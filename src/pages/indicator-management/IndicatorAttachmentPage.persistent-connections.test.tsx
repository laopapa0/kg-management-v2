import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { createIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import IndicatorAttachmentPage from './IndicatorAttachmentPage'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
vi.mock('mind-elixir', () => ({
  default: class MockMindElixir {
    static SIDE = 2
    static new = () => ({ nodeData: { id: 'root', topic: 'root' } })
    container: any
    bus = { addListener: () => {}, removeListener: () => {} }
    init = () => {}
    refresh = () => {}
    toCenter = () => {}
    scaleFit = () => {}
  },
}))
vi.mock('mind-elixir/style.css', () => ({}))
vi.mock('@/components/tree/TreeView', () => {
  const React = require('react')
  return { default: () => React.createElement('div', { 'data-testid': 'tree-view' }) }
})
vi.mock('react-resizable-panels', () => {
  const React = require('react')
  return {
    Panel: ({ children, ...p }: any) => React.createElement('div', { ...p, 'data-panel': '' }, children),
    Group: ({ children, ...p }: any) => React.createElement('div', p, children),
    Separator: (p: any) => React.createElement('div', { ...p, role: 'separator' }),
  }
})
/* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

function buildTestIndicators() {
  const root = createIndicatorAttachment({
    id: 'tree-root', name: '财务部指标树', code: 'ROOT-001',
    indicatorCode: 'ROOT-001', indicatorDisplayName: '财务部指标树',
    indicatorShowName: '财务部指标树', indicatorType: '虚拟分组',
    level1: '经营', level2: '', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: false, department: '财务部',
    businessCaliber: '', techCaliber: '', tags: [],
    treeParentId: undefined, tagIds: [], ruleIds: [],
  })
  const l1 = createIndicatorAttachment({
    id: 'l1-revenue', name: '收入类', code: 'L1-001',
    indicatorCode: 'L1-001', indicatorDisplayName: '收入类',
    indicatorShowName: '收入类', indicatorType: '虚拟分组',
    level1: '经营', level2: '收入', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: false, department: '财务部',
    businessCaliber: '', techCaliber: '', tags: [],
    treeParentId: 'tree-root', tagIds: [], ruleIds: [],
  })
  const leaf = createIndicatorAttachment({
    id: 'leaf-revenue-total', name: '总收入', code: 'LEAF-001',
    indicatorCode: 'LEAF-001', indicatorDisplayName: '总收入',
    indicatorShowName: '总收入', indicatorType: '基础指标',
    level1: '经营', level2: '收入', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: false, department: '财务部',
    businessCaliber: '', techCaliber: '', tags: [],
    treeParentId: 'l1-revenue', tagIds: ['tag-1'], ruleIds: ['rule-1'],
  })
  // 这个指标被错误地挂在 pending 容器下：它会出现在候选池，
  // 但修复前 PersistentConnectionLayer 会画一条到"默认"节点的连线。
  const pendingWithParent = createIndicatorAttachment({
    id: 'pending-with-parent', name: '待选但有父节点', code: 'PENDING-PARENT',
    indicatorCode: 'PENDING-PARENT', indicatorDisplayName: '待选但有父节点',
    indicatorShowName: '待选但有父节点', indicatorType: '基础指标',
    level1: '经营', level2: '收入', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: false, department: '财务部',
    businessCaliber: '', techCaliber: '', tags: [],
    treeParentId: 'dept-财务部-pending', tagIds: [], ruleIds: [],
  })
  return [root, l1, leaf, pendingWithParent]
}

function setupStoreWithPendingParent() {
  localStorage.clear()
  __resetAttachmentStorageCache()
  useAttachmentStore.setState(useAttachmentStore.getInitialState())

  const indicators = buildTestIndicators()
  const departments = [{ id: 'dept-test', name: '财务部' }]
  const tagNodes = [{ id: 'tag-1', name: '重点监控', color: '#ef4444', parentId: undefined }]
  const rules = [{ id: 'rule-1', code: 'RULE-001', name: '上限告警', category: '阈值上下限', type: '阈值', paramSummary: 'upperLimit=95', parentRule: null, status: 'enabled', updatedAt: '' }]

  localStorage.setItem('kgv2-attachment-data-version', '4')
  localStorage.setItem('kgv2-attachment-departments', JSON.stringify(departments))
  localStorage.setItem('kgv2-attachment-indicators-dept-test', JSON.stringify(indicators))
  localStorage.setItem('kgv2-attachment-tagnodes-dept-test', JSON.stringify(tagNodes))
  localStorage.setItem('kgv2-attachment-rules', JSON.stringify(rules))
  localStorage.setItem('kgv2-attachment-rule-params', JSON.stringify([]))
  localStorage.setItem('kgv2-attachment-ui', JSON.stringify({ selectedDepartmentId: 'dept-test' }))
}

describe('指标树拖拽后奇怪连线 bug', () => {
  beforeEach(() => {
    setupStoreWithPendingParent()
  })

  it('不应渲染从默认/pending 节点到候选池卡片的 persistent connection', () => {
    render(<IndicatorAttachmentPage />)

    const lines = screen.queryAllByTestId('persistent-connection-line')
    // 正常树结构有两条连线：leaf -> l1 -> root。
    // pending-with-parent 指向 dept-财务部-pending 的连线应该被过滤掉。
    expect(lines.length).toBe(2)
  })
})
