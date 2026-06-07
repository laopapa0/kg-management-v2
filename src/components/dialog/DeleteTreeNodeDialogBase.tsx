import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DeleteTreeNodeDialogBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodeName: string
  icon: React.ReactNode
  contentClassName?: string
  title: string
  description: React.ReactNode
  bodyText: React.ReactNode
  confirmLabel: string
  dataTestidPrefix: string
  onConfirm: () => void
}

export default function DeleteTreeNodeDialogBase({
  open,
  onOpenChange,
  nodeName,
  icon,
  contentClassName,
  title,
  description,
  bodyText,
  confirmLabel,
  dataTestidPrefix,
  onConfirm,
}: DeleteTreeNodeDialogBaseProps) {
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
        data-testid={`${dataTestidPrefix}-dialog`}
        className={cn(
          'bg-dark-card-l1 text-dark-text-primary',
          contentClassName,
        )}
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            {icon}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription
            data-testid={`${dataTestidPrefix}-dialog-description`}
            className="text-dark-text-secondary"
          >
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-dark-text-secondary">{bodyText}</p>
        </div>

        <DialogFooter>
          <Button
            data-testid={`${dataTestidPrefix}-cancel-button`}
            variant="outline"
            onClick={handleCancel}
            className="border-dark-border text-dark-text-primary"
          >
            取消
          </Button>
          <Button
            data-testid={`${dataTestidPrefix}-confirm-button`}
            variant="destructive"
            onClick={handleConfirm}
            className="hover:opacity-90"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
