import { FileText, Plus, Pencil, Trash2, Play } from 'lucide-react'
import { useState, useEffect } from 'react'
import EmptyState from '@/components/empty-state/EmptyState'
import { Button } from '@/components/ui/button'
import ReportPlanDialog from '@/components/dialog/ReportPlanDialog'
import { SCHEDULE_LABELS, createReportPlan } from '@/models/reportModel'
import type { ReportPlan } from '@/models/reportModel'
import { getReportPlans, saveReportPlans } from '@/utils/reportStorage'
import { getGeneratedReports } from '@/utils/generatedReportStorage'
import { useNavigate } from 'react-router-dom'


export default function ReportManagementPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState(getReportPlans)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ReportPlan | null>(null)

  useEffect(() => {
    setPlans(getReportPlans())
  }, [])

  if (plans.length === 0) {
    return (
      <>
        <ReportPlanDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingPlan}
          onConfirm={(data) => {
          if (editingPlan) {
            const next = plans.map((p) =>
              p.id === editingPlan.id
                ? { ...p, name: data.name, schedule: data.schedule, description: data.description, autoSchedule: data.autoSchedule }
                : p,
            )
            setPlans(next)
            saveReportPlans(next)
          } else {
            const newPlan = createReportPlan({
              name: data.name,
              schedule: data.schedule,
              description: data.description,
              filterSummary: '全部指标 / 全部部门',
              autoSchedule: data.autoSchedule,
            })
            const next = [...plans, newPlan]
            setPlans(next)
            saveReportPlans(next)
          }
        }}
        />
        <div
          data-testid="report-management-page"
          className="flex h-full flex-col items-center justify-center bg-dark-page p-6 text-dark-text-primary"
        >
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
      </>
    )
  }

  return (
    <div
      data-testid="report-management-page"
      className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold text-dark-text-primary">报告管理</h2>
        <div className="flex items-center gap-2">
          <Button
            data-testid="generate-report-button"
            variant="outline"
            onClick={() => navigate('/reports/generate')}
            className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
          >
            <Play size={16} />
            生成报告
          </Button>
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

      <ReportPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingPlan}
        onConfirm={(data) => {
          if (editingPlan) {
            const next = plans.map((p) =>
              p.id === editingPlan.id
                ? { ...p, name: data.name, schedule: data.schedule, description: data.description, autoSchedule: data.autoSchedule }
                : p,
            )
            setPlans(next)
            saveReportPlans(next)
          } else {
            const newPlan = createReportPlan({
              name: data.name,
              schedule: data.schedule,
              description: data.description,
              filterSummary: '全部指标 / 全部部门',
              autoSchedule: data.autoSchedule,
            })
            const next = [...plans, newPlan]
            setPlans(next)
            saveReportPlans(next)
          }
        }}
      />

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
    </div>
  )
}
