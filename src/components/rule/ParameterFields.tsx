import { forwardRef, useImperativeHandle, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RotateCcw, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RuleType } from '@/models/indicatorAttachmentModel'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'

/* ─── zod schemas ─── */

const thresholdSchema = z
  .object({
    upperLimit: z.coerce.number().optional(),
    lowerLimit: z.coerce.number().optional(),
    unit: z.string().optional(),
    level: z.enum(['P1', 'P2', 'P3', 'P4']).optional(),
  })
  .refine(
    (data) => {
      if (data.upperLimit != null && data.lowerLimit != null) {
        return data.upperLimit > data.lowerLimit
      }
      return true
    },
    { message: '上限值必须大于下限值', path: ['upperLimit'] },
  )

const fluctuationSchema = z.object({
  algorithm: z.string().min(1, '请选择算法'),
  window: z.string().min(1, '请输入时间窗口'),
})

const topnSchema = z.object({
  n: z.coerce.number().min(1, 'N 值必须大于 0'),
  dimension: z.string().min(1, '请选择维度'),
})

const schemas: Record<RuleType, z.ZodTypeAny> = {
  threshold: thresholdSchema,
  fluctuation: fluctuationSchema,
  topn: topnSchema,
}

/* ─── options ─── */

const UNIT_OPTIONS = ['%', 'ms', '次/秒']
const LEVEL_OPTIONS = ['P1', 'P2', 'P3', 'P4'] as const
const ALGORITHM_OPTIONS = ['同比', '环比', '3σ', '皮尔逊']
const DIMENSION_OPTIONS = ['QPS', 'RT', '错误率', '吞吐量']
const WINDOW_UNIT_OPTIONS = ['秒', '分', '时', '天']

/* ─── inheritance helpers ─── */

function safeCompare(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null && b == null) return true
  if (a == null || b == null) return false
  return String(a) === String(b)
}

function useFieldInheritance(
  form: ReturnType<typeof useForm>,
  fieldName: string,
  inheritedValues?: Record<string, unknown>,
) {
  const value = form.watch(fieldName)
  const inheritedValue = inheritedValues?.[fieldName]
  const hasInheritance = inheritedValues !== undefined && inheritedValue !== undefined
  const isInherited = hasInheritance && safeCompare(value, inheritedValue)
  const isOverridden = hasInheritance && !safeCompare(value, inheritedValue)
  return { value, inheritedValue, isInherited, isOverridden, hasInheritance }
}

