// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const appSource = readFileSync(resolve('src/App.tsx'), 'utf-8')

describe('App.tsx legacy route annotation', () => {
  it('retains 5 active routes: /, /indicator-management, /lineage, /reports, /knowledge-upload', () => {
    const activeRoutes = [
      { path: '/', element: 'DashboardPage' },
      { path: '/indicator-management', element: 'IndicatorManagementPage' },
      { path: '/lineage', element: 'LineageCanvasPage' },
      { path: '/reports', element: 'ReportManagementPage' },
      { path: '/knowledge-upload', element: 'KnowledgeUploadPage' },
    ]
    for (const { path, element } of activeRoutes) {
      expect(appSource).toContain(`<Route path="${path}" element={<${element} />}`)
    }
  })

  it('annotates legacy /indicator/create and /indicator/edit/:id with [LEGACY]', () => {
    expect(appSource).toContain('{/* [LEGACY] /indicator/create */}')
    expect(appSource).toContain('{/* [LEGACY] /indicator/edit/:id */}')
    expect(appSource).toMatch(/\{\/\*\s*\[LEGACY\]\s*\/indicator\/create\s*\*\/\}\s*\n?\s*\{\/\*\s*<Route path="\/indicator\/create"/)
    expect(appSource).toMatch(/\{\/\*\s*\[LEGACY\]\s*\/indicator\/edit\/:id\s*\*\/\}\s*\n?\s*\{\/\*\s*<Route path="\/indicator\/edit\/:id"/)
  })

  it('annotates legacy /tag-config and /rule-config with [LEGACY]', () => {
    expect(appSource).toContain('{/* [LEGACY] /tag-config */}')
    expect(appSource).toContain('{/* [LEGACY] /rule-config */}')
  })

  it('annotates legacy /inspection-todo with [LEGACY]', () => {
    expect(appSource).toContain('{/* [LEGACY] /inspection-todo */}')
  })

  it('annotates all /noc/* routes with [LEGACY]', () => {
    const nocRoutes = [
      '/noc/object-type',
      '/noc/link-relation',
      '/noc/property',
      '/noc/tag',
      '/noc/rule',
      '/noc/audit',
      '/noc/inspection',
    ]
    for (const path of nocRoutes) {
      expect(appSource).toContain(`{/* [LEGACY] ${path} */}`)
    }
  })

  it('annotates all /platform/* routes with [LEGACY]', () => {
    const platformRoutes = [
      '/platform/object-type',
      '/platform/link-type',
      '/platform/property',
      '/platform/graph',
    ]
    for (const path of platformRoutes) {
      expect(appSource).toContain(`{/* [LEGACY] ${path} */}`)
    }
  })

  it('annotates legacy /knowledge-management with [LEGACY]', () => {
    expect(appSource).toContain('{/* [LEGACY] /knowledge-management */}')
  })
})
