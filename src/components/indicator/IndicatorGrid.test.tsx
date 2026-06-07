import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import IndicatorGrid from './IndicatorGrid'

const mockIndicators = [
  {
    id: 'ind-001',
    name: '5G用户渗透率',
    code: '5G_PENETRATION',
    level1: '发展',
    level2: '用户发展',
    source: '市场部',
  },
  {
    id: 'ind-002',
    name: '营收完成率',
    code: 'REVENUE_COMPLETION',
    level1: '经营',
    level2: '收入',
    source: '财务部',
  },
  {
    id: 'ind-003',
    name: '客户满意度',
    code: 'CSAT',
    level1: '服务',
    level2: '客户满意度',
    source: '客服部',
  },
]

describe('IndicatorGrid', () => {
  it('renders the correct number of cards', () => {
    render(<IndicatorGrid indicators={mockIndicators} />)

    const cards = screen.getAllByTestId('indicator-card')
    expect(cards).toHaveLength(3)
  })

  it('uses CSS Grid layout', () => {
    const { container } = render(<IndicatorGrid indicators={mockIndicators} />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass('grid')
  })

  it('has auto-fill minmax column sizing', () => {
    const { container } = render(<IndicatorGrid indicators={mockIndicators} />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveStyle({
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    })
  })

  it('has responsive breakpoints', () => {
    const { container } = render(<IndicatorGrid indicators={mockIndicators} />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass('md:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-3')
    expect(grid).toHaveClass('min-[1440px]:grid-cols-4')
  })

  it('renders an empty placeholder when no indicators are provided', () => {
    render(<IndicatorGrid indicators={[]} />)

    expect(screen.getByTestId('indicator-grid-empty')).toBeInTheDocument()
  })
})
