import type { Task, TaskStatus } from '../../types/api'
import { statusLabels, taskStatuses } from '../../types/api'

export function StatusSelect({ task, busy, onChange }: {
  task: Task
  busy: boolean
  onChange: (status: TaskStatus) => void
}) {
  return (
    <label className="field">
      <span>Estado de {task.title}</span>
      <select aria-label={`Cambiar estado para ${task.title}`} value={task.status} disabled={busy} onChange={(event) => onChange(event.target.value as TaskStatus)}>
        {taskStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
      </select>
    </label>
  )
}
