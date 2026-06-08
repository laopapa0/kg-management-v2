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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ReportPlan } from '@/models/reportModel'

export interface ReportPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ReportPlan | null
  onConfirm: (data: { name: string; schedule: ReportPlan['schedule']; description: string; autoSchedule: boolean }) => void
}

export default function ReportPlanDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}: ReportPlanDialogProps) {
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState<ReportPlan['schedule']>('daily')
  const [description, setDescription] = useState('')
  const [autoSchedule, setAutoSchedule] = useState(false)

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setSchedule(initialData?.schedule ?? 'daily')
      setDescription(initialData?.description ?? '')
      setAutoSchedule(initialData?.autoSchedule ?? false)
    }
  }, [open, initialData])

  const handleConfirm = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm({ name: trimmed, schedule, description: description.trim(), autoSchedule })
    onOpenChange(false)
  }

  const isEdit = Boolean(initialData)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] bg-dark-card-l1 text-dark-text-primary">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑报告计划' : '新建报告计划'}</DialogTitle>
          <DialogDescription className="text-dark-text-secondary">
            {isEdit ? '修改报告计划的配置信息' : '创建一个新的定时报告生成计划'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="plan-name">计划名称</Label>
            <Input
              id="plan-name"
              data-testid="report-plan-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入计划名称"
              className="bg-dark-card-l2 text-dark-text-primary"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-schedule">执行周期</Label>
            <Select
              value={schedule}
              onValueChange={(value) => setSchedule(value as ReportPlan['schedule'])}
            >
              <SelectTrigger
                id="plan-schedule"
                data-testid="report-plan-schedule-select"
                className="bg-dark-card-l2 text-dark-text-primary"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card-l1 text-dark-text-primary">
                <SelectItem value="daily">每日</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-description">描述</Label>
            <Textarea
              id="plan-description"
              data-testid="report-plan-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入描述（可选）"
              className="bg-dark-card-l2 text-dark-text-primary min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              data-testid="report-plan-auto-schedule"
              checked={autoSchedule}
              onCheckedChange={setAutoSchedule}
            />
            <Label className="text-sm text-dark-text-secondary">
              {autoSchedule ? '自动执行已启用' : '启用自动执行'}
            </Label>
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
            data-testid="report-plan-confirm-button"
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
