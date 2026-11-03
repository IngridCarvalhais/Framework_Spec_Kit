import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { createApiTaskService } from '../../src/services/api/taskService'
import type { Task } from '../../src/types/api'
import { server } from '../setup'

const baseUrl = 'https://api.example.test/v1'
const id = '00000000-0000-4000-8000-000000000002'
const projectId = '00000000-0000-4000-8000-000000000001'
const task: Task = {
  id, project_id: projectId, title: 'Tarea API', status: 'TODO',
  priority: 'MEDIUM', created_at: '2025-01-01T00:00:00Z',
  assigned_to: null, due_date: null, ai_score: null,
}

describe('task CRUD contract', () => {
  it('posts the documented create payload and reads a task by id', async () => {
    let posted: unknown
    server.use(
      http.post(`${baseUrl}/tasks`, async ({ request }) => {
        posted = await request.json()
        return HttpResponse.json(task, { status: 201 })
      }),
      http.get(`${baseUrl}/tasks/${id}`, () => HttpResponse.json(task)),
    )
    const service = createApiTaskService(baseUrl)
    await service.createTask({ project_id: projectId, title: 'Tarea API', priority: 'MEDIUM' })
    expect(posted).toEqual({ project_id: projectId, title: 'Tarea API', priority: 'MEDIUM' })
    await expect(service.getTask(id)).resolves.toEqual(task)
  })

  it('puts only documented update fields and deletes without parsing a 204 body', async () => {
    let updated: unknown
    server.use(
      http.put(`${baseUrl}/tasks/${id}`, async ({ request }) => {
        updated = await request.json()
        return HttpResponse.json({ ...task, status: 'DONE' })
      }),
      http.delete(`${baseUrl}/tasks/${id}`, () => new HttpResponse(null, { status: 204 })),
    )
    const service = createApiTaskService(baseUrl)
    await service.updateTask(id, { status: 'DONE' })
    expect(updated).toEqual({ status: 'DONE' })
    await expect(service.deleteTask(id)).resolves.toBeUndefined()
  })
})
