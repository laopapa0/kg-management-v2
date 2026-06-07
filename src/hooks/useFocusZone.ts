import { useState, useEffect } from 'react'

export type FocusZone = 'tree' | 'tag' | 'rule' | 'indicator' | null

const VALID_ZONES = new Set(['tree', 'tag', 'rule', 'indicator'])

function getFocusZone(element: Element | null): FocusZone {
  let el: Element | null = element
  while (el) {
    const zone = el.getAttribute('data-focus-zone')
    if (zone && VALID_ZONES.has(zone)) {
      return zone as FocusZone
    }
    el = el.parentElement
  }
  return null
}

export function useFocusZone(): FocusZone {
  const [zone, setZone] = useState<FocusZone>(() => getFocusZone(document.activeElement))

  useEffect(() => {
    const handleFocusIn = () => {
      setZone(getFocusZone(document.activeElement))
    }

    document.addEventListener('focusin', handleFocusIn)
    // Set initial zone in case activeElement already exists
    setZone(getFocusZone(document.activeElement))

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
    }
  }, [])

  return zone
}
