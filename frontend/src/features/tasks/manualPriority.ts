import type { Task } from '../../types/api'

const priorityRank = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const

export function sortTasksManually(tasks: readonly Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priority = priorityRank[a.priority] - priorityRank[b.priority]
    if (priority) return priority
    if (a.due_date === null && b.due_date !== null) return 1
    if (a.due_date !== null && b.due_date === null) return -1
    if (a.due_date !== null && b.due_date !== null) {
      const dueDate = Date.parse(a.due_date) - Date.parse(b.due_date)
      if (dueDate) return dueDate
    }
    return Date.parse(a.created_at) - Date.parse(b.created_at) || a.id.localeCompare(b.id)
  })
}
