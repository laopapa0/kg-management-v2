import { cn } from '@/lib/utils'

export type ReportAlertVariant = 'danger' | 'warning' | 'info' | 'success'

interface ReportAlertProps {
  variant: ReportAlertVariant
  title: string
  message: string
}

export default function ReportAlert({ variant, title, message }: ReportAlertProps) {
  return (
    <div
      className={cn(
        'report-alert rounded-md border-l-4 bg-opacity-10 p-3',
        variant === 'danger' && 'report-alert-danger border-l-red-500 bg-red-500/10',
        variant === 'warning' && 'report-alert-warning border-l-orange-500 bg-orange-500/10',
        variant === 'info' && 'report-alert-info border-l-blue-500 bg-blue-500/10',
        variant === 'success' && 'report-alert-success border-l-green-500 bg-green-500/10',
      )}
    >
      <div className="text-sm font-medium text-dark-text-primary">{title}</div>
      <div className="mt-1 text-xs text-dark-text-secondary">{message}</div>
    </div>
  )
}
