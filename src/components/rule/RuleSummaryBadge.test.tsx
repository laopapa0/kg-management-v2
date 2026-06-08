import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RuleSummaryBadge, { getSummaryText } from './RuleSummaryBadge'
import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'

describe('RuleSummaryBadge', () => {
  describe('getSummaryText', () => {
    it('returns threshold summary with upper and lower limits', () => {
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      const params: RuleParameter[] = [
        { ruleId: 'r1', indicatorId: 'i1', upperLimit: 120, lowerLimit: 80, unit: '百分比', level: 'P2' },
      ]
      expect(getSummaryText(rule, params)).toBe('阈值: 80~120百分比 · P2')
    })

    it('returns threshold summary with only upper limit', () => {
      const rule: Rule = { id: 'r1', name: '成本上限', type: 'threshold' }
      const params: RuleParameter[] = [
        { ruleId: 'r1', indicatorId: 'i1', upperLimit: 15, unit: '百分比', level: 'P2' },
      ]
      expect(getSummaryText(rule, params)).toBe('阈值: ≤15百分比 · P2')
    })

    it('returns threshold summary with only lower limit', () => {
      const rule: Rule = { id: 'r1', name: '满意度下限', type: 'threshold' }
      const params: RuleParameter[] = [
        { ruleId: 'r1', indicatorId: 'i1', lowerLimit: 85, unit: '分', level: 'P1' },
      ]
      expect(getSummaryText(rule, params)).toBe('阈值: ≥85分 · P1')
    })

    it('returns fluctuation summary with algorithm and window', () => {
      const rule: Rule = { id: 'r2', name: '波动检测', type: 'fluctuation' }
      const params: RuleParameter[] = [
        { ruleId: 'r2', indicatorId: 'i1', algorithm: '3σ', window: '5min', level: 'P2' },
      ]
      expect(getSummaryText(rule, params)).toBe('波动: 3σ · 5min')
    })

    it('returns topn summary with n and dimension', () => {
      const rule: Rule = { id: 'r3', name: 'TOPN', type: 'topn' }
      const params: RuleParameter[] = [
        { ruleId: 'r3', indicatorId: 'i1', n: 10, dimension: 'QPS', level: 'P3' },
      ]
      expect(getSummaryText(rule, params)).toBe('TOP10 · 按QPS')
    })

    it('returns null when parameters are insufficient', () => {
      const rule: Rule = { id: 'r2', name: '波动检测', type: 'fluctuation' }
      const params: RuleParameter[] = [
        { ruleId: 'r2', indicatorId: 'i1', upperLimit: 10 },
      ]
      expect(getSummaryText(rule, params)).toBeNull()
    })

    it('returns null when parameters list is empty', () => {
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      expect(getSummaryText(rule, [])).toBeNull()
    })
  })

  describe('rendering', () => {
    it('renders "待配置" for rules without sufficient parameters', () => {
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      render(<RuleSummaryBadge rule={rule} parameters={[]} />)
      expect(screen.getByTestId('rule-summary-r1')).toHaveTextContent('待配置')
    })

    it('renders threshold summary badge with P2 dark theme colors', () => {
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      const params: RuleParameter[] = [
        { ruleId: 'r1', indicatorId: 'i1', upperLimit: 120, lowerLimit: 80, unit: '百分比', level: 'P2' },
      ]
      render(<RuleSummaryBadge rule={rule} parameters={params} />)
      const badge = screen.getByTestId('rule-summary-r1')
      expect(badge).toHaveTextContent('阈值: 80~120百分比 · P2')
      expect(badge.className).toContain('bg-orange-900/30')
      expect(badge.className).toContain('text-orange-300')
    })

    it('renders fluctuation summary badge', () => {
      const rule: Rule = { id: 'r2', name: '波动检测', type: 'fluctuation' }
      const params: RuleParameter[] = [
        { ruleId: 'r2', indicatorId: 'i1', algorithm: '3σ', window: '5min', level: 'P1' },
      ]
      render(<RuleSummaryBadge rule={rule} parameters={params} />)
      const badge = screen.getByTestId('rule-summary-r2')
      expect(badge).toHaveTextContent('波动: 3σ · 5min')
      expect(badge.className).toContain('bg-red-900/30')
    })

    it('renders topn summary badge', () => {
      const rule: Rule = { id: 'r3', name: 'TOPN', type: 'topn' }
      const params: RuleParameter[] = [
        { ruleId: 'r3', indicatorId: 'i1', n: 10, dimension: 'QPS', level: 'P4' },
      ]
      render(<RuleSummaryBadge rule={rule} parameters={params} />)
      const badge = screen.getByTestId('rule-summary-r3')
      expect(badge).toHaveTextContent('TOP10 · 按QPS')
      expect(badge.className).toContain('bg-blue-900/30')
    })

    it('shows tooltip with parameter details on hover', async () => {
      const user = userEvent.setup()
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      const params: RuleParameter[] = [
        {
          ruleId: 'r1',
          indicatorId: 'i1',
          upperLimit: 120,
          lowerLimit: 80,
          unit: '百分比',
          level: 'P2',
          isInherited: false,
          overriddenFields: ['upperLimit'],
        },
      ]
      render(<RuleSummaryBadge rule={rule} parameters={params} />)

      await user.hover(screen.getByTestId('rule-summary-r1'))

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toHaveTextContent('类型: threshold')
        expect(tooltip).toHaveTextContent('上限: 120')
        expect(tooltip).toHaveTextContent('下限: 80')
        expect(tooltip).toHaveTextContent('单位: 百分比')
        expect(tooltip).toHaveTextContent('级别: P2')
        expect(tooltip).toHaveTextContent('来源: 显式配置')
        expect(tooltip).toHaveTextContent('已覆盖: upperLimit')
      })
    })

    it('shows tooltip with inheritance info when isInherited is true', async () => {
      const user = userEvent.setup()
      const rule: Rule = { id: 'r1', name: '营收阈值', type: 'threshold' }
      const params: RuleParameter[] = [
        {
          ruleId: 'r1',
          indicatorId: 'i1',
          upperLimit: 120,
          lowerLimit: 80,
          unit: '百分比',
          level: 'P2',
          isInherited: true,
        },
      ]
      render(<RuleSummaryBadge rule={rule} parameters={params} />)

      await user.hover(screen.getByTestId('rule-summary-r1'))

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toHaveTextContent('来源: 继承')
      })
    })
  })
})
