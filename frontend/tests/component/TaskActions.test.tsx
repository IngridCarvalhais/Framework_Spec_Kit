import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProjectBoard } from '../../src/features/tasks/ProjectBoard'
import { createDemoTaskService } from '../../src/services/demo/taskService'

describe('task actions', () => {
  it('changes status after service success and confirms deletion accessibly', async () => {
    const user = userEvent.setup()
    render(<ProjectBoard projectId="demo-project" service={createDemoTaskService()} />)
    const title = await screen.findByText('Definir objetivos del sprint')
    const card = title.closest('article')
    expect(card).not.toBeNull()
    await user.selectOptions(screen.getByRole('combobox', { name: 'Cambiar estado para Definir objetivos del sprint' }), 'IN_PROGRESS')
    await screen.findByText('Estado actualizado.')
    const taskActions = within(screen.getByText('Definir objetivos del sprint').closest('article') as HTMLElement)
    await user.click(within(screen.getByText('Definir objetivos del sprint').closest('article') as HTMLElement).getByRole('button', { name: 'Eliminar' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Definir objetivos del sprint')
    expect(screen.getByRole('button', { name: 'Confirmar eliminación' })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(taskActions.getByRole('button', { name: 'Eliminar' })).toHaveFocus()
    expect(screen.getByText('Definir objetivos del sprint')).toBeInTheDocument()
    await user.click(taskActions.getByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))
    await screen.findByText('Tarea eliminada.')
    expect(screen.queryByText('Definir objetivos del sprint')).not.toBeInTheDocument()
  })

  it('keeps the previous status when the server rejects an update', async () => {
    const user = userEvent.setup()
    const base = createDemoTaskService()
    const service = { ...base, updateTask: vi.fn().mockRejectedValue(new Error('Sin permisos')) }
    render(<ProjectBoard projectId="demo-project" service={service} />)
    await screen.findByText('Definir objetivos del sprint')
    const status = screen.getByRole('combobox', { name: 'Cambiar estado para Definir objetivos del sprint' })
    await user.selectOptions(status, 'DONE')
    expect(await screen.findByRole('alert')).toHaveTextContent('Sin permisos')
    expect(status).toHaveValue('TODO')
  })

  it('keeps a task visible when delete fails', async () => {
    const user = userEvent.setup()
    const base = createDemoTaskService()
    const service = { ...base, deleteTask: vi.fn().mockRejectedValue(new Error('No se pudo eliminar')) }
    render(<ProjectBoard projectId="demo-project" service={service} />)
    await screen.findByText('Definir objetivos del sprint')
    const card = screen.getByText('Definir objetivos del sprint').closest('article') as HTMLElement
    await user.click(within(card).getByRole('button', { name: 'Eliminar' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo eliminar')
    expect(screen.getByText('Definir objetivos del sprint')).toBeInTheDocument()
  })
})
