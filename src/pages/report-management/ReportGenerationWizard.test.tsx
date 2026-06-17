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
import type { IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { getGeneratedReports, addGeneratedReport, __resetGeneratedReportStorageCache } from '@/utils/generatedReportStorage'
import { saveReportTemplates, __resetReportTemplateStorageCache } from '@/utils/reportTemplateStorage'
import { mockReportTemplates } from '@/models/reportTemplateModel'
import { createGeneratedReport } from '@/models/generatedReportModel'
import ReportGenerationWizard from './ReportGenerationWizard'

describe('ReportGenerationWizard', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetAttachmentStorageCache()
    __resetGeneratedReportStorageCache()
    __resetReportTemplateStorageCache()

    saveDepartments([{ id: 'dept-test', name: '测试部门' }])
    const root = createMinimalIndicatorAttachment('根节点', { department: '测试部门' }) as IndicatorAttachment
    root.id = 'ind-root'
    const child = createMinimalIndicatorAttachment('子节点', { parentId: 'ind-root', department: '测试部门' }) as IndicatorAttachment
    child.id = 'ind-child'
    saveIndicators('dept-test', [root, child])
    saveTagNodes('dept-test', [])
    saveRules(generateMockRules())
  })

  it('renders three-step wizard with step indicators', () => {
    render(<ReportGenerationWizard onComplete={vi.fn()} />)

    expect(screen.getByText(/筛选范围/)).toBeInTheDocument()
    expect(screen.getByText(/选择模板/)).toBeInTheDocument()
    expect(screen.getByText(/确认并生成/)).toBeInTheDocument()
  })

  it('step 1 embeds FilterScopeSelector and enables next when indicators selected', () => {
    render(<ReportGenerationWizard onComplete={vi.fn()} />)

    expect(screen.getByTestId('filter-scope-selector')).toBeInTheDocument()

    const nextBtn = screen.getByTestId('wizard-next-button')
    expect(nextBtn).toBeDisabled()

    const checkbox = screen.getByTestId('scope-indicator-checkbox-ind-root')
    fireEvent.click(checkbox)

    expect(nextBtn).toBeEnabled()
  })

  it('step 2 shows template list and enables next when a template is selected', () => {
    saveReportTemplates(mockReportTemplates)

    render(<ReportGenerationWizard onComplete={vi.fn()} />)

    // Step 1: select an indicator
    fireEvent.click(screen.getByTestId('scope-indicator-checkbox-ind-root'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 2: template list is visible
    expect(screen.getByText('月报标准模板')).toBeInTheDocument()
    expect(screen.getByText('周报速览模板')).toBeInTheDocument()

    const nextBtn = screen.getByTestId('wizard-next-button')
    expect(nextBtn).toBeDisabled()

    // Select a template
    fireEvent.click(screen.getByTestId('wizard-template-tmpl-001'))

    expect(nextBtn).toBeEnabled()
  })

  it('step 3 shows filter summary and template preview', () => {
    saveReportTemplates(mockReportTemplates)

    render(<ReportGenerationWizard onComplete={vi.fn()} />)

    // Step 1: select root indicator (includes root + child = 2 indicators)
    fireEvent.click(screen.getByTestId('scope-indicator-checkbox-ind-root'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 2: select template
    fireEvent.click(screen.getByTestId('wizard-template-tmpl-001'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 3: summary visible
    expect(screen.getByText(/已选.*指标/)).toBeInTheDocument()
    expect(screen.getByText('月报标准模板')).toBeInTheDocument()
    expect(screen.getByTestId('wizard-generate-button')).toBeInTheDocument()
  })

  it('clicking generate calls onComplete with a report id and persists the report', () => {
    saveReportTemplates(mockReportTemplates)
    const onComplete = vi.fn()

    render(<ReportGenerationWizard onComplete={onComplete} />)

    // Step 1
    fireEvent.click(screen.getByTestId('scope-indicator-checkbox-ind-root'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 2
    fireEvent.click(screen.getByTestId('wizard-template-tmpl-001'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 3: generate
    fireEvent.click(screen.getByTestId('wizard-generate-button'))

    expect(onComplete).toHaveBeenCalledTimes(1)
    const reportId = onComplete.mock.calls[0][0] as string
    expect(typeof reportId).toBe('string')
    expect(reportId.startsWith('gen-')).toBe(true)

    // Persisted in storage
    const stored = getGeneratedReports()
    expect(stored.some((r) => r.id === reportId)).toBe(true)
  })

  it('auto-increments version number when a report already exists for the plan', () => {
    saveReportTemplates(mockReportTemplates)

    // Pre-create a v0.1 report for plan-mock
    addGeneratedReport(
      createGeneratedReport({
        planId: 'plan-mock',
        planName: '报告计划',
        templateId: 'tmpl-001',
        templateName: '月报标准模板',
        version: 'v0.1',
        triggerType: 'manual',
        filterScope: {
          includedIndicatorIds: [],
          excludedRuleIds: [],
          excludedLinkRelationIds: [],
        },
        sections: [{ id: 's1', title: '概览', content: '内容' }],
      }),
    )

    const onComplete = vi.fn()
    render(<ReportGenerationWizard onComplete={onComplete} />)

    // Step 1
    fireEvent.click(screen.getByTestId('scope-indicator-checkbox-ind-root'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 2
    fireEvent.click(screen.getByTestId('wizard-template-tmpl-001'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    // Step 3: generate
    fireEvent.click(screen.getByTestId('wizard-generate-button'))

    const reportId = onComplete.mock.calls[0][0] as string
    const stored = getGeneratedReports()
    const newReport = stored.find((r) => r.id === reportId)
    expect(newReport?.version).toBe('v0.2')
    expect(newReport?.triggerType).toBe('manual')
  })

  it('clicking prev button returns to previous step', () => {
    saveReportTemplates(mockReportTemplates)

    render(<ReportGenerationWizard onComplete={vi.fn()} />)

    // Go to step 2
    fireEvent.click(screen.getByTestId('scope-indicator-checkbox-ind-root'))
    fireEvent.click(screen.getByTestId('wizard-next-button'))

    expect(screen.getByText('月报标准模板')).toBeInTheDocument()

    // Go back to step 1
    fireEvent.click(screen.getByTestId('wizard-prev-button'))

    expect(screen.getByTestId('filter-scope-selector')).toBeInTheDocument()
  })
})
