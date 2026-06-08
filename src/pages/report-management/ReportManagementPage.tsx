import { FileText } from 'lucide-react'
import EmptyState from '@/components/empty-state/EmptyState'

export default function ReportManagementPage() {
  return (
    <div
      data-testid="report-management-page"
      className="flex h-full flex-col items-center justify-center bg-dark-page p-6 text-dark-text-primary"
    >
      <EmptyState
        icon={<FileText className="size-8" />}
        title="报告管理"
        description="四大核心菜单之一。当前为占位页面，后续实现报告计划、筛选、模板与版本管理。"
      />
    </div>
  )
}
