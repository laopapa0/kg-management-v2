import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TreeSearchInput from './TreeSearchInput'

function ControlledInput({ initialValue = '' }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue)
  return <TreeSearchInput value={value} onChange={setValue} />
}

describe('TreeSearchInput', () => {
  it('renders with search icon', () => {
    render(<ControlledInput />)
    expect(screen.getByTestId('tree-search-icon')).toBeInTheDocument()
  })

  it('shows clear button only when has value', async () => {
    const user = userEvent.setup()
    render(<ControlledInput />)
    expect(screen.queryByTestId('tree-search-clear')).not.toBeInTheDocument()

    const input = screen.getByTestId('tree-search-input')
    await user.type(input, 'foo')
    expect(screen.getByTestId('tree-search-clear')).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    function SpyInput() {
      const [value, setValue] = useState('')
      return (
        <TreeSearchInput
          value={value}
          onChange={(v) => {
            setValue(v)
            onChange(v)
          }}
        />
      )
    }

    render(<SpyInput />)
    const input = screen.getByTestId('tree-search-input')
    await user.type(input, 'cost')
    expect(onChange).toHaveBeenLastCalledWith('cost')
  })

  it('clears value when clear button clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeSearchInput value="foo" onChange={onChange} />)

    await user.click(screen.getByTestId('tree-search-clear'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('has 36px height and focus ring styles', () => {
    render(<ControlledInput />)
    const input = screen.getByTestId('tree-search-input')
    expect(input).toHaveClass('h-9')
    expect(input).toHaveClass('focus:border-[#4DA6FF]')
  })
})
