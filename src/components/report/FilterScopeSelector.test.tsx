import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  saveDepartments,
  saveIndicators,
  saveTagNodes,
  saveRules,
  __resetAttachmentStorageCache,
} from '@/utils/attachmentStorage'
import { generateMockRules } from '@/data/mockAttachmentData'
import { createMinimalIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import type { IndicatorAttachment, TagNode } from '@/models/indicatorAttachmentModel'
import FilterScopeSelector, { type FilterScopeValue } from './FilterScopeSelector'

describe('FilterScopeSelector', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()

    // Inject minimal cross-department data
    saveDepartments([{ id: 'dept-test', name: '测试部门' }])

    const root = createMinimalIndicatorAttachment('根节点', { department: '测试部门' }) as IndicatorAttachment
    root.id = 'ind-root'

    const child = createMinimalIndicatorAttachment('子节点', { parentId: 'ind-root', department: '测试部门' }) as IndicatorAttachment
    child.id = 'ind-child'

    const tagged = createMinimalIndicatorAttachment('带标签指标', { department: '测试部门' }) as IndicatorAttachment
    tagged.id = 'ind-tagged'
    tagged.indicatorType = '原子指标'
    tagged.tagIds = ['tag-1']

    saveIndicators('dept-test', [root, child, tagged])
    saveTagNodes('dept-test', [{ id: 'tag-1', name: '核心标签' }])
    saveRules(generateMockRules())
  })

  it('renders indicator tree and includes checked indicator in scope', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    expect(screen.getByText('根节点')).toBeInTheDocument()

    const checkbox = screen.getByTestId('scope-indicator-checkbox-ind-root')
    fireEvent.click(checkbox)

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.includedIndicatorIds).toContain('ind-root')
  })

  it('checking a tag includes all associated indicators in scope', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    expect(screen.getByText('核心标签')).toBeInTheDocument()

    const tagCheckbox = screen.getByTestId('scope-tag-checkbox-tag-1')
    fireEvent.click(tagCheckbox)

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.includedIndicatorIds).toContain('ind-tagged')
  })

  it('checking parent node includes all descendants', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    const parentCheckbox = screen.getByTestId('scope-indicator-checkbox-ind-root')
    fireEvent.click(parentCheckbox)

    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.includedIndicatorIds).toContain('ind-root')
    expect(lastCall.includedIndicatorIds).toContain('ind-child')
  })

  it('checking a rule updates excludedRuleIds', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    expect(screen.getByText('阈值上下限')).toBeInTheDocument()

    const ruleCheckbox = screen.getByTestId('scope-rule-checkbox-rule-cat-threshold')
    fireEvent.click(ruleCheckbox)

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.excludedRuleIds).toContain('rule-cat-threshold')
  })

  it('checking a link relation updates excludedLinkRelationIds', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    expect(screen.getByText('依赖关系')).toBeInTheDocument()

    const relationCheckbox = screen.getByTestId('scope-relation-checkbox-rel-depends')
    fireEvent.click(relationCheckbox)

    expect(onChange).toHaveBeenCalled()
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.excludedLinkRelationIds).toContain('rel-depends')
  })

  it('shows union count and department coverage in stats', () => {
    const onChange = vi.fn()
    const value: FilterScopeValue = {
      includedIndicatorIds: [],
      excludedRuleIds: [],
      excludedLinkRelationIds: [],
    }

    render(<FilterScopeSelector value={value} onChange={onChange} />)

    // Check tree parent (includes root + child = 2 indicators)
    const parentCheckbox = screen.getByTestId('scope-indicator-checkbox-ind-root')
    fireEvent.click(parentCheckbox)

    // Check tag (includes tagged indicator = 1 indicator)
    const tagCheckbox = screen.getByTestId('scope-tag-checkbox-tag-1')
    fireEvent.click(tagCheckbox)

    // Union = 3 indicators, 1 department
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as FilterScopeValue
    expect(lastCall.includedIndicatorIds).toHaveLength(3)
    expect(lastCall.includedIndicatorIds).toContain('ind-root')
    expect(lastCall.includedIndicatorIds).toContain('ind-child')
    expect(lastCall.includedIndicatorIds).toContain('ind-tagged')

    expect(screen.getByText(/已选.*个指标/)).toHaveTextContent('已选 3 个指标，覆盖 1 个部门')
  })
})
