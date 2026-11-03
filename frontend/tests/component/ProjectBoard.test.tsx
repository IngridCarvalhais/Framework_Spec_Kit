import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProjectBoard } from '../../src/features/tasks/ProjectBoard'
import { createDemoTaskService } from '../../src/services/demo/taskService'
import { demoTasks } from '../../src/services/demo/taskFixtures'
import type { TaskService } from '../../src/services/tasks/types'
import type { Task } from '../../src/types/api'

describe('ProjectBoard', () => {
  it('shows loading, columns, and exact task distribution', async () => {
    render(<ProjectBoard projectId="demo-project" service={createDemoTaskService()} />)
    expect(screen.getByText('Cargando tareas…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /Pendiente/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /En curso/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Terminada/ })).toBeInTheDocument()
    expect(screen.getByText('Definir objetivos del sprint')).toBeInTheDocument()
    expect(screen.getByText('Preparar prototipo')).toBeInTheDocument()
    expect(screen.getByText('Revisar documentación')).toBeInTheDocument()
  })

  it('shows a recoverable error rather than an empty board', async () => {
    const service = {
      ...createDemoTaskService(),
      listTasks: vi.fn().mockRejectedValue(new Error('Servicio no disponible')),
    } satisfies TaskService
    render(<ProjectBoard projectId="demo-project" service={service} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio no disponible')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.queryByText('No hay tareas para estos filtros.')).not.toBeInTheDocument()
  })

  it('distinguishes a successful empty result from a failed request', async () => {
    const service = { ...createDemoTaskService(), listTasks: vi.fn().mockResolvedValue([]) } satisfies TaskService
    render(<ProjectBoard projectId="demo-project" service={service} />)
    expect(await screen.findByText('No hay tareas para estos filtros.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear primera tarea' })).toBeInTheDocument()
  })

  it('preserves the manual demo path and filters by both contract fields', async () => {
    const user = userEvent.setup()
    render(<ProjectBoard projectId="demo-project" service={createDemoTaskService()} />)
    await screen.findByText('Definir objetivos del sprint')
    await user.selectOptions(screen.getByLabelText('Estado'), 'TODO')
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'HIGH')
    await waitFor(() => expect(screen.getByText('Definir objetivos del sprint')).toBeInTheDocument())
    expect(screen.queryByText('Preparar prototipo')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Priorizar con IA' })).toBeDisabled()
  })

  it('discards a response from an earlier filter request', async () => {
    const user = userEvent.setup()
    let resolveOld: (tasks: Task[]) => void = () => {}
    let callNumber = 0
    const service = {
      ...createDemoTaskService(),
      listTasks: vi.fn((_projectId: string, filters?: { status?: Task['status'] }) => {
        callNumber += 1
        if (callNumber === 1) return new Promise<Task[]>((resolve) => { resolveOld = resolve })
        return Promise.resolve(filters?.status === 'DONE' ? [demoTasks[2]] : demoTasks)
      }),
    } satisfies TaskService
    render(<ProjectBoard projectId="demo-project" service={service} />)
    await user.selectOptions(screen.getByLabelText('Estado'), 'DONE')
    expect(await screen.findByText('Revisar documentación')).toBeInTheDocument()
    resolveOld([demoTasks[0]])
    await waitFor(() => expect(screen.queryByText('Definir objetivos del sprint')).not.toBeInTheDocument())
    expect(screen.getByText('Revisar documentación')).toBeInTheDocument()
  })

  it('keeps a failed create draft available for manual correction and retry', async () => {
    const user = userEvent.setup()
    const base = createDemoTaskService()
    const service = { ...base, createTask: vi.fn().mockRejectedValue(new Error('No se pudo guardar')) } satisfies TaskService
    render(<ProjectBoard projectId="demo-project" service={service} />)
    await screen.findByText('Definir objetivos del sprint')
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))
    const title = screen.getByLabelText(/Título/)
    await user.type(title, 'Borrador conservado')
    await user.click(screen.getAllByRole('button', { name: 'Crear tarea' }).at(-1)!)
    await waitFor(() => expect(screen.getAllByText('No se pudo guardar')).toHaveLength(2))
    expect(title).toHaveValue('Borrador conservado')
  })

  it('sends only TODO tasks to AI and applies a complete ranking without changing priorities', async () => {
    const user = userEvent.setup()
    const service = createDemoTaskService()
    const prioritize = vi.fn().mockImplementation(async (_projectId, tasks) => ({
      tasks: tasks.map((task: Task, index: number) => ({
        id: task.id,
        ai_score: index === 0 ? 0.91 : 0.42,
        reason: 'Fecha y prioridad consideradas; contexto analizado.',
      })),
    }))
    render(<ProjectBoard projectId="demo-project" service={service} prioritize={prioritize} />)
    await screen.findByText('Definir objetivos del sprint')

    await user.click(screen.getByRole('button', { name: 'Priorizar con IA' }))

    await waitFor(() => expect(prioritize).toHaveBeenCalledOnce())
    const [, sentTasks] = prioritize.mock.calls[0]
    expect(sentTasks.every((task: Task) => task.status === 'TODO')).toBe(true)
    expect(await screen.findByText(/Se actualizaron las sugerencias de prioridad/)).toBeInTheDocument()
    expect(screen.getByText('Puntuación IA: 0.91')).toBeInTheDocument()
    expect(screen.getByText(/contexto analizado/i)).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Definir objetivos del sprint' })).toHaveTextContent('Alta')
  })

  it('discards an AI result when a task changes during analysis', async () => {
    const user = userEvent.setup()
    const service = createDemoTaskService()
    const prioritize = vi.fn().mockImplementation(async (_projectId, tasks) => {
      await service.updateTask(tasks[0].id, { title: 'Tarea actualizada durante el análisis' })
      return {
        tasks: tasks.map((task: Task) => ({
          id: task.id,
          ai_score: 0.99,
          reason: 'Esta explicación no debe aplicarse.',
        })),
      }
    })
    render(<ProjectBoard projectId="demo-project" service={service} prioritize={prioritize} />)
    await screen.findByText('Definir objetivos del sprint')

    await user.click(screen.getByRole('button', { name: 'Priorizar con IA' }))

    expect(await screen.findByText(/Las tareas cambiaron durante el análisis/)).toBeInTheDocument()
    expect(await screen.findByText('Tarea actualizada durante el análisis')).toBeInTheDocument()
    expect(screen.queryByText('Puntuación IA: 0.99')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ordenar manualmente' })).toBeEnabled()
  })
})
