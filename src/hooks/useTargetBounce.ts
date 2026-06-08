import { useEffect } from 'react'

export function useTargetBounce() {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { targetId: string }
      const selectors = [
        `[data-node-id="${detail.targetId}"]`,
        `[data-tag-id="${detail.targetId}"]`,
        `[data-rule-id="${detail.targetId}"]`,
      ]
      const targetEl = selectors
        .map((s) => document.querySelector(s))
        .find(Boolean)
      if (targetEl) {
        targetEl.classList.add('animate-target-bounce')
        setTimeout(() => {
          targetEl.classList.remove('animate-target-bounce')
        }, 200)
      }
    }

    window.addEventListener('connection-confirmed', handler)
    return () => window.removeEventListener('connection-confirmed', handler)
  }, [])
}
