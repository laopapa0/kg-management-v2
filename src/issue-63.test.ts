// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(resolve('src/App.tsx'), 'utf-8')

describe('Issue #63 — NOC 审核页路由注释 + 旧表单页面隐藏', () => {
  it('keeps IndicatorEditPage.tsx file on disk (not deleted)', () => {
    expect(existsSync(resolve('src/pages/indicator-edit/IndicatorEditPage.tsx'))).toBe(true)
  })

  it('keeps NocAuditPage.tsx file on disk (not deleted)', () => {
    expect(existsSync(resolve('src/pages/noc/NocAuditPage.tsx'))).toBe(true)
  })

  it('annotates /indicator/edit/:id route with [LEGACY] in App.tsx', () => {
    expect(appSource).toContain('{/* [LEGACY] /indicator/edit/:id */}')
    expect(appSource).toMatch(
      /\{\/\*\s*\[LEGACY\]\s*\/indicator\/edit\/:id\s*\*\/\}\s*\n?\s*\{\/\*\s*<Route path="\/indicator\/edit\/:id"/
    )
  })

  it('annotates /noc/audit route with [LEGACY] in App.tsx', () => {
    expect(appSource).toContain('{/* [LEGACY] /noc/audit */}')
    expect(appSource).toMatch(
      /\{\/\*\s*\[LEGACY\]\s*\/noc\/audit\s*\*\/\}\s*\n?\s*\{\/\*\s*<Route path="\/noc\/audit"/
    )
  })
})
