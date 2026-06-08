import { useEffect, useRef } from 'react'

export interface UseFocusTrapOptions {
  enabled: boolean
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]
  return elements.filter((el) => {
    const tabindex = el.getAttribute('tabindex')
    if (tabindex !== null && parseInt(tabindex, 10) < 0) return false
    return true
  })
}

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions,
): void {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!options.enabled) {
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus()
      }
      return
    }

    const container = containerRef.current
    if (!container) return

    // Remember previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement | null

    // Move focus to first focusable element inside container
    const focusableElements = getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements(container)
      if (focusableElements.length === 0) return

      event.preventDefault()

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

      let nextIndex: number
      if (event.shiftKey) {
        nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
      } else {
        nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
      }

      focusableElements[nextIndex].focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [options.enabled, containerRef])
}
