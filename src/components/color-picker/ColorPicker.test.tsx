import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ColorPicker from './ColorPicker'

describe('ColorPicker', () => {
  it('renders 12 preset color swatches', async () => {
    const user = userEvent.setup()
    render(<ColorPicker onChange={vi.fn()} />)

    // Open the popover
    const trigger = screen.getByTestId('color-picker-trigger')
    await user.click(trigger)

    // All 12 preset colors should be visible
    expect(screen.getByTestId('color-picker-preset-#3B82F6')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#22C55E')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#EF4444')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#F59E0B')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#8B5CF6')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#EC4899')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#06B6D4')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#84CC16')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#F97316')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#6366F1')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#14B8A6')).toBeInTheDocument()
    expect(screen.getByTestId('color-picker-preset-#E11D48')).toBeInTheDocument()
  })

  it('calls onChange with selected preset color and closes popover', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ColorPicker onChange={handleChange} />)

    // Open the popover
    const trigger = screen.getByTestId('color-picker-trigger')
    await user.click(trigger)

    // Click a preset color
    const preset = screen.getByTestId('color-picker-preset-#3B82F6')
    await user.click(preset)

    // onChange should be called with the selected color
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('#3B82F6')

    // Popover should be closed
    expect(screen.queryByTestId('color-picker-preset-#22C55E')).not.toBeInTheDocument()
  })

  it('supports custom hex input and triggers onChange', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<ColorPicker onChange={handleChange} />)

    // Open the popover
    const trigger = screen.getByTestId('color-picker-trigger')
    await user.click(trigger)

    // Type a custom hex value
    const hexInput = screen.getByTestId('color-picker-hex-input')
    await user.clear(hexInput)
    await user.type(hexInput, 'FF5733')

    // Click apply button
    const applyBtn = screen.getByTestId('color-picker-hex-apply')
    await user.click(applyBtn)

    // onChange should be called with the custom color
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('#FF5733')

    // Popover should be closed
    expect(screen.queryByTestId('color-picker-hex-input')).not.toBeInTheDocument()
  })
})
