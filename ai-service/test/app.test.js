import test from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

test('returns an empty result without calling Gemini when there are no TODOs', async () => {
  let providerCalls = 0
  await withServer(createApp(async () => { providerCalls += 1 }), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/projects/demo-project/tasks/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [] }),
    })
    assert.equal(response.status, 200)
    const result = await response.json()
    assert.equal(result.project_id, 'demo-project')
    assert.equal(Number.isFinite(Date.parse(result.reference_time)), true)
    assert.equal(result.scoring_version, 'v1')
    assert.deepEqual(result.tasks, [])
  })
  assert.equal(providerCalls, 0)
})

test('rejects cross-project and non-pending tasks before provider use', async () => {
  let providerCalls = 0
  const task = {
    id: 'task-1',
    project_id: 'other-project',
    title: 'A task',
    status: 'TODO',
    priority: 'HIGH',
    due_date: null,
    created_at: '2025-01-01T00:00:00Z',
  }
  await withServer(createApp(async () => { providerCalls += 1 }), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/v1/projects/demo-project/tasks/prioritize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: [task] }),
    })
    assert.equal(response.status, 422)
    assert.match((await response.json()).message, /proyecto indicado/)
  })
  assert.equal(providerCalls, 0)
})
