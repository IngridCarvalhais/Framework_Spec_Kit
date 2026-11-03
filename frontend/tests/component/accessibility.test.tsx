import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { describe, expect, it } from 'vitest'
import { TaskFilters } from '../../src/components/board/TaskFilters'
import { TaskForm } from '../../src/components/forms/TaskForm'
import { ConfirmDialog } from '../../src/components/feedback/ConfirmDialog'
import { demoTasks } from '../../src/services/demo/taskFixtures'

describe('accessible controls', () => {
  it('labels filters, supports keyboard semantics, and has no axe violations', async () => {
    const { container } = render(
      <>
        <TaskFilters filters={{}} onChange={() => {}} onClear={() => {}} />
        <TaskForm busy={false} error="" onSave={async () => {}} onCancel={() => {}} />
        <ConfirmDialog task={demoTasks[0]} busy={false} onCancel={() => {}} onConfirm={() => {}} />
      </>,
    )
    expect(screen.getByLabelText('Estado')).toBeVisible()
    expect(screen.getByLabelText('Prioridad', { selector: 'select#filter-priority' })).toBeVisible()
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
