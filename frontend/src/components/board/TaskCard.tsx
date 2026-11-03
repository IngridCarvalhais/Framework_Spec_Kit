import type { Task, TaskStatus } from '../../types/api'
import { priorityLabels, statusLabels } from '../../types/api'
import { StatusSelect } from '../forms/StatusSelect'

export function TaskCard({ task, aiReason, busy, onEdit, onDelete, onStatusChange }: {
  task: Task
  aiReason?: string
  busy: boolean
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: TaskStatus) => void
}) {
  return (
    <li className="task-card">
      <article aria-labelledby={`task-${task.id}-title`}>
        <h3 id={`task-${task.id}-title`}>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`badge ${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span>
          <span className="badge">{statusLabels[task.status]}</span>
          {task.due_date && <span>Fecha límite: <time dateTime={task.due_date}>{task.due_date.slice(0, 10)}</time></span>}
          {task.ai_score !== null && task.ai_score !== undefined && <span>Puntuación IA: {task.ai_score}</span>}
        </div>
        {aiReason && <p className="ai-reason">{aiReason}</p>}
        <div className="card-actions">
          <button className="secondary" type="button" onClick={onEdit} disabled={busy}>Editar</button>
          <button className="danger" type="button" onClick={onDelete} disabled={busy}>Eliminar</button>
        </div>
        <StatusSelect task={task} busy={busy} onChange={onStatusChange} />
      </article>
    </li>
  )
}
