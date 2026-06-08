import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import FilterScopeSelector, { type FilterScopeValue } from '@/components/report/FilterScopeSelector'
import { getReportTemplates } from '@/utils/reportTemplateStorage'
import { addGeneratedReport } from '@/utils/generatedReportStorage'
import { createGeneratedReport } from '@/models/generatedReportModel'
import { generateMockReport } from '@/data/mockReportData'
import type { ReportTemplate } from '@/models/reportTemplateModel'

export interface ReportGenerationWizardProps {
  onComplete: (reportId: string) => void
}

const STEPS = ['筛选范围', '选择模板', '确认并生成'] as const

export default function ReportGenerationWizard({ onComplete }: ReportGenerationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [filterScope, setFilterScope] = useState<FilterScopeValue>({
    includedIndicatorIds: [],
    excludedRuleIds: [],
    excludedLinkRelationIds: [],
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const templates = useMemo(() => getReportTemplates().filter((t) => t.enabled), [])
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId],
  )

  const canGoNext =
    currentStep === 0
      ? filterScope.includedIndicatorIds.length > 0
      : currentStep === 1
        ? selectedTemplateId !== null
        : true

  return (
    <div data-testid="report-generation-wizard" className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary">
      {/* 步骤指示器 */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => (
          <div key={step} className="flex items-center gap-2">
            <span
              data-testid={`wizard-step-${idx}`}
              className={`rounded-full px-3 py-1 text-sm ${
                idx === currentStep
                  ? 'bg-dark-accent-primary text-white'
                  : 'bg-dark-card-l2 text-dark-text-secondary'
              }`}
            >
              {idx + 1}. {step}
            </span>
            {idx < STEPS.length - 1 && (
              <span className="text-dark-text-secondary">→</span>
            )}
          </div>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 rounded-lg border border-dark-border bg-dark-card-l1 p-4 overflow-auto">
        {currentStep === 0 && (
          <FilterScopeSelector value={filterScope} onChange={setFilterScope} />
        )}
        {currentStep === 1 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-medium text-dark-text-primary">选择报告模板</h3>
            <div className="flex flex-col gap-2">
              {templates.map((tmpl: ReportTemplate) => (
                <label
                  key={tmpl.id}
                  data-testid={`wizard-template-${tmpl.id}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedTemplateId === tmpl.id
                      ? 'border-dark-accent-primary bg-dark-accent-primary/10'
                      : 'border-dark-border bg-dark-card-l2 hover:border-dark-border-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    value={tmpl.id}
                    checked={selectedTemplateId === tmpl.id}
                    onChange={() => setSelectedTemplateId(tmpl.id)}
                    className="size-4 accent-dark-accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-dark-text-primary">{tmpl.name}</span>
                    <span className="text-sm text-dark-text-secondary">{tmpl.description}</span>
                    <span className="text-xs text-dark-text-secondary">{tmpl.sections.length} 个板块</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-dark-text-primary">确认配置</h3>

            <div className="rounded-lg border border-dark-border bg-dark-card-l2 p-4">
              <h4 className="mb-2 text-sm font-medium text-dark-text-primary">筛选范围摘要</h4>
              <div className="flex flex-col gap-1 text-sm text-dark-text-secondary">
                <p data-testid="wizard-summary-indicators">
                  已选 <span className="text-dark-text-primary">{filterScope.includedIndicatorIds.length}</span> 个指标
                </p>
                {filterScope.excludedRuleIds.length > 0 && (
                  <p>
                    剔除 <span className="text-dark-text-primary">{filterScope.excludedRuleIds.length}</span> 条规则
                  </p>
                )}
                {filterScope.excludedLinkRelationIds.length > 0 && (
                  <p>
                    剔除 <span className="text-dark-text-primary">{filterScope.excludedLinkRelationIds.length}</span> 种关联关系
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-dark-border bg-dark-card-l2 p-4">
              <h4 className="mb-2 text-sm font-medium text-dark-text-primary">报告模板</h4>
              {selectedTemplate && (
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-dark-text-primary">{selectedTemplate.name}</span>
                  <span className="text-sm text-dark-text-secondary">{selectedTemplate.description}</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedTemplate.sections.map((sec) => (
                      <span
                        key={sec.id}
                        className="rounded-md bg-dark-card-l1 px-2 py-0.5 text-xs text-dark-text-secondary"
                      >
                        {sec.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 操作栏 */}
      <div className="flex justify-end gap-2">
        {currentStep > 0 && (
          <Button
            data-testid="wizard-prev-button"
            variant="outline"
            onClick={() => setCurrentStep((s) => s - 1)}
            className="border-dark-border text-dark-text-primary"
          >
            上一步
          </Button>
        )}
        {currentStep < STEPS.length - 1 && (
          <Button
            data-testid="wizard-next-button"
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canGoNext}
          >
            下一步
          </Button>
        )}
        {currentStep === STEPS.length - 1 && (
          <Button
            data-testid="wizard-generate-button"
            onClick={() => {
              const report = createGeneratedReport({
                ...generateMockReport(
                  '报告计划',
                  selectedTemplate?.name ?? '默认模板',
                ),
                filterScope: {
                  includedIndicatorIds: filterScope.includedIndicatorIds,
                  excludedRuleIds: filterScope.excludedRuleIds,
                  excludedLinkRelationIds: filterScope.excludedLinkRelationIds,
                },
              })
              addGeneratedReport(report)
              onComplete(report.id)
            }}
          >
            生成报告
          </Button>
        )}
      </div>
    </div>
  )
}
