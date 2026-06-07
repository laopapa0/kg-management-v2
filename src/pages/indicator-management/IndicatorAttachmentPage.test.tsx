import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore } from '@/stores/attachmentStore'
import IndicatorAttachmentPage from './IndicatorAttachmentPage'

describe('IndicatorAttachmentPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
  })

  it('renders four panels with correct titles', () => {
    render(<IndicatorAttachmentPage />)

    expect(screen.getByText('指标树')).toBeInTheDocument()
    expect(screen.getByText('待选指标')).toBeInTheDocument()
    expect(screen.getByText('标签集')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
  })

  it('renders resizable panel handles', () => {
    render(<IndicatorAttachmentPage />)

    const handles = screen.getAllByRole('separator')
    expect(handles.length).toBeGreaterThanOrEqual(2)
  })

  it('applies dark theme elevated/card backgrounds to panels', () => {
    render(<IndicatorAttachmentPage />)

    const treePanel = screen.getByTestId('panel-indicator-tree')
    const indicatorPanel = screen.getByTestId('panel-pending-indicators')
    const tagPanel = screen.getByTestId('panel-tag-set')
    const rulePanel = screen.getByTestId('panel-rules')

    expect(treePanel).toHaveClass('bg-dark-card-l1')
    expect(indicatorPanel).toHaveClass('bg-dark-elevated')
    expect(tagPanel).toHaveClass('bg-dark-card-l1')
    expect(rulePanel).toHaveClass('bg-dark-card-l1')
  })

  it('marks panels with data-panel attributes for react-resizable-panels', () => {
    render(<IndicatorAttachmentPage />)

    expect(screen.getByTestId('panel-indicator-tree').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-pending-indicators').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-tag-set').closest('[data-panel]')).toBeInTheDocument()
    expect(screen.getByTestId('panel-rules').closest('[data-panel]')).toBeInTheDocument()
  })

  it('renders a panel header for each of the four panels', () => {
    render(<IndicatorAttachmentPage />)

    const headers = screen.getAllByTestId('panel-header')
    expect(headers).toHaveLength(4)
  })

  it('renders empty state placeholder in the rule panel only', () => {
    render(<IndicatorAttachmentPage />)

    const emptyStates = screen.getAllByTestId('empty-state-wrapper')
    expect(emptyStates).toHaveLength(1)
  })

  it('renders TreeView in the tag set panel from store data', () => {
    render(<IndicatorAttachmentPage />)

    const tagPanel = screen.getByTestId('panel-tag-set')
    expect(within(tagPanel).getByTestId('tree-view')).toBeInTheDocument()
    const tagNodes = useAttachmentStore.getState().tagNodes
    const firstRoot = tagNodes.find((t) => !t.parentId)
    expect(firstRoot).toBeDefined()
    expect(within(tagPanel).getByText(firstRoot!.name)).toBeInTheDocument()
  })

  it('renders TreeView in the indicator tree panel from store data', () => {
    render(<IndicatorAttachmentPage />)

    const treePanel = screen.getByTestId('panel-indicator-tree')
    expect(within(treePanel).getByTestId('tree-view')).toBeInTheDocument()
    const indicators = useAttachmentStore.getState().indicators
    expect(within(treePanel).getByText(indicators[0].name)).toBeInTheDocument()
  })

  it('renders indicator cards in the pending indicators panel from store data', () => {
    render(<IndicatorAttachmentPage />)

    const cards = screen.getAllByTestId('indicator-card')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  it('uses the auto-fill CSS Grid for pending indicators', () => {
    render(<IndicatorAttachmentPage />)

    const grid = screen.getByTestId('indicator-grid')
    expect(grid).toHaveStyle({
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    })
  })

  it('filters pending indicators by attachment state', () => {
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const pendingCount = state.indicators.filter(
      (i) => !i.treeParentId && i.tagIds.length === 0 && i.ruleIds.length === 0,
    ).length

    const cards = screen.getAllByTestId('indicator-card')
    expect(cards.length).toBe(pendingCount)
  })

  it('updates pending indicators when an indicator is attached to the tree', async () => {
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const target = state.indicators.find(
      (i) => i.id !== state.indicators[0].id && !i.treeParentId && i.tagIds.length === 0 && i.ruleIds.length === 0,
    )!
    const pendingPanel = screen.getByTestId('panel-pending-indicators')

    expect(within(pendingPanel).getByText(target.name)).toBeInTheDocument()

    act(() => {
      state.setIndicators(
        state.indicators.map((i) =>
          i.id === target.id ? { ...i, treeParentId: state.indicators[0].id } : i,
        ),
      )
    })

    await waitFor(() => {
      expect(within(pendingPanel).queryByText(target.name)).not.toBeInTheDocument()
    })
  })

  it('returns an indicator to pending when treeParentId is cleared', async () => {
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const pendingPanel = screen.getByTestId('panel-pending-indicators')
    const attached = state.indicators[5]

    act(() => {
      state.setIndicators(
        state.indicators.map((i) => (i.id === attached.id ? { ...i, treeParentId: state.indicators[0].id } : i)),
      )
    })

    await waitFor(() => {
      expect(within(pendingPanel).queryByText(attached.name)).not.toBeInTheDocument()
    })

    act(() => {
      state.setIndicators(
        state.indicators.map((i) => (i.id === attached.id ? { ...i, treeParentId: undefined } : i)),
      )
    })

    await waitFor(() => {
      expect(within(pendingPanel).getByText(attached.name)).toBeInTheDocument()
    })
  })

  it('allows expanding and collapsing tree nodes in the indicator tree panel', async () => {
    const user = userEvent.setup()
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const root = state.indicators[0]
    act(() => {
      state.setIndicators(
        state.indicators.map((i, idx) => (idx > 0 && idx < 3 ? { ...i, treeParentId: root.id } : i)),
      )
    })

    const toggle = screen.getByLabelText(`收起节点 ${root.id}`)
    expect(screen.getByText(state.indicators[1].name)).toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders four add buttons that fade in on header hover', () => {
    render(<IndicatorAttachmentPage />)

    const addButtons = screen.getAllByTestId('panel-header-add-button')
    expect(addButtons).toHaveLength(4)
    addButtons.forEach((button) => {
      expect(button).toHaveClass('opacity-0')
      expect(button).toHaveClass('group-hover:opacity-100')
    })
  })
})
