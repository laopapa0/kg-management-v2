import { useState, useMemo } from 'react'
import { Eye, FileText, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '@/components/empty-state/EmptyState'
import { Button } from '@/components/ui/button'
import { getGeneratedReports } from '@/utils/generatedReportStorage'
import type { GeneratedReport } from '@/models/generatedReportModel'

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
  const navigate = useNavigate()
  const [triggerFilter, setTriggerFilter] = useState<TriggerFilter>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  const allReports = useMemo(() => {
    const reports = getGeneratedReports()
    return [...reports].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
    )
  }, [])

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

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredReports.slice(start, start + PAGE_SIZE)
  }, [filteredReports, currentPage])

  if (allReports.length === 0) {
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
    <div className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary overflow-auto">
      {/* 页面标题 */}
      <div>
        <h1 className="text-display">历史报告</h1>
        <p className="text-small text-dark-text-secondary mt-1">查看所有已生成的报告记录</p>
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

      {/* 报告卡片列表 */}
      {filteredReports.length === 0 ? (
        <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-10 text-center">
          <FileText size={32} className="mx-auto text-dark-text-tertiary mb-3" />
          <div className="text-[15px] text-dark-text-secondary mb-1">未找到匹配的报告</div>
          <div className="text-[13px] text-dark-text-tertiary">请调整筛选条件后重试</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {pagedReports.map((report) => (
              <div
                key={report.id}
                data-testid={`report-history-card-${report.id}`}
                className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 flex flex-col"
              >
                {/* 头部：报告标题 + 触发类型 */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[14px] font-medium text-dark-text-primary leading-tight pr-2">
                    {report.planName} {report.version}
                  </h3>
                  <TriggerBadge type={report.triggerType} />
                </div>

                {/* 生成时间 */}
                <div className="text-[12px] text-dark-text-tertiary mb-3">
                  {new Date(report.generatedAt).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>

                {/* 信息栏 */}
                <div className="flex gap-4 mb-4">
                  <div>
                    <div className="text-[11px] text-dark-text-tertiary">所属计划</div>
                    <div className="text-[13px] font-medium text-dark-text-primary">{report.planName}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-dark-text-tertiary">使用模板</div>
                    <div className="text-[13px] font-medium text-dark-text-primary">{report.templateName}</div>
                  </div>
                </div>

                {/* 操作栏 */}
                <div className="mt-auto pt-3 border-t border-dark-border flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`view-report-${report.id}`}
                    className="text-[12px] h-7 px-2 border-dark-border text-dark-text-secondary hover:bg-dark-page"
                    onClick={() => window.open('docs/report.html', '_blank')}
                  >
                    <ExternalLink size={13} className="mr-1" />
                    查看报告
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`online-detail-${report.id}`}
                    className="text-[12px] h-7 px-2 border-dark-border text-dark-accent-primary hover:bg-dark-accent-primary/10"
                    onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <Eye size={13} className="mr-1" />
                    在线详情
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-2">
              <button
                data-testid="pagination-prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded text-[13px] border border-dark-border bg-dark-elevated text-dark-text-secondary hover:bg-dark-page disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span data-testid="pagination-info" className="text-[13px] text-dark-text-secondary">
                {currentPage} / {totalPages}
              </span>
              <button
                data-testid="pagination-next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded text-[13px] border border-dark-border bg-dark-elevated text-dark-text-secondary hover:bg-dark-page disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
