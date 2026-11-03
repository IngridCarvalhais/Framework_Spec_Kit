import { useState, type FormEvent } from 'react'
import { FeedbackBanner } from '../../components/feedback/FeedbackBanner'

export function LoginForm({ error, onSubmit }: {
  error: string
  onSubmit: (email: string, password: string) => Promise<void>
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await onSubmit(email.trim(), password)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login-panel">
      <h1>Iniciar sesión</h1>
      <p>Usa tu cuenta de TaskManager AI para consultar el proyecto configurado.</p>
      {error && <FeedbackBanner kind="error">{error}</FeedbackBanner>}
      <form className="editor" onSubmit={submit}>
        <div className="field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="form-actions"><button type="submit" disabled={busy}>{busy ? 'Conectando…' : 'Iniciar sesión'}</button></div>
      </form>
    </section>
  )
}
