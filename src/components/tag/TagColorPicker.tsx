import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface TagColorPickerProps {
  color?: string
  onChange: (color: string) => void
  'data-testid'?: string
}

const PRESET_COLORS = [
  { name: 'Magenta', value: '#EB2F96' },
  { name: 'Red', value: '#F5222D' },
  { name: 'Volcano', value: '#FA541C' },
  { name: 'Gold', value: '#FAAD14' },
  { name: 'Green', value: '#52C41A' },
  { name: 'Cyan', value: '#13C2C2' },
  { name: 'Blue', value: '#1890FF' },
  { name: 'Purple', value: '#722ED1' },
]

const HEX_REGEX = /^#([0-9A-Fa-f]{6})$/

function isValidHex(value: string): boolean {
  return HEX_REGEX.test(value)
}

export default function TagColorPicker({
  color,
  onChange,
  'data-testid': testId = 'tag-color-trigger',
}: TagColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [hexInput, setHexInput] = useState(color ?? '')
  const [error, setError] = useState<string | null>(null)

  const handlePresetClick = (value: string) => {
    onChange(value)
    setHexInput(value)
    setError(null)
    setOpen(false)
  }

  const handleApplyHex = () => {
    if (!isValidHex(hexInput)) {
      setError('无效的 HEX 色值，请输入 6 位十六进制（例如 #1890FF）')
      return
    }
    onChange(hexInput.toUpperCase())
    setError(null)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={testId}
          className={cn(
            'inline-flex size-4 shrink-0 cursor-pointer rounded-full border border-white/20 transition-transform duration-150 hover:scale-110',
            !color && 'bg-dark-border',
          )}
          style={{ backgroundColor: color }}
          aria-label="选择标签颜色"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverTrigger>
      <PopoverContent
        data-testid="tag-color-popover"
        className="w-56 space-y-3 border-dark-border bg-dark-card-l2 p-3"
        align="end"
        sideOffset={4}
      >
        <div
          data-testid="tag-color-preset-grid"
          className="grid grid-cols-4 gap-2"
        >
          {PRESET_COLORS.map((preset) => {
            const isSelected = color?.toUpperCase() === preset.value.toUpperCase()
            return (
              <button
                key={preset.value}
                type="button"
                data-testid={`tag-color-preset-${preset.value}`}
                title={preset.name}
                onClick={() => handlePresetClick(preset.value)}
                className={cn(
                  'size-6 rounded-full transition-transform duration-150 ease-out hover:scale-[1.15]',
                  isSelected && 'ring-2 ring-white ring-offset-1 ring-offset-dark-card-l2',
                )}
                style={{ backgroundColor: preset.value }}
                aria-label={preset.name}
              />
            )
          })}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-text-secondary">#</span>
            <input
              type="text"
              data-testid="tag-color-hex-input"
              value={hexInput.replace(/^#/, '')}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6)
                setHexInput(raw ? `#${raw}` : '')
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplyHex()
              }}
              placeholder="1890FF"
              className="h-7 flex-1 rounded-md border border-dark-border bg-dark-card-l1 px-2 text-xs text-dark-text-primary placeholder:text-dark-text-tertiary focus:border-[#4DA6FF] focus:outline-none"
            />
            <button
              type="button"
              data-testid="tag-color-hex-apply"
              onClick={handleApplyHex}
              className="h-7 rounded-md bg-[#1890FF] px-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
            >
              确定
            </button>
          </div>
          {error && (
            <p
              data-testid="tag-color-hex-error"
              className="text-xs text-red-400"
            >
              {error}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
