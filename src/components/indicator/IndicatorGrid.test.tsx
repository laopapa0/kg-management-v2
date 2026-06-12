import { describe, it, expect, vi } from 'vitest'
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

function generateIndicators(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `ind-${String(i).padStart(3, '0')}`,
    name: `指标${i + 1}`,
    code: `CODE_${i + 1}`,
    level1: `一级${(i % 5) + 1}`,
    level2: `二级${(i % 10) + 1}`,
    source: `来源${(i % 3) + 1}`,
  }))
}

// Mock react-virtuoso so tests run in jsdom without ResizeObserver
vi.mock('react-virtuoso', () => ({
  VirtuosoGrid: ({ totalCount, itemContent, components }: any) => {
    const List = components?.List || 'div'
    const Item = components?.Item || 'div'
    return (
      <div data-testid="virtuoso-grid">
        <List>
          {Array.from({ length: totalCount }).map((_, i) => (
            <Item key={i}>{itemContent(i)}</Item>
          ))}
        </List>
      </div>
    )
  },
}))

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

  it('has auto-fill responsive columns instead of fixed breakpoints', () => {
    const { container } = render(<IndicatorGrid indicators={mockIndicators} />)

    const grid = container.firstChild as HTMLElement
    expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(180px,1fr))]')
    // 不再使用固定断点
    expect(grid).not.toHaveClass('md:grid-cols-2')
    expect(grid).not.toHaveClass('lg:grid-cols-3')
  })

  it('renders EmptyState when no indicators are provided', () => {
    render(<IndicatorGrid indicators={[]} />)

    expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    expect(screen.getByText('暂无指标')).toBeInTheDocument()
  })

  describe('virtual scrolling', () => {
    it('renders virtual grid when indicators >= 100', () => {
      const items = generateIndicators(100)
      render(<IndicatorGrid indicators={items} />)

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument()
      const cards = screen.getAllByTestId('indicator-card')
      expect(cards).toHaveLength(100)
    })

    it('renders full grid when forceDisableVirtualization is true', () => {
      const items = generateIndicators(100)
      render(<IndicatorGrid indicators={items} forceDisableVirtualization />)

      expect(screen.queryByTestId('virtuoso-grid')).not.toBeInTheDocument()
      const cards = screen.getAllByTestId('indicator-card')
      expect(cards).toHaveLength(100)
    })

    it('switches back to virtual grid when forceDisableVirtualization is removed', () => {
      const items = generateIndicators(100)
      const { rerender } = render(
        <IndicatorGrid indicators={items} forceDisableVirtualization />
      )

      expect(screen.queryByTestId('virtuoso-grid')).not.toBeInTheDocument()

      rerender(<IndicatorGrid indicators={items} />)

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument()
    })
  })

  describe('search filtering', () => {
    it('filters indicators by searchQuery (name match)', () => {
      const items = generateIndicators(10)
      items[5].name = '特殊指标名称'
      render(<IndicatorGrid indicators={items} searchQuery="特殊" />)

      const cards = screen.getAllByTestId('indicator-card')
      expect(cards).toHaveLength(1)
      expect(screen.getByText('特殊指标名称')).toBeInTheDocument()
    })

    it('filters indicators by searchQuery (code match)', () => {
      const items = generateIndicators(10)
      items[3].code = 'SPECIAL_CODE'
      render(<IndicatorGrid indicators={items} searchQuery="SPECIAL" />)

      const cards = screen.getAllByTestId('indicator-card')
      expect(cards).toHaveLength(1)
      expect(screen.getByText('SPECIAL_CODE')).toBeInTheDocument()
    })

    it('filters indicators by searchQuery (level1/level2 match)', () => {
      const items = generateIndicators(10)
      items[2].level1 = ' UniqueLevel '
      render(<IndicatorGrid indicators={items} searchQuery="uniquelevel" />)

      const cards = screen.getAllByTestId('indicator-card')
      expect(cards).toHaveLength(1)
    })

    it('uses virtual grid when filtered results >= 100', () => {
      const items = generateIndicators(200)
      render(<IndicatorGrid indicators={items} searchQuery="指标" />)

      expect(screen.getByTestId('virtuoso-grid')).toBeInTheDocument()
    })

    it('renders EmptyState when searchQuery filters out all indicators', () => {
      render(<IndicatorGrid indicators={mockIndicators} searchQuery="不存在的词" />)

      expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
      expect(screen.queryByTestId('indicator-card')).not.toBeInTheDocument()
    })

    it('is case-insensitive for searchQuery', () => {
      const items = generateIndicators(10)
      items[0].name = 'UpperCaseName'
      render(<IndicatorGrid indicators={items} searchQuery="uppercasename" />)

      expect(screen.getByText('UpperCaseName')).toBeInTheDocument()
    })
  })

  describe('compact mode', () => {
    it('compact 模式使用单列布局', () => {
      const { container } = render(
        <IndicatorGrid indicators={mockIndicators} compact />
      )

      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).not.toHaveClass('md:grid-cols-2')
      expect(grid).not.toHaveClass('lg:grid-cols-3')
    })

    it('compact 模式缩减间距和内边距', () => {
      const { container } = render(
        <IndicatorGrid indicators={mockIndicators} compact />
      )

      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('gap-2')
      expect(grid).toHaveClass('p-2')
    })

    it('非 compact 模式使用 auto-fill 自适应列布局', () => {
      const { container } = render(
        <IndicatorGrid indicators={mockIndicators} />
      )

      const grid = container.firstChild as HTMLElement
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(180px,1fr))]')
      expect(grid).toHaveClass('gap-4')
    })

    it('compact 模式下空状态仍正常渲染', () => {
      render(<IndicatorGrid indicators={[]} compact />)

      expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    })
  })
})
