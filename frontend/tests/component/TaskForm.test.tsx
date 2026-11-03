import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from '../../src/components/forms/TaskForm'

describe('TaskForm', () => {
  it('rejects whitespace-only titles and associates the error with the field', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<TaskForm busy={false} error="" onSave={onSave} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/Título/), '   ')
    await user.click(screen.getAllByRole('button', { name: 'Crear tarea' }).at(-1)!)
    expect(await screen.findByText('Escribe un título con contenido.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Título/)).toHaveAttribute('aria-invalid', 'true')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits contract enums and an ISO date with timezone', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<TaskForm busy={false} error="" onSave={onSave} onCancel={() => {}} />)
    await user.type(screen.getByLabelText(/Título/), '  Planificar  ')
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'HIGH')
    await user.type(screen.getByLabelText('Fecha límite (opcional)'), '2026-11-05')
    await user.click(screen.getByRole('button', { name: 'Crear tarea' }))
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Planificar',
      priority: 'HIGH',
      due_date: '2026-11-05T00:00:00.000Z',
    }))
  })
})
