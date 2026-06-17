import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within, act, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import type { Rule, IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import RulePanel from './RulePanel'

// Mock AnimatePresence to skip exit animations in jsdom
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  }
})

// vaul uses PointerEvents which are not fully supported in JSDOM
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}

describe('RulePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders rule tree from store rules', () => {
    initializeAttachmentStore()
    render(<RulePanel />)

    const state = useAttachmentStore.getState()
    expect(state.rules.length).toBeGreaterThan(0)

    for (const rule of state.rules) {
      if (!rule.parentId) {
        expect(screen.getByText(rule.name)).toBeInTheDocument()
      }
    }
  })

  it('renders new two-level rule tree with 2 root categories and 9 leaf rules', () => {
    initializeAttachmentStore()
    render(<RulePanel />)

    const state = useAttachmentStore.getState()
    const rootRules = state.rules.filter((r) => !r.parentId)
    const leafRules = state.rules.filter((r) => r.parentId && !state.rules.some((p) => p.parentId === r.id))

    expect(rootRules).toHaveLength(2)
    expect(leafRules).toHaveLength(9)

    for (const root of rootRules) {
      expect(screen.getByText(root.name)).toBeInTheDocument()
    }
    expect(screen.getByText('异常规则')).toBeInTheDocument()
    expect(screen.getByText('指标预警')).toBeInTheDocument()
    expect(screen.getByText('波动算法')).toBeInTheDocument()
    expect(screen.getByText('阈值上下限')).toBeInTheDocument()
    expect(screen.getByText('TOPN')).toBeInTheDocument()
  })

  it('displays attached indicator count for each rule', () => {
    initializeAttachmentStore()
    render(<RulePanel />)

    const state = useAttachmentStore.getState()
    const firstRule = state.rules[0]

    const countBadge = screen.getByTestId(`rule-count-${firstRule.id}`)
    expect(countBadge).toHaveTextContent('0')

    const targetIndicator = state.indicators[0]
    act(() => {
      state.setIndicators(
        state.indicators.map((i) =>
          i.id === targetIndicator.id ? { ...i, ruleIds: [firstRule.id] } : i,
        ),
      )
    })

    expect(screen.getByTestId(`rule-count-${firstRule.id}`)).toHaveTextContent('1')
  })

  it('does not change rules when department is switched', async () => {
    initializeAttachmentStore()
    render(<RulePanel />)

    const state = useAttachmentStore.getState()
    const secondDept = state.departments[1]
    expect(secondDept).toBeDefined()

    const firstRuleName = state.rules[0].name
    expect(screen.getByText(firstRuleName)).toBeInTheDocument()

    const initialRuleCount = state.rules.length

    act(() => {
      state.setCurrentDepartmentId(secondDept.id)
    })

    await waitFor(() => {
      const nextState = useAttachmentStore.getState()
      expect(nextState.rules.length).toBe(initialRuleCount)
      expect(screen.getByText(firstRuleName)).toBeInTheDocument()
    })
  })

  it('shows summary tooltip with parameter details on hover', async () => {
    const user = userEvent.setup()
    initializeAttachmentStore()

    const state = useAttachmentStore.getState()
    const ruleWithParams = state.rules.find((r) =>
      state.ruleParameters.some((p) => p.ruleId === r.id),
    )
    expect(ruleWithParams).toBeDefined()

    const params = state.ruleParameters.filter((p) => p.ruleId === ruleWithParams!.id)

    render(<RulePanel />)

    const summary = screen.getByTestId(`rule-summary-${ruleWithParams!.id}`)
    await user.hover(summary)

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip')
      expect(tooltip).toHaveTextContent(`类型: ${ruleWithParams!.type}`)
      for (const param of params) {
        if (param.level) {
          expect(tooltip).toHaveTextContent(`级别: ${param.level}`)
        }
      }
    })
  })

  it('shows "待配置" hint for rules without parameters', () => {
    initializeAttachmentStore()
    render(<RulePanel />)

    const state = useAttachmentStore.getState()
    const ruleWithoutParams = state.rules.find(
      (r) => !state.ruleParameters.some((p) => p.ruleId === r.id),
    )
    expect(ruleWithoutParams).toBeDefined()

    const row = screen.getByTestId(`rule-row-${ruleWithoutParams!.id}`)
    expect(within(row).getByText('待配置')).toBeInTheDocument()
  })

  it('renders EmptyState when rules is empty', () => {
    initializeAttachmentStore()
    useAttachmentStore.setState({ rules: [] })

    render(<RulePanel />)

    expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    expect(screen.getByText('暂无规则')).toBeInTheDocument()
  })

  describe('search filtering', () => {
    it('renders TreeSearchInput at the top', () => {
      initializeAttachmentStore()
      render(<RulePanel />)
      expect(screen.getByTestId('rule-search-input')).toBeInTheDocument()
    })

    it('filters rules with 150ms debounce', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const targetRule = state.rules.find((r) => r.name.includes('阈值'))
      expect(targetRule).toBeDefined()
      const otherRule = state.rules.find((r) => r.name === '波动幅度检测')
      expect(otherRule).toBeDefined()

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '阈值', { delay: null })

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(screen.getByTestId(`rule-row-${targetRule!.id}`)).not.toHaveAttribute('data-dimmed')
      expect(screen.getByTestId(`rule-row-${otherRule!.id}`)).toHaveAttribute('data-dimmed', 'true')

      vi.useRealTimers()
    })

    it('auto-expands parent nodes containing matched children', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const childRule = state.rules.find((r) => r.parentId)
      expect(childRule).toBeDefined()

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, childRule!.name, { delay: null })
      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(screen.getByText(childRule!.name)).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('shows contextual empty state when no rules match', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '不存在的规则', { delay: null })
      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
      expect(screen.getByText('未找到匹配规则')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('hides unmatched rules when switched to filter mode', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const targetRule = state.rules.find((r) => r.name.includes('阈值'))!
      const otherRule = state.rules.find((r) => r.name === '波动幅度检测')!

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '阈值')

      // 等待 debounce
      await waitFor(
        () => {
          expect(screen.getByTestId(`rule-row-${targetRule.id}`)).toBeInTheDocument()
        },
        { timeout: 5000 },
      )

      // 高亮模式下 otherRule 仍存在（只是 dim）
      expect(screen.getByTestId(`rule-row-${otherRule.id}`)).toBeInTheDocument()

      // 切换到过滤模式
      await user.click(screen.getByTestId('search-mode-filter'))

      // 等待 DOM 更新
      await waitFor(
        () => {
          expect(screen.queryByTestId(`rule-row-${otherRule.id}`)).not.toBeInTheDocument()
        },
        { timeout: 5000 },
      )
      expect(screen.getByTestId(`rule-row-${targetRule.id}`)).toBeInTheDocument()
    })

    it('shows contextual empty state when no rules match in filter mode', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()
      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '绝对不存在的规则')

      // 等待 debounce + 空状态出现
      await waitFor(
        () => {
          expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
      expect(screen.getByText('未找到匹配规则')).toBeInTheDocument()

      // 切换到过滤模式——仍应显示空状态
      await user.click(screen.getByTestId('search-mode-filter'))

      expect(screen.getByTestId('empty-state-wrapper')).toBeInTheDocument()
    })

    it('applies scale and pointer-events-none to dimmed unmatched rules in highlight mode', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const targetRule = state.rules.find((r) => r.name.includes('阈值'))!
      const otherRule = state.rules.find((r) => r.name === '波动幅度检测')!

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '阈值', { delay: null })
      act(() => vi.advanceTimersByTime(150))

      const dimmedRow = screen.getByTestId(`rule-row-${otherRule.id}`)
      expect(dimmedRow).toHaveAttribute('data-dimmed', 'true')
      expect(dimmedRow).toHaveClass('opacity-[0.35]')
      expect(dimmedRow).toHaveClass('scale-[0.98]')
      expect(dimmedRow).toHaveClass('pointer-events-none')

      const targetRow = screen.getByTestId(`rule-row-${targetRule.id}`)
      expect(targetRow).not.toHaveAttribute('data-dimmed')

      vi.useRealTimers()
    })

    it('clears search when clear button is clicked', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      initializeAttachmentStore()

      render(<RulePanel />)

      const input = screen.getByTestId('rule-search-input')
      await user.type(input, '阈值', { delay: null })
      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(screen.getByDisplayValue('阈值')).toBeInTheDocument()

      await user.click(screen.getByTestId('tree-search-clear'))

      expect(screen.queryByDisplayValue('阈值')).not.toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('parameter drawer', () => {
    it('opens parameter drawer when config icon is clicked', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const firstRule = state.rules[0]

      render(<RulePanel />)

      const configBtn = screen.getByTestId(`rule-config-btn-${firstRule.id}`)
      await user.click(configBtn)

      expect(screen.getByTestId('parameter-drawer-content')).toBeInTheDocument()
    })

    it('shows correct rule name in drawer header', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const firstRule = state.rules[0]

      render(<RulePanel />)

      const configBtn = screen.getByTestId(`rule-config-btn-${firstRule.id}`)
      await user.click(configBtn)

      const header = screen.getByTestId('drawer-header')
      expect(header).toHaveTextContent(firstRule.name)
    })

    it('closes drawer and removes it from DOM', async () => {
      const user = userEvent.setup()
      initializeAttachmentStore()

      const state = useAttachmentStore.getState()
      const firstRule = state.rules[0]

      render(<RulePanel />)

      const configBtn = screen.getByTestId(`rule-config-btn-${firstRule.id}`)
      await user.click(configBtn)

      expect(screen.getByTestId('parameter-drawer-content')).toBeInTheDocument()

      const closeBtn = screen.getByTestId('drawer-close-btn')
      await user.click(closeBtn)

      await waitFor(() => {
        expect(screen.queryByTestId('parameter-drawer-content')).not.toBeInTheDocument()
      })
    })
  })
})

