import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import IndicatorAttributeGraph from './IndicatorAttributeGraph'
import type { Indicator } from '@/models/indicatorModel'

const mockIndicator: Indicator = {
  id: 'ind-001',
  name: '5G用户渗透率',
  code: '5G-001',
  indicatorCode: '5G-001',
  indicatorDisplayName: '5G用户渗透率',
  indicatorShowName: '5G渗透率',
  indicatorType: '基础指标',
  level1: '发展',
  level2: '用户发展',
  granularity: '省分',
  frequency: '月',
  unit: '百分比',
  isBigScreen: true,
  department: '市场部',
  businessCaliber: '5G用户数除以移动用户总数',
  techCaliber: 'COUNT(5G用户)/COUNT(移动用户)',
  tags: ['核心指标'],
  source: '经营管理大屏',
}

describe('IndicatorAttributeGraph', () => {
  it('renders center node with indicator name', () => {
    render(<IndicatorAttributeGraph indicator={mockIndicator} />)

    expect(screen.getByText('5G用户渗透率')).toBeInTheDocument()
  })

  it('renders 13 peripheral field nodes', () => {
    render(<IndicatorAttributeGraph indicator={mockIndicator} />)

    // 中心节点之外的 13 个外围节点应包含字段标签+值
    expect(screen.getByText(/指标编码/)).toBeInTheDocument()
    expect(screen.getByText(/一级/)).toBeInTheDocument()
    expect(screen.getByText(/颗粒度/)).toBeInTheDocument()
    expect(screen.getByText(/是否大屏使用/)).toBeInTheDocument()
  })

  it('calls onFieldClick when clicking a peripheral node', () => {
    const handleClick = vi.fn()
    render(<IndicatorAttributeGraph indicator={mockIndicator} onFieldClick={handleClick} />)

    // 点击"一级"节点（包含 "一级" 文本的 SVG 元素）
    const level1Node = screen.getByText('一级').closest('g')
    expect(level1Node).toBeTruthy()
    fireEvent.click(level1Node!)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'level1', label: '一级', type: 'enum' }),
      '发展'
    )
  })

  it('renders 13 connecting lines between center and peripheral nodes', () => {
    const { container } = render(<IndicatorAttributeGraph indicator={mockIndicator} />)

    const lines = container.querySelectorAll('svg > line')
    expect(lines).toHaveLength(13)
  })
})
