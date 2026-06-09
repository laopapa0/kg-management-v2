import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ColorPicker from '@/components/color-picker/ColorPicker'
import IconPicker from '@/components/icon-picker/IconPicker'
import type { LinkRelation } from '@/models/linkRelationModel'

export interface LinkRelationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<LinkRelation, 'id' | 'usageCount' | 'createdAt'>) => void
  existingRelations: LinkRelation[]
  initialData?: LinkRelation
}

const CODE_REGEX = /^[A-Z][A-Z_]*$/

const DEFAULT_FORM = {
  code: '',
  name: '',
  displayName: '',
  description: '',
  direction: '有向' as '有向' | '无向',
  color: '#3B82F6',
  icon: 'Link',
  sourceTypes: ['指标'] as string[],
  targetTypes: ['指标'] as string[],
  enabled: true,
}

export default function LinkRelationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  existingRelations,
  initialData,
}: LinkRelationFormDialogProps) {
  const isEdit = !!initialData

  const [form, setForm] = useState({ ...DEFAULT_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill form when initialData changes or dialog opens
  useEffect(() => {
    if (open && initialData) {
      setForm({
        code: initialData.code,
        name: initialData.name,
        displayName: initialData.displayName,
        description: initialData.description,
        direction: initialData.direction,
        color: initialData.color,
        icon: initialData.icon,
        sourceTypes: [...initialData.sourceTypes],
        targetTypes: [...initialData.targetTypes],
        enabled: initialData.enabled,
      })
      setErrors({})
    } else if (open && !initialData) {
      setForm({ ...DEFAULT_FORM })
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}

    if (!isEdit) {
      if (!form.code.trim()) {
        nextErrors.code = '编码不能为空'
      } else if (!CODE_REGEX.test(form.code)) {
        nextErrors.code = '编码只能包含大写字母和下划线'
      } else if (existingRelations.some((r) => r.code === form.code)) {
        nextErrors.code = '该编码已存在'
      }
    }

    if (!form.name.trim()) {
      nextErrors.name = '英文名不能为空'
    }

    if (!form.displayName.trim()) {
      nextErrors.displayName = '中文显示名不能为空'
    } else if (
      existingRelations.some(
        (r) =>
          r.displayName === form.displayName &&
          (!initialData || r.id !== initialData.id),
      )
    ) {
      nextErrors.displayName = '该名称已存在'
    }

    if (form.sourceTypes.length === 0) {
      nextErrors.sourceTypes = '至少选择一个源类型'
    }

    if (form.targetTypes.length === 0) {
      nextErrors.targetTypes = '至少选择一个目标类型'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSubmit(form)
    if (!isEdit) {
      setForm({ ...DEFAULT_FORM })
      setErrors({})
    }
  }

  const toggleType = (key: 'sourceTypes' | 'targetTypes', value: string) => {
    const current = form[key]
    if (current.includes(value)) {
      handleChange(key, current.filter((v) => v !== value))
    } else {
      handleChange(key, [...current, value])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑关系类型' : '新增关系类型'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1.5">
            <Label>编码 <span className="text-red-400">*</span></Label>
            <Input
              data-testid="form-code"
              value={form.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="如 DEPENDS_ON"
              disabled={isEdit}
              className={errors.code ? 'border-red-400' : ''}
            />
            {errors.code && <p className="text-xs text-red-400">{errors.code}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>英文名 <span className="text-red-400">*</span></Label>
            <Input
              data-testid="form-name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="如 DEPENDS_ON"
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>中文显示名 <span className="text-red-400">*</span></Label>
            <Input
              data-testid="form-displayName"
              value={form.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="如 依赖关系"
              className={errors.displayName ? 'border-red-400' : ''}
            />
            {errors.displayName && <p className="text-xs text-red-400">{errors.displayName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>方向</Label>
            <RadioGroup
              value={form.direction}
              onValueChange={(v) => handleChange('direction', v)}
              className="flex gap-4 h-9 items-center"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="有向" id="dir-directed" />
                <Label htmlFor="dir-directed" className="cursor-pointer">有向</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="无向" id="dir-undirected" />
                <Label htmlFor="dir-undirected" className="cursor-pointer">无向</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>描述</Label>
            <Input
              data-testid="form-description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="关系类型的描述"
            />
          </div>
          <div className="space-y-1.5">
            <Label>颜色</Label>
            <ColorPicker
              value={form.color}
              onChange={(color) => handleChange('color', color)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>图标</Label>
            <IconPicker
              value={form.icon}
              onChange={(icon) => handleChange('icon', icon)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>源类型</Label>
            <div className="flex flex-wrap gap-2">
              {['指标', '虚拟分组', '外部因素'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleType('sourceTypes', opt)}
                  className={`px-3 py-1.5 rounded-md text-[13px] border transition-colors ${
                    form.sourceTypes.includes(opt)
                      ? 'bg-dark-accent-primary/10 border-dark-accent-primary text-dark-accent-primary'
                      : 'bg-dark-elevated border-dark-border-hover text-dark-text-secondary hover:border-dark-text-tertiary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.sourceTypes && <p className="text-xs text-red-400">{errors.sourceTypes}</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>目标类型</Label>
            <div className="flex flex-wrap gap-2">
              {['指标', '虚拟分组', '外部因素'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleType('targetTypes', opt)}
                  className={`px-3 py-1.5 rounded-md text-[13px] border transition-colors ${
                    form.targetTypes.includes(opt)
                      ? 'bg-dark-accent-primary/10 border-dark-accent-primary text-dark-accent-primary'
                      : 'bg-dark-elevated border-dark-border-hover text-dark-text-secondary hover:border-dark-text-tertiary'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {errors.targetTypes && <p className="text-xs text-red-400">{errors.targetTypes}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button data-testid="form-submit" onClick={handleSubmit}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
