import { useState, type FormEvent } from 'react'
import type { CreateTaskRequest, Task, TaskPriority } from '../../types/api'

export type TaskDraft = Pick<CreateTaskRequest, 'title'> & {
  description?: string
  priority: TaskPriority
  due_date?: string
}

export function TaskForm({ task, busy, error, onSave, onCancel }: {
  task?: Task
  busy: boolean
  error: string
  onSave: (draft: TaskDraft) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) ?? '')
  const [titleError, setTitleError] = useState('')
  const [dateError, setDateError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanTitle = title.trim()
    const nextTitleError = cleanTitle ? '' : 'Escribe un título con contenido.'
    const nextDateError = task?.due_date && !dueDate
      ? 'El contrato actual no permite borrar la fecha límite.'
      : ''
    setTitleError(nextTitleError)
    setDateError(nextDateError)
    if (busy || nextTitleError || nextDateError) return

    await onSave({
      title: cleanTitle,
      description,
      priority,
      ...(dueDate ? { due_date: new Date(`${dueDate}T00:00:00.000Z`).toISOString() } : {}),
    })
  }

  const titleErrorId = 'task-title-error'
  const dateErrorId = 'task-date-error'
  return (
    <section className="editor" aria-labelledby="task-form-heading">
      <h2 id="task-form-heading">{task ? 'Editar tarea' : 'Crear tarea'}</h2>
      {error && <p className="form-error" role="alert">{error}</p>}
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="field wide">
            <label htmlFor="task-title">Título <span aria-hidden="true">*</span></label>
            <input id="task-title" name="title" required value={title} aria-invalid={Boolean(titleError)} aria-describedby={titleError ? titleErrorId : undefined} onChange={(event) => setTitle(event.target.value)} />
            {titleError && <span className="form-error" id={titleErrorId}>{titleError}</span>}
          </div>
          <div className="field wide">
            <label htmlFor="task-description">Descripción (opcional)</label>
            <textarea id="task-description" name="description" value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="task-priority">Prioridad</label>
            <select id="task-priority" name="priority" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              <option value="HIGH">Alta</option>
              <option value="MEDIUM">Media</option>
              <option value="LOW">Baja</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due-date">Fecha límite (opcional)</label>
            <input id="task-due-date" name="due_date" type="date" value={dueDate} aria-invalid={Boolean(dateError)} aria-describedby={dateError ? dateErrorId : undefined} onChange={(event) => setDueDate(event.target.value)} />
            {dateError && <span className="form-error" id={dateErrorId}>{dateError}</span>}
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={busy}>{busy ? 'Guardando…' : task ? 'Guardar cambios' : 'Crear tarea'}</button>
          <button className="secondary" type="button" onClick={onCancel} disabled={busy}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
