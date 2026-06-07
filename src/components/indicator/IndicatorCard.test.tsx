import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IndicatorCard from './IndicatorCard'

const baseIndicator = {
  id: 'ind-001',
  name: '5G用户渗透率',
  code: '5G_PENETRATION',
  level1: '发展',
  level2: '用户发展',
  source: '市场部',
}

describe('IndicatorCard', () => {
  it('renders primary info: name and code', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument()
    expect(screen.getByText('5G_PENETRATION')).toBeInTheDocument()
  })

  it('renders secondary category tags', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('发展')).toBeInTheDocument()
    expect(screen.getByText('用户发展')).toBeInTheDocument()
  })

  it('renders meta info: source badge', () => {
    render(<IndicatorCard {...baseIndicator} />)

    expect(screen.getByText('市场部')).toBeInTheDocument()
  })

  it('default state has no shadow and no special ring', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} />)

    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveClass('shadow-card-hover')
    expect(card).not.toHaveClass('ring-2')
  })

  it('hover state lifts 1px and adds shadow', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="hover" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('-translate-y-px')
    expect(card).toHaveClass('shadow-card-hover')
  })

  it('selected state shows brand ring, glow and pulse dot', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="selected" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('ring-2')
    expect(card).toHaveClass('ring-dark-accent-primary')
    expect(card).toHaveClass('shadow-[0_0_12px_rgba(91,141,239,0.35)]')
    expect(screen.getByTestId('pulse-dot')).toBeInTheDocument()
  })

  it('attached state dims opacity and shows green badge', () => {
    const { container } = render(<IndicatorCard {...baseIndicator} state="attached" />)

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('opacity-50')
    expect(screen.getByText('已挂靠')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<IndicatorCard {...baseIndicator} onClick={onClick} />)

    const card = screen.getByTestId('indicator-card')
    await user.click(card)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
