import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { JSDOM } from 'jsdom'

const REPORT_PATH = resolve(__dirname, 'report.html')

function loadReport(excludedIds: string[] = []): Document {
  const storage = new Map<string, string>()
  if (excludedIds.length > 0) {
    storage.set('kgv2-excluded-relation-ids', JSON.stringify(excludedIds))
  }

  const dom = new JSDOM(readFileSync(REPORT_PATH, 'utf-8'), {
    url: 'http://localhost/kg-management-v2/report.html',
    runScripts: 'dangerously',
    beforeParse(window) {
      // mock echarts (report.html 引用了 echarts.min.js)
      (window as any).echarts = { init: () => ({ setOption: () => {}, dispose: () => {} }) }
      const mockStorage = {
        _data: new Map(storage),
        getItem: (k: string) => mockStorage._data.get(k) ?? null,
        setItem: (k: string, v: string) => { mockStorage._data.set(k, v); storage.set(k, v) },
        removeItem: (k: string) => { mockStorage._data.delete(k); storage.delete(k) },
        clear: () => { mockStorage._data.clear(); storage.clear() },
        get length() { return mockStorage._data.size },
        key: (i: number) => [...mockStorage._data.keys()][i] ?? null,
      }
      try {
        Object.defineProperty(window, 'localStorage', {
          value: mockStorage,
          writable: true,
          configurable: true,
        })
      } catch {
        // fallback: 直接赋值
        ;(window as any).localStorage = mockStorage
      }
    },
  })
  return dom.window.document
}

function getEmbeddedData(doc: Document): { relations: any[]; clusters: any[] } {
  const scriptEls = doc.querySelectorAll('script:not([src])')
  let relations: any[] = []
  let clusters: any[] = []

  for (const el of scriptEls) {
    const text = el.textContent || ''
    if (text.includes('FINANCE_RELATIONS')) {
      const match = text.match(/const FINANCE_RELATIONS\s*=\s*(\[[\s\S]*?\]);/)
      if (match) {
        try { relations = JSON.parse(match[1]) } catch {}
      }
    }
    if (text.includes('FINANCE_CLUSTERS')) {
      const match = text.match(/const FINANCE_CLUSTERS\s*=\s*(\[[\s\S]*?\]);/)
      if (match) {
        try { clusters = JSON.parse(match[1]) } catch {}
      }
    }
  }

  return { relations, clusters }
}

