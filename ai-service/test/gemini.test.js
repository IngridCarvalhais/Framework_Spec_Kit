import test from 'node:test'
import assert from 'node:assert/strict'
import { requestGeminiScores } from '../src/gemini.js'
import { ServiceError } from '../src/errors.js'

const tasks = [{ id: 'task-1', title: 'Task', description: 'Description' }]

test('sends only task context to Gemini and parses constrained JSON output', async () => {
  let request
  const result = await requestGeminiScores(tasks, {
    apiKey: 'test-secret',
    fetchImpl: async (url, options) => {
      request = { url, options }
      return Response.json({
        candidates: [{ content: { parts: [{ text: JSON.stringify({
          tasks: [{ id: 'task-1', semantic_score: 0.7, reason: 'Bloqueo descrito.' }],
        }) }] } }],
      })
    },
  })
  assert.equal(result.tasks[0].semantic_score, 0.7)
  assert.equal(request.options.headers['x-goog-api-key'], 'test-secret')
  assert.match(request.url, /gemini-2\.5-flash:generateContent/)
  const body = JSON.parse(request.options.body)
  assert.equal(body.generationConfig.responseMimeType, 'application/json')
  assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), { tasks })
  assert.equal(JSON.stringify(body).includes('test-secret'), false)
})

test('maps provider rate limits, unavailable responses and malformed JSON', async () => {
  await assert.rejects(
    requestGeminiScores(tasks, { apiKey: 'key', fetchImpl: async () => new Response('', { status: 429 }) }),
    (error) => error instanceof ServiceError && error.status === 429,
  )
  await assert.rejects(
    requestGeminiScores(tasks, { apiKey: 'key', fetchImpl: async () => new Response('', { status: 503 }) }),
    (error) => error instanceof ServiceError && error.status === 503,
  )
  await assert.rejects(
    requestGeminiScores(tasks, {
      apiKey: 'key',
      fetchImpl: async () => Response.json({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }),
    }),
    (error) => error instanceof ServiceError && error.status === 502,
  )
})

test('fails explicitly when the Gemini key is not configured', async () => {
  await assert.rejects(
    requestGeminiScores(tasks, { apiKey: '' }),
    (error) => error instanceof ServiceError && error.status === 503,
  )
})
