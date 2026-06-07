import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import IndicatorTreePanel from './IndicatorTreePanel'

const mockToast = vi.fn()

vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}))

describe('IndicatorTreePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
    mockToast.mockClear()
  })

  it('renders tree view with indicator names', () => {
    initializeAttachmentStore()
    render(<IndicatorTreePanel />)

    expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    const indicators = useAttachmentStore.getState().indicators
    expect(screen.getByText(indicators[0].name)).toBeInTheDocument()
  })

  it('builds nested tree based on treeParentId', () => {
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]
    const child = state.indicators[1]

    state.setIndicators(
      state.indicators.map((i) => (i.id === child.id ? { ...i, treeParentId: parent.id } : i)),
    )

    render(<IndicatorTreePanel />)

    const toggle = screen.getByLabelText(`收起节点 ${parent.id}`)
    expect(toggle).toBeInTheDocument()
  })

  it('shows indicator code as caption when renderNode provides it', () => {
    initializeAttachmentStore()
    render(<IndicatorTreePanel />)

    const indicators = useAttachmentStore.getState().indicators
    expect(screen.getByText(indicators[0].code)).toBeInTheDocument()
  })

  it('renders EmptyState when no indicators have treeParentId (no tree roots)', () => {
    initializeAttachmentStore()
    useAttachmentStore.setState({ indicators: [] })

    render(<IndicatorTreePanel />)

    expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    expect(screen.getByText('暂无指标树节点')).toBeInTheDocument()
  })

  it('opens add dialog when openAddDialog is called via ref', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    const ref = { current: null as { openAddDialog: () => void } | null }

    render(<IndicatorTreePanel ref={(r) => { ref.current = r }} />)

    act(() => {
      ref.current?.openAddDialog()
    })

    expect(screen.getByTestId('add-node-name-input')).toBeInTheDocument()

    const input = screen.getByTestId('add-node-name-input')
    await user.type(input, '新分组节点')

    const confirmButton = screen.getByTestId('add-node-confirm-button')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('新分组节点')).toBeInTheDocument()
    })
  })

  it('adds a new node as child when a node is selected', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    const ref = { current: null as { openAddDialog: () => void } | null }

    render(<IndicatorTreePanel ref={(r) => { ref.current = r }} />)

    const rows = screen.getAllByTestId('tree-node-row')
    await user.click(rows[0])

    act(() => {
      ref.current?.openAddDialog()
    })

    const input = screen.getByTestId('add-node-name-input')
    await user.type(input, '子分组节点')

    const confirmButton = screen.getByTestId('add-node-confirm-button')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.getByText('子分组节点')).toBeInTheDocument()
    })

    const state = useAttachmentStore.getState()
    const parentId = state.indicators[0].id
    const child = state.indicators.find((i) => i.name === '子分组节点')
    expect(child?.treeParentId).toBe(parentId)
  })

  it('shows edit button on hover and enters inline edit mode', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const state = useAttachmentStore.getState()
    const firstIndicator = state.indicators[0]

    const rows = screen.getAllByTestId('tree-node-row')
    await user.hover(rows[0])

    const editButton = within(rows[0]).getByTestId('tree-node-edit-button')
    await user.click(editButton)

    const inlineInput = screen.getByTestId('tree-node-inline-input') as HTMLInputElement
    expect(inlineInput).toBeInTheDocument()
    expect(inlineInput.value).toBe(firstIndicator.name)
  })

  it('renames a node via inline edit', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const rows = screen.getAllByTestId('tree-node-row')
    await user.hover(rows[0])

    const editButton = within(rows[0]).getByTestId('tree-node-edit-button')
    await user.click(editButton)

    const inlineInput = screen.getByTestId('tree-node-inline-input')
    await user.clear(inlineInput)
    await user.type(inlineInput, '重命名后')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('重命名后')).toBeInTheDocument()
    })
  })

  it('shows delete button on hover', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const rows = screen.getAllByTestId('tree-node-row')
    await user.hover(rows[0])

    const deleteButton = within(rows[0]).getByTestId('tree-node-delete-button')
    expect(deleteButton).toBeInTheDocument()
  })

  it('deletes a leaf node directly and shows undo toast', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const state = useAttachmentStore.getState()
    // indicators[5] has no children by default (index >= 5 => treeParentId undefined, no child refs it)
    const leafIndicator = state.indicators[5]

    const rows = screen.getAllByTestId('tree-node-row')
    const leafRow = rows.find((r) => r.getAttribute('data-node-id') === leafIndicator.id)
    if (!leafRow) throw new Error('leaf row not found')

    await user.hover(leafRow)

    const deleteButton = within(leafRow).getByTestId('tree-node-delete-button')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText(leafIndicator.name)).not.toBeInTheDocument()
    })

    expect(mockToast).toHaveBeenCalledWith(
      '节点已删除',
      expect.objectContaining({
        description: `「${leafIndicator.name}」已被删除`,
        duration: 5000,
        action: expect.objectContaining({
          label: '撤销',
        }),
      }),
    )
  })

  it('restores deleted leaf node via toast undo action', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const state = useAttachmentStore.getState()
    const leafIndicator = state.indicators[5]

    const rows = screen.getAllByTestId('tree-node-row')
    const leafRow = rows.find((r) => r.getAttribute('data-node-id') === leafIndicator.id)
    if (!leafRow) throw new Error('leaf row not found')

    await user.hover(leafRow)

    const deleteButton = within(leafRow).getByTestId('tree-node-delete-button')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText(leafIndicator.name)).not.toBeInTheDocument()
    })

    const toastCall = mockToast.mock.calls[0]
    const toastOptions = toastCall[1] as { action: { onClick: () => void } }
    act(() => {
      toastOptions.action.onClick()
    })

    await waitFor(() => {
      expect(screen.getByText(leafIndicator.name)).toBeInTheDocument()
    })
  })

  it('shows warning dialog when deleting node with children', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    // indicators[0] is parent of indicators[1-4] by default mock data
    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === 'ind-dept-finance-1')
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    const deleteButton = within(parentRow).getByTestId('tree-node-delete-button')
    await user.click(deleteButton)

    expect(screen.getByTestId('delete-warning-dialog')).toBeInTheDocument()
    expect(screen.getByText(/此操作将删除 4 个子节点/)).toBeInTheDocument()
  })

  it('cancels deletion when warning dialog cancel is clicked', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]

    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    await user.click(within(parentRow).getByTestId('tree-node-delete-button'))

    expect(screen.getByTestId('delete-warning-dialog')).toBeInTheDocument()

    await user.click(screen.getByTestId('delete-warning-cancel-button'))

    await waitFor(() => {
      expect(screen.queryByTestId('delete-warning-dialog')).not.toBeInTheDocument()
    })
    expect(screen.getByText(parent.name)).toBeInTheDocument()
  })

  it('cascades delete when warning dialog is confirmed', async () => {
    initializeAttachmentStore()
    const user = userEvent.setup()
    render(<IndicatorTreePanel />)

    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]
    const child = state.indicators[1]

    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    await user.click(within(parentRow).getByTestId('tree-node-delete-button'))

    await user.click(screen.getByTestId('delete-warning-confirm-button'))

    await waitFor(() => {
      expect(screen.queryByText(parent.name)).not.toBeInTheDocument()
    })
    expect(screen.queryByText(child.name)).not.toBeInTheDocument()

    expect(mockToast).toHaveBeenCalledWith(
      '节点已删除',
      expect.objectContaining({
        description: expect.stringContaining(parent.name),
        duration: 5000,
        action: expect.objectContaining({ label: '撤销' }),
      }),
    )
  })

  it('shows special dialog when deleting node with attached indicators', async () => {
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]
    const child = state.indicators[1]

    // Mark child as attached (has tagIds)
    state.setIndicators(
      state.indicators.map((i) => (i.id === child.id ? { ...i, tagIds: ['tag-1'] } : i)),
    )

    render(<IndicatorTreePanel />)
    const user = userEvent.setup()

    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    await user.click(within(parentRow).getByTestId('tree-node-delete-button'))

    expect(screen.getByTestId('delete-special-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('delete-special-dialog-description')).toBeInTheDocument()
  })

  it('clears treeParentId of children when special dialog confirmed', async () => {
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    const parent = state.indicators[0]
    const child = state.indicators[1]

    state.setIndicators(
      state.indicators.map((i) =>
        i.id === child.id ? { ...i, tagIds: ['tag-1'] } : i,
      ),
    )

    render(<IndicatorTreePanel />)
    const user = userEvent.setup()

    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    await user.click(within(parentRow).getByTestId('tree-node-delete-button'))

    await user.click(screen.getByTestId('delete-special-confirm-button'))

    await waitFor(() => {
      expect(screen.queryByText(parent.name)).not.toBeInTheDocument()
    })

    // Child should still exist but with treeParentId cleared
    const updatedChild = useAttachmentStore.getState().indicators.find((i) => i.id === child.id)
    expect(updatedChild).toBeDefined()
    expect(updatedChild?.treeParentId).toBeUndefined()
  })
})
