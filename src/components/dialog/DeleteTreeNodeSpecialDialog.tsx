import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

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
        data-testid="delete-special-dialog"
        className="max-w-[460px] border-t-[3px] border-t-[#F59E0B] bg-dark-card-l1 text-dark-text-primary"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Info className="size-5" style={{ color: '#F59E0B' }} />
            <DialogTitle>删除确认</DialogTitle>
          </div>
          <DialogDescription data-testid="delete-special-dialog-description" className="text-dark-text-secondary">
            {attachedCount} 个指标将回到「待挂靠」区域
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-dark-text-secondary">
            节点「{nodeName}」下包含 {attachedCount} 个已挂靠的指标。删除该节点后，这些指标将回到「待挂靠」区域，不会被删除。
          </p>
        </div>

        <DialogFooter>
          <Button
            data-testid="delete-special-cancel-button"
            variant="outline"
            onClick={handleCancel}
            className="border-dark-border text-dark-text-primary"
          >
            取消
          </Button>
          <Button
            data-testid="delete-special-confirm-button"
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
