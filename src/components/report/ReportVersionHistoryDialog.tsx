import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { GeneratedReport, ReportVersionSnapshot } from '@/models/generatedReportModel'

interface ReportVersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: GeneratedReport | null
}

interface DisplayVersion {
  version: string
  generatedAt: string
  triggerType: 'manual' | 'auto'
  isCurrent: boolean
  reportId: string
}

export default function ReportVersionHistoryDialog({
  open,
  onOpenChange,
  report,
}: ReportVersionHistoryDialogProps) {
  const versions = useMemo<DisplayVersion[]>(() => {
    if (!report) return []
    const list: DisplayVersion[] = [
      {
        version: report.version,
        generatedAt: report.generatedAt,
        triggerType: report.triggerType,
        isCurrent: true,
        reportId: report.id,
      },
    ]
    const prev = report.previousVersions ?? []
    for (const p of prev) {
      list.push({
        version: p.version,
        generatedAt: p.generatedAt,
        triggerType: p.triggerType,
        isCurrent: false,
        reportId: report.id,
      })
    }
    list.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    return list
  }, [report])

  const label = report?.title ?? report?.planName ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px] bg-dark-card-l1 text-dark-text-primary">
        <DialogHeader>
          <DialogTitle>{label} 版本历史</DialogTitle>
          <DialogDescription className="text-dark-text-secondary">
            共 {versions.length} 个版本
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto space-y-1" data-testid="version-history-list">
          {versions.length === 0 ? (
            <p className="py-4 text-center text-sm text-dark-text-secondary">暂无版本记录</p>
          ) : (
            versions.map((v, i) => (
              <div
                key={v.version}
                className={`flex items-center justify-between rounded-md px-3 py-2 ${
                  i === 0 ? 'border-l-2 border-blue-500 bg-dark-card-l2' : 'bg-dark-page'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-dark-text-primary">{v.version}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                    v.triggerType === 'manual'
                      ? 'bg-dark-accent-primary/10 text-dark-accent-primary'
                      : 'bg-dark-card-l2 text-dark-text-secondary'
                  }`}>
                    {v.triggerType === 'manual' ? '手动' : '自动'}
                  </span>
                  <span className="text-xs text-dark-text-secondary">
                    {new Date(v.generatedAt).toLocaleString('zh-CN')}
                  </span>
                  {v.isCurrent && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      最新
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`version-view-${v.version}`}
                  className="text-[11px] h-6 px-2 border-dark-border text-dark-text-secondary hover:bg-dark-page"
                  onClick={() => {
                    window.open(`/kg-management-v2/report.html?reportId=${v.reportId}`, '_blank')
                    onOpenChange(false)
                  }}
                >
                  查看
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
