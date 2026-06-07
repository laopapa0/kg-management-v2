import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagColorPicker from './TagColorPicker'

const PRESET_Magenta = '#EB2F96'
const PRESET_Blue = '#1890FF'

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/)
  if (!match) return null
  return `#${[match[1], match[2], match[3]].map((x) => parseInt(x).toString(16).padStart(2, '0')).join('')}`
}

describe('TagColorPicker', () => {
  it('renders trigger dot with current color', () => {
    render(<TagColorPicker color={PRESET_Blue} onChange={() => {}} />)
    const trigger = screen.getByTestId('tag-color-trigger')
    expect(trigger).toBeInTheDocument()
    const hex = rgbToHex(trigger.style.backgroundColor)
    expect(hex?.toUpperCase()).toBe(PRESET_Blue)
  })

  it('renders 8 preset colors in 4x2 grid', async () => {
    const user = userEvent.setup()
    render(<TagColorPicker color={PRESET_Blue} onChange={() => {}} />)

    await user.click(screen.getByTestId('tag-color-trigger'))

    const grid = screen.getByTestId('tag-color-preset-grid')
    expect(grid).toBeInTheDocument()
    expect(grid.children).toHaveLength(8)
  })

  it('calls onChange with preset color when clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TagColorPicker color={PRESET_Blue} onChange={onChange} />)

    await user.click(screen.getByTestId('tag-color-trigger'))
    await user.click(screen.getByTestId(`tag-color-preset-${PRESET_Magenta}`))

    expect(onChange).toHaveBeenCalledWith(PRESET_Magenta)
  })

  it('shows white border on selected preset', async () => {
    const user = userEvent.setup()
    render(<TagColorPicker color={PRESET_Blue} onChange={() => {}} />)

    await user.click(screen.getByTestId('tag-color-trigger'))

    const selected = screen.getByTestId(`tag-color-preset-${PRESET_Blue}`)
    expect(selected).toHaveClass('ring-2')
    expect(selected).toHaveClass('ring-white')
  })

  it('supports custom hex input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TagColorPicker color={PRESET_Blue} onChange={onChange} />)

    await user.click(screen.getByTestId('tag-color-trigger'))

    const input = screen.getByTestId('tag-color-hex-input')
    await user.clear(input)
    await user.type(input, '#FF5733')
    await user.click(screen.getByTestId('tag-color-hex-apply'))

    expect(onChange).toHaveBeenCalledWith('#FF5733')
  })

  it('rejects invalid hex input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TagColorPicker color={PRESET_Blue} onChange={onChange} />)

    await user.click(screen.getByTestId('tag-color-trigger'))

    const input = screen.getByTestId('tag-color-hex-input')
    await user.clear(input)
    await user.type(input, 'not-a-hex')
    await user.click(screen.getByTestId('tag-color-hex-apply'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('tag-color-hex-error')).toHaveTextContent(/无效/)
  })

  it('preset swatch has 24x24 size and hover scale', async () => {
    const user = userEvent.setup()
    render(<TagColorPicker color={PRESET_Blue} onChange={() => {}} />)

    await user.click(screen.getByTestId('tag-color-trigger'))

    const swatch = screen.getByTestId(`tag-color-preset-${PRESET_Blue}`)
    expect(swatch).toHaveClass('size-6')
    expect(swatch).toHaveClass('hover:scale-[1.15]')
  })
})
