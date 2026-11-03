import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPrioritization, validateSemanticResults, validateTaskSnapshot } from '../src/scoring.js'
import { ServiceError } from '../src/errors.js'

const projectId = 'demo-project'
const task = (overrides = {}) => ({
  id: 'task-1',
  project_id: projectId,
  title: 'Revisar el flujo de pago',
  description: 'Un bloqueo impide completar la compra.',
  status: 'TODO',
  priority: 'HIGH',
  due_date: '2025-01-01T12:00:00.000Z',
  created_at: '2024-12-01T00:00:00.000Z',
  ...overrides,
})

test('computes the documented 0.9 and 0.1 score examples', () => {
  const reference = new Date('2025-01-01T00:00:00.000Z')
  const high = buildPrioritization(projectId, [task()], {
    tasks: [{ id: 'task-1', semantic_score: 0.5, reason: 'Bloquea compras.' }],
  }, reference)
  assert.equal(high.tasks[0].ai_score, 0.9)

  const lowTask = task({ priority: 'LOW', due_date: null })
  const low = buildPrioritization(projectId, [lowTask], {
    tasks: [{ id: 'task-1', semantic_score: 0.5, reason: 'Información insuficiente.' }],
  }, reference)
  assert.equal(low.tasks[0].ai_score, 0.1)
})

test('uses the exact due-date boundaries', () => {
  const reference = new Date('2025-01-01T00:00:00.000Z')
  const cases = [
    ['2025-01-02T00:00:00.000Z', 1],
    ['2025-01-02T00:00:00.001Z', 0.75],
    ['2025-01-04T00:00:00.000Z', 0.75],
    ['2025-01-04T00:00:00.001Z', 0.5],
    ['2025-01-08T00:00:00.000Z', 0.5],
    ['2025-01-08T00:00:00.001Z', 0.25],
  ]
  for (const [due_date, dueScore] of cases) {
    const item = task({ priority: 'LOW', due_date })
    const result = buildPrioritization(projectId, [item], {
      tasks: [{ id: item.id, semantic_score: 0, reason: 'Contexto.' }],
    }, reference)
    assert.equal(result.tasks[0].ai_score, Math.round(0.5 * dueScore * 10_000) / 10_000)
  }
})

test('ranks equal scores by creation time and then id', () => {
  const tasks = [
    task({ id: 'z', created_at: '2025-01-01T00:00:00Z' }),
    task({ id: 'b', created_at: '2024-01-01T00:00:00Z' }),
    task({ id: 'a', created_at: '2024-01-01T00:00:00Z' }),
  ]
  const result = buildPrioritization(projectId, tasks, {
    tasks: tasks.map(({ id }) => ({ id, semantic_score: 0.5, reason: 'Igual.' })),
  }, new Date('2025-01-01T00:00:00Z'))
  assert.deepEqual(result.tasks.map(({ id }) => id), ['a', 'b', 'z'])
})

test('rejects non-TODO, wrong-project and oversized snapshots', () => {
  assert.throws(() => validateTaskSnapshot(projectId, [task({ status: 'DONE' })]), ServiceError)
  assert.throws(() => validateTaskSnapshot(projectId, [task({ project_id: 'other' })]), ServiceError)
  assert.throws(() => validateTaskSnapshot(projectId, Array(101).fill(task())), ServiceError)
})

test('rejects missing, duplicate, foreign and invalid semantic scores', () => {
  const tasks = [task()]
  for (const results of [
    { tasks: [] },
    { tasks: [{ id: 'other', semantic_score: 0.5, reason: 'ok' }] },
    { tasks: [{ id: 'task-1', semantic_score: 1.1, reason: 'ok' }] },
    { tasks: [{ id: 'task-1', semantic_score: true, reason: 'ok' }] },
    { tasks: [{ id: 'task-1', semantic_score: 0.5, reason: '' }] },
  ]) {
    assert.throws(() => validateSemanticResults(tasks, results), ServiceError)
  }
})