describe('RulePanel config mode', () => {
  let configIndicatorId: string

  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    initializeAttachmentStore()
    const state = useAttachmentStore.getState()
    configIndicatorId = state.indicators[0]?.id ?? 'ind-0'
  })

  it('does not show checkboxes before rules (removed per design update)', () => {
    render(<RulePanel selectedIndicatorId={configIndicatorId} />)
    const checkboxes = screen.queryAllByRole('checkbox')
    expect(checkboxes.length).toBe(0)
  })

  it('rules are still displayed for selected indicator (checkboxes removed)', () => {
    const state = useAttachmentStore.getState()
    const targetRule = state.rules.find((r: Rule) => r.name.includes('阈值'))!
    state.setIndicators(
      state.indicators.map((i: IndicatorAttachment) =>
        i.id === configIndicatorId ? { ...i, ruleIds: [targetRule.id] } : i,
      ),
    )
    render(<RulePanel selectedIndicatorId={configIndicatorId} />)
    expect(screen.getByText(targetRule.name)).toBeInTheDocument()
  })

  it('shows settings button for checked rules in config mode', () => {
    const state = useAttachmentStore.getState()
    const targetRule = state.rules.find((r: Rule) => r.name.includes('阈值'))!
    state.setIndicators(
      state.indicators.map((i: IndicatorAttachment) =>
        i.id === configIndicatorId ? { ...i, ruleIds: [targetRule.id] } : i,
      ),
    )
    render(<RulePanel selectedIndicatorId={configIndicatorId} />)
    expect(screen.getByTestId(`rule-config-settings-${targetRule.id}`)).toBeInTheDocument()
  })
})
