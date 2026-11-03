import type { CreateTaskRequest, Task, TaskFilters, UpdateTaskRequest } from '../../types/api'
import { demoTasks } from './taskFixtures'
import type { TaskService } from '../tasks/types'

export function createDemoTaskService(): TaskService {
  let tasks = demoTasks.map((task) => ({ ...task }))
  let nextId = 4
  return {
    async listTasks(projectId: string, filters: TaskFilters = {}) {
      return tasks.filter((task) =>
        task.project_id === projectId &&
        (!filters.status || task.status === filters.status) &&
        (!filters.priority || task.priority === filters.priority),
      ).map((task) => ({ ...task }))
    },
    async createTask(input: CreateTaskRequest) {
      const id = `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`
      const task: Task = {
        id,
        project_id: input.project_id,
        title: input.title,
        description: input.description,
        status: 'TODO',
        priority: input.priority ?? 'MEDIUM',
        assigned_to: input.assigned_to ?? null,
        due_date: input.due_date ?? null,
        ai_score: null,
        created_at: new Date().toISOString(),
      }
      tasks = [task, ...tasks]
      return { ...task }
    },
    async getTask(id: string) {
      const task = tasks.find((item) => item.id === id)
      if (!task) throw new Error('No se encontró la tarea.')
      return { ...task }
    },
    async updateTask(id: string, input: UpdateTaskRequest) {
      const index = tasks.findIndex((item) => item.id === id)
      if (index < 0) throw new Error('No se encontró la tarea.')
      const task = { ...tasks[index], ...input }
      tasks = tasks.map((item, taskIndex) => taskIndex === index ? task : item)
      return { ...task }
    },
    async deleteTask(id: string) {
      if (!tasks.some((task) => task.id === id)) throw new Error('No se encontró la tarea.')
      tasks = tasks.filter((task) => task.id !== id)
    },
  }
}
