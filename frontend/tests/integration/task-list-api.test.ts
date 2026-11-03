import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createApiTaskService } from '../../src/services/api/taskService'
import { setAccessToken, clearAccessToken } from '../../src/services/api/client'
import type { Task } from '../../src/types/api'
import { server } from '../setup'

const baseUrl = 'https://api.example.test/v1'
const projectId = '00000000-0000-4000-8000-000000000001'
const task: Task = {
  id: '00000000-0000-4000-8000-000000000002',
  project_id: projectId,
  title: 'Revisión',
  status: 'TODO',
  priority: 'HIGH',
  created_at: '2025-01-01T00:00:00Z',
  description: 'Texto',
  assigned_to: null,
  due_date: null,
  ai_score: null,
}

describe('GET project tasks contract', () => {
  it('sends exact filters and bearer auth with one /v1 prefix', async () => {
    let seenUrl = ''
    let seenAuth = ''
    server.use(http.get(`${baseUrl}/projects/:projectId/tasks`, ({ request }) => {
      seenUrl = request.url
      seenAuth = request.headers.get('authorization') ?? ''
      return HttpResponse.json([task])
    }))
    setAccessToken('memory-token')
    const service = createApiTaskService(baseUrl)
    const result = await service.listTasks(projectId, { status: 'TODO', priority: 'HIGH' })
    expect(new URL(seenUrl).pathname).toBe(`/v1/projects/${projectId}/tasks`)
    expect(new URL(seenUrl).searchParams.get('status')).toBe('TODO')
    expect(new URL(seenUrl).searchParams.get('priority')).toBe('HIGH')
    expect(seenAuth).toBe('Bearer memory-token')
    expect(result).toEqual([task])
    clearAccessToken()
  })

  it('omits empty query parameters', async () => {
    let seenUrl = ''
    server.use(http.get(`${baseUrl}/projects/:projectId/tasks`, ({ request }) => {
      seenUrl = request.url
      return HttpResponse.json([])
    }))
    await createApiTaskService(baseUrl).listTasks(projectId, {})
    expect(new URL(seenUrl).search).toBe('')
  })
})