function InheritanceBadges({
  fieldName,
  isInherited,
  isOverridden,
  inheritedValue,
  onRestore,
}: {
  fieldName: string
  isInherited: boolean
  isOverridden: boolean
  inheritedValue?: unknown
  onRestore?: () => void
}) {
  if (!isInherited && !isOverridden) return null
  const inheritedLabel = inheritedValue !== undefined ? String(inheritedValue) : '—'
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {isInherited && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                data-testid={`badge-inherited-${fieldName}`}
                className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-dark-status-info-active bg-dark-status-info-active/10 cursor-help"
              >
                继承
                <Info className="size-2.5 opacity-70" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <p>继承值: {inheritedLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {isOverridden && (
        <>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  data-testid={`badge-overridden-${fieldName}`}
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-dark-accent-gold bg-dark-accent-gold/10 cursor-help"
                >
                  已覆盖
                  <Info className="size-2.5 opacity-70" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <p>原继承值: {inheritedLabel}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onRestore && (
            <button
              type="button"
              data-testid={`restore-${fieldName}`}
              onClick={onRestore}
              className="rounded p-0.5 text-dark-text-tertiary transition-colors hover:bg-dark-card-l2 hover:text-dark-text-secondary"
              title="恢复默认"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ─── component ─── */

export interface ParameterFieldsRef {
  submit: () => boolean
}

export interface ParameterFieldsProps {
  ruleType: RuleType
  defaultValues?: Record<string, unknown>
  inheritedValues?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => void
}

const ParameterFields = forwardRef<ParameterFieldsRef, ParameterFieldsProps>(
  function ParameterFields({ ruleType, defaultValues, inheritedValues, onSubmit }, ref) {
    const schema = schemas[ruleType]

    const form = useForm({
      resolver: zodResolver(schema),
      mode: 'onBlur',
      defaultValues: defaultValues as never,
    })

    useImperativeHandle(ref, () => ({
      submit: () => {
        let hasError = false
        const handle = form.handleSubmit(
          (data) => {
            const overriddenFields = inheritedValues
              ? Object.keys(inheritedValues).filter((key) => {
                  const current = data[key]
                  const inherited = inheritedValues[key]
                  return !safeCompare(current, inherited)
                })
              : []
            onSubmit({
              ...data,
              isInherited:
                inheritedValues ? overriddenFields.length === 0 : false,
              overriddenFields:
                overriddenFields.length > 0 ? overriddenFields : undefined,
            })
          },
          () => {
            hasError = true
          },
        )
        handle()
        return !hasError
      },
    }))

    /* Cross-field validation: upperLimit > lowerLimit */
    const upperLimit = form.watch('upperLimit')
    const lowerLimit = form.watch('lowerLimit')
    useEffect(() => {
      if (
        upperLimit != null &&
        lowerLimit != null &&
        Number(upperLimit) <= Number(lowerLimit)
      ) {
        form.setError('upperLimit', {
          type: 'manual',
          message: '上限值必须大于下限值',
        })
      } else {
        form.clearErrors('upperLimit')
      }
    }, [upperLimit, lowerLimit, form])

    const restore = (fieldName: string, value: unknown) => {
      form.setValue(fieldName, value as never, { shouldValidate: true })
    }

    return (
      <Form {...form}>
        <form className="space-y-4">
          {ruleType === 'threshold' && (
            <>
              {/* Range: upperLimit ~ lowerLimit */}
              <div className="flex items-end gap-2">
                <FormField
                  control={form.control}
                  name="upperLimit"
                  render={({ field }) => {
                    const { isInherited, isOverridden, inheritedValue } =
                      useFieldInheritance(form, 'upperLimit', inheritedValues)
                    return (
                      <FormItem className="relative flex-1">
                        {isOverridden && (
                          <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-dark-accent-gold rounded-l" />
                        )}
                        <FormLabel className="text-xs text-dark-text-secondary">
                          上限
                        </FormLabel>
                        <FormControl>
                          <div className={isInherited ? 'opacity-70' : ''}>
                            <Input
                              data-testid="input-upperLimit"
                              type="number"
                              step="any"
                              className="h-8 text-sm"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <InheritanceBadges
                          fieldName="upperLimit"
                          isInherited={isInherited}
                          isOverridden={isOverridden}
                          inheritedValue={inheritedValue}
                          onRestore={
                            isOverridden && inheritedValue !== undefined
                              ? () => restore('upperLimit', inheritedValue)
                              : undefined
                          }
                        />
                        <FormMessage
                          data-testid="error-upperLimit"
                          className="text-xs animate-error-slide-in"
                        />
                      </FormItem>
                    )
                  }}
                />
                <span className="mb-2 text-sm text-dark-text-tertiary">~</span>
                <FormField
                  control={form.control}
                  name="lowerLimit"
                  render={({ field }) => {
                    const { isInherited, isOverridden, inheritedValue } =
                      useFieldInheritance(form, 'lowerLimit', inheritedValues)
                    return (
                      <FormItem className="relative flex-1">
                        {isOverridden && (
                          <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-dark-accent-gold rounded-l" />
                        )}
                        <FormLabel className="text-xs text-dark-text-secondary">
                          下限
                        </FormLabel>
                        <FormControl>
                          <div className={isInherited ? 'opacity-70' : ''}>
                            <Input
                              data-testid="input-lowerLimit"
                              type="number"
                              step="any"
                              className="h-8 text-sm"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value),
                                )
                              }
                            />
                          </div>
                        </FormControl>
                        <InheritanceBadges
                          fieldName="lowerLimit"
                          isInherited={isInherited}
                          isOverridden={isOverridden}
                          inheritedValue={inheritedValue}
                          onRestore={
                            isOverridden && inheritedValue !== undefined
                              ? () => restore('lowerLimit', inheritedValue)
                              : undefined
                          }
                        />
                        <FormMessage className="text-xs animate-error-slide-in" />
                      </FormItem>
                    )
                  }}
                />
              </div>

              {/* Unit: Segmented Button */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'unit', inheritedValues)
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        单位
                      </FormLabel>
                      <FormControl>
                        <div className={isInherited ? 'opacity-70' : ''}>
                          <ButtonGroup data-testid="unit-segmented">
                            {UNIT_OPTIONS.map((u) => (
                              <Button
                                key={u}
                                type="button"
                                variant={
                                  field.value === u ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => field.onChange(u)}
                              >
                                {u}
                              </Button>
                            ))}
                          </ButtonGroup>
                        </div>
                      </FormControl>
                      <InheritanceBadges
                        fieldName="unit"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('unit', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage className="text-xs animate-error-slide-in" />
                    </FormItem>
                  )
                }}
              />

              {/* Level: Pill radio */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'level', inheritedValues)
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        告警级别
                      </FormLabel>
                      <FormControl>
                        <div className={isInherited ? 'opacity-70' : ''}>
                          <div className="flex gap-1.5">
                            {LEVEL_OPTIONS.map((level) => (
                              <button
                                key={level}
                                type="button"
                                data-testid={`level-pill-${level}`}
                                data-selected={
                                  field.value === level || undefined
                                }
                                onClick={() => field.onChange(level)}
                                className={cn(
                                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                                  field.value === level
                                    ? 'bg-[#3B82F6] text-white'
                                    : 'bg-dark-card-l2 text-dark-text-secondary hover:bg-dark-card-l3',
                                )}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <InheritanceBadges
                        fieldName="level"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('level', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage className="text-xs animate-error-slide-in" />
                    </FormItem>
                  )
                }}
              />
            </>
          )}

          {ruleType === 'fluctuation' && (
            <>
              <FormField
                control={form.control}
                name="algorithm"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'algorithm', inheritedValues)
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        算法
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <div className={isInherited ? 'opacity-70' : ''}>
                            <SelectTrigger
                              data-testid="select-algorithm"
                              className="h-8 text-sm"
                            >
                              <SelectValue placeholder="选择算法" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {ALGORITHM_OPTIONS.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InheritanceBadges
                        fieldName="algorithm"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('algorithm', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage
                        data-testid="error-algorithm"
                        className="text-xs animate-error-slide-in"
                      />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="window"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'window', inheritedValues)
                  const current = String(field.value ?? '')
                  const match = current.match(/^(\d+)(.+)$/)
                  const numValue = match ? match[1] : ''
                  const unitValue = match ? match[2] : '分'
                  const handleNumChange = (val: string) => {
                    const formatted = val ? `${val}${unitValue}` : ''
                    field.onChange(formatted)
                  }
                  const handleUnitChange = (val: string) => {
                    const formatted = numValue ? `${numValue}${val}` : ''
                    field.onChange(formatted)
                  }
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        时间窗口
                      </FormLabel>
                      <FormControl>
                        <div className={cn('flex gap-2', isInherited ? 'opacity-70' : '')}>
                          <Input
                            data-testid="input-window-num"
                            type="number"
                            className="h-8 flex-1 text-sm"
                            placeholder="数值"
                            value={numValue}
                            onChange={(e) => handleNumChange(e.target.value)}
                          />
                          <Select value={unitValue} onValueChange={handleUnitChange}>
                            <SelectTrigger
                              data-testid="select-window-unit"
                              className="h-8 w-20 text-sm"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WINDOW_UNIT_OPTIONS.map((u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <InheritanceBadges
                        fieldName="window"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('window', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage
                        data-testid="error-window"
                        className="text-xs animate-error-slide-in"
                      />
                    </FormItem>
                  )
                }}
              />
            </>
          )}

          {ruleType === 'topn' && (
            <>
              <FormField
                control={form.control}
                name="n"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'n', inheritedValues)
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        TOP N
                      </FormLabel>
                      <FormControl>
                        <div className={isInherited ? 'opacity-70' : ''}>
                          <Input
                            data-testid="input-n"
                            type="number"
                            className="h-8 text-sm"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <InheritanceBadges
                        fieldName="n"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('n', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage data-testid="error-n" className="text-xs animate-error-slide-in" />
                    </FormItem>
                  )
                }}
              />

              <FormField
                control={form.control}
                name="dimension"
                render={({ field }) => {
                  const { isInherited, isOverridden, inheritedValue } =
                    useFieldInheritance(form, 'dimension', inheritedValues)
                  return (
                    <FormItem className="relative">
                      {isOverridden && (
                        <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-[#F5A623] rounded-l" />
                      )}
                      <FormLabel className="text-xs text-dark-text-secondary">
                        维度
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <div className={isInherited ? 'opacity-70' : ''}>
                            <SelectTrigger
                              data-testid="select-dimension"
                              className="h-8 text-sm"
                            >
                              <SelectValue placeholder="选择维度" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {DIMENSION_OPTIONS.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InheritanceBadges
                        fieldName="dimension"
                        isInherited={isInherited}
                        isOverridden={isOverridden}
                        inheritedValue={inheritedValue}
                        onRestore={
                          isOverridden && inheritedValue !== undefined
                            ? () => restore('dimension', inheritedValue)
                            : undefined
                        }
                      />
                      <FormMessage
                        data-testid="error-dimension"
                        className="text-xs animate-error-slide-in"
                      />
                    </FormItem>
                  )
                }}
              />
            </>
          )}
        </form>
      </Form>
    )
  },
)

export default ParameterFields
