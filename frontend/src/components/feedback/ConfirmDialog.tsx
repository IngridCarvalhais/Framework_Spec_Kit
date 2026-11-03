import { useEffect, useRef, type KeyboardEvent } from 'react'
import type { Task } from '../../types/api'

export function ConfirmDialog({ task, busy, onCancel, onConfirm }: {
  task: Task | null
  busy: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const taskId = task?.id

  useEffect(() => {
    if (!taskId) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus()
    return () => previousFocus?.focus()
  }, [taskId])

  function trapFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && !busy) {
      event.preventDefault()
      onCancel()
    }
    if (event.key !== 'Tab') return
    const elements = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)')
    if (!elements?.length) return
    const first = elements[0]
    const last = elements[elements.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  if (!task) return null
  return (
    <div className="dialog-backdrop">
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" tabIndex={-1} onKeyDown={trapFocus} className="editor">
        <h2 id="delete-title">Eliminar tarea</h2>
        <p id="delete-description">¿Seguro que quieres eliminar “{task.title}”?</p>
        <div className="form-actions">
          <button className="danger" type="button" disabled={busy} onClick={onConfirm}>{busy ? 'Eliminando…' : 'Confirmar eliminación'}</button>
          <button className="secondary" type="button" disabled={busy} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
