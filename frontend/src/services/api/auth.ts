import type { AuthLoginRequest, AuthResponse } from '../../types/api'
import { requestJson, setAccessToken } from './client'

export async function login(baseUrl: string, email: string, password: string): Promise<AuthResponse> {
  const body: AuthLoginRequest = { email, password }
  const response = await requestJson<AuthResponse>(baseUrl, '/auth/login', {
    method: 'POST',
    body,
    authenticated: false,
  })
  setAccessToken(response.token)
  return response
}
