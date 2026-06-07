import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface AddTreeNodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedNodeId: string | null
  onConfirm: (name: string, parentId?: string) => void
}

export default function AddTreeNodeDialog({
  open,
  onOpenChange,
  selectedNodeId,
  onConfirm,
}: AddTreeNodeDialogProps) {
  const [name, setName] = useState('')
  const [asChild, setAsChild] = useState(Boolean(selectedNodeId))

  useEffect(() => {
    if (open) {
      setName('')
      setAsChild(Boolean(selectedNodeId))
    }
  }, [open, selectedNodeId])

  const handleConfirm = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed, asChild ? (selectedNodeId ?? undefined) : undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] bg-dark-card-l1 text-dark-text-primary">
        <DialogHeader>
          <DialogTitle>添加节点</DialogTitle>
          <DialogDescription className="text-dark-text-secondary">
            在指标树中添加一个新的分组节点
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="node-name">节点名称</Label>
            <Input
              id="node-name"
              data-testid="add-node-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入节点名称"
              className="bg-dark-card-l2 text-dark-text-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label>添加位置</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-dark-text-primary">
                <input
                  data-testid="add-node-root-radio"
                  type="radio"
                  name="node-location"
                  checked={!asChild}
                  onChange={() => setAsChild(false)}
                />
                作为根节点
              </label>
              <label className="flex items-center gap-2 text-sm text-dark-text-primary">
                <input
                  data-testid="add-node-child-radio"
                  type="radio"
                  name="node-location"
                  checked={asChild}
                  onChange={() => setAsChild(true)}
                  disabled={!selectedNodeId}
                />
                作为子节点
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-dark-border text-dark-text-primary"
          >
            取消
          </Button>
          <Button
            data-testid="add-node-confirm-button"
            onClick={handleConfirm}
            disabled={!name.trim()}
          >
            确认
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
