import { cn } from '@/lib/utils'

export type ReportTagVariant = 'danger' | 'warning' | 'info' | 'success' | 'purple'

interface ReportTagProps {
  variant: ReportTagVariant
  children: React.ReactNode
}

export default function ReportTag({ variant, children }: ReportTagProps) {
  return (
    <span
      data-testid="report-tag"
      className={cn(
        'report-tag inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        variant === 'danger' && 'report-tag-danger bg-red-500/10 text-red-400',
        variant === 'warning' && 'report-tag-warning bg-orange-500/10 text-orange-400',
        variant === 'info' && 'report-tag-info bg-blue-500/10 text-blue-400',
        variant === 'success' && 'report-tag-success bg-green-500/10 text-green-400',
        variant === 'purple' && 'report-tag-purple bg-purple-500/10 text-purple-400',
      )}
    >
      {children}
    </span>
  )
}
