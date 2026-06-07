import { Info } from 'lucide-react'
import DeleteTreeNodeDialogBase from './DeleteTreeNodeDialogBase'

export interface DeleteTreeNodeSpecialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeName: string
  attachedCount: number
  onConfirm: () => void
}

export default function DeleteTreeNodeSpecialDialog({
  open,
  onOpenChange,
  nodeName,
  attachedCount,
  onConfirm,
}: DeleteTreeNodeSpecialDialogProps) {
  return (
    <DeleteTreeNodeDialogBase
      open={open}
      onOpenChange={onOpenChange}
      nodeName={nodeName}
      icon={<Info className="size-5 text-dark-status-warning-active" />}
      contentClassName="max-w-[460px] border-t-[3px] border-t-dark-status-warning-active"
      title="删除确认"
      description={`${attachedCount} 个指标将回到「待挂靠」区域`}
      bodyText={`节点「${nodeName}」下包含 ${attachedCount} 个已挂靠的指标。删除该节点后，这些指标将回到「待挂靠」区域，不会被删除。`}
      confirmLabel="确认删除"
      dataTestidPrefix="delete-special"
      onConfirm={onConfirm}
    />
  )
}
