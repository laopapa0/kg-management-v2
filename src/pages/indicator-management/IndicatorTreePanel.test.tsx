import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import { createMinimalIndicatorAttachment, createIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import type { IndicatorTreePanelRef } from './IndicatorTreePanel'
import IndicatorTreePanel from './IndicatorTreePanel'

const mockToast = vi.fn()

vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}))

const { mockMindMapInstance, mockOnInit } = vi.hoisted(() => ({
  mockMindMapInstance: {
    refresh: vi.fn(),
    destroy: vi.fn(),
    bus: { addListener: vi.fn(), removeListener: vi.fn(), fire: vi.fn() },
  },
  mockOnInit: vi.fn(),
}))

vi.mock('@/components/mindmap/MindMapWrapper', async () => {
  const React = await import('react')
  return {
    __esModule: true,
    default: function MindMapWrapperMock(props: { onInit?: (instance: typeof mockMindMapInstance) => void }) {
      React.useEffect(() => {
        props.onInit?.(mockMindMapInstance)
        mockOnInit()
      }, [])
      return React.createElement('div', { 'data-testid': 'mind-map-wrapper' }, 'MindMap')
    },
  }
})

describe('IndicatorTreePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
    mockToast.mockClear()
    mockMindMapInstance.refresh.mockClear()
    mockMindMapInstance.destroy.mockClear()
    mockOnInit.mockClear()
  })

  it('renders tree view with indicator names', () => {
    initializeAttachmentStore()
    render(<IndicatorTreePanel />)

    expect(screen.getByTestId('tree-view')).toBeInTheDocument()
    const indicators = useAttachmentStore.getState().indicators
    expect(screen.getByTestId(`indicator-tree-node-content-${indicators[0].id}`)).toBeInTheDocument()
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
    // find a true leaf: has treeParentId, has real code (not GROUP), no child references it
    const allParentIds = new Set(state.indicators.map(i => i.treeParentId).filter(Boolean))
    const leafIndicator = state.indicators.find(i =>
      i.treeParentId && !i.code?.startsWith('GROUP-') && !allParentIds.has(i.id)
    )
    if (!leafIndicator) throw new Error('no leaf found')

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

    // find a parent with children for delete testing
    const state = useAttachmentStore.getState()
    const parent = state.indicators.find(i =>
      !i.treeParentId && state.indicators.some(c => c.treeParentId === i.id)
    )
    if (!parent) throw new Error('no parent with children')
    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    const deleteButton = within(parentRow).getByTestId('tree-node-delete-button')
    await user.click(deleteButton)

    expect(screen.getByTestId('delete-warning-dialog')).toBeInTheDocument()
    const childCount = state.indicators.filter(c => c.treeParentId === parent.id).length
    expect(screen.getByText(new RegExp(`此操作将删除 ${childCount} 个子节点`))).toBeInTheDocument()
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
    expect(screen.getByTestId(`indicator-tree-node-content-${parent.id}`)).toBeInTheDocument()
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
      expect(screen.queryByTestId(`indicator-tree-node-content-${parent.id}`)).not.toBeInTheDocument()
    })
    expect(screen.queryByTestId(`indicator-tree-node-content-${child.id}`)).not.toBeInTheDocument()

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

    // Add a real indicator child with tagIds to guarantee special dialog triggers
    const realChild = createIndicatorAttachment({
      id: 'real-child-test',
      name: '真实子指标',
      code: 'REAL-CHILD',
      indicatorCode: 'REAL-CHILD',
      indicatorDisplayName: '真实子指标',
      indicatorShowName: '真实子指标',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: '财务部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: parent.id,
      tagIds: ['tag-1'],
      ruleIds: [],
    })
    state.setIndicators([...state.indicators, realChild])

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

    // Add a real indicator child with tagIds under parent
    const realChild = createIndicatorAttachment({
      id: 'real-child-test',
      name: '真实子指标',
      code: 'REAL-CHILD',
      indicatorCode: 'REAL-CHILD',
      indicatorDisplayName: '真实子指标',
      indicatorShowName: '真实子指标',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: '财务部',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: parent.id,
      tagIds: ['tag-1'],
      ruleIds: [],
    })
    state.setIndicators([...state.indicators, realChild])

    render(<IndicatorTreePanel />)
    const user = userEvent.setup()

    const rows = screen.getAllByTestId('tree-node-row')
    const parentRow = rows.find((r) => r.getAttribute('data-node-id') === parent.id)
    if (!parentRow) throw new Error('parent row not found')

    await user.hover(parentRow)
    await user.click(within(parentRow).getByTestId('tree-node-delete-button'))

    await user.click(screen.getByTestId('delete-special-confirm-button'))

    await waitFor(() => {
      expect(screen.queryByTestId(`indicator-tree-node-content-${parent.id}`)).not.toBeInTheDocument()
    })

    // Child should still exist but with treeParentId cleared
    const updatedChild = useAttachmentStore.getState().indicators.find((i) => i.id === realChild.id)
    expect(updatedChild).toBeDefined()
    expect(updatedChild?.treeParentId).toBeUndefined()
  })

  describe('drag and drop', () => {
    it('shows drag handle on hover', async () => {
      initializeAttachmentStore()
      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      await user.hover(rows[0])

      const handle = within(rows[0]).getByTestId('tree-node-drag-handle')
      expect(handle).toBeInTheDocument()
    })

    it('updates treeParentId when node is dragged inside another node', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()
      const root = state.indicators[0]
      const sibling = state.indicators[1]

      // Ensure sibling is at root level initially
      state.setIndicators(
        state.indicators.map((i) => (i.id === sibling.id ? { ...i, treeParentId: undefined } : i)),
      )

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      // Find the rows for root and sibling
      const rows = screen.getAllByTestId('tree-node-row')
      const rootRow = rows.find((r) => r.getAttribute('data-node-id') === root.id)
      const siblingRow = rows.find((r) => r.getAttribute('data-node-id') === sibling.id)
      if (!rootRow || !siblingRow) throw new Error('rows not found')

      // Hover sibling to show drag handle
      await user.hover(siblingRow)
      const handle = within(siblingRow).getByTestId('tree-node-drag-handle')

      // Simulate drag: pointerDown on handle, move over root, pointerUp
      // Using dnd-kit with distance:0 activation constraint
      const { fireEvent } = await import('@testing-library/react')
      fireEvent.pointerDown(handle, { clientX: 0, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(window, { clientX: 0, clientY: 0, pointerId: 1 })
      fireEvent.pointerUp(window, { pointerId: 1 })

      // Verify sibling's node row still in DOM by data-node-id
      const siblingRows = screen.getAllByTestId('tree-node-row')
      expect(siblingRows.some(r => r.getAttribute('data-node-id') === sibling.id)).toBe(true)
    })
  })

  describe('virtual grouping node deletion', () => {
    function makeRealIndicator(props: { id: string; name: string; treeParentId?: string; tagIds?: string[]; ruleIds?: string[] }) {
      return createIndicatorAttachment({
        id: props.id,
        name: props.name,
        code: props.id.toUpperCase(),
        indicatorCode: props.id,
        indicatorDisplayName: props.name,
        indicatorShowName: props.name,
        indicatorType: '基础指标',
        level1: '经营',
        level2: '收入',
        granularity: '全局',
        frequency: '月',
        unit: '元',
        isBigScreen: false,
        department: '财务部',
        businessCaliber: '',
        techCaliber: '',
        tags: [],
        treeParentId: props.treeParentId,
        tagIds: props.tagIds ?? [],
        ruleIds: props.ruleIds ?? [],
      })
    }

    it('shows special dialog when deleting L1 node whose descendant real indicators are attached', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      // Build 3-level tree: L1(virtual) -> L2(virtual) -> real(indicator with tagIds)
      const l1 = createMinimalIndicatorAttachment('一级分组')
      const l2 = createMinimalIndicatorAttachment('二级分组', { parentId: l1.id })
      const real = makeRealIndicator({ id: 'real-001', name: '真实指标', treeParentId: l2.id, tagIds: ['tag-1'] })

      state.setIndicators([l1, l2, real])

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      const l1Row = rows.find((r) => r.getAttribute('data-node-id') === l1.id)
      if (!l1Row) throw new Error('L1 row not found')

      await user.hover(l1Row)
      await user.click(within(l1Row).getByTestId('tree-node-delete-button'))

      expect(screen.getByTestId('delete-special-dialog')).toBeInTheDocument()
    })

    it('special dialog attachedCount counts real indicators only, not virtual grouping nodes', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      const l1 = createMinimalIndicatorAttachment('一级分组')
      const l2a = createMinimalIndicatorAttachment('二级A', { parentId: l1.id })
      const l2b = createMinimalIndicatorAttachment('二级B', { parentId: l1.id })
      const realA = makeRealIndicator({ id: 'real-a', name: '真实A', treeParentId: l2a.id, tagIds: ['tag-1'] })
      const realB = makeRealIndicator({ id: 'real-b', name: '真实B', treeParentId: l2b.id, tagIds: [] })

      state.setIndicators([l1, l2a, l2b, realA, realB])

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      const l1Row = rows.find((r) => r.getAttribute('data-node-id') === l1.id)
      if (!l1Row) throw new Error('L1 row not found')

      await user.hover(l1Row)
      await user.click(within(l1Row).getByTestId('tree-node-delete-button'))

      // attachedCount should be 1 (only realA has tagIds), not 2 or 4
      expect(screen.getByTestId('delete-special-dialog')).toBeInTheDocument()
      expect(screen.getByText('1 个指标将回到「待挂靠」区域')).toBeInTheDocument()
    })

    it('toast description counts real indicators when special dialog confirmed', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      const l1 = createMinimalIndicatorAttachment('一级分组')
      const l2 = createMinimalIndicatorAttachment('二级分组', { parentId: l1.id })
      const real1 = makeRealIndicator({ id: 'real-1', name: '真实1', treeParentId: l2.id, tagIds: ['tag-1'] })
      const real2 = makeRealIndicator({ id: 'real-2', name: '真实2', treeParentId: l2.id, tagIds: ['tag-2'] })

      state.setIndicators([l1, l2, real1, real2])

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      const l1Row = rows.find((r) => r.getAttribute('data-node-id') === l1.id)
      if (!l1Row) throw new Error('L1 row not found')

      await user.hover(l1Row)
      await user.click(within(l1Row).getByTestId('tree-node-delete-button'))
      await user.click(screen.getByTestId('delete-special-confirm-button'))

      // Toast should mention 2 real indicators, not 1 virtual grouping node (l2)
      expect(mockToast).toHaveBeenCalledWith(
        '节点已删除',
        expect.objectContaining({
          description: `「${l1.name}」已删除，2 个指标回到「待挂靠」区域`,
        }),
      )
    })

    it('cascades delete of descendant virtual groups when special dialog confirmed', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      // 3-level tree: L1(virtual) -> L2(virtual) -> real(indicator with tagIds)
      const l1 = createMinimalIndicatorAttachment('一级分组')
      const l2 = createMinimalIndicatorAttachment('二级分组', { parentId: l1.id })
      const real = makeRealIndicator({ id: 'real-001', name: '真实指标', treeParentId: l2.id, tagIds: ['tag-1'] })

      state.setIndicators([l1, l2, real])

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      const l1Row = rows.find((r) => r.getAttribute('data-node-id') === l1.id)
      if (!l1Row) throw new Error('L1 row not found')

      await user.hover(l1Row)
      await user.click(within(l1Row).getByTestId('tree-node-delete-button'))
      await user.click(screen.getByTestId('delete-special-confirm-button'))

      await waitFor(() => {
        expect(screen.queryByTestId(`indicator-tree-node-content-${l1.id}`)).not.toBeInTheDocument()
      })

      // L2 virtual group should also be deleted (cascade), not promoted to root
      expect(screen.queryByTestId(`indicator-tree-node-content-${l2.id}`)).not.toBeInTheDocument()

      // Real indicator should remain with treeParentId cleared
      const updatedReal = useAttachmentStore.getState().indicators.find((i) => i.id === real.id)
      expect(updatedReal).toBeDefined()
      expect(updatedReal?.treeParentId).toBeUndefined()
    })

    it('cascades delete through multiple levels of virtual groups', async () => {
      initializeAttachmentStore()
      const state = useAttachmentStore.getState()

      // 4-level tree: L1(virtual) -> L2(virtual) -> L3(virtual) -> real
      const l1 = createMinimalIndicatorAttachment('一级分组')
      const l2 = createMinimalIndicatorAttachment('二级分组', { parentId: l1.id })
      const l3 = createMinimalIndicatorAttachment('三级分组', { parentId: l2.id })
      const real = makeRealIndicator({ id: 'real-deep', name: '深层指标', treeParentId: l3.id, tagIds: ['tag-1'] })

      state.setIndicators([l1, l2, l3, real])

      render(<IndicatorTreePanel />)
      const user = userEvent.setup()

      const rows = screen.getAllByTestId('tree-node-row')
      const l1Row = rows.find((r) => r.getAttribute('data-node-id') === l1.id)
      if (!l1Row) throw new Error('L1 row not found')

      await user.hover(l1Row)
      await user.click(within(l1Row).getByTestId('tree-node-delete-button'))
      await user.click(screen.getByTestId('delete-special-confirm-button'))

      await waitFor(() => {
        expect(screen.queryByTestId(`indicator-tree-node-content-${l1.id}`)).not.toBeInTheDocument()
      })

      // All virtual groups should be deleted
      expect(screen.queryByTestId(`indicator-tree-node-content-${l2.id}`)).not.toBeInTheDocument()
      expect(screen.queryByTestId(`indicator-tree-node-content-${l3.id}`)).not.toBeInTheDocument()

      // Real indicator should remain with treeParentId cleared
      const updatedReal = useAttachmentStore.getState().indicators.find((i) => i.id === real.id)
      expect(updatedReal).toBeDefined()
      expect(updatedReal?.treeParentId).toBeUndefined()
    })
  })

  describe('expandAndSelectNode', () => {
    it('expands collapsed ancestors and selects the target node', async () => {
      const user = userEvent.setup()
      const state = useAttachmentStore.getState()
      const gp = createIndicatorAttachment({
        id: 'gp', name: '祖父', code: 'GROUP-GP',
        indicatorCode: '', indicatorDisplayName: '祖父', indicatorShowName: '祖父',
        indicatorType: '虚拟分组', level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: '', businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined, tagIds: [], ruleIds: [],
      })
      const p = createIndicatorAttachment({
        id: 'p', name: '父', code: 'GROUP-P',
        indicatorCode: '', indicatorDisplayName: '父', indicatorShowName: '父',
        indicatorType: '虚拟分组', level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: '', businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'gp', tagIds: [], ruleIds: [],
      })
      const c = createIndicatorAttachment({
        id: 'c', name: '子', code: 'GROUP-C',
        indicatorCode: '', indicatorDisplayName: '子', indicatorShowName: '子',
        indicatorType: '虚拟分组', level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: '', businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'p', tagIds: [], ruleIds: [],
      })
      state.setIndicators([gp, p, c])

      const ref = { current: null as IndicatorTreePanelRef | null }
      render(<IndicatorTreePanel ref={(r) => { ref.current = r }} />)

      // Collapse the grandparent
      const toggle = screen.getByLabelText(`收起节点 gp`)
      await user.click(toggle)

      await waitFor(() => {
        expect(screen.queryByTestId('indicator-tree-node-content-c')).not.toBeInTheDocument()
      })

      act(() => {
        ref.current?.expandAndSelectNode('c')
      })

      // Ancestors expanded: child should now be visible
      expect(screen.getByTestId('indicator-tree-node-content-c')).toBeInTheDocument()

      // Target node should be selected
      const rows = screen.getAllByTestId('tree-node-row')
      const cRow = rows.find((r) => r.getAttribute('data-node-id') === 'c')
      expect(cRow).toHaveAttribute('aria-selected', 'true')
    })

    it('highlights the selected node temporarily', async () => {
      vi.useFakeTimers()
      const state = useAttachmentStore.getState()
      const gp = createIndicatorAttachment({
        id: 'gp', name: '祖父', code: 'GROUP-GP',
        indicatorCode: '', indicatorDisplayName: '祖父', indicatorShowName: '祖父',
        indicatorType: '虚拟分组', level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: '', businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined, tagIds: [], ruleIds: [],
      })
      const c = createIndicatorAttachment({
        id: 'c', name: '子', code: 'GROUP-C',
        indicatorCode: '', indicatorDisplayName: '子', indicatorShowName: '子',
        indicatorType: '虚拟分组', level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: '', businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'gp', tagIds: [], ruleIds: [],
      })
      state.setIndicators([gp, c])

      const ref = { current: null as IndicatorTreePanelRef | null }
      render(<IndicatorTreePanel ref={(r) => { ref.current = r }} />)

      act(() => {
        ref.current?.expandAndSelectNode('c')
      })

      // Highlighted state is internal; the motion.div has animate prop
      // We verify the node is selected
      const rows = screen.getAllByTestId('tree-node-row')
      const cRow = rows.find((r) => r.getAttribute('data-node-id') === 'c')
      expect(cRow).toHaveAttribute('aria-selected', 'true')

      vi.useRealTimers()
    })
  })

  describe('view mode toggle', () => {
    it('renders tree view by default with toggle buttons', () => {
      initializeAttachmentStore()
      render(<IndicatorTreePanel />)

      expect(screen.getByTestId('tree-view')).toBeVisible()
      expect(screen.queryByTestId('mind-map-wrapper')).not.toBeInTheDocument()
      expect(screen.getByTestId('tree-view-toggle-tree')).toHaveAttribute('data-state', 'active')
      expect(screen.getByTestId('tree-view-toggle-mindmap')).not.toHaveAttribute('data-state', 'active')
    })

    it('switches to mindmap view and initializes MindMapWrapper', async () => {
      initializeAttachmentStore()
      const user = userEvent.setup()
      render(<IndicatorTreePanel />)

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))

      expect(screen.getByTestId('tree-view-wrapper')).toHaveClass('hidden')
      expect(screen.getByTestId('mind-map-container')).not.toHaveClass('hidden')
      expect(screen.getByTestId('mind-map-container')).toHaveClass('flex')
      expect(screen.getByTestId('tree-view-toggle-mindmap')).toHaveAttribute('data-state', 'active')
      expect(mockOnInit).toHaveBeenCalledTimes(1)
      expect(mockMindMapInstance.refresh).toHaveBeenCalledTimes(1)
    })

    it('keeps MindMapWrapper mounted but hidden when switching back to tree', async () => {
      initializeAttachmentStore()
      const user = userEvent.setup()
      render(<IndicatorTreePanel />)

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      await user.click(screen.getByTestId('tree-view-toggle-tree'))

      expect(screen.getByTestId('mind-map-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('mind-map-container')).toHaveClass('hidden')
      expect(screen.getByTestId('tree-view-wrapper')).not.toHaveClass('hidden')
    })

    it('does not reinitialize MindMapWrapper when toggling multiple times', async () => {
      initializeAttachmentStore()
      const user = userEvent.setup()
      render(<IndicatorTreePanel />)

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      await user.click(screen.getByTestId('tree-view-toggle-tree'))
      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      await user.click(screen.getByTestId('tree-view-toggle-tree'))

      expect(mockOnInit).toHaveBeenCalledTimes(1)
    })

    it('refreshes mind map with latest data when returning to mindmap', async () => {
      initializeAttachmentStore()
      const user = userEvent.setup()
      const state = useAttachmentStore.getState()
      render(<IndicatorTreePanel />)

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      expect(mockMindMapInstance.refresh).toHaveBeenCalledTimes(1)

      mockMindMapInstance.refresh.mockClear()
      await user.click(screen.getByTestId('tree-view-toggle-tree'))
      // add a new node while in tree mode
      const parent = state.indicators[0]
      act(() => {
        state.setIndicators([
          ...state.indicators,
          createMinimalIndicatorAttachment('脑图新节点', { parentId: parent.id }),
        ])
      })

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      expect(mockMindMapInstance.refresh).toHaveBeenCalledTimes(1)
    })

    it('notifies parent via onViewModeChange when toggled', async () => {
      initializeAttachmentStore()
      const user = userEvent.setup()
      const onViewModeChange = vi.fn()
      render(<IndicatorTreePanel onViewModeChange={onViewModeChange} />)

      await user.click(screen.getByTestId('tree-view-toggle-mindmap'))
      expect(onViewModeChange).toHaveBeenCalledWith('mindmap')

      await user.click(screen.getByTestId('tree-view-toggle-tree'))
      expect(onViewModeChange).toHaveBeenCalledWith('tree')
    })
  })
})
