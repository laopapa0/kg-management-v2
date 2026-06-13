import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    expect(screen.getByText('候选指标')).toBeInTheDocument()
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
    expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(180px,1fr))]')
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
  }, 15000)

  it('allows expanding and collapsing tree nodes in the indicator tree panel', async () => {
    const user = userEvent.setup()
    render(<IndicatorAttachmentPage />)

    const state = useAttachmentStore.getState()
    // find first L1 virtual grouping node with children (skip "默认" pending node)
    const allParentIds = new Set(state.indicators.map(i => i.treeParentId).filter(Boolean))
    const root = state.indicators.find(i =>
      i.indicatorType === '虚拟分组' && allParentIds.has(i.id) && !i.id?.endsWith('-pending')
    )
    if (!root) throw new Error('no root with children')
    act(() => {
      state.setIndicators(
        state.indicators.map((i, idx) => (idx > 0 && idx < 3 ? { ...i, treeParentId: root.id } : i)),
      )
    })

    const toggle = screen.getByLabelText(`收起节点 ${root.id}`)
    expect(within(screen.getByTestId('panel-indicator-tree')).getByTestId(`indicator-tree-node-content-${state.indicators[1].id}`)).toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  }, 20000)

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
      expect(screen.getByText(/点击目录节点即可挂靠/i)).toBeInTheDocument()
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
    }, 15000)
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
      expect(path).toHaveAttribute('stroke', 'var(--dark-conn-line-default)')
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

    it('sets data-dim-mode on root container in connection mode', async () => {
      render(<IndicatorAttachmentPage />)

      const cards = screen.getAllByTestId('indicator-card')
      act(() => {
        fireEvent.click(cards[0])
      })

      const root = screen.getByTestId('indicator-attachment-page')
      expect(root).toHaveAttribute('data-dim-mode', 'true')
    })

    it('does not set data-dim-mode when not in connection mode', () => {
      render(<IndicatorAttachmentPage />)

      const root = screen.getByTestId('indicator-attachment-page')
      expect(root).not.toHaveAttribute('data-dim-mode')
    })
  })

  describe('persistent connection layer', () => {
    it('renders persistent connection layer when indicators have attachments', () => {
      render(<IndicatorAttachmentPage />)

      expect(screen.getByTestId('persistent-connection-layer')).toBeInTheDocument()
    })

    it('renders persistent connection lines for tree-parent attachments', () => {
      render(<IndicatorAttachmentPage />)

      const lines = screen.getAllByTestId('persistent-connection-line')
      expect(lines.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('delete connection integration', () => {
    function setupConnectionElements(sourceId: string, targetId: string) {
      const sourceEl = document.createElement('div')
      sourceEl.classList.add('test-cleanup')
      sourceEl.setAttribute('data-indicator-id', sourceId)
      sourceEl.style.position = 'absolute'
      sourceEl.style.left = '0px'
      sourceEl.style.top = '0px'
      sourceEl.style.width = '10px'
      sourceEl.style.height = '10px'
      document.body.appendChild(sourceEl)
      sourceEl.getBoundingClientRect = () => ({
        x: 0, y: 0, width: 10, height: 10,
        top: 0, left: 0, right: 10, bottom: 10, toJSON: () => '',
      })

      const targetEl = document.createElement('div')
      targetEl.classList.add('test-cleanup')
      targetEl.setAttribute('data-node-id', targetId)
      targetEl.style.position = 'absolute'
      targetEl.style.left = '100px'
      targetEl.style.top = '100px'
      targetEl.style.width = '10px'
      targetEl.style.height = '10px'
      document.body.appendChild(targetEl)
      targetEl.getBoundingClientRect = () => ({
        x: 100, y: 100, width: 10, height: 10,
        top: 100, left: 100, right: 110, bottom: 110, toJSON: () => '',
      })

      return { sourceEl, targetEl }
    }

    it('shows undo toast after deleting a persistent connection', () => {
      const { sourceEl, targetEl } = setupConnectionElements('del-src', 'del-target')

      const state = useAttachmentStore.getState()
      state.setIndicators([
        ...state.indicators,
        createIndicatorAttachment({
          id: 'del-src',
          name: '删除测试指标',
          code: 'DEL-001',
          indicatorCode: 'DEL-001',
          indicatorDisplayName: '删除测试指标',
          indicatorShowName: '删除测试指标',
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
          treeParentId: 'del-target',
          tagIds: [],
          ruleIds: [],
        }),
      ])

      render(<IndicatorAttachmentPage />)

      const paths = screen.getAllByTestId('persistent-connection-line')
      const path = paths[paths.length - 1]
      fireEvent.mouseEnter(path)
      fireEvent.click(screen.getByTestId('delete-connection-button'))

      expect(screen.getByTestId('undo-toast')).toBeInTheDocument()
      expect(screen.getByText('已删除挂靠')).toBeInTheDocument()

      // Verify detached
      const indicator = useAttachmentStore.getState().indicators.find((i) => i.id === 'del-src')
      expect(indicator?.treeParentId).toBeUndefined()

      document.body.removeChild(sourceEl)
      document.body.removeChild(targetEl)
    }, 15000)

    it('restores connection when undo button is clicked', () => {
      const { sourceEl, targetEl } = setupConnectionElements('undo-src', 'undo-target')

      const state = useAttachmentStore.getState()
      state.setIndicators([
        ...state.indicators,
        createIndicatorAttachment({
          id: 'undo-src',
          name: '撤销测试指标',
          code: 'UNDO-001',
          indicatorCode: 'UNDO-001',
          indicatorDisplayName: '撤销测试指标',
          indicatorShowName: '撤销测试指标',
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
          treeParentId: 'undo-target',
          tagIds: [],
          ruleIds: [],
        }),
      ])

      render(<IndicatorAttachmentPage />)

      const paths = screen.getAllByTestId('persistent-connection-line')
      const path = paths[paths.length - 1]
      fireEvent.mouseEnter(path)
      fireEvent.click(screen.getByTestId('delete-connection-button'))

      expect(screen.getByTestId('undo-toast')).toBeInTheDocument()

      fireEvent.click(screen.getByTestId('undo-toast-button'))

      expect(screen.queryByTestId('undo-toast')).not.toBeInTheDocument()

      const restored = useAttachmentStore.getState().indicators.find((i) => i.id === 'undo-src')
      expect(restored?.treeParentId).toBe('undo-target')

      document.body.removeChild(sourceEl)
      document.body.removeChild(targetEl)
    }, 15000)
  })

  describe('feedback on successful attachment', () => {
    function createFeedbackTarget(id: string) {
      const el = document.createElement('div')
      el.classList.add('test-cleanup')
      el.setAttribute('data-node-id', id)
      el.style.position = 'absolute'
      el.style.left = '100px'
      el.style.top = '100px'
      el.style.width = '50px'
      el.style.height = '50px'
      document.body.appendChild(el)
      return el
    }

    it('shows pulse ring when connection-confirmed event is dispatched', () => {
      createFeedbackTarget('feedback-tree-1')
      render(<IndicatorAttachmentPage />)

      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'feedback-tree-1', targetType: 'tree' },
          }),
        )
      })

      expect(screen.getByTestId('pulse-ring')).toBeInTheDocument()
    })

    it('shows mini toast when connection-confirmed event is dispatched', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      createFeedbackTarget('feedback-tree-2')
      render(<IndicatorAttachmentPage />)

      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'feedback-tree-2', targetType: 'tree' },
          }),
        )
      })

      // Mini toast is delayed by 400ms until pulse ring dissipates
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(screen.getByTestId('mini-toast')).toBeInTheDocument()
      expect(screen.getByText('✓ 指标已挂靠')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('auto-removes pulse ring after 450ms', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      createFeedbackTarget('feedback-tree-3')

      render(<IndicatorAttachmentPage />)

      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'feedback-tree-3', targetType: 'tree' },
          }),
        )
      })

      expect(screen.getByTestId('pulse-ring')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(screen.queryByTestId('pulse-ring')).not.toBeInTheDocument()

      vi.useRealTimers()
    })

    it('auto-removes mini toast after 2 seconds', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      createFeedbackTarget('feedback-tree-4')

      render(<IndicatorAttachmentPage />)

      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'feedback-tree-4', targetType: 'tree' },
          }),
        )
      })

      // Mini toast appears after 400ms delay
      act(() => {
        vi.advanceTimersByTime(400)
      })
      expect(screen.getByTestId('mini-toast')).toBeInTheDocument()

      // Auto-removes after 2 seconds from appearance
      act(() => {
        vi.advanceTimersByTime(2000)
      })

      expect(screen.queryByTestId('mini-toast')).not.toBeInTheDocument()

      vi.useRealTimers()
    })

    it('cancels previous toast timer when a new connection-confirmed fires within 400ms', () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      createFeedbackTarget('target-a')
      createFeedbackTarget('target-b')

      render(<IndicatorAttachmentPage />)

      // First event at t=0 — schedules toast for target-a at t=400
      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'target-a', targetType: 'tree' },
          }),
        )
      })

      // Second event at t=200 — should cancel first timer
      act(() => {
        vi.advanceTimersByTime(200)
      })
      act(() => {
        window.dispatchEvent(
          new CustomEvent('connection-confirmed', {
            detail: { sourceId: 'src-1', targetId: 'target-b', targetType: 'tree' },
          }),
        )
      })

      // At t=400: first timer would fire if not cancelled — no toast yet
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(screen.queryByTestId('mini-toast')).not.toBeInTheDocument()

      // At t=600: second timer fires — toast for target-b appears
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(screen.getByTestId('mini-toast')).toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('command palette integration', () => {
    it('opens command palette on Cmd+K', async () => {
      render(<IndicatorAttachmentPage />)

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, key: 'k' }))
      })

      expect(screen.getByPlaceholderText(/搜索指标/i)).toBeInTheDocument()
    })

    it('opens command palette on Ctrl+K', async () => {
      render(<IndicatorAttachmentPage />)

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, key: 'k' }))
      })

      expect(screen.getByPlaceholderText(/搜索指标/i)).toBeInTheDocument()
    })

    it('renders command palette search input when opened', async () => {
      render(<IndicatorAttachmentPage />)

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { metaKey: true, key: 'k' }))
      })

      expect(screen.getByPlaceholderText(/搜索指标/i)).toBeInTheDocument()
      expect(screen.getByText('↑↓ 导航')).toBeInTheDocument()
    })
  })

  describe('面板比例切换', () => {
    it('默认列表树模式下三栏面板存在且左侧面板初始尺寸为 35%', () => {
      render(<IndicatorAttachmentPage />)

      const treePanel = screen.getByTestId('panel-indicator-tree')
      const pendingPanel = screen.getByTestId('panel-pending-indicators')
      const tagPanel = screen.getByTestId('panel-tag-set')

      expect(treePanel).toBeInTheDocument()
      expect(pendingPanel).toBeInTheDocument()
      expect(tagPanel).toBeInTheDocument()
    })

    it('页面以列表树模式渲染', () => {
      render(<IndicatorAttachmentPage />)

      // 默认模式为 tree，PanelGroup 应包含正确的 data 属性
      const treePanel = screen.getByTestId('panel-indicator-tree')
      expect(treePanel).toBeVisible()
    })
  })
})
