import { useState, useMemo, useCallback } from 'react'
import { FileText, ExternalLink, History, RotateCcw } from 'lucide-react'
import EmptyState from '@/components/empty-state/EmptyState'
import { Button } from '@/components/ui/button'
import DataTable, { type Column } from '@/components/DataTable'
import { getGeneratedReports, updateGeneratedReport } from '@/utils/generatedReportStorage'
import { getReportPlans, saveReportPlans } from '@/utils/reportStorage'
import { getReportTemplates } from '@/utils/reportTemplateStorage'
import { getNextVersion, makeReportTitle } from '@/models/generatedReportModel'
import type { GeneratedReport, ReportVersionSnapshot } from '@/models/generatedReportModel'
import { generateMockReport } from '@/data/mockReportData'
import { toast } from 'sonner'
import ReportVersionHistoryDialog from '@/components/report/ReportVersionHistoryDialog'

type TriggerFilter = 'all' | 'manual' | 'auto'

const PAGE_SIZE = 10

function TriggerBadge({ type }: { type: GeneratedReport['triggerType'] }) {
  const config = {
    manual: { text: '手动', className: 'bg-dark-accent-primary/10 text-dark-accent-primary' },
    auto: { text: '自动', className: 'bg-dark-card-l2 text-dark-text-secondary' },
  }
  const { text, className } = config[type]
  return (
    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${className}`}>
      {text}
    </span>
  )
}

export default function ReportHistoryPage() {
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [versionDialogOpen, setVersionDialogOpen] = useState(false)
  const [versionDialogReport, setVersionDialogReport] = useState<GeneratedReport | null>(null)

  const allReports = useMemo(() => {
    const reports = getGeneratedReports()
    return [...reports].sort(
      (a, b) => new Date(b.createdAt ?? b.generatedAt).getTime() - new Date(a.createdAt ?? a.generatedAt).getTime(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  const planOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of allReports) {
      if (!map.has(r.planId)) {
        map.set(r.planId, r.planName)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [allReports])

  const filteredReports = useMemo(() => {
    return allReports.filter((r) => {
      const triggerMatch = triggerFilter === 'all' || r.triggerType === triggerFilter
      const planMatch = planFilter === 'all' || r.planId === planFilter
      return triggerMatch && planMatch
    })
  }, [allReports, triggerFilter, planFilter])

  const handleOpenVersionHistory = (report: GeneratedReport) => {
    const fresh = getGeneratedReports().find((r) => r.id === report.id)
    setVersionDialogReport(fresh ?? report)
    setVersionDialogOpen(true)
  }

  const handleRerun = useCallback((report: GeneratedReport) => {
    const now = new Date()
    const newVersion = getNextVersion(report.version)
    const snapshot: ReportVersionSnapshot = {
      version: report.version,
      generatedAt: report.generatedAt,
      sections: report.sections,
      triggerType: report.triggerType,
    }

    const plans = getReportPlans()
    const plan = plans.find((p) => p.id === report.planId) ?? {
      name: report.planName,
      id: report.planId,
      schedule: 'daily' as const,
      templateId: report.templateId,
      latestVersion: 0,
      autoSchedule: false,
      filterScope: report.filterScope,
    }

    const templateName = plan.templateId
      ? (getReportTemplates().find((t) => t.id === plan.templateId)?.name ?? '默认模板')
      : '默认模板'

    const freshReport = generateMockReport(
      plan.name,
      templateName,
      plan.id,
      plan.templateId,
      plan.filterScope,
      'manual',
    )

    updateGeneratedReport(report.id, (r) => ({
      ...r,
      version: newVersion,
      generatedAt: now.toISOString(),
      createdAt: r.createdAt ?? r.generatedAt,
      title: makeReportTitle(r.planName, now),
      sections: freshReport.sections,
      triggerType: 'manual',
      previousVersions: [...(r.previousVersions ?? []), snapshot],
    }))

    const nextPlans = plans.map((p) =>
      p.id === plan.id
        ? { ...p, latestVersion: plan.latestVersion + 1, lastGeneratedAt: now.toISOString() }
        : p,
    )
    saveReportPlans(nextPlans)

    setRefreshKey((k) => k + 1)
    toast.success('报告已重新生成', {
      action: { label: '查看', onClick: () => window.open(`/kg-management-v2/report.html?reportId=${report.id}`, '_blank') },
    })
  }, [])

  const columns: Column<GeneratedReport>[] = [
    {
      key: 'title',
      title: '报告标题',
      render: (r) => (
        <span className="font-medium text-dark-text-primary">
          {r.title ? `${r.title} ${r.version}` : `${r.planName} ${r.version}`}
        </span>
      ),
    },
    {
      key: 'planName',
      title: '所属计划',
    },
    {
      key: 'templateName',
      title: '使用模板',
    },
    {
      key: 'generatedAt',
      title: '生成时间',
      render: (r) => (
        <span className="text-dark-text-secondary">
          {new Date(r.generatedAt).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'triggerType',
      title: '生成方式',
      render: (r) => <TriggerBadge type={r.triggerType} />,
    },
    {
      key: 'actions',
      title: '操作',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            data-testid={`view-report-${r.id}`}
            className="text-[12px] h-7 px-2 border-dark-border text-dark-text-secondary hover:bg-dark-page"
            onClick={(e) => {
              e.stopPropagation()
              window.open('/kg-management-v2/report.html', '_blank')
            }}
          >
            <ExternalLink size={13} className="mr-1" />
            查看报告
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid={`version-history-${r.id}`}
            className="text-[12px] h-7 px-2 border-dark-border text-dark-text-secondary hover:bg-dark-page"
            onClick={(e) => {
              e.stopPropagation()
              handleOpenVersionHistory(r)
            }}
          >
            <History size={13} className="mr-1" />
            历史版本
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid={`rerun-report-${r.id}`}
            className="text-[12px] h-7 px-2 border-dark-border text-dark-accent-primary hover:bg-dark-accent-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              handleRerun(r)
            }}
          >
            <RotateCcw size={13} className="mr-1" />
            重新跑
          </Button>
        </div>
      ),
    },
  ]

  if (allReports.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-dark-text-primary">
        <EmptyState
          icon={<FileText className="size-8" />}
          title="暂无历史报告"
          description="生成的报告将在此处展示"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 text-dark-text-primary overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold text-dark-text-primary">历史报告</h2>
      </div>

      {/* 筛选栏 */}
      <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 space-y-3">
        {/* 计划筛选 */}
        {planOptions.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-dark-text-secondary shrink-0">报告计划：</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => { setPlanFilter('all'); setPage(1) }}
                className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                  planFilter === 'all'
                    ? 'bg-dark-accent-primary text-white'
                    : 'bg-dark-page text-dark-text-secondary hover:bg-dark-accent-primary/10'
                }`}
              >
                全部
              </button>
              {planOptions.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => { setPlanFilter(plan.id); setPage(1) }}
                  className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                    planFilter === plan.id
                      ? 'bg-dark-accent-primary text-white'
                      : 'bg-dark-page text-dark-text-secondary hover:bg-dark-accent-primary/10'
                  }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 触发方式筛选 */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-dark-text-secondary shrink-0">生成方式：</span>
          <div className="flex gap-1.5">
            {[
              { value: 'all' as TriggerFilter, label: '全部' },
              { value: 'manual' as TriggerFilter, label: '手动' },
              { value: 'auto' as TriggerFilter, label: '自动' },
            ].map((btn) => (
              <button
                key={btn.value}
                onClick={() => { setTriggerFilter(btn.value); setPage(1) }}
                className={`px-3 py-1.5 rounded text-[13px] transition-colors ${
                  triggerFilter === btn.value
                    ? 'bg-dark-accent-primary text-white'
                    : 'bg-dark-page text-dark-text-secondary hover:bg-dark-accent-primary/10'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
        <DataTable
          columns={columns}
          data={filteredReports}
          rowKey="id"
          emptyText="未找到匹配的报告"
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total: filteredReports.length,
            onChange: setPage,
          }}
        />
      </div>

      <ReportVersionHistoryDialog
        open={versionDialogOpen}
        onOpenChange={setVersionDialogOpen}
        report={versionDialogReport}
      />
    </div>
  )
}
