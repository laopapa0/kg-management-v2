import { FileText } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '@/components/empty-state/EmptyState'
import { getGeneratedReports } from '@/utils/generatedReportStorage'

export default function ReportHistoryPage() {
  const navigate = useNavigate()
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all')
  const allReports = useMemo(() => getGeneratedReports(), [])

  const planOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of allReports) {
      if (!map.has(r.planId)) {
        map.set(r.planId, r.planName)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [allReports])

  const reports = useMemo(() => {
    if (selectedPlanId === 'all') return allReports
    return allReports.filter((r) => r.planId === selectedPlanId)
  }, [allReports, selectedPlanId])

  if (reports.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-dark-page p-6 text-dark-text-primary">
        <EmptyState
          icon={<FileText className="size-8" />}
          title="暂无历史报告"
          description="生成的报告将在此处展示"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold text-dark-text-primary">历史报告</h2>
        {planOptions.length > 0 && (
          <select
            data-testid="report-history-plan-filter"
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="rounded-md border border-dark-border bg-dark-card-l2 px-3 py-2 text-sm text-dark-text-primary"
          >
            <option value="all">全部计划</option>
            {planOptions.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {reports.map((report) => (
          <div
            key={report.id}
            data-testid={`report-history-row-${report.id}`}
            onClick={() => navigate(`/reports/${report.id}`)}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-dark-border bg-dark-card-l1 p-4 hover:border-dark-border-hover"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-dark-text-primary">{report.planName}</span>
                <span className="rounded-full bg-dark-card-l2 px-2 py-0.5 text-xs text-dark-text-secondary">
                  {report.version}
                </span>
              </div>
              <span className="text-sm text-dark-text-secondary">{report.templateName}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
              <span>{new Date(report.generatedAt).toLocaleDateString('zh-CN')}</span>
              <span className="rounded-full bg-dark-card-l2 px-2 py-0.5 text-xs">
                {report.triggerType === 'manual' ? '手动' : '自动'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
