import { forwardRef, useImperativeHandle, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

/* ─── component ─── */

export interface ParameterFieldsRef {
  submit: () => void
}

export interface ParameterFieldsProps {
  ruleType: RuleType
  defaultValues?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => void
}

const ParameterFields = forwardRef<ParameterFieldsRef, ParameterFieldsProps>(
  function ParameterFields({ ruleType, defaultValues, onSubmit }, ref) {
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
          (data) => onSubmit(data),
          () => { hasError = true },
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
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs text-dark-text-secondary">上限</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-upperLimit"
                          type="number"
                          step="any"
                          className="h-8 text-sm"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage data-testid="error-upperLimit" className="text-xs" />
                    </FormItem>
                  )}
                />
                <span className="mb-2 text-sm text-dark-text-tertiary">~</span>
                <FormField
                  control={form.control}
                  name="lowerLimit"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs text-dark-text-secondary">下限</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-lowerLimit"
                          type="number"
                          step="any"
                          className="h-8 text-sm"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit: Segmented Button */}
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">单位</FormLabel>
                    <FormControl>
                      <ButtonGroup data-testid="unit-segmented">
                        {UNIT_OPTIONS.map((u) => (
                          <Button
                            key={u}
                            type="button"
                            variant={field.value === u ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => field.onChange(u)}
                          >
                            {u}
                          </Button>
                        ))}
                      </ButtonGroup>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Level: Pill radio */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">告警级别</FormLabel>
                    <FormControl>
                      <div className="flex gap-1.5">
                        {LEVEL_OPTIONS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            data-testid={`level-pill-${level}`}
                            data-selected={field.value === level || undefined}
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
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </>
          )}

          {ruleType === 'fluctuation' && (
            <>
              <FormField
                control={form.control}
                name="algorithm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">算法</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-algorithm" className="h-8 text-sm">
                          <SelectValue placeholder="选择算法" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALGORITHM_OPTIONS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage data-testid="error-algorithm" className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="window"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">时间窗口</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-window"
                        className="h-8 text-sm"
                        placeholder="例如: 5min"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage data-testid="error-window" className="text-xs" />
                  </FormItem>
                )}
              />
            </>
          )}

          {ruleType === 'topn' && (
            <>
              <FormField
                control={form.control}
                name="n"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">TOP N</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-n"
                        type="number"
                        className="h-8 text-sm"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage data-testid="error-n" className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-dark-text-secondary">维度</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger data-testid="select-dimension" className="h-8 text-sm">
                          <SelectValue placeholder="选择维度" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIMENSION_OPTIONS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage data-testid="error-dimension" className="text-xs" />
                  </FormItem>
                )}
              />
            </>
          )}
        </form>
      </Form>
    )
  },
)

export default ParameterFields
