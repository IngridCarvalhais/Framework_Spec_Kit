export type DataMode = 'api' | 'demo'

export type DataModeConfig =
  | { mode: 'demo' }
  | { mode: 'api'; apiBaseUrl: string; projectId: string }
  | { mode: 'invalid'; message: string }

type Environment = {
  VITE_DATA_MODE?: string
  VITE_API_BASE_URL?: string
  VITE_PROJECT_ID?: string
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeApiBaseUrl(value: string): string {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('VITE_API_BASE_URL debe ser una URL HTTP(S) sin credenciales, query ni fragmento.')
  }
  const path = url.pathname.replace(/\/+$/, '')
  url.pathname = path || '/v1'
  if (/\/v1\/v1$/i.test(url.pathname)) {
    throw new Error('VITE_API_BASE_URL no debe repetir el prefijo /v1.')
  }
  if (!/\/v1$/i.test(url.pathname)) url.pathname = `${url.pathname}/v1`
  return url.toString().replace(/\/$/, '')
}

export function getDataMode(environment: Environment): DataModeConfig {
  if (environment.VITE_DATA_MODE === 'demo') return { mode: 'demo' }
  if (environment.VITE_DATA_MODE !== 'api') {
    return { mode: 'invalid', message: 'Configura explícitamente VITE_DATA_MODE como api o demo.' }
  }

  try {
    if (!environment.VITE_API_BASE_URL) throw new Error('Falta VITE_API_BASE_URL.')
    const apiBaseUrl = normalizeApiBaseUrl(environment.VITE_API_BASE_URL)
    if (!environment.VITE_PROJECT_ID || !uuidPattern.test(environment.VITE_PROJECT_ID)) {
      throw new Error('VITE_PROJECT_ID debe ser un UUID válido para el modo API.')
    }
    return { mode: 'api', apiBaseUrl, projectId: environment.VITE_PROJECT_ID }
  } catch (error) {
    return {
      mode: 'invalid',
      message: error instanceof Error ? error.message : 'La configuración API no es válida.',
    }
  }
}
