import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface ColorPickerProps {
  value?: string
  onChange: (color: string) => void
  'data-testid'?: string
}

const PRESET_COLORS = [
  '#3B82F6', '#22C55E', '#EF4444', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#E11D48',
]

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/

function isValidHex(value: string): boolean {
  return HEX_REGEX.test(value)
}

export default function ColorPicker({
  value,
  onChange,
  'data-testid': testId = 'color-picker-trigger',
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState('')

  const handlePresetClick = (color: string) => {
    onChange(color)
    setHexInput('')
    setOpen(false)
  }

  const handleApplyHex = () => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`
    if (!isValidHex(hex)) return
    onChange(hex.toUpperCase())
    setHexInput('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className={cn(
            'inline-flex size-6 shrink-0 cursor-pointer rounded-md border border-dark-border transition-transform duration-150 hover:scale-110',
            !value && 'bg-dark-border',
          )}
          style={{ backgroundColor: value }}
          aria-label="选择颜色"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-64 space-y-3 border-dark-border bg-dark-card-l2 p-3"
        align="start"
        sideOffset={4}
      >
        <div className="grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((preset) => {
            const isSelected = value?.toUpperCase() === preset.toUpperCase()
            return (
              <button
                key={preset}
                type="button"
                data-testid={`color-picker-preset-${preset}`}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  'size-7 rounded-md transition-transform duration-150 ease-out hover:scale-[1.15]',
                  isSelected && 'ring-2 ring-white ring-offset-1 ring-offset-dark-card-l2',
                )}
                style={{ backgroundColor: preset }}
                aria-label={`颜色 ${preset}`}
              />
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-dark-text-secondary">#</span>
          <input
            type="text"
            data-testid="color-picker-hex-input"
            value={hexInput.replace(/^#/, '')}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
              setHexInput(raw ? `#${raw}` : '')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyHex()
            }}
            placeholder="FFFFFF"
            className="h-7 flex-1 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-xs text-dark-text-primary placeholder:text-dark-text-tertiary focus:border-dark-accent-primary-hover focus:outline-none"
          />
          <button
            type="button"
            data-testid="color-picker-hex-apply"
            onClick={handleApplyHex}
            className="h-7 rounded-md bg-dark-accent-primary px-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            确定
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
