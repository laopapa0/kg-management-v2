import { describe, it, expect, afterEach } from 'vitest'
import { addExcludedRelation, removeExcludedRelation, getExcludedRelations } from '@/utils/lineageExcludedStorage'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { JSDOM } from 'jsdom'

const REPORT_PATH = resolve(__dirname, '..', 'public', 'report.html')
const LS_KEY = 'kgv2-excluded-relation-ids'

describe('画布删除 → 报告联动 E2E', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('画布删除 REL-001 → localStorage 写入 → report.html 过滤该行', () => {
    // 模拟画布删除操作
    addExcludedRelation('REL-090')

    // 验证 ls 已写入
    const stored = getExcludedRelations()
    expect(stored).toContain('REL-090')

    // 加载 report.html
    const storage = new Map<string, string>()
    storage.set(LS_KEY, JSON.stringify(stored))

    const dom = new JSDOM(readFileSync(REPORT_PATH, 'utf-8'), {
      url: 'http://localhost/kg-management-v2/report.html',
      runScripts: 'dangerously',
      beforeParse(window) {
        (window as any).echarts = { init: () => ({ setOption: () => {} }) }
        const mock = {
          _data: storage, getItem: (k: string) => mock._data.get(k) ?? null,
          setItem: (k: string, v: string) => { mock._data.set(k, v) },
          removeItem: (k: string) => { mock._data.delete(k) },
          clear: () => { mock._data.clear() }, get length() { return mock._data.size },
          key: (i: number) => [...mock._data.keys()][i] ?? null,
        }
        Object.defineProperty(window, 'localStorage', { value: mock, writable: true, configurable: true })
      },
    })

    const doc = dom.window.document
    // REL-090 对应 "月-财务-集团派单项目数量" 的 CAUSES 关系
    const excludedRows = doc.querySelectorAll('tr[data-relation-id="REL-090"]')
    expect(excludedRows.length).toBe(0) // 应该被过滤掉

    // 其他关系仍存在
    const allRows = doc.querySelectorAll('tr[data-relation-id]')
    expect(allRows.length).toBeGreaterThan(0)
  })

  it('画布未删除任何关系 → report.html 展示所有活跃关系', () => {
    const storage = new Map<string, string>()
    const dom = new JSDOM(readFileSync(REPORT_PATH, 'utf-8'), {
      url: 'http://localhost/kg-management-v2/report.html',
      runScripts: 'dangerously',
      beforeParse(window) {
        (window as any).echarts = { init: () => ({ setOption: () => {} }) }
        const mock = {
          _data: storage, getItem: (k: string) => mock._data.get(k) ?? null,
          setItem: (k: string, v: string) => { mock._data.set(k, v) },
          removeItem: (k: string) => { mock._data.delete(k) },
          clear: () => { mock._data.clear() }, get length() { return mock._data.size },
          key: (i: number) => [...mock._data.keys()][i] ?? null,
        }
        Object.defineProperty(window, 'localStorage', { value: mock, writable: true, configurable: true })
      },
    })
    const doc = dom.window.document
    const allRows = doc.querySelectorAll('tr[data-relation-id]')
    expect(allRows.length).toBeGreaterThan(30)
  })

  it('reload 后排除效果持续', () => {
    addExcludedRelation('REL-090')
    // 第一次加载
    const storage1 = new Map<string, string>()
    storage1.set(LS_KEY, JSON.stringify(getExcludedRelations()))
    const dom1 = new JSDOM(readFileSync(REPORT_PATH, 'utf-8'), {
      url: 'http://localhost/kg-management-v2/report.html',
      runScripts: 'dangerously',
      beforeParse(window) {
        (window as any).echarts = { init: () => ({ setOption: () => {} }) }
        const m = {
          _data: storage1, getItem: (k: string) => m._data.get(k) ?? null,
          setItem: (k: string, v: string) => { m._data.set(k, v) },
          removeItem: (k: string) => { m._data.delete(k) },
          clear: () => { m._data.clear() }, get length() { return m._data.size },
          key: (i: number) => [...m._data.keys()][i] ?? null,
        }
        Object.defineProperty(window, 'localStorage', { value: m, writable: true, configurable: true })
      },
    })
    // 第二次刷新
    const storage2 = new Map<string, string>()
    storage2.set(LS_KEY, JSON.stringify(getExcludedRelations()))
    const dom2 = new JSDOM(readFileSync(REPORT_PATH, 'utf-8'), {
      url: 'http://localhost/kg-management-v2/report.html',
      runScripts: 'dangerously',
      beforeParse(window) {
        (window as any).echarts = { init: () => ({ setOption: () => {} }) }
        const m2 = {
          _data: storage2, getItem: (k: string) => m2._data.get(k) ?? null,
          setItem: (k: string, v: string) => { m2._data.set(k, v) },
          removeItem: (k: string) => { m2._data.delete(k) },
          clear: () => { m2._data.clear() }, get length() { return m2._data.size },
          key: (i: number) => [...m2._data.keys()][i] ?? null,
        }
        Object.defineProperty(window, 'localStorage', { value: m2, writable: true, configurable: true })
      },
    })
    const rows1 = dom1.window.document.querySelectorAll('tr[data-relation-id="REL-090"]')
    const rows2 = dom2.window.document.querySelectorAll('tr[data-relation-id="REL-090"]')
    expect(rows1.length).toBe(0)
    expect(rows2.length).toBe(0) // 刷新后仍被排除
  })
})
