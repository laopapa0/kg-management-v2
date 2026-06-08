import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DeleteConnectionButton from './DeleteConnectionButton'

describe('DeleteConnectionButton', () => {
  it('renders at given position centered on the point', () => {
    render(<DeleteConnectionButton x={100} y={200} onClick={() => {}} visible />)

    const button = screen.getByTestId('delete-connection-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveStyle({ left: '90px', top: '190px' })
  })

  it('does not render when not visible', () => {
    const { container } = render(
      <DeleteConnectionButton x={100} y={200} onClick={() => {}} visible={false} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<DeleteConnectionButton x={100} y={200} onClick={onClick} visible />)

    fireEvent.click(screen.getByTestId('delete-connection-button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('has red background and × icon', () => {
    render(<DeleteConnectionButton x={100} y={200} onClick={() => {}} visible />)

    const button = screen.getByTestId('delete-connection-button')
    expect(button).toHaveTextContent('×')
    expect(button).toHaveClass('bg-red-500')
  })

  it('has fixed positioning and pointer-events-auto', () => {
    render(<DeleteConnectionButton x={100} y={200} onClick={() => {}} visible />)

    const button = screen.getByTestId('delete-connection-button')
    expect(button).toHaveClass('fixed')
    expect(button).toHaveClass('pointer-events-auto')
  })

  it('has scale enter animation class', () => {
    render(<DeleteConnectionButton x={100} y={200} onClick={() => {}} visible />)

    const button = screen.getByTestId('delete-connection-button')
    expect(button).toHaveClass('animate-scale-in')
  })

  it('has z-50 to float above connection layer', () => {
    render(<DeleteConnectionButton x={100} y={200} onClick={() => {}} visible />)

    const button = screen.getByTestId('delete-connection-button')
    expect(button).toHaveClass('z-50')
  })
})
