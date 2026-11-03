import { afterEach, describe, expect, it, vi } from 'vitest'
import { prioritizeTasks, AiPrioritizationError } from '../../src/services/tasks/aiPrioritization'
import { demoTasks } from '../../src/services/demo/taskFixtures'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('AI prioritization client', () => {
  it('uses the separate service endpoint and validates a complete response', async () => {
    const pending = demoTasks.filter((task) => task.status === 'TODO')
    const response = {
      project_id: 'demo-project',
      reference_time: '2025-01-01T00:00:00.000Z',
      scoring_version: 'v1',
      tasks: pending.map((task) => ({ id: task.id, ai_score: 0.9, reason: 'Fecha y prioridad consideradas.' })),
    }
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response))
    vi.stubGlobal('fetch', fetchMock)

    await expect(prioritizeTasks('http://127.0.0.1:3001/v1', 'demo-project', pending))
      .resolves.toEqual(response)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3001/v1/projects/demo-project/tasks/prioritize',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).tasks).toEqual(pending)
  })

  it('rejects partial, foreign, and out-of-range responses as a whole', async () => {
    const pending = [demoTasks[0]]
    for (const result of [
      { project_id: 'demo-project', reference_time: '2025-01-01T00:00:00Z', scoring_version: 'v1', tasks: [] },
      { project_id: 'other', reference_time: '2025-01-01T00:00:00Z', scoring_version: 'v1', tasks: [{ id: pending[0].id, ai_score: 0.5, reason: 'ok' }] },
      { project_id: 'demo-project', reference_time: '2025-01-01T00:00:00Z', scoring_version: 'v1', tasks: [{ id: pending[0].id, ai_score: 2, reason: 'ok' }] },
    ]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(result)))
      await expect(prioritizeTasks('http://127.0.0.1:3001/v1', 'demo-project', pending))
        .rejects.toBeInstanceOf(AiPrioritizationError)
      vi.unstubAllGlobals()
    }
  })

  it('preserves service errors for manual fallback messaging', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(
      { statusCode: 503, message: 'Gemini no está disponible.' },
      { status: 503 },
    )))
    await expect(prioritizeTasks('http://127.0.0.1:3001/v1', 'demo-project', [demoTasks[0]]))
      .rejects.toMatchObject({ status: 503, message: 'Gemini no está disponible.' })
  })
})
