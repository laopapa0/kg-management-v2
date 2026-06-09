import { FileText, Plus, Pencil, Trash2, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import EmptyState from '@/components/empty-state/EmptyState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReportPlanDialog from '@/components/dialog/ReportPlanDialog'
import type { ReportPlanFormData } from '@/components/dialog/ReportPlanDialog'
import { SCHEDULE_LABELS, createReportPlan } from '@/models/reportModel'
import type { ReportPlan } from '@/models/reportModel'
import { getNextVersion } from '@/models/generatedReportModel'
import { getReportPlans, saveReportPlans } from '@/utils/reportStorage'
import { getGeneratedReports, addGeneratedReport } from '@/utils/generatedReportStorage'
import { getReportTemplates } from '@/utils/reportTemplateStorage'
import { generateMockReport } from '@/data/mockReportData'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ReportHistoryPage from './ReportHistoryPage'
import ReportTemplatesPage from './ReportTemplatesPage'

type ReportTab = 'plans' | 'history' | 'templates'

export default function ReportManagementPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ReportTab>('plans')
  const [plans, setPlans] = useState(getReportPlans)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ReportPlan | null>(null)

  const handleGenerate = (plan: ReportPlan) => {
    const scopeEmpty =
      !plan.filterScope ||
      (
        plan.filterScope.includedIndicatorIds.length === 0 &&
        plan.filterScope.excludedRuleIds.length === 0 &&
        plan.filterScope.excludedLinkRelationIds.length === 0
      )
    if (scopeEmpty) {
      toast.error('筛选范围为空，请编辑计划调整范围')
      return
    }

    const templateName = plan.templateId
      ? (getReportTemplates().find((t) => t.id === plan.templateId)?.name ?? '默认模板')
      : '默认模板'

    const report = generateMockReport(
      plan.name,
      templateName,
      plan.id,
      plan.templateId,
      plan.filterScope,
      'manual',
    )
    report.version = getNextVersion(`v${plan.latestVersion}`)

    addGeneratedReport(report)

    const next = plans.map((p) =>
      p.id === plan.id
        ? { ...p, latestVersion: p.latestVersion + 1, lastGeneratedAt: new Date().toISOString() }
        : p,
    )
    setPlans(next)
    saveReportPlans(next)

    navigate(`/reports/${report.id}`)
  }

  const upsertPlanFromFormData = (data: ReportPlanFormData): ReportPlan => {
    if (editingPlan) {
      const updated = { ...editingPlan, name: data.name, schedule: data.schedule, description: data.description, autoSchedule: data.autoSchedule, filterScope: data.filterScope, templateId: data.templateId }
      const next = plans.map((p) => (p.id === editingPlan.id ? updated : p))
      setPlans(next)
      saveReportPlans(next)
      return updated
    }
    const newPlan = createReportPlan({
      name: data.name,
      schedule: data.schedule,
      description: data.description,
      filterSummary: '全部指标 / 全部部门',
      autoSchedule: data.autoSchedule,
      filterScope: data.filterScope,
      templateId: data.templateId,
    })
    const next = [...plans, newPlan]
    setPlans(next)
    saveReportPlans(next)
    return newPlan
  }

  const handleSave = (data: ReportPlanFormData) => {
    upsertPlanFromFormData(data)
  }

  const handleSaveAndGenerate = (data: ReportPlanFormData) => {
    const plan = upsertPlanFromFormData(data)
    handleGenerate(plan)
  }

  useEffect(() => {
    setPlans(getReportPlans())
  }, [])

  const renderPlansContent = () => {
    if (plans.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center">
          <EmptyState
            icon={<FileText className="size-8" />}
            title="暂无报告计划"
            description="创建报告计划以开始自动生成报告"
            action={
              <Button
                data-testid="new-report-plan-button"
                onClick={() => {
                  setEditingPlan(null)
                  setDialogOpen(true)
                }}
              >
                <Plus size={16} />
                新建报告计划
              </Button>
            }
          />
        </div>
      )
    }

    return (
      <>
        <div className="flex items-center justify-between">
          <h2 className="text-h2 font-semibold text-dark-text-primary">报告管理</h2>
          <div className="flex items-center gap-2">
            <Button
              data-testid="new-report-plan-button"
              onClick={() => {
                setEditingPlan(null)
                setDialogOpen(true)
              }}
            >
              <Plus size={16} />
              新建报告计划
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              data-testid={`report-plan-row-${plan.id}`}
              className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-card-l1 p-4"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-dark-text-primary">{plan.name}</span>
                  <span className="rounded-full bg-dark-card-l2 px-2 py-0.5 text-xs text-dark-text-secondary">
                    {SCHEDULE_LABELS[plan.schedule]}
                  </span>
                  {plan.autoSchedule && (
                    <span className="rounded-full bg-dark-accent-primary/15 px-2 py-0.5 text-xs text-dark-accent-primary">
                      自动
                    </span>
                  )}
                </div>
                <span className="text-sm text-dark-text-secondary">{plan.filterSummary}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
                <span>V{plan.latestVersion}</span>
                <span>{plan.lastGeneratedAt ? new Date(plan.lastGeneratedAt).toLocaleDateString('zh-CN') : '—'}</span>
                <div className="flex items-center gap-1">
                  {(() => {
                    const latestReport = getGeneratedReports()
                      .filter((r) => r.planName === plan.name)
                      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
                    return latestReport ? (
                      <button
                        data-testid={`view-report-${plan.id}`}
                        onClick={() => navigate(`/reports/${latestReport.id}`)}
                        className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 hover:text-dark-text-primary"
                        title="查看报告"
                      >
                        <FileText size={14} />
                      </button>
                    ) : null
                  })()}
                  {plan.latestVersion === 0 ? (
                    <button
                      data-testid={`generate-report-${plan.id}`}
                      onClick={() => handleGenerate(plan)}
                      className="rounded px-2 py-1 text-xs text-dark-text-secondary hover:bg-dark-card-l2 hover:text-dark-text-primary"
                      title="首次生成"
                    >
                      首次生成
                    </button>
                  ) : (
                    <button
                      data-testid={`generate-report-${plan.id}`}
                      onClick={() => handleGenerate(plan)}
                      className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 hover:text-dark-text-primary"
                      title="生成报告"
                    >
                      <Play size={14} />
                    </button>
                  )}
                  <button
                    data-testid={`edit-report-plan-${plan.id}`}
                    onClick={() => {
                      setEditingPlan(plan)
                      setDialogOpen(true)
                    }}
                    className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 hover:text-dark-text-primary"
                    title="编辑"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    data-testid={`delete-report-plan-${plan.id}`}
                    onClick={() => {
                      const next = plans.filter((p) => p.id !== plan.id)
                      setPlans(next)
                      saveReportPlans(next)
                    }}
                    className="rounded p-1 text-dark-text-secondary hover:bg-red-500/10 hover:text-red-400"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div
      data-testid="report-management-page"
      className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary overflow-auto"
    >
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)}>
        <TabsList className="mb-4 bg-dark-elevated border border-dark-border">
          <TabsTrigger
            value="plans"
            className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
          >
            报告计划
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
          >
            历史报告
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary"
          >
            报告模板
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ReportPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingPlan}
        onConfirm={handleSave}
        onSaveAndGenerate={handleSaveAndGenerate}
      />

      {activeTab === 'plans' && renderPlansContent()}
      {activeTab === 'history' && <ReportHistoryPage />}
      {activeTab === 'templates' && <ReportTemplatesPage />}
    </div>
  )
}
