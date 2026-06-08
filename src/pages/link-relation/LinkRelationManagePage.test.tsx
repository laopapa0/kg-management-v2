import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkRelationManagePage from './LinkRelationManagePage'
import { mockLinkRelations } from '@/models/linkRelationModel'

describe('LinkRelationManagePage', () => {
  it('renders page title', () => {
    render(<LinkRelationManagePage />)
    expect(screen.getByText('关联关系类型管理')).toBeInTheDocument()
  })

  it('renders relation type names from mock data', () => {
    render(<LinkRelationManagePage />)
    expect(screen.getByText('AGGREGATES')).toBeInTheDocument()
    expect(screen.getByText('DEPENDS_ON')).toBeInTheDocument()
    expect(screen.getByText('DRIVES')).toBeInTheDocument()
  })

  it('renders description, enabled toggle and usage count for each row', () => {
    render(<LinkRelationManagePage />)
    expect(screen.getByText('聚合关系：子指标汇总为父指标')).toBeInTheDocument()
    expect(screen.getByText('依赖关系：指标依赖于上游指标')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    const toggles = screen.getAllByRole('switch')
    expect(toggles.length).toBe(mockLinkRelations.length)
  })

  it('toggles enabled state when clicking switch', async () => {
    render(<LinkRelationManagePage />)
    const toggles = screen.getAllByRole('switch')
    // First relation (AGGREGATES) starts enabled
    expect(toggles[0]).toHaveAttribute('data-state', 'checked')
    await userEvent.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('data-state', 'unchecked')
    await userEvent.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('data-state', 'checked')
  })

  it('expands detail row when clicking 查看详情', async () => {
    render(<LinkRelationManagePage />)
    const detailButtons = screen.getAllByText('查看详情')
    await userEvent.click(detailButtons[0])
    expect(screen.getByText('源类型：Indicator')).toBeInTheDocument()
    expect(screen.getByText('目标类型：Indicator')).toBeInTheDocument()
    expect(screen.getByText('创建时间：2026-01-15')).toBeInTheDocument()
  })

  it('hides detail row when clicking 收起', async () => {
    render(<LinkRelationManagePage />)
    const detailButtons = screen.getAllByText('查看详情')
    await userEvent.click(detailButtons[0])
    expect(screen.getByText('源类型：Indicator')).toBeInTheDocument()
    const collapseButton = screen.getByText('收起')
    await userEvent.click(collapseButton)
    expect(screen.queryByText('源类型：Indicator')).not.toBeInTheDocument()
  })

  it('filters list by search keyword', async () => {
    render(<LinkRelationManagePage />)
    const searchInput = screen.getByPlaceholderText('搜索关系类型...')
    await userEvent.type(searchInput, 'DEPENDS')
    expect(screen.getByText('DEPENDS_ON')).toBeInTheDocument()
    expect(screen.queryByText('AGGREGATES')).not.toBeInTheDocument()
    expect(screen.queryByText('DRIVES')).not.toBeInTheDocument()
  })
})
