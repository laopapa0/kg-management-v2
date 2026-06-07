import { AlertTriangle } from 'lucide-react'
import DeleteTreeNodeDialogBase from './DeleteTreeNodeDialogBase'

export interface DeleteTreeNodeWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeName: string
  childCount: number
  onConfirm: () => void
}

export default function DeleteTreeNodeWarningDialog({
  open,
  onOpenChange,
  nodeName,
  childCount,
  onConfirm,
}: DeleteTreeNodeWarningDialogProps) {
  return (
    <DeleteTreeNodeDialogBase
      open={open}
      onOpenChange={onOpenChange}
      nodeName={nodeName}
      icon={<AlertTriangle className="size-5 text-dark-status-warning-active" />}
      contentClassName="max-w-[420px]"
      title="删除确认"
      description={`此操作将删除 ${childCount} 个子节点，是否继续？`}
      bodyText={`节点「${nodeName}」下包含 ${childCount} 个子节点，删除后这些子节点将一并被移除。`}
      confirmLabel="确认删除"
      dataTestidPrefix="delete-warning"
      onConfirm={onConfirm}
    />
  )
}
