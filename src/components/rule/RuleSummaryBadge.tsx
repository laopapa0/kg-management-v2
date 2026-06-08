import { useState, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'

export interface RuleSummaryBadgeProps {
  rule: Rule
  parameters?: RuleParameter[]
}

const LEVEL_COLORS: Record<
  'P1' | 'P2' | 'P3' | 'P4',
  { bg: string; text: string; border: string }
> = {
  P1: { bg: 'bg-red-900/30', text: 'text-red-300', border: 'border-red-800/40' },
  P2: { bg: 'bg-orange-900/30', text: 'text-orange-300', border: 'border-orange-800/40' },
  P3: { bg: 'bg-yellow-900/30', text: 'text-yellow-300', border: 'border-yellow-800/40' },
  P4: { bg: 'bg-blue-900/30', text: 'text-blue-300', border: 'border-blue-800/40' },
}

function formatThresholdSummary(param: RuleParameter): string | null {
  const level = param.level ?? ''
  const unit = param.unit ?? ''
  if (param.upperLimit !== undefined && param.lowerLimit !== undefined) {
    return `阈值: ${param.lowerLimit}~${param.upperLimit}${unit} · ${level}`
  }
  if (param.upperLimit !== undefined) {
    return `阈值: ≤${param.upperLimit}${unit} · ${level}`
  }
  if (param.lowerLimit !== undefined) {
    return `阈值: ≥${param.lowerLimit}${unit} · ${level}`
  }
  return null
}

function formatFluctuationSummary(param: RuleParameter): string | null {
  if (param.algorithm && param.window) {
    return `波动: ${param.algorithm} · ${param.window}`
  }
  return null
}

function formatTopnSummary(param: RuleParameter): string | null {
  if (param.n !== undefined && param.dimension) {
    return `TOP${param.n} · 按${param.dimension}`
  }
  return null
}

export function getSummaryText(rule: Rule, params: RuleParameter[]): string | null {
  const param = params[0]
  if (!param) return null
  switch (rule.type) {
    case 'threshold':
      return formatThresholdSummary(param)
    case 'fluctuation':
      return formatFluctuationSummary(param)
    case 'topn':
      return formatTopnSummary(param)
    default:
      return null
  }
}

function formatTooltipLine(param: RuleParameter): string {
  const entries: string[] = []
  if (param.upperLimit !== undefined) entries.push(`上限: ${param.upperLimit}`)
  if (param.lowerLimit !== undefined) entries.push(`下限: ${param.lowerLimit}`)
  if (param.unit) entries.push(`单位: ${param.unit}`)
  if (param.level) entries.push(`级别: ${param.level}`)
  if (param.algorithm) entries.push(`算法: ${param.algorithm}`)
  if (param.window) entries.push(`窗口: ${param.window}`)
  if (param.n !== undefined) entries.push(`N值: ${param.n}`)
  if (param.dimension) entries.push(`维度: ${param.dimension}`)
  if (param.isInherited) entries.push('来源: 继承')
  else entries.push('来源: 显式配置')
  if (param.overriddenFields && param.overriddenFields.length > 0) {
    entries.push(`已覆盖: ${param.overriddenFields.join(', ')}`)
  }
  return entries.join(' · ')
}

function formatTooltipContent(rule: Rule, params: RuleParameter[]): string {
  const lines: string[] = [`类型: ${rule.type}`]
  for (const param of params) {
    lines.push(formatTooltipLine(param))
  }
  return lines.join('\n')
}

export default function RuleSummaryBadge({ rule, parameters = [] }: RuleSummaryBadgeProps) {
  const summary = getSummaryText(rule, parameters)
  const level = parameters[0]?.level
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setIsUpdating(true)
    const timer = setTimeout(() => setIsUpdating(false), 200)
    return () => clearTimeout(timer)
  }, [parameters])

  if (!summary) {
    return (
      <span
        data-testid={`rule-summary-${rule.id}`}
        className="text-xs italic text-dark-text-tertiary"
      >
        待配置
      </span>
    )
  }

  const colors = level && LEVEL_COLORS[level] ? LEVEL_COLORS[level] : undefined

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-testid={`rule-summary-${rule.id}`}
            className={cn(
              'inline-block cursor-help rounded-md px-2.5 py-[3px] text-[11px] font-medium leading-none',
              'border transition-opacity duration-200',
              isUpdating ? 'opacity-50' : 'opacity-100',
              colors
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-dark-card-l2 text-dark-text-secondary border-dark-border',
            )}
          >
            {summary}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="max-w-xs whitespace-pre-line">
          {formatTooltipContent(rule, parameters)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
