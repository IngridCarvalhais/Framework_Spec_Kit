import { useEffect, useMemo, useRef, useState } from 'react'
import { BoardColumn } from '../../components/board/BoardColumn'
import { PriorityControls } from '../../components/board/PriorityControls'
import { TaskFilters } from '../../components/board/TaskFilters'
import { TaskForm, type TaskDraft } from '../../components/forms/TaskForm'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { FeedbackBanner } from '../../components/feedback/FeedbackBanner'
import { LoadingState } from '../../components/feedback/LoadingState'
import type { Task, TaskFilters as Filters, TaskStatus, UpdateTaskRequest } from '../../types/api'
import { taskStatuses } from '../../types/api'
import { ApiError } from '../../services/api/client'
import type { TaskService } from '../../services/tasks/types'
import { sortTasksManually } from './manualPriority'
import type { RankedTask } from '../../services/tasks/aiPrioritization'

const emptyAiResults = new Map<string, RankedTask>()

export function ProjectBoard({ projectId, service, prioritize, onUnauthorized }: {
  projectId: string
  service: TaskService
  prioritize?: (projectId: string, tasks: Task[], signal?: AbortSignal) => Promise<{ tasks: RankedTask[] }>
  onUnauthorized?: () => void
}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [operationMessage, setOperationMessage] = useState('')
  const [operationError, setOperationError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [editorTask, setEditorTask] = useState<Task | undefined>()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorBusy, setEditorBusy] = useState(false)
  const [editorError, setEditorError] = useState('')
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [manualOrderProjectId, setManualOrderProjectId] = useState<string | null>(null)
  const manualOrder = manualOrderProjectId === projectId
  const [aiOrderProjectId, setAiOrderProjectId] = useState<string | null>(null)
  const aiOrder = aiOrderProjectId === projectId
  const [aiBusy, setAiBusy] = useState(false)
  const [aiResultsState, setAiResultsState] = useState({ projectId, results: emptyAiResults })
  const aiResults = aiResultsState.projectId === projectId ? aiResultsState.results : emptyAiResults
  const [pendingTaskCountState, setPendingTaskCountState] = useState<{ projectId: string; count: number | null }>({ projectId, count: null })
  const pendingTaskCount = pendingTaskCountState.projectId === projectId ? pendingTaskCountState.count : null
  const [deleteBusy, setDeleteBusy] = useState(false)
  const aiInFlight = useRef(false)
  const aiController = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => aiController.current?.abort()
  }, [projectId])

  function clearAiPriority() {
    setAiResultsState({ projectId, results: emptyAiResults })
    setAiOrderProjectId(null)
  }

  function updatePendingTaskCount(update: (count: number | null) => number | null) {
    setPendingTaskCountState((current) => ({
      projectId,
      count: update(current.projectId === projectId ? current.count : null),
    }))
  }

  function refreshTasks() {
    setLoading(true)
    setLoadError('')
    setRefreshKey((key) => key + 1)
  }

  function changeFilters(nextFilters: Filters) {
    setLoading(true)
    setLoadError('')
    setFilters(nextFilters)
  }

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve()
      .then(() => service.listTasks(projectId, filters, controller.signal))
      .then((result) => {
        if (!controller.signal.aborted) {
          setTasks(result)
          if (!filters.status && !filters.priority) {
            setPendingTaskCountState({ projectId, count: result.filter((task) => task.status === 'TODO').length })
          }
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (error instanceof ApiError && error.status === 401) onUnauthorized?.()
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar las tareas.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [filters, onUnauthorized, projectId, refreshKey, service])

  const shownTasks = useMemo(
    () => tasks.map((task) => {
      const aiResult = aiResults.get(task.id)
      return aiResult ? { ...task, ai_score: aiResult.ai_score } : task
    }),
    [aiResults, tasks],
  )
  const inProgressCount = tasks.filter((task) => task.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter((task) => task.status === 'DONE').length
  const tasksByStatus = useMemo(() => Object.fromEntries(
    taskStatuses.map((status) => {
      const statusTasks = shownTasks.filter((task) => task.status === status)
      if (status === 'TODO' && aiOrder) {
        statusTasks.sort((a, b) =>
          (b.ai_score ?? -1) - (a.ai_score ?? -1) ||
          Date.parse(a.created_at) - Date.parse(b.created_at) ||
          a.id.localeCompare(b.id),
        )
      } else if (manualOrder) {
        return [status, sortTasksManually(statusTasks)]
      }
      return [status, statusTasks]
    }),
  ) as Record<TaskStatus, Task[]>, [aiOrder, manualOrder, shownTasks])

  function reportError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) onUnauthorized?.()
    setOperationError(error instanceof Error ? error.message : 'La operación no se pudo completar.')
    setOperationMessage('')
  }

  function updatePayload(task: Task, changes: UpdateTaskRequest): UpdateTaskRequest {
    return {
      ...(task.title ? { title: task.title } : {}),
      ...(task.description !== undefined ? { description: task.description } : {}),
      ...(task.priority ? { priority: task.priority } : {}),
      ...(task.assigned_to ? { assigned_to: task.assigned_to } : {}),
      ...(task.due_date ? { due_date: task.due_date } : {}),
      ...changes,
    }
  }

  async function saveTask(draft: TaskDraft) {
    if (editorBusy) return
    setEditorBusy(true)
    setEditorError('')
    setOperationMessage('')
    try {
      if (editorTask) {
        const updated = await service.updateTask(editorTask.id, updatePayload(editorTask, {
          title: draft.title,
          description: draft.description,
          priority: draft.priority,
          ...(draft.due_date ? { due_date: draft.due_date } : {}),
        }))
        setTasks((current) => current.map((task) => task.id === updated.id ? updated : task))
        setOperationMessage('Tarea actualizada.')
        refreshTasks()
      } else {
        const created = await service.createTask({
          project_id: projectId,
          title: draft.title,
          priority: draft.priority,
          ...(draft.description !== undefined ? { description: draft.description } : {}),
          ...(draft.due_date ? { due_date: draft.due_date } : {}),
        })
        setTasks((current) => [created, ...current])
        setOperationMessage('Tarea creada.')
        if (created.status === 'TODO') updatePendingTaskCount((count) => count === null ? count : count + 1)
        refreshTasks()
      }
      clearAiPriority()
      setEditorOpen(false)
      setEditorTask(undefined)
    } catch (error) {
      reportError(error)
      setEditorError(error instanceof Error ? error.message : 'No se pudo guardar la tarea.')
    } finally {
      setEditorBusy(false)
    }
  }

  async function changeStatus(task: Task, status: TaskStatus) {
    setBusyTaskId(task.id)
    setOperationError('')
    setOperationMessage('')
    try {
      const updated = await service.updateTask(task.id, updatePayload(task, { status }))
      clearAiPriority()
      if (task.status !== updated.status) {
        updatePendingTaskCount((count) => count === null
          ? count
          : count + (updated.status === 'TODO' ? 1 : 0) - (task.status === 'TODO' ? 1 : 0))
      }
      setTasks((current) => current.map((item) => item.id === updated.id ? updated : item))
      setOperationMessage('Estado actualizado.')
      refreshTasks()
    } catch (error) {
      reportError(error)
    } finally {
      setBusyTaskId(null)
    }
  }

  async function confirmDelete() {
    if (!deleteTask || deleteBusy) return
    setDeleteBusy(true)
    setOperationError('')
    setOperationMessage('')
    try {
      await service.deleteTask(deleteTask.id)
      clearAiPriority()
      if (deleteTask.status === 'TODO') {
        updatePendingTaskCount((count) => count === null ? count : Math.max(0, count - 1))
      }
      setTasks((current) => current.filter((task) => task.id !== deleteTask.id))
      setDeleteTask(null)
      setOperationMessage('Tarea eliminada.')
    } catch (error) {
      reportError(error)
    } finally {
      setDeleteBusy(false)
    }
  }

  async function prioritizeProjectTasks() {
    if (!prioritize || aiInFlight.current || loading) return
    aiInFlight.current = true
    setAiBusy(true)
    setOperationError('')
    setOperationMessage('')
    setAiOrderProjectId(null)
    const controller = new AbortController()
    aiController.current = controller
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 20_000)
    try {
      const snapshot = await service.listTasks(projectId, {}, controller.signal)
      const pendingTasks = snapshot.filter((task) => task.status === 'TODO')
      if (pendingTasks.length === 0) {
        setOperationMessage('No hay tareas pendientes para priorizar.')
        return
      }

      const result = await prioritize(projectId, pendingTasks, controller.signal)
      const currentSnapshot = await service.listTasks(projectId, {}, controller.signal)
      setPendingTaskCountState({ projectId, count: currentSnapshot.filter((task) => task.status === 'TODO').length })
      if (!samePendingSnapshot(pendingTasks, currentSnapshot.filter((task) => task.status === 'TODO'))) {
        setOperationError('Las tareas cambiaron durante el análisis. Actualicé el tablero; vuelve a intentarlo.')
        setTasks(await service.listTasks(projectId, filters))
        return
      }

      setAiResultsState({ projectId, results: new Map(result.tasks.map((task) => [task.id, task])) })
      setAiOrderProjectId(projectId)
      setManualOrderProjectId(null)
      setOperationMessage('Se actualizaron las sugerencias de prioridad. Las prioridades originales no cambiaron.')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) onUnauthorized?.()
      if (timedOut) {
        setOperationError('La solicitud superó los 20 segundos. Actualizando las tareas antes de permitir otro intento.')
        try {
          const refreshed = await service.listTasks(projectId, filters)
          setTasks(refreshed)
        } catch (refreshError) {
          if (refreshError instanceof ApiError && refreshError.status === 401) onUnauthorized?.()
          setOperationError('La solicitud superó el tiempo máximo y no pude actualizar el tablero. Usa Reintentar para volver a cargar.')
        }
      } else if (!controller.signal.aborted) {
        setOperationError(error instanceof Error ? error.message : 'No se pudieron priorizar las tareas.')
      }
      setOperationMessage('')
    } finally {
      clearTimeout(timeoutId)
      if (aiController.current === controller) aiController.current = null
      aiInFlight.current = false
      setAiBusy(false)
    }
  }

  return (
    <section aria-labelledby="board-title">
      <header className="board-header">
        <div>
          <p className="eyebrow">GESTIÓN DEL PROYECTO</p>
          <h1 id="board-title">Tablero de tareas</h1>
          <p>Todo el trabajo de tu equipo, organizado en un solo lugar.</p>
        </div>
        <button type="button" onClick={() => { setEditorTask(undefined); setEditorError(''); setEditorOpen((open) => !open) }}>
          {editorOpen && !editorTask ? 'Cerrar formulario' : 'Crear tarea'}
        </button>
        <div className="board-stats" aria-label="Resumen del tablero">
          <div className="board-stat"><span>Visibles</span><strong>{tasks.length}</strong></div>
          <div className="board-stat"><span>En curso</span><strong>{inProgressCount}</strong></div>
          <div className="board-stat"><span>Terminadas</span><strong>{completedCount}</strong></div>
        </div>
      </header>

      <TaskFilters
        filters={filters}
        onChange={changeFilters}
        onClear={() => changeFilters({})}
      />
      <PriorityControls
        manual={manualOrder}
        aiActive={aiOrder}
        available={Boolean(prioritize)}
        hasPendingTasks={pendingTaskCount !== 0}
        busy={aiBusy}
        loading={loading}
        onPrioritize={() => { void prioritizeProjectTasks() }}
        onToggleManual={() => {
          setManualOrderProjectId((current) => current === projectId ? null : projectId)
          setAiOrderProjectId(null)
        }}
      />

      {editorOpen && (
        <TaskForm
          key={editorTask?.id ?? 'new'}
          task={editorTask}
          busy={editorBusy}
          error={editorError}
          onSave={saveTask}
          onCancel={() => { setEditorOpen(false); setEditorTask(undefined); setEditorError('') }}
        />
      )}

      {operationError && <FeedbackBanner kind="error">{operationError}</FeedbackBanner>}
      {operationMessage && <FeedbackBanner kind="success">{operationMessage}</FeedbackBanner>}
      {loading && <LoadingState />}
      {loadError && (
        <FeedbackBanner kind="error">
          {loadError} <button className="secondary" type="button" onClick={refreshTasks}>Reintentar</button>
        </FeedbackBanner>
      )}
      {!loading && !loadError && tasks.length === 0 && (
        <div className="empty">
          <p>No hay tareas para estos filtros.</p>
          <button type="button" onClick={() => { setEditorTask(undefined); setEditorOpen(true) }}>Crear primera tarea</button>
        </div>
      )}
      {(!loadError || tasks.length > 0) && (
        <div className="columns" aria-label="Columnas del tablero">
          {taskStatuses.map((status) => (
            <BoardColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              busyTaskId={busyTaskId}
              aiReasons={new Map([...aiResults].map(([id, result]) => [id, result.reason]))}
              onEdit={(task) => { setEditorTask(task); setEditorError(''); setEditorOpen(true) }}
              onDelete={setDeleteTask}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      )}

      <ConfirmDialog task={deleteTask} busy={deleteBusy} onCancel={() => setDeleteTask(null)} onConfirm={confirmDelete} />
    </section>
  )
}

function samePendingSnapshot(before: Task[], after: Task[]): boolean {
  if (before.length !== after.length) return false
  const latestById = new Map(after.map((task) => [task.id, task]))
  return before.every((task) => {
    const current = latestById.get(task.id)
    return current !== undefined &&
      current.title === task.title &&
      current.description === task.description &&
      current.priority === task.priority &&
      current.due_date === task.due_date &&
      current.status === task.status &&
      current.created_at === task.created_at
  })
}
