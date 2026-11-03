import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, requestJson, setAccessToken } from '../../src/services/api/client'
import { normalizeApiBaseUrl } from '../../src/app/dataMode'

afterEach(() => {
  clearAccessToken()
  vi.unstubAllGlobals()
})

describe('HTTP client', () => {
  it('uses the /v1 prefix once and sends a bearer token held only in memory', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    setAccessToken('session-token')

    await requestJson(normalizeApiBaseUrl('https://api.example.test/v1'), '/tasks')

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/v1/tasks')
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer session-token')
    expect(localStorage.length).toBe(0)
  })

  it('does not parse a 204 response as JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    await expect(requestJson('https://api.example.test/v1', '/tasks/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('surfaces HTTP status and API message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'Sin permiso' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })))
    await expect(requestJson('https://api.example.test/v1', '/tasks/1')).rejects.toMatchObject({
      status: 403,
      message: 'Sin permiso',
    })
  })
})
