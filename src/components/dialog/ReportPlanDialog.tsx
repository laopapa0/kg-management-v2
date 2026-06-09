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
import type { ReportPlan } from '@/models/reportModel'
import FilterScopeSelector, { type FilterScopeValue } from '@/components/report/FilterScopeSelector'
import { getReportTemplates } from '@/utils/reportTemplateStorage'
import { SCHEDULE_LABELS } from '@/models/reportModel'

export interface ReportPlanFormData {
  name: string
  schedule: ReportPlan['schedule']
  description: string
  autoSchedule: boolean
  filterScope?: FilterScopeValue
  templateId?: string
}

export interface ReportPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: ReportPlan | null
  onConfirm: (data: ReportPlanFormData) => void
  onSaveAndGenerate?: (data: ReportPlanFormData) => void
}

const SCHEDULE_OPTIONS: { value: ReportPlan['schedule']; label: string }[] = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
]

export default function ReportPlanDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  onSaveAndGenerate,
}: ReportPlanDialogProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [schedule, setSchedule] = useState<ReportPlan['schedule']>('daily')
  const [description, setDescription] = useState('')
  const [autoSchedule, setAutoSchedule] = useState(false)
  const [filterScope, setFilterScope] = useState<FilterScopeValue>({
    includedIndicatorIds: [],
    excludedRuleIds: [],
    excludedLinkRelationIds: [],
  })
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (open) {
      setStep(0)
      setName(initialData?.name ?? '')
      setSchedule(initialData?.schedule ?? 'daily')
      setDescription(initialData?.description ?? '')
      setAutoSchedule(initialData?.autoSchedule ?? false)
      setFilterScope(initialData?.filterScope ?? {
        includedIndicatorIds: [],
        excludedRuleIds: [],
        excludedLinkRelationIds: [],
      })
      setTemplateId(initialData?.templateId)
    }
  }, [open, initialData])

  const isEdit = Boolean(initialData)
  const canNext = name.trim().length > 0

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm({
      name: trimmed,
      schedule,
      description: description.trim(),
      autoSchedule,
      filterScope,
      templateId,
    })
    onOpenChange(false)
  }

  const handleSaveAndGenerate = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const data = {
      name: trimmed,
      schedule,
      description: description.trim(),
      autoSchedule,
      filterScope,
      templateId,
    }
    if (onSaveAndGenerate) {
      onSaveAndGenerate(data)
    } else {
      onConfirm(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] bg-dark-card-l1 text-dark-text-primary">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑报告计划' : '新建报告计划'}</DialogTitle>
          <DialogDescription className="text-dark-text-secondary">
            {isEdit ? '修改报告计划的配置信息' : '创建一个新的定时报告生成计划'}
          </DialogDescription>
        </DialogHeader>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2 text-sm">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              data-testid={`step-indicator-${s}`}
              className={`rounded-full px-2 py-0.5 ${
                step + 1 === s
                  ? 'bg-dark-accent-primary text-white'
                  : 'bg-dark-card-l2 text-dark-text-secondary'
              }`}
            >
              Step {s}
            </span>
          ))}
        </div>

        {/* Step 1 — 基本信息 */}
        {step === 0 && (
          <div data-testid="step-1" className="grid gap-4 py-2">
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
              <Label>执行频率</Label>
              <div className="flex gap-4">
                {SCHEDULE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value={opt.value}
                      checked={schedule === opt.value}
                      onChange={() => setSchedule(opt.value)}
                      className="accent-dark-accent-primary"
                    />
                    <span className="text-sm text-dark-text-secondary">{opt.label}</span>
                  </label>
                ))}
              </div>
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
        )}

        {/* Step 2 — 筛选范围 */}
        {step === 1 && (
          <div data-testid="step-2" className="py-2 max-h-[400px] overflow-y-auto">
            <FilterScopeSelector value={filterScope} onChange={setFilterScope} />
          </div>
        )}

        {/* Step 3 — 模板选择 */}
        {step === 2 && (
          <div data-testid="step-3" className="py-2 flex flex-col gap-4">
            <div>
              <h3 className="mb-2 font-medium text-dark-text-primary">选择模板</h3>
              <div className="flex flex-col gap-2">
                {getReportTemplates()
                  .filter((t) => t.enabled)
                  .map((tmpl) => (
                    <label
                      key={tmpl.id}
                      className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-card-l2 p-3 cursor-pointer hover:bg-dark-card-l1"
                    >
                      <input
                        type="radio"
                        name="template"
                        value={tmpl.id}
                        data-testid={`template-radio-${tmpl.id}`}
                        checked={templateId === tmpl.id}
                        onChange={() => setTemplateId(tmpl.id)}
                        className="accent-dark-accent-primary"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-dark-text-primary">{tmpl.name}</span>
                        <span className="text-xs text-dark-text-secondary">{tmpl.description}</span>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            <div data-testid="step-3-summary" className="rounded-lg border border-dark-border bg-dark-card-l2 p-3 text-sm text-dark-text-secondary">
              <div className="font-medium text-dark-text-primary mb-1">配置摘要</div>
              <div>名称：{name || '—'}</div>
              <div>频率：{SCHEDULE_LABELS[schedule]}</div>
              <div>自动排程：{autoSchedule ? '是' : '否'}</div>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
              >
                取消
              </Button>
              <Button
                data-testid="report-plan-next-button"
                onClick={() => setStep(1)}
                disabled={!canNext}
              >
                下一步
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep(0)}
                className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
              >
                上一步
              </Button>
              <Button
                data-testid="report-plan-next-button"
                onClick={() => setStep(2)}
              >
                下一步
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
              >
                取消
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="bg-transparent border-dark-border text-dark-text-primary hover:bg-dark-card-l2 hover:text-dark-text-primary"
              >
                上一步
              </Button>
              <Button
                data-testid="report-plan-save-button"
                variant="outline"
                onClick={handleSave}
              >
                保存计划
              </Button>
              <Button
                data-testid="report-plan-save-generate-button"
                onClick={handleSaveAndGenerate}
              >
                {isEdit ? '保存并重新生成' : '保存并生成'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
