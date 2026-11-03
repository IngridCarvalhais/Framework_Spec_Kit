import type { Task } from '../../types/api'

export type RankedTask = {
  id: string
  ai_score: number
  reason: string
}

export type AiPrioritizationResponse = {
  project_id: string
  reference_time: string
  scoring_version: 'v1'
  tasks: RankedTask[]
}

export class AiPrioritizationError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AiPrioritizationError'
    this.status = status
  }
}

export async function prioritizeTasks(
  baseUrl: string,
  projectId: string,
  tasks: Task[],
  signal?: AbortSignal,
): Promise<AiPrioritizationResponse> {
  const url = new URL(
    `projects/${encodeURIComponent(projectId)}/tasks/prioritize`,
    `${baseUrl.replace(/\/+$/, '')}/`,
  )
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
    signal,
  })

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.message === 'string'
      ? payload.message
      : `No se pudo priorizar (HTTP ${response.status}).`
    throw new AiPrioritizationError(message, response.status)
  }
  if (!isValidResponse(payload, projectId, tasks)) {
    throw new AiPrioritizationError('El servicio de IA devolvió una respuesta no válida.')
  }
  return payload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidResponse(value: unknown, projectId: string, tasks: Task[]): value is AiPrioritizationResponse {
  if (!isRecord(value) || value.project_id !== projectId ||
    typeof value.reference_time !== 'string' || !Number.isFinite(Date.parse(value.reference_time)) ||
    value.scoring_version !== 'v1' || !Array.isArray(value.tasks) ||
    value.tasks.length !== tasks.length) {
    return false
  }

  const expectedIds = new Set(tasks.map((task) => task.id))
  const seenIds = new Set<string>()
  for (const result of value.tasks) {
    if (!isRecord(result) || typeof result.id !== 'string' || !expectedIds.has(result.id) ||
      seenIds.has(result.id) || typeof result.ai_score !== 'number' ||
      !Number.isFinite(result.ai_score) || result.ai_score < 0 || result.ai_score > 1 ||
      typeof result.reason !== 'string' || result.reason.length === 0 || result.reason.length > 240) {
      return false
    }
    seenIds.add(result.id)
  }
  return seenIds.size === expectedIds.size
}
