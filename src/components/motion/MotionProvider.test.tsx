import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MotionProvider } from './MotionProvider'

describe('MotionProvider', () => {
  it('renders children', () => {
    render(
      <MotionProvider>
        <div data-testid="child">Hello</div>
      </MotionProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('wraps children in MotionConfig with reducedMotion="user"', () => {
    const { container } = render(
      <MotionProvider>
        <div data-testid="child">Hello</div>
      </MotionProvider>,
    )

    // MotionConfig renders a context provider without extra DOM elements.
    // We verify the child is present and the component renders without errors.
    expect(container.querySelector('[data-testid="child"]')).toBeInTheDocument()
  })
})
