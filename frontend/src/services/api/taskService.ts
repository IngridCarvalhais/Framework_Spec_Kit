import type { CreateTaskRequest, Task, TaskFilters, UpdateTaskRequest } from '../../types/api'
import { requestJson } from './client'
import type { TaskService } from '../tasks/types'

export function createApiTaskService(baseUrl: string): TaskService {
  return {
    listTasks(projectId: string, filters: TaskFilters = {}, signal?: AbortSignal) {
      const query = new URLSearchParams()
      if (filters.status) query.set('status', filters.status)
      if (filters.priority) query.set('priority', filters.priority)
      const suffix = query.size ? `?${query.toString()}` : ''
      return requestJson<Task[]>(baseUrl, `/projects/${encodeURIComponent(projectId)}/tasks${suffix}`, { signal })
    },
    createTask(input: CreateTaskRequest) {
      return requestJson<Task>(baseUrl, '/tasks', { method: 'POST', body: input })
    },
    getTask(id: string) {
      return requestJson<Task>(baseUrl, `/tasks/${encodeURIComponent(id)}`)
    },
    updateTask(id: string, input: UpdateTaskRequest) {
      return requestJson<Task>(baseUrl, `/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body: input })
    },
    async deleteTask(id: string) {
      await requestJson<void>(baseUrl, `/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },
  }
}
