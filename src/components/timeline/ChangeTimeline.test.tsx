import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChangeTimeline from './ChangeTimeline'
import type { ChangeLogEntry } from '@/models/linkRelationModel'

describe('ChangeTimeline', () => {
  const mockChanges: ChangeLogEntry[] = [
    { timestamp: '2026-01-15 09:30:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建聚合关系', operator: '财务部-张三' },
    { timestamp: '2026-02-20 14:15:00', type: '修改', field: 'description', oldValue: '直接汇总', newValue: '间接汇总', operator: '市场部-李四' },
    { timestamp: '2026-03-10 10:00:00', type: '删除', field: 'description', oldValue: '旧关联', newValue: '-', operator: '网络部-王五' },
  ]

  it('renders timeline title', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('变更记录')).toBeInTheDocument()
  })

  it('renders each change entry with timestamp', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('2026-01-15 09:30:00')).toBeInTheDocument()
    expect(screen.getByText('2026-02-20 14:15:00')).toBeInTheDocument()
    expect(screen.getByText('2026-03-10 10:00:00')).toBeInTheDocument()
  })

  it('renders change type labels', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    // Tab 按钮和变更记录 badge 都会包含"新增"/"修改"/"删除"文字，用 getAllByText 验证
    expect(screen.getAllByText('新增').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('修改').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('删除').length).toBeGreaterThanOrEqual(2)
  })

  it('renders operator names', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    const operators = screen.getAllByText(/财务部-张三|市场部-李四|网络部-王五/)
    expect(operators.length).toBe(3)
  })

  it('renders old and new values', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByText('新建聚合关系')).toBeInTheDocument()
    expect(screen.getByText('直接汇总')).toBeInTheDocument()
    expect(screen.getByText('间接汇总')).toBeInTheDocument()
  })

  it('renders empty state when no changes', () => {
    render(<ChangeTimeline changes={[]} />)
    expect(screen.getByText('暂无变更记录')).toBeInTheDocument()
  })

  it('renders filter tabs', () => {
    render(<ChangeTimeline changes={mockChanges} />)
    expect(screen.getByRole('tab', { name: '全部' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '新增' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '修改' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '删除' })).toBeInTheDocument()
  })

  it('filters by type when tab clicked', async () => {
    const user = userEvent.setup()
    render(<ChangeTimeline changes={mockChanges} />)

    // 初始状态：全部显示（Tab 按钮和 badge 各有一个"新增"和"删除"）
    expect(screen.getAllByText('新增').length).toBe(2)
    expect(screen.getAllByText('删除').length).toBe(2)

    // 点击"修改" Tab
    await user.click(screen.getByRole('tab', { name: '修改' }))
    expect(screen.getByText('间接汇总')).toBeInTheDocument()
    expect(screen.queryByText('新建聚合关系')).not.toBeInTheDocument()
    expect(screen.queryByText('-')).not.toBeInTheDocument()
  })

  it('shows empty state when filter yields no results', async () => {
    const user = userEvent.setup()
    const onlyAdd: ChangeLogEntry[] = [
      { timestamp: '2026-01-15 09:30:00', type: '新增', field: 'description', oldValue: '-', newValue: '新建关系', operator: 'admin' },
    ]
    render(<ChangeTimeline changes={onlyAdd} />)

    await user.click(screen.getByRole('tab', { name: '删除' }))
    expect(screen.getByText('当前筛选条件下暂无变更记录')).toBeInTheDocument()
  })
})
