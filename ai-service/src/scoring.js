import { ServiceError } from './errors.js'

const priorities = { HIGH: 1, MEDIUM: 0.5, LOW: 0 }

export function validateTaskSnapshot(projectId, tasks) {
  if (!Array.isArray(tasks)) {
    throw new ServiceError(422, 'Se requiere una lista de tareas.')
  }
  if (tasks.length > 100) {
    throw new ServiceError(422, 'La priorización admite como máximo 100 tareas pendientes.')
  }

  const ids = new Set()
  for (const task of tasks) {
    if (!task || typeof task !== 'object' || Array.isArray(task)) {
      throw new ServiceError(422, 'El formato de una tarea no es válido.')
    }
    if (typeof task.id !== 'string' || !task.id || ids.has(task.id)) {
      throw new ServiceError(422, 'Las tareas deben tener identificadores únicos.')
    }
    ids.add(task.id)
    if (task.project_id !== projectId || task.status !== 'TODO') {
      throw new ServiceError(422, 'Solo se admiten tareas pendientes del proyecto indicado.')
    }
    if (typeof task.title !== 'string' || task.title.trim().length === 0 || task.title.length > 500) {
      throw new ServiceError(422, 'El título de una tarea no es válido.')
    }
    if (task.description !== undefined && task.description !== null && typeof task.description !== 'string') {
      throw new ServiceError(422, 'La descripción de una tarea no es válida.')
    }
    if (!Object.hasOwn(priorities, task.priority)) {
      throw new ServiceError(422, 'La prioridad de una tarea no es válida.')
    }
    if (task.due_date !== undefined && task.due_date !== null &&
      (typeof task.due_date !== 'string' || !Number.isFinite(Date.parse(task.due_date)))) {
      throw new ServiceError(422, 'La fecha límite de una tarea no es válida.')
    }
    if (typeof task.created_at !== 'string' || !Number.isFinite(Date.parse(task.created_at))) {
      throw new ServiceError(422, 'La fecha de creación de una tarea no es válida.')
    }
  }
  return tasks
}

export function validateSemanticResults(tasks, results) {
  if (!results || typeof results !== 'object' || !Array.isArray(results.tasks) ||
    results.tasks.length !== tasks.length) {
    throw new ServiceError(502, 'El proveedor devolvió un conjunto de resultados incompleto.')
  }

  const expectedIds = new Set(tasks.map((task) => task.id))
  const seenIds = new Set()
  for (const result of results.tasks) {
    if (!result || typeof result !== 'object' || Array.isArray(result) ||
      typeof result.id !== 'string' || !expectedIds.has(result.id) || seenIds.has(result.id) ||
      typeof result.semantic_score !== 'number' || !Number.isFinite(result.semantic_score) ||
      result.semantic_score < 0 || result.semantic_score > 1 ||
      typeof result.reason !== 'string' || result.reason.trim().length === 0 || result.reason.length > 240) {
      throw new ServiceError(502, 'El proveedor devolvió resultados de priorización no válidos.')
    }
    seenIds.add(result.id)
  }
  if (seenIds.size !== expectedIds.size) {
    throw new ServiceError(502, 'El proveedor omitió tareas pendientes.')
  }
  return new Map(results.tasks.map((result) => [result.id, result]))
}

function dateFactor(task, referenceTime) {
  if (!task.due_date) return 0
  const hoursUntilDue = (Date.parse(task.due_date) - referenceTime.getTime()) / 3_600_000
  if (hoursUntilDue <= 24) return 1
  if (hoursUntilDue <= 72) return 0.75
  if (hoursUntilDue <= 168) return 0.5
  return 0.25
}

function reasonFor(task, dueFactorValue, priorityFactor, semanticReason) {
  const dueDescription = task.due_date
    ? `Fecha D=${dueFactorValue.toFixed(2)}`
    : 'Sin fecha D=0.00'
  const priorityDescription = `Prioridad P=${priorityFactor.toFixed(2)}`
  const semanticDescription = `Contexto S. ${semanticReason.trim()}`
  return `${dueDescription}; ${priorityDescription}; ${semanticDescription}`.slice(0, 240)
}

export function buildPrioritization(projectId, tasks, semanticResults, referenceTime = new Date()) {
  const semanticById = validateSemanticResults(tasks, semanticResults)
  const rankedTasks = tasks.map((task) => {
    const due = dateFactor(task, referenceTime)
    const priority = priorities[task.priority]
    const semantic = semanticById.get(task.id)
    const aiScore = Math.round((0.5 * due + 0.3 * priority + 0.2 * semantic.semantic_score) * 10_000) / 10_000
    return {
      id: task.id,
      ai_score: aiScore,
      reason: reasonFor(task, due, priority, semantic.reason),
      created_at: Date.parse(task.created_at),
    }
  })

  rankedTasks.sort((a, b) =>
    b.ai_score - a.ai_score || a.created_at - b.created_at || a.id.localeCompare(b.id),
  )

  return {
    project_id: projectId,
    reference_time: referenceTime.toISOString(),
    scoring_version: 'v1',
    tasks: rankedTasks.map(({ id, ai_score, reason }) => ({ id, ai_score, reason })),
  }
}
