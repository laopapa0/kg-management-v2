import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import KnowledgeGraphChart from './KnowledgeGraphChart'

const eventHandlers: Record<string, Function[]> = {}

const { mockInit, mockSetOption, mockDispose, mockInstance } = vi.hoisted(() => {
  const mockSetOption = vi.fn()
  const mockDispose = vi.fn()
  const mockOn = vi.fn((event: string, handler: Function) => {
    eventHandlers[event] = eventHandlers[event] || []
    eventHandlers[event].push(handler)
  })
  const mockOff = vi.fn((event: string, handler: Function) => {
    if (eventHandlers[event]) {
      eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler)
    }
  })
  const mockInstance = {
    setOption: mockSetOption,
    resize: vi.fn(),
    dispose: mockDispose,
    on: mockOn,
    off: mockOff,
  }
  const mockInit = vi.fn(() => mockInstance)
  return { mockInit, mockSetOption, mockDispose, mockInstance }
})

vi.mock('echarts', () => ({
  init: mockInit,
}))

function triggerEvent(event: string, params: any) {
  const handlers = eventHandlers[event] || []
  for (const h of handlers) {
    h(params)
  }
}

function clearEventHandlers() {
  for (const key of Object.keys(eventHandlers)) {
    delete eventHandlers[key]
  }
}

