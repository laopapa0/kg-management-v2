import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore, selectPendingIndicators } from '@/stores/attachmentStore'
import { createIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import IndicatorAttachmentPage from './IndicatorAttachmentPage'

describe('IndicatorAttachmentPage', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
    initializeAttachmentStore()

    // Inject real pending indicators so tests have observable data after the
    // selectPendingIndicators fix excludes virtual grouping nodes.
    const state = useAttachmentStore.getState()
    const pendingReal1 = createIndicatorAttachment({
      id: 'pending-real-1',
      name: '待选真实指标1',
      code: 'PENDING-001',
      indicatorCode: 'PENDING-001',
      indicatorDisplayName: '待选真实指标1',
      indicatorShowName: '待选真实指标1',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '收入',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: state.departments[0]?.name ?? '',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: undefined,
      tagIds: [],
      ruleIds: [],
    })
    const pendingReal2 = createIndicatorAttachment({
      id: 'pending-real-2',
      name: '待选真实指标2',
      code: 'PENDING-002',
      indicatorCode: 'PENDING-002',
      indicatorDisplayName: '待选真实指标2',
      indicatorShowName: '待选真实指标2',
      indicatorType: '基础指标',
      level1: '经营',
      level2: '利润',
      granularity: '全局',
      frequency: '月',
      unit: '元',
      isBigScreen: false,
      department: state.departments[0]?.name ?? '',
      businessCaliber: '',
      techCaliber: '',
      tags: [],
      treeParentId: undefined,
      tagIds: [],
      ruleIds: [],
    })
    state.setIndicators([...state.indicators, pendingReal1, pendingReal2])
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
    expect(within(treePanel).getByTestId(`indicator-tree-node-content-${indicators[0].id}`)).toBeInTheDocument()
  })

  it('renders TreeView in the rules panel from store data', () => {
    render(<IndicatorAttachmentPage />)

    const rulesPanel = screen.getByTestId('panel-rules')
    expect(within(rulesPanel).getByTestId('tree-view')).toBeInTheDocument()
    const rules = useAttachmentStore.getState().rules
    const firstRoot = rules.find((r) => !r.parentId)
    expect(firstRoot).toBeDefined()
    expect(within(rulesPanel).getByText(firstRoot!.name)).toBeInTheDocument()
  })

  it('renders indicator cards in the pending indicators panel from store data', () => {
    render(<IndicatorAttachmentPage />)

    const cards = screen.getAllByTestId('indicator-card')
    expect(cards.length).toBeGreaterThanOrEqual(2)
  })

  it('uses responsive CSS Grid breakpoints for pending indicators', () => {
    render(<IndicatorAttachmentPage />)

    const grid = screen.getByTestId('indicator-grid')
    expect(grid).toHaveClass('md:grid-cols-2')
    expect(grid).toHaveClass('lg:grid-cols-3')
    expect(grid).toHaveClass('min-[1440px]:grid-cols-4')
  })

  it('filters pending indicators by attachment state', () => {
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const pendingCount = selectPendingIndicators(state).length

    const cards = screen.getAllByTestId('indicator-card')
    expect(cards.length).toBe(pendingCount)
  })

  it('updates pending indicators when an indicator is attached to the tree', async () => {
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    const target = state.indicators.find(
      (i) => i.indicatorType !== '虚拟分组' && !i.treeParentId && i.tagIds.length === 0 && i.ruleIds.length === 0,
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
    expect(within(screen.getByTestId('panel-indicator-tree')).getByTestId(`indicator-tree-node-content-${state.indicators[1].id}`)).toBeInTheDocument()

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

  describe('connection mode integration', () => {
    it('renders continuous mode toggle', () => {
      render(<IndicatorAttachmentPage />)

      expect(screen.getByText('连续挂靠')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
    })

    it('toggles continuous mode on click', async () => {
      const user = userEvent.setup()
      render(<IndicatorAttachmentPage />)

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('data-state', 'unchecked')

      await user.click(toggle)
      expect(toggle).toHaveAttribute('data-state', 'checked')

      await user.click(toggle)
      expect(toggle).toHaveAttribute('data-state', 'unchecked')
    })

    it('shows connection status bar when a card is clicked', async () => {
      const user = userEvent.setup()
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      await user.click(cards[0])

      expect(screen.getByTestId('connection-status-bar')).toBeInTheDocument()
      expect(screen.getByText(/连线模式/i)).toBeInTheDocument()
    })

    it('sets body cursor to crosshair in connection mode', async () => {
      const user = userEvent.setup()
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      await user.click(cards[0])

      expect(document.body).toHaveStyle('cursor: crosshair')
    })

    it('restores body cursor after cancel', async () => {
      const user = userEvent.setup()
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      await user.click(cards[0])
      expect(document.body).toHaveStyle('cursor: crosshair')

      // Press ESC to cancel
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })

      expect(document.body).not.toHaveStyle('cursor: crosshair')
    })

    it('shakes status bar on invalid Space key', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      act(() => {
        fireEvent.keyDown(document, { key: ' ' })
      })

      const statusBar = screen.getByTestId('connection-status-bar')
      expect(statusBar).toHaveClass('animate-shake-connection')
    })

    it('shows misfire hint after 3 invalid Space presses', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      // 3 invalid Space presses
      for (let i = 0; i < 3; i++) {
        act(() => {
          fireEvent.keyDown(document, { key: ' ' })
        })
      }

      expect(screen.getByTestId('misfire-hint')).toBeInTheDocument()
      expect(screen.getByText(/请将连线拖拽到目标指标后按空格确认/i)).toBeInTheDocument()
    })

    it('auto-dismisses misfire hint after 3s and resets counter', async () => {
      vi.useFakeTimers()

      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      for (let i = 0; i < 3; i++) {
        act(() => {
          fireEvent.keyDown(document, { key: ' ' })
        })
      }

      expect(screen.getByTestId('misfire-hint')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.queryByTestId('misfire-hint')).not.toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('focus zone hint', () => {
    it('shows hint when an indicator card is focused', () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        cards[0].focus()
      })

      const hint = screen.getByTestId('focus-zone-hint')
      expect(hint).toBeInTheDocument()
      expect(hint.textContent).toMatch(/space/i)
    })

    it('shows tag zone hint when a tag pill is focused', () => {
      render(<IndicatorAttachmentPage />)

      const tagPill = document.querySelector('button[data-testid^="tag-pill-"]') as HTMLElement
      expect(tagPill).toBeTruthy()
      act(() => {
        tagPill.focus()
      })

      const hint = screen.getByTestId('focus-zone-hint')
      expect(hint).toBeInTheDocument()
      expect(hint.textContent).toMatch(/标签/)
    })

    it('does not show hint when no focusable element is focused', () => {
      render(<IndicatorAttachmentPage />)

      // Ensure nothing is focused
      act(() => {
        document.body.focus()
      })

      expect(screen.queryByTestId('focus-zone-hint')).not.toBeInTheDocument()
    })

    it('hides hint when focus moves outside any zone', () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        cards[0].focus()
      })
      expect(screen.getByTestId('focus-zone-hint')).toBeInTheDocument()

      // Create an element outside any data-focus-zone and focus it
      const outsideBtn = document.createElement('button')
      outsideBtn.id = 'outside-zone-btn'
      document.body.appendChild(outsideBtn)
      act(() => {
        outsideBtn.focus()
      })
      expect(screen.queryByTestId('focus-zone-hint')).not.toBeInTheDocument()
      document.body.removeChild(outsideBtn)
    })

    it('does not show zone hint in connection mode (status bar already shows hint)', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      // In connection mode, the status bar is shown but focus-zone-hint should not be
      expect(screen.getByTestId('connection-status-bar')).toBeInTheDocument()
      expect(screen.queryByTestId('focus-zone-hint')).not.toBeInTheDocument()
    })
  })

  describe('connection layer integration', () => {
    it('renders SVG connection layer when a card is clicked', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      expect(screen.getByTestId('connection-layer')).toBeInTheDocument()
    })

    it('does not render connection layer when not in connection mode', () => {
      render(<IndicatorAttachmentPage />)

      expect(screen.queryByTestId('connection-layer')).not.toBeInTheDocument()
    })

    it('renders connection line path with ant-line animation', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      const path = screen.getByTestId('connection-line-path')
      expect(path).toHaveAttribute('stroke', '#64748B')
      expect(path).toHaveAttribute('stroke-dasharray', '6 4')
      expect(path).toHaveClass('animate-ant-line')
    })

    it('renders arrow marker in connection layer', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      const marker = document.getElementById('conn-arrow')
      expect(marker).toBeInTheDocument()
    })

    it('renders focus mode overlay when in connection mode', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      expect(screen.getByTestId('focus-mode-overlay')).toBeInTheDocument()
    })

    it('does not render focus mode overlay when not in connection mode', () => {
      render(<IndicatorAttachmentPage />)

      expect(screen.queryByTestId('focus-mode-overlay')).not.toBeInTheDocument()
    })
  })
})
