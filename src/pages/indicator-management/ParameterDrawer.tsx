import { useMemo, useRef } from 'react'
import { X, Save } from 'lucide-react'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import ParameterFields, { type ParameterFieldsRef } from '@/components/rule/ParameterFields'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { RuleParameter } from '@/models/indicatorAttachmentModel'
import { getEffectiveParameter } from '@/utils/ruleParameterInheritance'

export interface ParameterDrawerProps {
  ruleId: string
  indicatorId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CONTENT_FIELDS: Record<string, string[]> = {
  threshold: ['upperLimit', 'lowerLimit', 'unit', 'level'],
  fluctuation: ['algorithm', 'window'],
  topn: ['n', 'dimension'],
}

const INTERACTION_FIELDS = ['isInherited', 'overriddenFields']

function countConfigured(
  fields: string[],
  param?: RuleParameter,
): { configured: number; total: number } {
  if (!param) return { configured: 0, total: fields.length }
  let configured = 0
  for (const field of fields) {
    const value = param[field as keyof RuleParameter]
    if (value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      configured++
    }
  }
  return { configured, total: fields.length }
}

function SectionBadge({ configured, total }: { configured: number; total: number }) {
  if (total === 0) return null
  return (
    <span
      data-testid="section-badge"
      className="ml-auto mr-2 inline-flex items-center rounded-full bg-dark-card-l2 px-2 py-0.5 text-[10px] font-medium text-dark-text-secondary"
    >
      已配置 {configured}/{total} 项
    </span>
  )
}

export default function ParameterDrawer({
  ruleId,
  indicatorId,
  open,
  onOpenChange,
}: ParameterDrawerProps) {
  const rules = useAttachmentStore((state) => state.rules)
  const ruleParameters = useAttachmentStore((state) => state.ruleParameters)
  const updateRuleParameter = useAttachmentStore((state) => state.updateRuleParameter)

  const fieldsRef = useRef<ParameterFieldsRef>(null)

  const rule = useMemo(() => rules.find((r) => r.id === ruleId), [rules, ruleId])

  const param = useMemo(() => {
    return ruleParameters.find(
      (p) => p.ruleId === ruleId && p.indicatorId === (indicatorId ?? ''),
    )
  }, [ruleParameters, ruleId, indicatorId])

  const inheritedParam = useMemo(() => {
    return getEffectiveParameter(ruleId, rules, ruleParameters)
  }, [ruleId, rules, ruleParameters])

  const contentFields = rule ? (CONTENT_FIELDS[rule.type] ?? []) : []
  const contentCount = countConfigured(contentFields, param)
  const interactionCount = countConfigured(INTERACTION_FIELDS, param)

  const sectionCounts = {
    content: contentCount,
    interaction: interactionCount,
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      data-testid="parameter-drawer"
    >
      <DrawerContent
        data-testid="parameter-drawer-content"
        className="w-[480px] max-w-[480px] border-l border-dark-border-default bg-dark-card-l1 shadow-[-4px_0_24px_rgba(0,0,0,0.4)]"
      >
        <DrawerHeader className="relative border-b border-dark-border-default pb-3 pt-4" data-testid="drawer-header">
          <button
            type="button"
            data-testid="drawer-close-btn"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-md p-1 text-dark-text-tertiary transition-colors hover:bg-dark-card-l2 hover:text-dark-text-secondary"
          >
            <X className="size-4" />
          </button>
          <DrawerTitle className="text-base font-semibold text-dark-text-primary">
            {rule?.name ?? '参数配置'}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-dark-text-secondary">
            {indicatorId ? `指标级参数配置` : '规则级参数配置'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <Accordion
            type="multiple"
            defaultValue={['content']}
            className="w-full"
          >
            <AccordionItem value="content" data-testid="section-content">
              <AccordionTrigger data-testid="section-content-trigger">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-dark-text-secondary">
                  Content
                </span>
                <SectionBadge {...sectionCounts.content} />
              </AccordionTrigger>
              <AccordionContent data-testid="section-content-panel">
                {rule && (
                  <ParameterFields
                    ref={fieldsRef}
                    ruleType={rule.type}
                    defaultValues={param}
                    inheritedValues={inheritedParam}
                    onSubmit={(data) => {
                      const { affectedCount } = updateRuleParameter(
                        ruleId,
                        indicatorId ?? '',
                        data,
                      )
                      if (affectedCount > 5) {
                        toast.success(`已更新 ${affectedCount} 个子规则的参数`)
                      }
                      onOpenChange(false)
                    }}
                  />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="interaction" data-testid="section-interaction">
              <AccordionTrigger data-testid="section-interaction-trigger">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-dark-text-secondary">
                  Interaction
                </span>
                <SectionBadge {...sectionCounts.interaction} />
              </AccordionTrigger>
              <AccordionContent data-testid="section-interaction-panel">
                <div className="space-y-3 py-1">
                  <p className="text-xs text-dark-text-tertiary">行为配置区域</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="appearance" data-testid="section-appearance">
              <AccordionTrigger data-testid="section-appearance-trigger">
                <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-dark-text-secondary">
                  Appearance
                </span>
                {/* Appearance section — reserved for future display settings */}
              </AccordionTrigger>
              <AccordionContent data-testid="section-appearance-panel">
                <div className="space-y-3 py-1">
                  <p className="text-xs text-dark-text-tertiary">显示设置区域</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer save button */}
        <div className="border-t border-dark-border-default p-4">
          <Button
            data-testid="drawer-save-btn"
            className="w-full"
            onClick={() => {
              const ok = fieldsRef.current?.submit()
              if (!ok) {
                // Scroll to first invalid field
                setTimeout(() => {
                  const firstInvalid = document.querySelector(
                    '[data-testid="parameter-drawer-content"] [aria-invalid="true"]',
                  )
                  firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 50)
              }
            }}
          >
            <Save className="size-4" />
            保存参数
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
