import { http, HttpResponse } from 'msw'
import type { CreateTaskRequest, Task, UpdateTaskRequest } from '../types/api'

const api = 'https://mock-api.taskmanager.test/v1'
let tasks: Task[] = []
let nextId = 2

function notFound() {
  return HttpResponse.json({ statusCode: 404, message: 'No se encontró la tarea.' }, { status: 404 })
}

export const handlers = [
  http.post(`${api}/auth/login`, () => HttpResponse.json({
    token: 'e2e-only-token',
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'demo@example.test',
      name: 'Demo',
      created_at: '2025-01-01T00:00:00Z',
    },
  })),
  http.get(`${api}/projects/:projectId/tasks`, ({ request, params }) => {
    const url = new URL(request.url)
    const result = tasks.filter((task) =>
      task.project_id === params.projectId &&
      (!url.searchParams.has('status') || task.status === url.searchParams.get('status')) &&
      (!url.searchParams.has('priority') || task.priority === url.searchParams.get('priority')),
    )
    return HttpResponse.json(result)
  }),
  http.post(`${api}/tasks`, async ({ request }) => {
    const input = await request.json() as CreateTaskRequest
    const task: Task = {
      id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
      project_id: input.project_id,
      title: input.title,
      description: input.description,
      status: 'TODO',
      priority: input.priority ?? 'MEDIUM',
      assigned_to: input.assigned_to ?? null,
      due_date: input.due_date ?? null,
      ai_score: null,
      created_at: '2025-01-01T00:00:00Z',
    }
    tasks = [...tasks, task]
    return HttpResponse.json(task, { status: 201 })
  }),
  http.get(`${api}/tasks/:id`, ({ params }) => {
    const task = tasks.find((item) => item.id === params.id)
    return task ? HttpResponse.json(task) : notFound()
  }),
  http.put(`${api}/tasks/:id`, async ({ params, request }) => {
    const input = await request.json() as UpdateTaskRequest
    let updated: Task | undefined
    tasks = tasks.map((task) => {
      if (task.id !== params.id) return task
      updated = { ...task, ...input }
      return updated
    })
    return updated ? HttpResponse.json(updated) : notFound()
  }),
  http.delete(`${api}/tasks/:id`, ({ params }) => {
    if (!tasks.some((task) => task.id === params.id)) return notFound()
    tasks = tasks.filter((task) => task.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),
]
