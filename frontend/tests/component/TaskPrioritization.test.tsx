import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PriorityControls } from '../../src/components/board/PriorityControls'
import { demoTasks } from '../../src/services/demo/taskFixtures'
import { sortTasksManually } from '../../src/features/tasks/manualPriority'

describe('manual priority and AI controls', () => {
  it('sorts priority, due date, creation date, and id deterministically', () => {
    const sorted = sortTasksManually([...demoTasks].reverse())
    expect(sorted.map((task) => task.id)).toEqual([
      demoTasks[0].id,
      demoTasks[1].id,
      demoTasks[2].id,
    ])
  })

  it('places missing dates last and uses created_at then id for ties', () => {
    const base = demoTasks[0]
    const later = { ...base, id: '00000000-0000-4000-8000-000000000010', created_at: '2025-01-03T09:00:00Z', due_date: null }
    const earlierId = { ...base, id: '00000000-0000-4000-8000-000000000009', created_at: '2025-01-03T09:00:00Z', due_date: '2025-01-20T00:00:00Z' }
    const earlierCreated = { ...base, id: '00000000-0000-4000-8000-000000000011', created_at: '2025-01-02T09:00:00Z', due_date: null }
    expect(sortTasksManually([later, earlierId, earlierCreated]).map((task) => task.id)).toEqual([
      earlierId.id,
      earlierCreated.id,
      later.id,
    ])
  })

  it('compares due dates by instant when their timezone offsets differ', () => {
    const base = demoTasks[0]
    const earlier = { ...base, id: '00000000-0000-4000-8000-000000000012', due_date: '2025-01-01T10:00:00+14:00' }
    const later = { ...base, id: '00000000-0000-4000-8000-000000000013', due_date: '2024-12-31T21:00:00Z' }
    expect(sortTasksManually([later, earlier]).map((task) => task.id)).toEqual([
      earlier.id,
      later.id,
    ])
  })

  it('uses timestamp order for creation dates with different timezone offsets', () => {
    const base = demoTasks[0]
    const earlier = { ...base, id: '00000000-0000-4000-8000-000000000014', created_at: '2025-01-02T10:00:00+14:00', due_date: null }
    const later = { ...base, id: '00000000-0000-4000-8000-000000000015', created_at: '2025-01-01T22:30:00Z', due_date: null }
    expect(sortTasksManually([later, earlier]).map((task) => task.id)).toEqual([
      earlier.id,
      later.id,
    ])
  })

  it('enables AI and keeps the manual option available', () => {
    const toggle = vi.fn()
    render(
      <PriorityControls
        manual={false}
        aiActive={false}
        available
        hasPendingTasks
        busy={false}
        loading={false}
        onToggleManual={toggle}
        onPrioritize={() => {}}
      />,
    )
    expect(screen.getByRole('button', { name: 'Priorizar con IA' })).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent('Se enviarán títulos y descripciones a Gemini')
    expect(screen.getByRole('button', { name: 'Ordenar manualmente' })).toBeEnabled()
  })
})
