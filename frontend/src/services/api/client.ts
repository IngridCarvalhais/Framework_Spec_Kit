export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let accessToken: string | null = null

export function setAccessToken(token: string): void {
  accessToken = token
}

export function clearAccessToken(): void {
  accessToken = null
}

type RequestOptions = {
  method?: string
  body?: unknown
  signal?: AbortSignal
  authenticated?: boolean
}

export async function requestJson<T>(
  baseUrl: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(path.replace(/^\/+/, ''), `${baseUrl.replace(/\/+$/, '')}/`)
  const headers = new Headers({ Accept: 'application/json' })
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (options.authenticated !== false && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  })

  if (response.status === 401) clearAccessToken()
  if (response.status === 204 || response.status === 205) return undefined as T

  const text = await response.text()
  if (!text) {
    if (!response.ok) throw new ApiError(`La solicitud falló (HTTP ${response.status}).`, response.status)
    return undefined as T
  }

  let payload: unknown
  try {
    payload = JSON.parse(text)
  } catch {
    throw new ApiError(`El servidor devolvió una respuesta no válida (HTTP ${response.status}).`, response.status)
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload &&
      typeof payload.message === 'string'
      ? payload.message
      : `La solicitud falló (HTTP ${response.status}).`
    throw new ApiError(message, response.status)
  }

  return payload as T
}
