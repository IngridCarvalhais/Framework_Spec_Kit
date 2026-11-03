import type { Task, TaskStatus } from '../../types/api'
import { statusLabels } from '../../types/api'
import { TaskCard } from './TaskCard'

export function BoardColumn({ status, tasks, busyTaskId, aiReasons, onEdit, onDelete, onStatusChange }: {
  status: TaskStatus
  tasks: Task[]
  busyTaskId: string | null
  aiReasons?: ReadonlyMap<string, string>
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
}) {
  const headingId = `column-${status}`
  return (
    <section className="column" aria-labelledby={headingId}>
      <h2 id={headingId}>{statusLabels[status]} <span aria-label={`${tasks.length} tareas`}>{tasks.length}</span></h2>
      {tasks.length === 0
        ? <p className="empty">No hay tareas en esta columna.</p>
        : <ul className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              aiReason={aiReasons?.get(task.id)}
              busy={busyTaskId === task.id}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
              onStatusChange={(nextStatus) => onStatusChange(task, nextStatus)}
            />
          ))}
        </ul>}
    </section>
  )
}
