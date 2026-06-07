import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export interface TreeNodeInlineEditProps {
  initialName: string
  existingNames: string[]
  onSave: (name: string) => void
  onCancel: () => void
}

export default function TreeNodeInlineEdit({ initialName, existingNames, onSave, onCancel }: TreeNodeInlineEditProps) {
  const [value, setValue] = useState(initialName)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      toast('节点名称不能为空', { duration: 2000 })
      onCancel()
      return
    }
    if (existingNames.includes(trimmed) && trimmed !== initialName) {
      setIsDuplicate(true)
      inputRef.current?.focus()
      return
    }
    onSave(trimmed)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSubmit()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
    }
  }

  const handleBlur = () => {
    handleSubmit()
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    if (isDuplicate) {
      setIsDuplicate(false)
    }
  }

  return (
    <input
      ref={inputRef}
      data-testid="tree-node-inline-input"
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={[
        'h-7 w-full rounded border bg-dark-card-l2 px-2 text-sm text-dark-text-primary outline-none',
        'focus:border-dark-accent-primary focus:ring-1 focus:ring-dark-accent-primary',
        isDuplicate ? 'border-red-500' : 'border-dark-border',
      ].join(' ')}
    />
  )
}
