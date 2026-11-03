import { describe, expect, it } from 'vitest'
import { getDataMode, normalizeApiBaseUrl } from '../../src/app/dataMode'

describe('explicit data mode', () => {
  it('rejects a missing or unknown mode instead of silently choosing demo', () => {
    expect(getDataMode({}).mode).toBe('invalid')
    expect(getDataMode({ VITE_DATA_MODE: 'other' }).mode).toBe('invalid')
  })

  it('allows demo without remote credentials or project id', () => {
    expect(getDataMode({ VITE_DATA_MODE: 'demo' })).toEqual({ mode: 'demo' })
  })

  it('requires an API URL and valid project UUID in API mode', () => {
    expect(getDataMode({ VITE_DATA_MODE: 'api', VITE_API_BASE_URL: 'https://api.example.test/v1' }).mode).toBe('invalid')
    expect(getDataMode({
      VITE_DATA_MODE: 'api',
      VITE_API_BASE_URL: 'https://api.example.test/v1',
      VITE_PROJECT_ID: 'not-a-uuid',
    }).mode).toBe('invalid')
  })

  it('normalizes the /v1 prefix exactly once', () => {
    expect(normalizeApiBaseUrl('https://api.example.test')).toBe('https://api.example.test/v1')
    expect(normalizeApiBaseUrl('https://api.example.test/v1/')).toBe('https://api.example.test/v1')
    expect(() => normalizeApiBaseUrl('https://api.example.test/v1/v1')).toThrow('/v1')
  })

  it('does not activate demo when API mode configuration is invalid', () => {
    expect(getDataMode({ VITE_DATA_MODE: 'api' })).toMatchObject({ mode: 'invalid' })
  })
})
