import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IconPicker from './IconPicker'

describe('IconPicker', () => {
  it('renders 20 icon options in a grid', async () => {
    const user = userEvent.setup()
    render(<IconPicker onChange={vi.fn()} />)

    // Open the popover
    const trigger = screen.getByTestId('icon-picker-trigger')
    await user.click(trigger)

    // All 20 icons should be visible
    const expectedIcons = [
      'Link', 'ArrowRight', 'Combine', 'GitBranch', 'Shuffle',
      'Layers', 'Replace', 'ExternalLink', 'ArrowLeftRight', 'TrendingUp',
      'TrendingDown', 'Activity', 'BarChart3', 'PieChart', 'LineChart',
      'Network', 'Share2', 'Merge', 'Split', 'Workflow',
    ]
    for (const name of expectedIcons) {
      expect(screen.getByTestId(`icon-picker-option-${name}`)).toBeInTheDocument()
    }
  })

  it('calls onChange with selected icon and closes popover', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<IconPicker onChange={handleChange} />)

    // Open the popover
    const trigger = screen.getByTestId('icon-picker-trigger')
    await user.click(trigger)

    // Click an icon
    const option = screen.getByTestId('icon-picker-option-ArrowRight')
    await user.click(option)

    // onChange should be called
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('ArrowRight')

    // Popover should be closed
    expect(screen.queryByTestId('icon-picker-option-Link')).not.toBeInTheDocument()
  })

  it('filters icons by search keyword', async () => {
    const user = userEvent.setup()
    render(<IconPicker onChange={vi.fn()} />)

    // Open the popover
    const trigger = screen.getByTestId('icon-picker-trigger')
    await user.click(trigger)

    // Type search keyword
    const searchInput = screen.getByTestId('icon-picker-search')
    await user.type(searchInput, 'Arrow')

    // Only matching icons should be visible
    expect(screen.getByTestId('icon-picker-option-ArrowRight')).toBeInTheDocument()
    expect(screen.getByTestId('icon-picker-option-ArrowLeftRight')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-picker-option-Link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('icon-picker-option-Combine')).not.toBeInTheDocument()
  })
})