describe('KnowledgeGraphChart', () => {
  beforeEach(() => {
    mockInit.mockClear()
    mockSetOption.mockClear()
    mockDispose.mockClear()
    mockInstance.on.mockClear()
    mockInstance.off.mockClear()
    clearEventHandlers()
  })

  const mockNodes = [
    { id: 'n1', name: '5G渗透率', type: 'anomaly' as const, value: 55 },
    { id: 'n2', name: '基站数', type: 'upstream' as const, value: 22 },
    { id: 'n3', name: '用户数', type: 'normal' as const, value: 15 },
  ]

  const mockEdges = [
    { source: 'n2', target: 'n1', relation: 'DEPENDS_ON', verified: true },
    { source: 'n3', target: 'n1', relation: 'CORRELATES', verified: false },
  ]

  /* ─── 原有测试 ─── */

  it('renders chart container and calls echarts.init with dark theme', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} />)
    expect(mockInit).toHaveBeenCalledTimes(1)
    const callArg = mockInit.mock.calls[0][0]
    expect(callArg).toBeInstanceOf(HTMLDivElement)
    expect(mockInit.mock.calls[0][1]).toBe('dark')
  })

  it('passes graph series option to setOption with nodes and edges', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} />)
    expect(mockSetOption).toHaveBeenCalled()
    const passedOption = mockSetOption.mock.calls[0][0]
    expect(passedOption.series).toHaveLength(1)
    expect(passedOption.series[0].type).toBe('graph')
    expect(passedOption.series[0].layout).toBe('force')
    expect(passedOption.series[0].data).toHaveLength(mockNodes.length)
    expect(passedOption.series[0].links).toHaveLength(mockEdges.length)
    expect(passedOption.series[0].roam).toBe(true)
  })

  it('maps node colors and sizes by type', () => {
    const colorNodes = [
      { id: 'a', name: '异常中心', type: 'anomaly' as const },
      { id: 'b', name: '上游依赖', type: 'upstream' as const },
      { id: 'c', name: '已偏离', type: 'deviated' as const },
      { id: 'd', name: '正常', type: 'normal' as const },
    ]
    render(<KnowledgeGraphChart nodes={colorNodes} edges={[]} />)
    const passedOption = mockSetOption.mock.calls[0][0]
    const data = passedOption.series[0].data
    expect(data[0].symbolSize).toBe(55)
    expect(data[0].itemStyle?.color).toBe('#ef4444')
    expect(data[1].symbolSize).toBe(22)
    expect(data[1].itemStyle?.color).toBe('#3b82f6')
    expect(data[2].symbolSize).toBe(15)
    expect(data[2].itemStyle?.color).toBe('#f97316')
    expect(data[3].symbolSize).toBe(15)
    expect(data[3].itemStyle?.color).toBe('#22c55e')
  })

  it('maps edge styles by verified flag and shows relation label', () => {
    const styleEdges = [
      { source: 'a', target: 'b', relation: 'DEPENDS_ON', verified: true },
      { source: 'a', target: 'c', relation: 'CORRELATES', verified: false },
    ]
    render(<KnowledgeGraphChart nodes={mockNodes} edges={styleEdges} />)
    const passedOption = mockSetOption.mock.calls[0][0]
    const links = passedOption.series[0].links
    expect(links[0].lineStyle?.width).toBe(2.5)
    expect(links[0].lineStyle?.type).toBe('solid')
    expect(links[0].label?.show).toBe(true)
    expect(links[0].label?.formatter).toBe('DEPENDS_ON')
    expect(links[1].lineStyle?.width).toBe(1)
    expect(links[1].lineStyle?.type).toBe('dashed')
    expect(links[1].label?.show).toBe(true)
    expect(links[1].label?.formatter).toBe('CORRELATES')
  })

  it('renders legend panel with node colors and edge styles', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} />)
    expect(screen.getByText('异常中心')).toBeInTheDocument()
    expect(screen.getByText('上游依赖')).toBeInTheDocument()
    expect(screen.getByText('已偏离邻居')).toBeInTheDocument()
    expect(screen.getByText('未偏离邻居')).toBeInTheDocument()
    expect(screen.getByText('已验证传导')).toBeInTheDocument()
    expect(screen.getByText('无数据证据')).toBeInTheDocument()
  })

  it('renders attribution panel with ReportAlert when attribution is provided', () => {
    const attribution = { status: 'success' as const, message: '归因成功：基站数下降导致', department: '网络部' }
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} attribution={attribution} />)
    expect(screen.getByText('归因分析')).toBeInTheDocument()
    expect(screen.getByText('归因成功：基站数下降导致 建议负责部门：网络部')).toBeInTheDocument()
  })

  it('does not render attribution panel when attribution is omitted', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} />)
    expect(screen.queryByText('归因分析')).not.toBeInTheDocument()
  })

  it('disposes echarts instance on unmount', () => {
    const { unmount } = render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} />)
    unmount()
    expect(mockDispose).toHaveBeenCalled()
  })

  /* ─── 新增 editable 模式测试 ─── */

  it('registers mouseover/mouseout event listeners when editable is true', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} editable />)
    expect(mockInstance.on).toHaveBeenCalledWith('mouseover', expect.any(Function))
    expect(mockInstance.on).toHaveBeenCalledWith('mouseout', expect.any(Function))
  })

  it('does not register event listeners when editable is false', () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} editable={false} />)
    expect(mockInstance.on).not.toHaveBeenCalled()
  })

  it('shows float action buttons on node mouseover in editable mode', async () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} editable />)

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'node', data: { id: 'n1', name: '5G渗透率' } })

    expect(await screen.findByTestId('knowledge-graph-float-actions')).toBeInTheDocument()
    expect(screen.getByTestId('modify-relation-btn')).toBeInTheDocument()
    expect(screen.queryByTestId('delete-relation-btn')).not.toBeInTheDocument()
  })

  it('shows float action buttons on edge mouseover in editable mode', async () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} editable />)

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'edge', data: { source: 'n2', target: 'n1', relation: 'DEPENDS_ON' } })

    expect(await screen.findByTestId('knowledge-graph-float-actions')).toBeInTheDocument()
    expect(screen.getByTestId('modify-relation-btn')).toBeInTheDocument()
    expect(screen.getByTestId('delete-relation-btn')).toBeInTheDocument()
  })

  it('hides float actions on mouseout', async () => {
    render(<KnowledgeGraphChart nodes={mockNodes} edges={mockEdges} editable />)

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'node', data: { id: 'n1', name: '5G渗透率' } })
    expect(await screen.findByTestId('knowledge-graph-float-actions')).toBeInTheDocument()

    triggerEvent('mouseout', {})
    await waitFor(() => {
      expect(screen.queryByTestId('knowledge-graph-float-actions')).not.toBeInTheDocument()
    })
  })

  it('opens delete dialog and calls onEdgeDelete when confirmed', async () => {
    const onEdgeDelete = vi.fn()
    render(
      <KnowledgeGraphChart
        nodes={mockNodes}
        edges={mockEdges}
        editable
        onEdgeDelete={onEdgeDelete}
      />,
    )

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'edge', data: { source: 'n2', target: 'n1', relation: 'DEPENDS_ON' } })

    fireEvent.click(await screen.findByTestId('delete-relation-btn'))

    expect(screen.getByText('确认删除关系')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('confirm-delete-btn'))

    await waitFor(() => {
      expect(onEdgeDelete).toHaveBeenCalledTimes(1)
    })

    const deletedEdge = onEdgeDelete.mock.calls[0][0]
    expect(deletedEdge.source).toBe('n2')
    expect(deletedEdge.target).toBe('n1')
    expect(deletedEdge.relation).toBe('DEPENDS_ON')
  })

  it('opens edit dialog and calls onEdgeChange when confirmed', async () => {
    const onEdgeChange = vi.fn()
    render(
      <KnowledgeGraphChart
        nodes={mockNodes}
        edges={mockEdges}
        editable
        onEdgeChange={onEdgeChange}
      />,
    )

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'edge', data: { source: 'n2', target: 'n1', relation: 'DEPENDS_ON' } })

    fireEvent.click(await screen.findByTestId('modify-relation-btn'))

    expect(screen.getByRole('heading', { name: '修改关系' })).toBeInTheDocument()

    // Select new relation type
    fireEvent.change(screen.getByTestId('edit-relation-select'), { target: { value: 'CORRELATES' } })

    // Select new target node
    fireEvent.change(screen.getByTestId('edit-target-select'), { target: { value: 'n3' } })

    fireEvent.click(screen.getByTestId('confirm-edit-btn'))

    await waitFor(() => {
      expect(onEdgeChange).toHaveBeenCalledTimes(1)
    })

    const [oldEdge, newEdge] = onEdgeChange.mock.calls[0]
    expect(oldEdge.relation).toBe('DEPENDS_ON')
    expect(oldEdge.target).toBe('n1')
    expect(newEdge.relation).toBe('CORRELATES')
    expect(newEdge.target).toBe('n3')
  })

  it('cancels delete dialog without calling onEdgeDelete', async () => {
    const onEdgeDelete = vi.fn()
    render(
      <KnowledgeGraphChart
        nodes={mockNodes}
        edges={mockEdges}
        editable
        onEdgeDelete={onEdgeDelete}
      />,
    )

    await waitFor(() => expect(eventHandlers['mouseover']?.length ?? 0).toBeGreaterThan(0))

    triggerEvent('mouseover', { dataType: 'edge', data: { source: 'n2', target: 'n1', relation: 'DEPENDS_ON' } })
    fireEvent.click(await screen.findByTestId('delete-relation-btn'))

    fireEvent.click(screen.getByTestId('cancel-delete-btn'))

    expect(onEdgeDelete).not.toHaveBeenCalled()
  })
})
