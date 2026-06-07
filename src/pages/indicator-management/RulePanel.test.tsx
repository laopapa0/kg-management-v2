import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, initializeAttachmentStore } from '@/stores/attachmentStore'
import RulePanel from './RulePanel'

describe('RulePanel', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())
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
})
