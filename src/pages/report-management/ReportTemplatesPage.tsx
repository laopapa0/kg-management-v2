import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, ArrowUp, ArrowDown, X, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/empty-state/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ReportTemplate, ReportSection } from '@/models/reportTemplateModel'
import { createReportTemplate, createReportSection, PROMPT_PRESETS } from '@/models/reportTemplateModel'
import { getReportTemplates, saveReportTemplates } from '@/utils/reportTemplateStorage'

interface DialogState {
  open: boolean
  editing: ReportTemplate | null
  name: string
  description: string
  styleGuide: string
  sections: ReportSection[]
  enabled: boolean
  aiRequest: string
  aiGenerating: boolean
}

function emptyDialog(): DialogState {
  return {
    open: false,
    editing: null,
    name: '',
    description: '',
    styleGuide: '',
    sections: [],
    enabled: true,
    aiRequest: '',
    aiGenerating: false,
  }
}

function generateMockSections(_request: string): ReportSection[] {
  return [
    createReportSection({ title: '核心指标概览', prompt: '汇总关键指标的最新数值、同比环比变化，生成概览图表 + 文字说明。' }),
    createReportSection({ title: '异常波动检测', prompt: '基于当前时间范围内的历史数据，检测是否有指标出现异常波动（毛刺/突增/突降）。对每个异常指标列出：指标名、异常时间点、波动幅度、可能原因。' }),
    createReportSection({ title: '智能归因分析', prompt: '用知识图谱中的指标间关系（DRIVES/CAUSES/DEPENDS_ON/AGGREGATES/TRANSMISSION），从图谱关系出发追溯每个毛刺的根因。' }),
  ]
}

