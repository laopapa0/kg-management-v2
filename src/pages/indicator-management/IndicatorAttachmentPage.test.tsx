import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within, waitFor, act } from '@testing-library/react'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import { useAttachmentStore, selectPendingIndicators } from '@/stores/attachmentStore'
import { createIndicatorAttachment } from '@/models/indicatorAttachmentModel'
import IndicatorAttachmentPage from './IndicatorAttachmentPage'

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

function setupStore() {
  localStorage.clear()
  __resetAttachmentStorageCache()
  useAttachmentStore.setState(useAttachmentStore.getInitialState())
  const store = useAttachmentStore.getState()
  useAttachmentStore.setState({ departments: [{ id: 'dept-test', name: '财务部' }] })
  store.setCurrentDepartmentId('dept-test')

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
  store.setIndicators([root, l1, leaf])
  const p1 = createIndicatorAttachment({
    id: 'pending-real-1', name: '待选真实指标1', code: 'PENDING-001',
    indicatorCode: 'PENDING-001', indicatorDisplayName: '待选真实指标1',
    indicatorShowName: '待选真实指标1', indicatorType: '基础指标',
    level1: '经营', level2: '收入', granularity: '全局', frequency: '月',
    unit: '元', isBigScreen: false, department: '财务部',
    businessCaliber: '', techCaliber: '', tags: [],
    treeParentId: undefined, tagIds: [], ruleIds: [],
  })
  store.setIndicators([...store.indicators, p1])
  store.setTagNodes([
    { id: 'tag-1', name: '重点监控', color: '#ef4444', parentId: undefined },
  ])
  store.setRules([
    { id: 'rule-1', code: 'RULE-001', name: '上限告警', category: '阈值上下限', type: '阈值', paramSummary: 'upperLimit=95', parentRule: null, status: 'enabled', updatedAt: '' },
  ])
}

describe('IndicatorAttachmentPage', () => {
  beforeEach(() => { setupStore() })

  it('renders four panels with correct titles and tree views', () => {
    render(<IndicatorAttachmentPage />)
    expect(screen.getByText('指标树')).toBeInTheDocument()
    expect(screen.getByText('候选指标')).toBeInTheDocument()
    expect(screen.getByText('标签集')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
    expect(screen.getAllByTestId('tree-view').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByTestId('panel-header')).toHaveLength(4)
    expect(screen.getAllByRole('separator').length).toBeGreaterThanOrEqual(2)
  })

  it('applies dark theme backgrounds and data-panel attributes', () => {
    render(<IndicatorAttachmentPage />)
    expect(screen.getByTestId('panel-indicator-tree')).toHaveClass('bg-dark-card-l1')
    expect(screen.getByTestId('panel-pending-indicators')).toHaveClass('bg-dark-elevated')
    expect(screen.getByTestId('panel-tag-set')).toHaveClass('bg-dark-card-l1')
    expect(screen.getByTestId('panel-rules')).toHaveClass('bg-dark-card-l1')
    ;['panel-indicator-tree', 'panel-pending-indicators', 'panel-tag-set', 'panel-rules'].forEach((id) => {
      expect(screen.getByTestId(id).closest('[data-panel]')).toBeInTheDocument()
    })
  })

  it('renders add buttons with hover fade effect', () => {
    render(<IndicatorAttachmentPage />)
    const addButtons = screen.getAllByTestId('panel-header-add-button')
    expect(addButtons).toHaveLength(4)
    addButtons.forEach((btn) => expect(btn).toHaveClass('opacity-0'))
  })
})
