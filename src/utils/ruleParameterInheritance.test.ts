import { describe, it, expect } from 'vitest'
import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
import {
  getParentRuleId,
  getEffectiveParameter,
  getDescendantRuleIds,
  buildParameterWithOverrides,
  cascadeParentChange,
} from './ruleParameterInheritance'

describe('ruleParameterInheritance', () => {
  const rules: Rule[] = [
    { id: 'root', name: '根规则', type: 'threshold' },
    { id: 'child-a', name: '子规则A', type: 'threshold', parentId: 'root' },
    { id: 'child-b', name: '子规则B', type: 'threshold', parentId: 'root' },
    { id: 'grandchild', name: '孙规则', type: 'threshold', parentId: 'child-a' },
  ]

  describe('getParentRuleId', () => {
    it('returns parentId for child rule', () => {
      expect(getParentRuleId('child-a', rules)).toBe('root')
    })

    it('returns undefined for root rule', () => {
      expect(getParentRuleId('root', rules)).toBeUndefined()
    })

    it('returns undefined for unknown rule', () => {
      expect(getParentRuleId('unknown', rules)).toBeUndefined()
    })
  })

  describe('getEffectiveParameter', () => {
    it('returns explicit param when no parent exists', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1' },
      ]
      const result = getEffectiveParameter('root', rules, params)
      expect(result?.upperLimit).toBe(100)
      expect(result?.isInherited).toBeFalsy()
    })

    it('inherits parent param when child has none', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1' },
      ]
      const result = getEffectiveParameter('child-a', rules, params)
      expect(result?.upperLimit).toBe(100)
      expect(result?.isInherited).toBe(true)
      expect(result?.ruleId).toBe('child-a')
    })

    it('merges inherited and overridden fields', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1' },
        { ruleId: 'child-a', indicatorId: '', upperLimit: 150, isInherited: true, overriddenFields: ['upperLimit'] },
      ]
      const result = getEffectiveParameter('child-a', rules, params)
      expect(result?.upperLimit).toBe(150)
      expect(result?.lowerLimit).toBe(0)
      expect(result?.overriddenFields).toContain('upperLimit')
    })

    it('chains multi-level inheritance', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1' },
      ]
      const result = getEffectiveParameter('grandchild', rules, params)
      expect(result?.upperLimit).toBe(100)
      expect(result?.isInherited).toBe(true)
    })
  })

  describe('getDescendantRuleIds', () => {
    it('returns all descendants of a rule', () => {
      const result = getDescendantRuleIds('root', rules)
      expect(result).toEqual(['child-a', 'child-b', 'grandchild'])
    })

    it('returns empty array for leaf rule', () => {
      const result = getDescendantRuleIds('grandchild', rules)
      expect(result).toEqual([])
    })
  })

  describe('buildParameterWithOverrides', () => {
    it('builds param with inherited values + overrides', () => {
      const inherited: RuleParameter = { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0 }
      const explicit: RuleParameter = { ruleId: 'child', indicatorId: '', upperLimit: 150, isInherited: true, overriddenFields: ['upperLimit'] }
      const result = buildParameterWithOverrides(inherited, explicit)
      expect(result.upperLimit).toBe(150)
      expect(result.lowerLimit).toBe(0)
      expect(result.overriddenFields).toContain('upperLimit')
    })

    it('removes override when restored to inherited value', () => {
      const inherited: RuleParameter = { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0 }
      const explicit: RuleParameter = { ruleId: 'child', indicatorId: '', upperLimit: 100, isInherited: true, overriddenFields: ['upperLimit'] }
      const result = buildParameterWithOverrides(inherited, explicit)
      expect(result.upperLimit).toBe(100)
      expect(result.overriddenFields).toBeUndefined()
    })
  })

  describe('cascadeParentChange', () => {
    it('updates inherited child params when parent changes', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1' },
        { ruleId: 'child-a', indicatorId: '', upperLimit: 100, lowerLimit: 0, unit: '%', level: 'P1', isInherited: true },
        { ruleId: 'child-b', indicatorId: '', upperLimit: 150, lowerLimit: 10, unit: '%', level: 'P2', isInherited: true, overriddenFields: ['upperLimit'] },
      ]
      const newParent = { ruleId: 'root', indicatorId: '', upperLimit: 200, lowerLimit: 0, unit: '%', level: 'P1' }
      const { nextParams, affectedCount } = cascadeParentChange('root', rules, params, newParent)
      expect(affectedCount).toBe(2)
      const childA = nextParams.find((p) => p.ruleId === 'child-a')
      expect(childA?.upperLimit).toBe(200)
      expect(childA?.lowerLimit).toBe(0)
      const childB = nextParams.find((p) => p.ruleId === 'child-b')
      expect(childB?.upperLimit).toBe(150) // overridden, not updated
      expect(childB?.lowerLimit).toBe(0) // inherited, updated
    })

    it('does not affect non-inherited children', () => {
      const params: RuleParameter[] = [
        { ruleId: 'root', indicatorId: '', upperLimit: 100, lowerLimit: 0 },
        { ruleId: 'child-a', indicatorId: '', upperLimit: 150, lowerLimit: 10 },
      ]
      const newParent = { ruleId: 'root', indicatorId: '', upperLimit: 200, lowerLimit: 0 }
      const { nextParams, affectedCount } = cascadeParentChange('root', rules, params, newParent)
      expect(affectedCount).toBe(0)
      const childA = nextParams.find((p) => p.ruleId === 'child-a')
      expect(childA?.upperLimit).toBe(150)
    })
  })
})
