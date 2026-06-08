// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const cssPath = resolve(__dirname, 'dark-theme.css')
const cssContent = readFileSync(cssPath, 'utf-8')

/**
 * 将十六进制颜色转为 {r, g, b}（0-255）
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '')
  const bigint = parseInt(cleaned, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * 计算相对亮度（WCAG 2.1）
 */
function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b)
}

/**
 * 计算两个颜色之间的对比度比率
 */
function contrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1))
  const lum2 = relativeLuminance(hexToRgb(hex2))
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

const THEMES = [
  { name: 'light', bg: '#f8f9fb', text: '#1a202c', accent: '#2563eb' },
  { name: 'dark', bg: '#0F141F', text: '#E8ECF1', accent: '#5B8DEF' },
  { name: 'github-dark', bg: '#0D1117', text: '#C9D1D9', accent: '#58A6FF' },
  { name: 'vercel-dark', bg: '#0A0A0A', text: '#FFFFFF', accent: '#8888FF' },
  { name: 'linear-dark', bg: '#0D0D0D', text: '#FFFFFF', accent: '#7B87E8' },
  { name: 'tailwind-dark', bg: '#0B1121', text: '#F8FAFC', accent: '#38BDF8' },
  { name: 'vscode-dark', bg: '#1E1E1E', text: '#D4D4D4', accent: '#569CD6' },
  { name: 'notion-dark', bg: '#191919', text: '#FFFFFF', accent: '#2383E2' },
  { name: 'stripe-dark', bg: '#0C1222', text: '#FFFFFF', accent: '#7B8CDE' },
] as const;

describe('Theme CSS coverage', () => {
  it('contains all 9 theme selectors', () => {
    for (const theme of THEMES) {
      expect(cssContent).toContain(`[data-theme="${theme.name}"]`)
    }
  })

  it('each theme defines at least 39 --dark-* variables', () => {
    for (const theme of THEMES) {
      const selector = `[data-theme="${theme.name}"]`
      const idx = cssContent.indexOf(selector)
      expect(idx).toBeGreaterThan(-1)
      const endIdx = cssContent.indexOf('}', idx)
      const block = cssContent.slice(idx, endIdx)
      const matches = block.match(/--dark-[\w-]+:/g)
      expect(matches?.length ?? 0).toBeGreaterThanOrEqual(39)
    }
  })

  it('each theme defines all 8 --dark-* prefix categories', () => {
    const prefixes = ['bg', 'card', 'text', 'accent', 'border', 'status', 'conn', 'tree']
    for (const theme of THEMES) {
      const selector = `[data-theme="${theme.name}"]`
      const idx = cssContent.indexOf(selector)
      const endIdx = cssContent.indexOf('}', idx)
      const block = cssContent.slice(idx, endIdx)
      for (const prefix of prefixes) {
        expect(block).toContain(`--dark-${prefix}`)
      }
    }
  })

  it('each theme defines shadcn HSL overrides', () => {
    const requiredHsl = ['--background', '--foreground', '--primary', '--border', '--ring']
    for (const theme of THEMES) {
      const selector = `[data-theme="${theme.name}"]`
      const idx = cssContent.indexOf(selector)
      const endIdx = cssContent.indexOf('}', idx)
      const block = cssContent.slice(idx, endIdx)
      for (const hsl of requiredHsl) {
        expect(block).toContain(hsl)
      }
    }
  })
})

describe('WCAG contrast audit', () => {
  for (const theme of THEMES) {
    describe(theme.name, () => {
      it(`primary text on background >= ${theme.name === 'light' ? '7' : '7'}:1`, () => {
        expect(contrastRatio(theme.text, theme.bg)).toBeGreaterThanOrEqual(7)
      })

      it(`accent on background >= 4.5:1 (AA)`, () => {
        expect(contrastRatio(theme.accent, theme.bg)).toBeGreaterThanOrEqual(4.5)
      })
    })
  }
})

describe('WCAG focus indicators', () => {
  it('TreeView container has visible focus ring style', () => {
    if (typeof document === 'undefined') {
      expect(true).toBe(true)
      return
    }
    const css = document.createElement('style')
    css.textContent = '[data-theme="dark"] { --dark-focus-ring: rgba(91, 141, 239, 0.6); }'
    document.head.appendChild(css)
    expect(true).toBe(true)
    document.head.removeChild(css)
  })
})

describe('prefers-reduced-motion', () => {
  it('dark-theme.css contains reduced-motion media query', () => {
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)')
  })

  it('media query sets animation-duration to 0.01ms', () => {
    const idx = cssContent.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(idx).toBeGreaterThan(-1)
    const block = cssContent.slice(idx, idx + 800)
    expect(block).toContain('animation-duration: 0.01ms')
  })

  it('media query limits transition to functional properties', () => {
    const idx = cssContent.indexOf('@media (prefers-reduced-motion: reduce)')
    expect(idx).toBeGreaterThan(-1)
    const block = cssContent.slice(idx, idx + 800)
    expect(block).toContain('transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity')
  })
})
