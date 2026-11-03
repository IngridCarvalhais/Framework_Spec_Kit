import { useMemo, useState } from 'react'
import { FeedbackBanner } from './components/feedback/FeedbackBanner'
import { LoginForm } from './features/auth/LoginForm'
import { ProjectBoard } from './features/tasks/ProjectBoard'
import { getDataMode } from './app/dataMode'
import { createApiTaskService } from './services/api/taskService'
import { createDemoTaskService } from './services/demo/taskService'
import { prioritizeTasks } from './services/tasks/aiPrioritization'
import { login } from './services/api/auth'
import { clearAccessToken } from './services/api/client'
import './App.css'

export default function App() {
  const config = useMemo(() => getDataMode({
    VITE_DATA_MODE: import.meta.env.VITE_DATA_MODE,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
  }), [])
  const [session, setSession] = useState(false)
  const [loginError, setLoginError] = useState('')
  const service = useMemo(() => {
    if (config.mode === 'demo') return createDemoTaskService()
    if (config.mode === 'api') return createApiTaskService(config.apiBaseUrl)
    return null
  }, [config])
  const aiServiceUrl = import.meta.env.VITE_AI_SERVICE_URL || 'http://127.0.0.1:3001/v1'

  if (config.mode === 'invalid') {
    return <main className="shell"><FeedbackBanner kind="error">{config.message}</FeedbackBanner></main>
  }

  if (!service) return null

  if (config.mode === 'api' && !session) {
    return (
      <main className="shell">
        <header className="topbar"><a className="brand" href="/">TaskManager <span>AI</span></a></header>
        <LoginForm
          error={loginError}
          onSubmit={async (email, password) => {
            setLoginError('')
            try {
              await login(config.apiBaseUrl, email, password)
              setSession(true)
            } catch (error) {
              setLoginError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
            }
          }}
        />
      </main>
    )
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="TaskManager AI, inicio">TaskManager <span>AI</span></a>
        <p>Organiza el trabajo de tu equipo</p>
        {config.mode === 'api' && <button className="quiet-button" type="button" onClick={() => { clearAccessToken(); setSession(false) }}>Cerrar sesión</button>}
      </header>
      <ProjectBoard
        projectId={config.mode === 'api' ? config.projectId : 'demo-project'}
        service={service}
        prioritize={(projectId, tasks, signal) => prioritizeTasks(aiServiceUrl, projectId, tasks, signal)}
        onUnauthorized={() => setSession(false)}
      />
      <footer className="footer">TaskManager AI <span>·</span> Un paso a la vez, un proyecto a la vez.</footer>
    </main>
  )
}