export default function ReportTemplatesPage() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [dialog, setDialog] = useState<DialogState>(emptyDialog)

  useEffect(() => {
    setTemplates(getReportTemplates())
  }, [])

  const handleOpenCreate = () => {
    setDialog({ ...emptyDialog(), open: true })
  }

  const handleOpenEdit = (tmpl: ReportTemplate) => {
    setDialog({
      open: true,
      editing: tmpl,
      name: tmpl.name,
      description: tmpl.description,
      styleGuide: tmpl.styleGuide,
      sections: [...tmpl.sections],
      enabled: tmpl.enabled,
      aiRequest: '',
      aiGenerating: false,
    })
  }

  const handleAddSection = () => {
    setDialog((d) => ({
      ...d,
      sections: [...d.sections, createReportSection({ title: '' })],
    }))
  }

  const handleRemoveSection = (index: number) => {
    setDialog((d) => ({
      ...d,
      sections: d.sections.filter((_, i) => i !== index),
    }))
  }

  const handleMoveSection = (index: number, direction: -1 | 1) => {
    setDialog((d) => {
      const next = [...d.sections]
      const swapIdx = index + direction
      if (swapIdx < 0 || swapIdx >= next.length) return d
      const temp = next[index]
      next[index] = next[swapIdx]
      next[swapIdx] = temp
      return { ...d, sections: next }
    })
  }

  const handleUpdateSection = (index: number, patch: Partial<ReportSection>) => {
    setDialog((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }))
  }

  const handleApplyPreset = (index: number, preset: string) => {
    setDialog((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, prompt: preset } : s)),
    }))
  }

  const handleSave = () => {
    if (!dialog.name.trim()) return

    if (dialog.editing) {
      const next = templates.map((t) =>
        t.id === dialog.editing!.id
          ? { ...t, name: dialog.name, description: dialog.description, styleGuide: dialog.styleGuide, sections: dialog.sections, enabled: dialog.enabled }
          : t,
      )
      setTemplates(next)
      saveReportTemplates(next)
    } else {
      const newTmpl = createReportTemplate({
        name: dialog.name,
        description: dialog.description,
        styleGuide: dialog.styleGuide,
        sections: dialog.sections,
        enabled: dialog.enabled,
      })
      const next = [...templates, newTmpl]
      setTemplates(next)
      saveReportTemplates(next)
    }
    setDialog(emptyDialog())
  }

  const handleToggleEnabled = (tmpl: ReportTemplate) => {
    const next = templates.map((t) => (t.id === tmpl.id ? { ...t, enabled: !t.enabled } : t))
    setTemplates(next)
    saveReportTemplates(next)
  }

  const handleDelete = (tmpl: ReportTemplate) => {
    const next = templates.filter((t) => t.id !== tmpl.id)
    setTemplates(next)
    saveReportTemplates(next)
  }

  if (templates.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-dark-text-primary">
        <EmptyState
          icon={<FileText className="size-8" />}
          title="暂无报告模板"
          description="创建模板以标准化报告生成格式"
          action={
            <Button onClick={handleOpenCreate}>
              <Plus size={16} />
              新建模板
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 text-dark-text-primary">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold text-dark-text-primary">报告模板管理</h2>
        <Button onClick={handleOpenCreate}>
          <Plus size={16} />
          新建模板
        </Button>
      </div>

      {/* Dialog */}
      {dialog.open && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialog(emptyDialog())
          }}
        >
          <div className="flex max-h-[90vh] w-[640px] flex-col rounded-lg border border-dark-border bg-dark-elevated shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-border px-6 py-4">
              <h3 className="text-lg font-semibold text-dark-text-primary">
                {dialog.editing ? '编辑报告模板' : '新建报告模板'}
              </h3>
              <button
                onClick={() => setDialog(emptyDialog())}
                className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <Label>模板名称</Label>
                  <Input
                    placeholder="模板名称"
                    value={dialog.name}
                    onChange={(e) => setDialog((d) => ({ ...d, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>模板描述</Label>
                  <Textarea
                    placeholder="模板描述"
                    value={dialog.description}
                    onChange={(e) => setDialog((d) => ({ ...d, description: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>整体风格指南</Label>
                  <Textarea
                    placeholder="输入报告整体风格要求，例如：语气专业客观，多用数据说话。每个板块用标题+简要分析+关键数字摘要的结构。"
                    value={dialog.styleGuide}
                    onChange={(e) => setDialog((d) => ({ ...d, styleGuide: e.target.value }))}
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={dialog.enabled}
                    onCheckedChange={(v) => setDialog((d) => ({ ...d, enabled: v }))}
                  />
                  <span className="text-sm text-dark-text-secondary">
                    {dialog.enabled ? '启用' : '停用'}
                  </span>
                </div>

                {/* AI 生成板块 */}
                <div className="rounded-lg border border-dark-border bg-dark-card-l1 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-dark-accent-primary" />
                    <Label className="text-dark-accent-primary">AI 生成板块</Label>
                  </div>
                  <Textarea
                    placeholder="描述你的报告需求，例如：帮我生成一个包含核心指标概览、异常检测和归因分析的月度运营报告模板"
                    value={dialog.aiRequest}
                    onChange={(e) => setDialog((d) => ({ ...d, aiRequest: e.target.value }))}
                    className="min-h-[60px]"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-dark-text-secondary">
                      AI 将根据需求自动生成板块结构和提示词
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={dialog.aiGenerating || !dialog.aiRequest.trim()}
                      onClick={() => {
                        setDialog((d) => ({ ...d, aiGenerating: true }))
                        toast.info('AI 正在生成板块结构...')
                        setTimeout(() => {
                          const generatedSections = generateMockSections(dialog.aiRequest)
                          setDialog((d) => ({
                            ...d,
                            sections: generatedSections,
                            aiGenerating: false,
                            aiRequest: '',
                          }))
                          toast.success('AI 生成完成，已填充板块列表')
                        }, 1500)
                      }}
                    >
                      {dialog.aiGenerating ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      {dialog.aiGenerating ? '生成中...' : '开始生成'}
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>板块列表</Label>
                    <Button variant="outline" size="sm" onClick={handleAddSection}>
                      <Plus size={14} />
                      添加板块
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {dialog.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="rounded-lg border border-dark-border bg-dark-card-l1 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Input
                            placeholder="板块标题"
                            value={section.title}
                            onChange={(e) => handleUpdateSection(idx, { title: e.target.value })}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveSection(idx, -1)}
                              disabled={idx === 0}
                              className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 disabled:opacity-30"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              onClick={() => handleMoveSection(idx, 1)}
                              disabled={idx === dialog.sections.length - 1}
                              className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 disabled:opacity-30"
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              aria-label="删除板块"
                              onClick={() => handleRemoveSection(idx)}
                              className="rounded p-1 text-dark-text-secondary hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <Textarea
                          placeholder="输入提示词或点击下方预选项填充"
                          value={section.prompt}
                          onChange={(e) => handleUpdateSection(idx, { prompt: e.target.value })}
                          className="min-h-[80px]"
                        />

                        <div className="mt-2 flex flex-wrap gap-2">
                          {PROMPT_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              onClick={() => handleApplyPreset(idx, preset)}
                              className="rounded-md border border-dark-border-hover px-2 py-1 text-xs text-dark-text-secondary hover:border-dark-accent-primary hover:text-dark-accent-primary"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-dark-border px-6 py-4">
              <Button variant="outline" onClick={() => setDialog(emptyDialog())}>
                取消
              </Button>
              <Button onClick={handleSave}>保存</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="flex items-center justify-between rounded-lg border border-dark-border bg-dark-card-l1 p-4"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium text-dark-text-primary">{tmpl.name}</span>
              <span className="text-sm text-dark-text-secondary">{tmpl.description}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-text-secondary">
              <span>{tmpl.sections.length} 个板块</span>
              <span>已使用 {tmpl.usageCount} 次</span>
              <span>{tmpl.enabled ? '启用' : '停用'}</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={tmpl.enabled}
                  onCheckedChange={() => handleToggleEnabled(tmpl)}
                />
                <button
                  onClick={() => handleOpenEdit(tmpl)}
                  className="rounded p-1 text-dark-text-secondary hover:bg-dark-card-l2 hover:text-dark-text-primary"
                  title="编辑"
                >
                  <FileText size={14} />
                </button>
                <button
                  onClick={() => handleDelete(tmpl)}
                  className="rounded p-1 text-dark-text-secondary hover:bg-red-500/10 hover:text-red-400"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
