import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParameterDrawer from './ParameterDrawer'

// vaul uses PointerEvents which are not fully supported in JSDOM
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}

describe('ParameterDrawer', () => {
  const defaultProps = {
    ruleId: 'rule-threshold-p1',
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when open', () => {
    render(<ParameterDrawer {...defaultProps} />)
    expect(screen.getByTestId('parameter-drawer-content')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(<ParameterDrawer {...defaultProps} open={false} />)
    expect(screen.queryByTestId('parameter-drawer-content')).not.toBeInTheDocument()
  })

  it('has 480px width from the right', () => {
    render(<ParameterDrawer {...defaultProps} />)
    const content = screen.getByTestId('parameter-drawer-content')
    expect(content).toHaveClass('w-[480px]')
    expect(content).toHaveAttribute('data-vaul-drawer-direction', 'right')
  })

  it('shows three sections: Content, Interaction, Appearance', () => {
    render(<ParameterDrawer {...defaultProps} />)
    expect(screen.getByTestId('section-content-trigger')).toHaveTextContent(/Content/i)
    expect(screen.getByTestId('section-interaction-trigger')).toHaveTextContent(/Interaction/i)
    expect(screen.getByTestId('section-appearance-trigger')).toHaveTextContent(/Appearance/i)
  })

  it('expands Content section by default', () => {
    render(<ParameterDrawer {...defaultProps} />)
    const contentPanel = screen.getByTestId('section-content-panel')
    expect(contentPanel).toHaveAttribute('data-state', 'open')
  })

  it('collapses Interaction and Appearance by default', () => {
    render(<ParameterDrawer {...defaultProps} />)
    const interactionPanel = screen.getByTestId('section-interaction-panel')
    const appearancePanel = screen.getByTestId('section-appearance-panel')
    expect(interactionPanel).toHaveAttribute('data-state', 'closed')
    expect(appearancePanel).toHaveAttribute('data-state', 'closed')
  })

  it('shows configured count badge on collapsed section headers', () => {
    render(<ParameterDrawer {...defaultProps} />)
    const interactionTrigger = screen.getByTestId('section-interaction-trigger')
    expect(within(interactionTrigger).getByTestId('section-badge')).toBeInTheDocument()
  })

  it('toggles section open/close on click', async () => {
    const user = userEvent.setup()
    render(<ParameterDrawer {...defaultProps} />)

    const contentTrigger = screen.getByTestId('section-content-trigger')
    const contentPanel = screen.getByTestId('section-content-panel')

    expect(contentPanel).toHaveAttribute('data-state', 'open')
    await user.click(contentTrigger)
    expect(contentPanel).toHaveAttribute('data-state', 'closed')
    await user.click(contentTrigger)
    expect(contentPanel).toHaveAttribute('data-state', 'open')
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<ParameterDrawer {...defaultProps} onOpenChange={onOpenChange} />)

    const closeBtn = screen.getByTestId('drawer-close-btn')
    await user.click(closeBtn)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('displays rule name in drawer header', () => {
    render(<ParameterDrawer {...defaultProps} />)
    const header = screen.getByTestId('drawer-header')
    expect(header).toBeInTheDocument()
  })
})
