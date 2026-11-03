import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from '../../src/features/auth/LoginForm'

describe('LoginForm', () => {
  it('submits the documented email and password once and exposes errors', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm error="Credenciales no válidas" onSubmit={submit} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales no válidas')
    await user.type(screen.getByLabelText('Correo electrónico'), 'person@example.test')
    await user.type(screen.getByLabelText('Contraseña'), 'secret-pass')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(submit).toHaveBeenCalledWith('person@example.test', 'secret-pass')
  })
})
