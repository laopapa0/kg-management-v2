import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAttachmentStore } from '@/stores/attachmentStore'
import { __resetAttachmentStorageCache } from '@/utils/attachmentStorage'
import AttachmentCommandPalette from './AttachmentCommandPalette'

describe('AttachmentCommandPalette', () => {
  const mockOnOpenChange = vi.fn()
  const mockOnSelectIndicator = vi.fn()
  const mockOnToggleTag = vi.fn()
  const mockOnToggleRule = vi.fn()
  const mockOnNavigateToTag = vi.fn()
  const mockOnNavigateToRule = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    __resetAttachmentStorageCache()
    useAttachmentStore.setState(useAttachmentStore.getInitialState())

    // Inject test data
    useAttachmentStore.setState({
      indicators: [
        {
          id: 'ind-1',
          name: '营收指标A',
          code: 'REV-001',
          indicatorCode: 'REV-001',
          indicatorDisplayName: '营收指标A',
          indicatorShowName: '营收指标A',
          indicatorType: '基础指标',
          level1: '经营',
          level2: '收入',
          granularity: '全局',
          frequency: '月',
          unit: '元',
          isBigScreen: false,
          department: '财务部',
          businessCaliber: '',
          techCaliber: '',
          tags: [],
          treeParentId: undefined,
          tagIds: [],
          ruleIds: [],
        },
        {
          id: 'ind-2',
          name: '利润指标B',
          code: 'PROF-002',
          indicatorCode: 'PROF-002',
          indicatorDisplayName: '利润指标B',
          indicatorShowName: '利润指标B',
          indicatorType: '基础指标',
          level1: '经营',
          level2: '利润',
          granularity: '全局',
          frequency: '月',
          unit: '元',
          isBigScreen: false,
          department: '财务部',
          businessCaliber: '',
          techCaliber: '',
          tags: [],
          treeParentId: 'tree-1',
          tagIds: ['tag-1'],
          ruleIds: ['rule-1'],
        },
        {
          id: 'vg-1',
          name: '战略执行',
          code: 'GROUP-001',
          indicatorCode: 'GROUP-001',
          indicatorDisplayName: '战略执行',
          indicatorShowName: '战略执行',
          indicatorType: '虚拟分组',
          level1: '',
          level2: '',
          granularity: '',
          frequency: '',
          unit: '',
          isBigScreen: false,
          department: '财务部',
          businessCaliber: '',
          techCaliber: '',
          tags: [],
          treeParentId: undefined,
          tagIds: [],
          ruleIds: [],
        },
      ],
      tagNodes: [
        { id: 'tag-1', name: '成本标签', parentId: undefined },
        { id: 'tag-2', name: '利润标签', parentId: undefined },
      ],
      rules: [
        { id: 'rule-1', name: '阈值告警', type: 'threshold' as const, parentId: undefined },
        { id: 'rule-2', name: '波动检测', type: 'fluctuation' as const, parentId: undefined },
      ],
    })
  })

  function renderPalette(props: Partial<Parameters<typeof AttachmentCommandPalette>[0]> = {}) {
    return render(
      <AttachmentCommandPalette
        open={true}
        onOpenChange={mockOnOpenChange}
        selectedIndicatorId={null}
        onSelectIndicator={mockOnSelectIndicator}
        onToggleTag={mockOnToggleTag}
        onToggleRule={mockOnToggleRule}
        onNavigateToTag={mockOnNavigateToTag}
        onNavigateToRule={mockOnNavigateToRule}
        {...props}
      />,
    )
  }

  it('renders search input and group headings when open', () => {
    renderPalette()

    expect(screen.getByPlaceholderText(/搜索指标/i)).toBeInTheDocument()
    expect(screen.getByText('指标')).toBeInTheDocument()
    expect(screen.getByText('标签')).toBeInTheDocument()
    expect(screen.getByText('规则')).toBeInTheDocument()
  })

  it('lists all non-virtual-group indicators initially', () => {
    renderPalette()

    // Should show real indicators
    expect(screen.getByText('营收指标A')).toBeInTheDocument()
    expect(screen.getByText('利润指标B')).toBeInTheDocument()
    // Should NOT show virtual grouping nodes
    expect(screen.queryByText('战略执行')).not.toBeInTheDocument()
  })

  it('lists all tags initially', () => {
    renderPalette()

    expect(screen.getByText('成本标签')).toBeInTheDocument()
    expect(screen.getByText('利润标签')).toBeInTheDocument()
  })

  it('lists all rules initially', () => {
    renderPalette()

    expect(screen.getByText('阈值告警')).toBeInTheDocument()
    expect(screen.getByText('波动检测')).toBeInTheDocument()
  })

  it('filters indicators by name when typing', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '营收')

    expect(screen.getByText('营收指标A')).toBeInTheDocument()
    expect(screen.queryByText('利润指标B')).not.toBeInTheDocument()
  })

  it('filters indicators by code when typing', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, 'PROF-002')

    expect(screen.queryByText('营收指标A')).not.toBeInTheDocument()
    expect(screen.getByText('利润指标B')).toBeInTheDocument()
  })

  it('filters tags by name when typing', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '成本')

    // Tag group should still show with filtered results
    expect(screen.getByText('成本标签')).toBeInTheDocument()
    expect(screen.queryByText('利润标签')).not.toBeInTheDocument()
  })

  it('filters rules by name when typing', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '波动')

    expect(screen.queryByText('阈值告警')).not.toBeInTheDocument()
    expect(screen.getByText('波动检测')).toBeInTheDocument()
  })

  it('shows empty state when no results match', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '不存在的搜索词')

    expect(screen.getByText(/未找到结果/i)).toBeInTheDocument()
  })

  it('calls onSelectIndicator when selecting an indicator via Enter', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '营收')

    // Press Enter to select the first (and only) result
    await user.keyboard('{Enter}')

    expect(mockOnSelectIndicator).toHaveBeenCalledTimes(1)
    expect(mockOnSelectIndicator).toHaveBeenCalledWith('ind-1')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onToggleTag when selecting a tag with selectedIndicatorId set', async () => {
    const user = userEvent.setup()
    renderPalette({ selectedIndicatorId: 'ind-1' })

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '成本')

    await user.keyboard('{Enter}')

    expect(mockOnToggleTag).toHaveBeenCalledTimes(1)
    expect(mockOnToggleTag).toHaveBeenCalledWith('tag-1')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onNavigateToTag when selecting a tag without selectedIndicatorId', async () => {
    const user = userEvent.setup()
    renderPalette({ selectedIndicatorId: null })

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '成本')

    await user.keyboard('{Enter}')

    expect(mockOnNavigateToTag).toHaveBeenCalledTimes(1)
    expect(mockOnNavigateToTag).toHaveBeenCalledWith('tag-1')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnToggleTag).not.toHaveBeenCalled()
  })

  it('calls onToggleRule when selecting a rule with selectedIndicatorId set', async () => {
    const user = userEvent.setup()
    renderPalette({ selectedIndicatorId: 'ind-1' })

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '阈值')

    await user.keyboard('{Enter}')

    expect(mockOnToggleRule).toHaveBeenCalledTimes(1)
    expect(mockOnToggleRule).toHaveBeenCalledWith('rule-1')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onNavigateToRule when selecting a rule without selectedIndicatorId', async () => {
    const user = userEvent.setup()
    renderPalette({ selectedIndicatorId: null })

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.type(input, '阈值')

    await user.keyboard('{Enter}')

    expect(mockOnNavigateToRule).toHaveBeenCalledTimes(1)
    expect(mockOnNavigateToRule).toHaveBeenCalledWith('rule-1')
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnToggleRule).not.toHaveBeenCalled()
  })

  it('closes on Escape key', async () => {
    const user = userEvent.setup()
    renderPalette()

    const input = screen.getByPlaceholderText(/搜索指标/i)
    await user.click(input)
    await user.keyboard('{Escape}')

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('displays keyboard shortcut hints in the footer', () => {
    renderPalette()

    expect(screen.getByText(/↑↓ 导航/i)).toBeInTheDocument()
    expect(screen.getByText(/Enter 执行/i)).toBeInTheDocument()
    expect(screen.getByText(/Esc 关闭/i)).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    renderPalette({ open: false })

    expect(screen.queryByPlaceholderText(/搜索指标/i)).not.toBeInTheDocument()
  })

  it('shows indicator code alongside name', () => {
    renderPalette()

    const item = screen.getByText('营收指标A').closest('[data-testid="command-item"]')
    expect(item).toHaveTextContent('REV-001')
  })

  it('shows rule type badge alongside rule name', () => {
    renderPalette()

    const item = screen.getByText('阈值告警').closest('[data-testid="command-item"]')
    expect(item).toHaveTextContent('threshold')
  })
})
