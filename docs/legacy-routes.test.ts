// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docPath = resolve(__dirname, 'legacy-routes.md')

describe('legacy-routes.md documentation', () => {
  it('exists at docs/legacy-routes.md', () => {
    expect(existsSync(docPath)).toBe(true)
  })

  it('contains main title and overview sections', () => {
    const content = readFileSync(docPath, 'utf-8')
    expect(content).toContain('# 旧模块路由清单与归档')
    expect(content).toContain('## App.tsx 注册路由')
    expect(content).toContain('## Sidebar 导航菜单')
    expect(content).toContain('## 处理策略说明')
  })

  it('documents all registered routes from App.tsx', () => {
    const content = readFileSync(docPath, 'utf-8')
    const routes = [
      '/',
      '/indicator/create',
      '/indicator/edit/:id',
      '/indicator-management',
      '/lineage',
      '/tag-config',
      '/rule-config',
      '/inspection-todo',
      '/noc/object-type',
      '/noc/link-relation',
      '/noc/property',
      '/noc/tag',
      '/noc/rule',
      '/noc/audit',
      '/noc/inspection',
      '/knowledge-management',
      '/knowledge-upload',
      '/platform/object-type',
      '/platform/link-type',
      '/platform/property',
      '/platform/graph',
    ]
    for (const route of routes) {
      expect(content).toContain(route)
    }
  })

  it('documents all Sidebar menu groups', () => {
    const content = readFileSync(docPath, 'utf-8')
    expect(content).toContain('业务部门')
    expect(content).toContain('NOC 管理')
    expect(content).toContain('平台维护')
  })

  it('documents all Sidebar menu items', () => {
    const content = readFileSync(docPath, 'utf-8')
    const items = [
      '首页',
      '指标管理',
      '血缘画布',
      '配置标签',
      '配置规则',
      '巡检待办',
      '知识上传',
      '对象类型',
      '链接关系',
      '属性管理',
      '标签管理',
      '规则管理',
      '审核待办',
      '巡检管理',
      '知识管理',
      '链接类型',
      '图谱管理',
    ]
    for (const item of items) {
      expect(content).toContain(item)
    }
  })

  it('includes disposal strategy markers for every route', () => {
    const content = readFileSync(docPath, 'utf-8')
    expect(content).toContain('保留')
    expect(content).toContain('注释')
    expect(content).toContain('物理删除')
  })

  it('describes future reuse scenarios using domain glossary terms', () => {
    const content = readFileSync(docPath, 'utf-8')
    expect(content).toContain('报告管理')
    expect(content).toContain('知识库管理')
    expect(content).toContain('指标挂靠')
  })

  it('includes key source file paths', () => {
    const content = readFileSync(docPath, 'utf-8')
    expect(content).toContain('src/App.tsx')
    expect(content).toContain('src/components/Sidebar.tsx')
    expect(content).toContain('src/pages/')
  })

  it('marks /noc/audit and /indicator/edit/:id as commented out (注释)', () => {
    const content = readFileSync(docPath, 'utf-8')
    // Verify the rows for these legacy routes use "注释" as the disposal strategy
    const nocAuditRow = content
      .split('\n')
      .find((line) => line.includes('| `/noc/audit`'))
    const indicatorEditRow = content
      .split('\n')
      .find((line) => line.includes('| `/indicator/edit/:id`'))

    expect(nocAuditRow).toBeDefined()
    expect(indicatorEditRow).toBeDefined()
    expect(nocAuditRow).toContain('注释')
    expect(indicatorEditRow).toContain('注释')
  })

  it('reflects hidden status for /noc/audit and /indicator/edit/:id (not active)', () => {
    const content = readFileSync(docPath, 'utf-8')
    const nocAuditRow = content
      .split('\n')
      .find((line) => line.includes('| `/noc/audit`'))
    const indicatorEditRow = content
      .split('\n')
      .find((line) => line.includes('| `/indicator/edit/:id`'))

    expect(nocAuditRow).toBeDefined()
    expect(indicatorEditRow).toBeDefined()
    // Current state should indicate the route is hidden/commented, not active
    expect(nocAuditRow).toMatch(/已注释|已隐藏/)
    expect(indicatorEditRow).toMatch(/已注释|已隐藏/)
    expect(nocAuditRow).not.toMatch(/\|\s*在用\s*\|\s*注释/)
    expect(indicatorEditRow).not.toMatch(/\|\s*在用\s*\|\s*注释/)
  })
})