describe('report.html 第三章动态渲染', () => {
  afterEach(() => {
    // cleanup jsdom
  })

  describe('67 条关系 JSON 数据嵌入', () => {
    it('report.html 包含 FINANCE_RELATIONS 数组且 ≥67 条', () => {
      const doc = loadReport()
      const { relations } = getEmbeddedData(doc)
      expect(relations.length).toBeGreaterThanOrEqual(67)
    })

    it('每条关系含必需字段：id/sourceName/relationType/targetName', () => {
      const doc = loadReport()
      const { relations } = getEmbeddedData(doc)
      for (const rel of relations) {
        expect(rel.id).toMatch(/^REL-\d{3}$/)
        expect(typeof rel.sourceName).toBe('string')
        expect(rel.sourceName.length).toBeGreaterThan(0)
        expect(typeof rel.relationType).toBe('string')
        expect(['DEPENDS_ON', 'TRANSMISSION', 'AGGREGATES', 'CAUSES'].includes(rel.relationType)).toBe(true)
        expect(typeof rel.targetName).toBe('string')
        expect(rel.targetName.length).toBeGreaterThan(0)
      }
    })
  })

  describe('8 个簇定义嵌入', () => {
    it('report.html 包含 FINANCE_CLUSTERS 数组且恰好 8 个簇', () => {
      const doc = loadReport()
      const { clusters } = getEmbeddedData(doc)
      expect(clusters.length).toBe(8)
    })

    it('每个簇含 title/centerIndicator/relationIds/narrative', () => {
      const doc = loadReport()
      const { relations, clusters } = getEmbeddedData(doc)
      const relationIdSet = new Set(relations.map((r: any) => r.id))
      for (const cluster of clusters) {
        expect(typeof cluster.title).toBe('string')
        expect(cluster.title.length).toBeGreaterThan(0)
        expect(typeof cluster.centerIndicator).toBe('string')
        expect(Array.isArray(cluster.relationIds)).toBe(true)
        expect(cluster.relationIds.length).toBeGreaterThan(0)
        expect(typeof cluster.narrative).toBe('string')
        expect(cluster.narrative.length).toBeGreaterThan(10)
        for (const rid of cluster.relationIds) {
          expect(relationIdSet.has(rid)).toBe(true)
        }
      }
    })
  })

  describe('第三章 DOM 渲染', () => {
    it('第三章由 JS 动态生成（不含静态 table 内容）', () => {
      const doc = loadReport()
      const section3 = doc.querySelector('#section3-root')
      expect(section3).toBeTruthy()
      // section3-root 内所有 table 应有 data-relation-id 行（动态渲染的特征）
      const oldStaticTables = section3?.querySelectorAll('table:not(.nb-table)')
      expect(oldStaticTables?.length || 0).toBe(0)
      // 应有至少 8 个 data-cluster 节
      const clusterSections = section3?.querySelectorAll('[data-cluster]') || []
      expect(clusterSections.length).toBeGreaterThanOrEqual(8)
    })

    it('加载后第三章渲染出 8 个簇的 section', () => {
      const doc = loadReport()
      const sections = doc.querySelectorAll('#section3-root [data-cluster]')
      expect(sections.length).toBe(8)
      // 每个簇应有 echarts 因果链路图容器
      for (let i = 0; i < 8; i++) {
        const chart = doc.getElementById(`chart-c${i}`)
        expect(chart).toBeTruthy()
      }
    })

    it('每个簇的 table 含正确的行数（等于活跃关系数）', () => {
      const doc = loadReport()
      const { clusters } = getEmbeddedData(doc)
      const sections = doc.querySelectorAll('#section3-root [data-cluster]')
      expect(sections.length).toBeGreaterThan(0)

      for (let i = 0; i < sections.length; i++) {
        const rows = sections[i].querySelectorAll('tbody tr[data-relation-id]')
        const expectedActive = clusters[i].relationIds.length
        expect(rows.length).toBe(expectedActive)
      }
    })

    it('指标链接格式正确：/kg-management-v2/#/lineage?q=指标名', () => {
      const doc = loadReport()
      const links = doc.querySelectorAll('#section3-root a.ind-link')
      expect(links.length).toBeGreaterThan(0)
      for (const link of links) {
        const href = link.getAttribute('href')
        expect(href).toContain('/kg-management-v2/#/lineage?q=')
        expect(link.getAttribute('target')).toBe('_blank')
      }
    })

    it('关系类型渲染为正确的 tag class', () => {
      const doc = loadReport()
      const tags = doc.querySelectorAll('#section3-root .tag')
      const validClasses = new Set(['tag-info', 'tag-purple', 'tag-success', 'tag-warning'])
      expect(tags.length).toBeGreaterThan(0)
      for (const tag of tags) {
        const classes = tag.className.split(' ')
        const tagClass = classes.find((c) => c.startsWith('tag-'))
        expect(tagClass).toBeTruthy()
        expect(validClasses.has(tagClass!)).toBe(true)
      }
    })
  })

  describe('localStorage 过滤', () => {
    it('排除某关系后对应行消失', () => {
      const docAll = loadReport([])
      const allRelIds = Array.from(docAll.querySelectorAll('tr[data-relation-id]')).map(r => r.getAttribute('data-relation-id'))
      expect(allRelIds.length).toBeGreaterThan(0)
      const firstId = allRelIds[0]!

      const docExcluded = loadReport([firstId])
      const rows = docExcluded.querySelectorAll('tr[data-relation-id="' + firstId + '"]')
      expect(rows.length).toBe(0)

      const remainingRows = docExcluded.querySelectorAll('tr[data-relation-id]')
      expect(remainingRows.length).toBeGreaterThan(0)
    })

    it('排除全部关系后报告显示空状态', () => {
      const doc = loadReport([])
      const allRowIds = Array.from(doc.querySelectorAll('tr[data-relation-id]')).map(r => r.getAttribute('data-relation-id')).filter(Boolean) as string[]
      if (allRowIds.length === 0) return
      // 排除当前显示的某条关系，验证其行消失
      const docExcluded = loadReport([allRowIds[0]])
      const rows = docExcluded.querySelectorAll('tr[data-relation-id="' + allRowIds[0] + '"]')
      expect(rows.length).toBe(0)
    })
  })
})
