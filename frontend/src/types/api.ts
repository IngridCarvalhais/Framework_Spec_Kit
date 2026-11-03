import type { components } from './openapi'

export type Task = components['schemas']['Task']
export type CreateTaskRequest = components['schemas']['CreateTaskRequest']
export type UpdateTaskRequest = components['schemas']['UpdateTaskRequest']
export type AuthLoginRequest = components['schemas']['AuthLoginRequest']
export type AuthResponse = components['schemas']['AuthResponse']
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']
export type TaskFilters = { status?: TaskStatus; priority?: TaskPriority }

export const taskStatuses: readonly TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE']
export const taskPriorities: readonly TaskPriority[] = ['HIGH', 'MEDIUM', 'LOW']

export const statusLabels: Record<TaskStatus, string> = {
  TODO: 'Pendiente',
  IN_PROGRESS: 'En curso',
  DONE: 'Terminada',
}

export const priorityLabels: Record<TaskPriority, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
}
