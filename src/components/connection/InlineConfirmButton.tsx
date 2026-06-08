import { useState, useEffect, useRef, useCallback } from 'react'

interface InlineConfirmButtonProps {
  onConfirm: () => void
  confirmText?: string
  cancelDuration?: number
  onConfirmingChange?: (isConfirming: boolean) => void
}

export default function InlineConfirmButton({
  onConfirm,
  confirmText = '确认删除？',
  cancelDuration = 100,
  onConfirmingChange,
}: InlineConfirmButtonProps) {
  const [isConfirming, setIsConfirmingState] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const setIsConfirming = useCallback((value: boolean) => {
    setIsConfirmingState(value)
    onConfirmingChange?.(value)
  }, [onConfirmingChange])

  const clearCancelTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const cancelConfirmation = useCallback(() => {
    clearCancelTimer()
    timerRef.current = setTimeout(() => {
      setIsConfirming(false)
    }, cancelDuration)
  }, [cancelDuration, clearCancelTimer, setIsConfirming])

  useEffect(() => {
    if (!isConfirming) return

    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        cancelConfirmation()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelConfirmation()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      clearCancelTimer()
    }
  }, [isConfirming, cancelConfirmation, clearCancelTimer])

  const handleClick = () => {
    if (isConfirming) {
      clearCancelTimer()
      setIsConfirming(false)
      onConfirm()
    } else {
      clearCancelTimer()
      setIsConfirming(true)
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      data-testid="inline-confirm-button"
      data-confirming={isConfirming || undefined}
      onClick={handleClick}
      className={[
        'flex h-5 items-center justify-center rounded-full text-xs font-semibold text-white',
        'transition-all duration-150 ease-out overflow-hidden whitespace-nowrap',
        isConfirming ? 'w-20 bg-red-500 px-2' : 'w-5 bg-error-500',
      ].join(' ')}
      aria-label={isConfirming ? confirmText : '删除挂靠'}
    >
      {isConfirming ? confirmText : '×'}
    </button>
  )
}
