import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChangeTimeline from './ChangeTimeline'
import type { ChangeLogEntry } from '@/models/linkRelationModel'

describe('ChangeTimeline', () => {
  const mockChanges: ChangeLogEntry[] = [
    { timestamp: '2026-01-15 09:30:00', type: '创建', field: 'enabled', oldValue: '-', newValue: 'true', operator: 'admin' },
    { timestamp: '2026-02-20 14:15:00', type: '修改', field: 'description', oldValue: '聚合关系', newValue: '聚合关系：子指标汇总为父指标', operator: 'zhangsan' },
  ]

  it('renders timeline title', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('变更记录')).toBeInTheDocument()
  })

  it('renders each change entry with timestamp', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('2026-01-15 09:30:00')).toBeInTheDocument()
    expect(screen.getByText('2026-02-20 14:15:00')).toBeInTheDocument()
  })

  it('renders change type labels', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('创建')).toBeInTheDocument()
    expect(screen.getByText('修改')).toBeInTheDocument()
  })

  it('renders operator names', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    const operators = screen.getAllByText(/admin|zhangsan/)
    expect(operators.length).toBe(2)
  })

  it('renders old and new values', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('聚合关系')).toBeInTheDocument()
    expect(screen.getByText('聚合关系：子指标汇总为父指标')).toBeInTheDocument()
  })

  it('renders empty state when no changes', () => {
    render(<ChangeTimeline changes={[]} />)
    expect(screen.getByText('暂无变更记录')).toBeInTheDocument()
  })
})
