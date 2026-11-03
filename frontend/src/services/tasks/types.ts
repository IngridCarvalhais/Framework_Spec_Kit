import type { CreateTaskRequest, Task, TaskFilters, UpdateTaskRequest } from '../../types/api'

export interface TaskService {
  listTasks(projectId: string, filters?: TaskFilters, signal?: AbortSignal): Promise<Task[]>
  createTask(input: CreateTaskRequest): Promise<Task>
  getTask(id: string): Promise<Task>
  updateTask(id: string, input: UpdateTaskRequest): Promise<Task>
  deleteTask(id: string): Promise<void>
}
