import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LinkRelationManagePage from './LinkRelationManagePage'
import { mockLinkRelations } from '@/models/linkRelationModel'

describe('LinkRelationManagePage', () => {
  it('renders page title', () => {
    render(<LinkRelationManagePage />)
    expect(screen.getByText('基础维护')).toBeInTheDocument()
  })

  it('renders DataTable with all new columns', () => {
    render(<LinkRelationManagePage />)

    // Table headers should include all new columns
    expect(screen.getByText('图标')).toBeInTheDocument()
    expect(screen.getByText('中文名')).toBeInTheDocument()
    expect(screen.getByText('编码')).toBeInTheDocument()
    expect(screen.getByText('英文名')).toBeInTheDocument()
    expect(screen.getByText('方向')).toBeInTheDocument()
    expect(screen.getByText('颜色')).toBeInTheDocument()
    expect(screen.getByText('源类型')).toBeInTheDocument()
    expect(screen.getByText('目标类型')).toBeInTheDocument()
    expect(screen.getByText('状态')).toBeInTheDocument()
  })

  it('renders relation data from mock data', () => {
    render(<LinkRelationManagePage />)

    // Should display displayName (Chinese names)
    expect(screen.getByText('聚合关系')).toBeInTheDocument()
    expect(screen.getByText('依赖关系')).toBeInTheDocument()
    expect(screen.getByText('驱动关系')).toBeInTheDocument()

    // Should display code in code column (use getAllByText since code=name for these)
    expect(screen.getAllByText('AGGREGATES').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('DEPENDS_ON').length).toBeGreaterThanOrEqual(1)
  })

  it('renders pagination with default page size of 10', () => {
    render(<LinkRelationManagePage />)

    // Pagination should show total count
    expect(screen.getByText(`共 ${mockLinkRelations.length} 条`)).toBeInTheDocument()
  })

  it('toggles enabled state when clicking switch', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const toggles = screen.getAllByRole('switch')
    // First relation (AGGREGATES) starts enabled
    expect(toggles[0]).toHaveAttribute('data-state', 'checked')
    await user.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('data-state', 'unchecked')
    await user.click(toggles[0])
    expect(toggles[0]).toHaveAttribute('data-state', 'checked')
  })

  it('expands detail row when clicking 查看详情', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const detailButtons = screen.getAllByText('查看详情')
    await user.click(detailButtons[0])

    // Expanded detail should show source/target types and createdAt
    expect(screen.getAllByText(/源类型/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/目标类型/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/创建时间/).length).toBeGreaterThanOrEqual(1)
  })

  it('filters by keyword including sourceTypes and targetTypes', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const searchInput = screen.getByPlaceholderText('搜索关系类型...')
    // Search for '虚拟分组' which exists in sourceTypes of PART_OF
    await user.type(searchInput, '虚拟分组')

    // 组成关系 has 虚拟分组 in sourceTypes
    expect(screen.getByText('组成关系')).toBeInTheDocument()
    // Other relations without 虚拟分组 should be hidden
    expect(screen.queryByText('聚合关系')).not.toBeInTheDocument()
  })

  it('filters by keyword across all fields', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const searchInput = screen.getByPlaceholderText('搜索关系类型...')
    await user.type(searchInput, '聚合关系')

    // Should show matching row
    expect(screen.getByText('聚合关系')).toBeInTheDocument()
    // Should hide non-matching rows
    expect(screen.queryByText('依赖关系')).not.toBeInTheDocument()
  })

  it('filters by direction dropdown', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // Select '有向' from direction filter
    await user.selectOptions(screen.getByTestId('direction-filter'), '有向')

    // 有向 relations should be visible
    expect(screen.getByText('聚合关系')).toBeInTheDocument()
    expect(screen.getByText('依赖关系')).toBeInTheDocument()
    // 无向 relation should be hidden
    expect(screen.queryByText('相关关系')).not.toBeInTheDocument()
  })

  it('filters by source type dropdown', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // Select '虚拟分组' from source type filter
    await user.selectOptions(screen.getByTestId('source-type-filter'), '虚拟分组')

    // Relations with 虚拟分组 in sourceTypes should be visible
    expect(screen.getByText('组成关系')).toBeInTheDocument()
    // Relations without 虚拟分组 should be hidden
    expect(screen.queryByText('聚合关系')).not.toBeInTheDocument()
  })

  it('resets all filters when clicking reset button', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const searchInput = screen.getByPlaceholderText('搜索关系类型...')
    await user.type(searchInput, '聚合关系')

    // Verify filter applied
    expect(screen.queryByText('依赖关系')).not.toBeInTheDocument()

    // Click reset
    const resetBtn = screen.getByTestId('filter-reset')
    await user.click(resetBtn)

    // All data should be visible again
    expect(screen.getByText('聚合关系')).toBeInTheDocument()
    expect(screen.getByText('依赖关系')).toBeInTheDocument()
    expect(screen.getByText('驱动关系')).toBeInTheDocument()
  })

  it('focuses search input on / key press', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const searchInput = screen.getByPlaceholderText('搜索关系类型...')
    expect(document.activeElement).not.toBe(searchInput)

    await user.keyboard('/')

    expect(document.activeElement).toBe(searchInput)
  })

  it('opens create dialog when clicking 新增 button', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const addBtn = screen.getByTestId('add-relation-btn')
    await user.click(addBtn)

    expect(screen.getByText('新增关系类型')).toBeInTheDocument()
    expect(screen.getByTestId('form-code')).toBeInTheDocument()
    expect(screen.getByTestId('form-name')).toBeInTheDocument()
    expect(screen.getByTestId('form-displayName')).toBeInTheDocument()
  })

  it('creates a new relation and refreshes the list', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // Open dialog
    const addBtn = screen.getByTestId('add-relation-btn')
    await user.click(addBtn)

    // Fill form
    await user.type(screen.getByTestId('form-code'), 'TEST_REL')
    await user.type(screen.getByTestId('form-name'), 'TEST_RELATION')
    await user.type(screen.getByTestId('form-displayName'), '测试关系')

    // Submit
    const submitBtn = screen.getByTestId('form-submit')
    await user.click(submitBtn)

    // Dialog should close and new record should appear
    expect(screen.queryByText('新增关系类型')).not.toBeInTheDocument()
    expect(screen.getByText('测试关系')).toBeInTheDocument()
    expect(screen.getByText('TEST_REL')).toBeInTheDocument()
  })

  it('shows validation error for invalid code format', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const addBtn = screen.getByTestId('add-relation-btn')
    await user.click(addBtn)

    await user.type(screen.getByTestId('form-code'), 'lowercase')
    await user.type(screen.getByTestId('form-displayName'), '测试关系')

    const submitBtn = screen.getByTestId('form-submit')
    await user.click(submitBtn)

    // Should show error and not close dialog
    expect(screen.getByText('编码只能包含大写字母和下划线')).toBeInTheDocument()
    expect(screen.getByText('新增关系类型')).toBeInTheDocument()
  })

  it('shows validation error for duplicate code', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const addBtn = screen.getByTestId('add-relation-btn')
    await user.click(addBtn)

    await user.type(screen.getByTestId('form-code'), 'AGGREGATES')
    await user.type(screen.getByTestId('form-displayName'), '新聚合关系')

    const submitBtn = screen.getByTestId('form-submit')
    await user.click(submitBtn)

    expect(screen.getByText('该编码已存在')).toBeInTheDocument()
  })

  // ─── #97 编辑关系类型 ───

  it('opens edit dialog with pre-filled data when clicking 编辑 button', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // Find edit button for first row (聚合关系)
    const editButtons = screen.getAllByTestId('edit-relation-btn')
    await user.click(editButtons[0])

    expect(screen.getByText('编辑关系类型')).toBeInTheDocument()
    expect(screen.getByTestId('form-code')).toHaveValue('AGGREGATES')
    expect(screen.getByTestId('form-name')).toHaveValue('AGGREGATES')
    expect(screen.getByTestId('form-displayName')).toHaveValue('聚合关系')
  })

  it('code field is read-only in edit mode', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const editButtons = screen.getAllByTestId('edit-relation-btn')
    await user.click(editButtons[0])

    const codeInput = screen.getByTestId('form-code')
    expect(codeInput).toBeDisabled()
  })

  it('edits displayName and refreshes the list', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const editButtons = screen.getAllByTestId('edit-relation-btn')
    await user.click(editButtons[0])

    // Clear and type new displayName
    const displayNameInput = screen.getByTestId('form-displayName')
    await user.clear(displayNameInput)
    await user.type(displayNameInput, '聚合关系（已改）')

    const submitBtn = screen.getByTestId('form-submit')
    await user.click(submitBtn)

    // Dialog should close and updated value should appear
    expect(screen.queryByText('编辑关系类型')).not.toBeInTheDocument()
    expect(screen.getByText('聚合关系（已改）')).toBeInTheDocument()
  })

  it('does not show duplicate displayName error when keeping own name in edit mode', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const editButtons = screen.getAllByTestId('edit-relation-btn')
    await user.click(editButtons[0])

    // Re-type the same displayName (simulating user editing then reverting)
    const displayNameInput = screen.getByTestId('form-displayName')
    await user.tripleClick(displayNameInput)
    await user.type(displayNameInput, '聚合关系')

    const submitBtn = screen.getByTestId('form-submit')
    await user.click(submitBtn)

    // Should not show duplicate error and dialog should close
    expect(screen.queryByText('该名称已存在')).not.toBeInTheDocument()
    expect(screen.queryByText('编辑关系类型')).not.toBeInTheDocument()
  })

  // ─── #98 使用追踪 + 变更记录 + 启用/停用 ───

  it('renders usage tracking table with source, target and createdAt in expanded panel', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const detailButtons = screen.getAllByText('查看详情')
    await user.click(detailButtons[0])

    expect(screen.getByTestId('usage-tracking')).toBeInTheDocument()
    expect(screen.getByText(/已被/)).toBeInTheDocument()
  })

  it('shows empty state for zero-usage relation', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // 组成关系 (PART_OF / LKT-008) has no usage data
    const detailButtons = screen.getAllByText('查看详情')
    // PART_OF is the 8th item (index 7)
    await user.click(detailButtons[7])

    expect(screen.getByText('暂无连线引用此关系类型')).toBeInTheDocument()
  })

  it('shows 跳转画布 button in usage tracking', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const detailButtons = screen.getAllByText('查看详情')
    await user.click(detailButtons[0])

    expect(screen.getAllByText('跳转画布').length).toBeGreaterThanOrEqual(1)
  })

  it('renders change timeline in expanded panel', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    const detailButtons = screen.getAllByText('查看详情')
    await user.click(detailButtons[0])

    expect(screen.getByTestId('change-timeline')).toBeInTheDocument()
  })

  it('records change log when toggling switch', async () => {
    const user = userEvent.setup()
    render(<LinkRelationManagePage />)

    // Toggle first relation (AGGREGATES) off
    const toggles = screen.getAllByRole('switch')
    await user.click(toggles[0])

    // Expand detail to see change timeline
    const detailButtons = screen.getAllByText('查看详情')
    await user.click(detailButtons[0])

    // Should show a new '修改' entry in the timeline
    const timeline = screen.getByTestId('change-timeline')
    expect(timeline.textContent).toContain('修改')
  })
})
