import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { login } from '../../src/services/api/auth'
import { clearAccessToken, requestJson } from '../../src/services/api/client'
import { server } from '../setup'

const baseUrl = 'https://api.example.test/v1'

describe('login contract', () => {
  it('posts email/password, accepts AuthResponse, and keeps the JWT in memory', async () => {
    let requestBody: unknown
    let loginAuthHeader: string | null = null
    let nextAuthHeader: string | null = null
    server.use(
      http.post(`${baseUrl}/auth/login`, async ({ request }) => {
        requestBody = await request.json()
        loginAuthHeader = request.headers.get('authorization')
        return HttpResponse.json({
          token: 'ephemeral-session-token',
          user: {
            id: '00000000-0000-4000-8000-000000000001',
            email: 'person@example.test',
            name: 'Persona',
            created_at: '2025-01-01T00:00:00Z',
          },
        })
      }),
      http.get(`${baseUrl}/tasks`, ({ request }) => {
        nextAuthHeader = request.headers.get('authorization')
        return HttpResponse.json([])
      }),
    )
    const response = await login(baseUrl, 'person@example.test', 'password')
    await requestJson(baseUrl, '/tasks')
    expect(requestBody).toEqual({ email: 'person@example.test', password: 'password' })
    expect(loginAuthHeader).toBeNull()
    expect(response.token).toBe('ephemeral-session-token')
    expect(nextAuthHeader).toBe('Bearer ephemeral-session-token')
    expect(localStorage.length).toBe(0)
    clearAccessToken()
  })
})
