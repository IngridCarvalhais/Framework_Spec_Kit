import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskFilters } from '../../src/components/board/TaskFilters'

describe('TaskFilters', () => {
  it('keeps exact enum values, combines filters and clears them', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const { rerender } = render(<TaskFilters filters={{}} onChange={onChange} onClear={onClear} />)
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'IN_PROGRESS' } })
    expect(onChange).toHaveBeenCalledWith({ status: 'IN_PROGRESS' })
    rerender(<TaskFilters filters={{ status: 'IN_PROGRESS' }} onChange={onChange} onClear={onClear} />)
    fireEvent.change(screen.getByLabelText('Prioridad'), { target: { value: 'HIGH' } })
    expect(onChange).toHaveBeenLastCalledWith({ status: 'IN_PROGRESS', priority: 'HIGH' })
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
