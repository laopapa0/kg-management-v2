import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

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
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="delete-warning-dialog"
        className="max-w-[420px] bg-dark-card-l1 text-dark-text-primary"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5" style={{ color: '#F59E0B' }} />
            <DialogTitle>删除确认</DialogTitle>
          </div>
          <DialogDescription className="text-dark-text-secondary">
            此操作将删除 {childCount} 个子节点，是否继续？
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-dark-text-secondary">
            节点「{nodeName}」下包含 {childCount} 个子节点，删除后这些子节点将一并被移除。
          </p>
        </div>

        <DialogFooter>
          <Button
            data-testid="delete-warning-cancel-button"
            variant="outline"
            onClick={handleCancel}
            className="border-dark-border text-dark-text-primary"
          >
            取消
          </Button>
          <Button
            data-testid="delete-warning-confirm-button"
            variant="destructive"
            onClick={handleConfirm}
            className="bg-[#EF4444] hover:bg-[#EF4444]/90"
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
