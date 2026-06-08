import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import KnowledgeGraphChart from './KnowledgeGraphChart'

const { mockInit, mockSetOption, mockDispose, mockInstance } = vi.hoisted(() => {
  const mockSetOption = vi.fn()
  const mockDispose = vi.fn()
  const mockInstance = { setOption: mockSetOption, resize: vi.fn(), dispose: mockDispose }
  const mockInit = vi.fn(() => mockInstance)
  return { mockInit, mockSetOption, mockDispose, mockInstance }
})

vi.mock('echarts', () => ({
  init: mockInit,
}))

describe('KnowledgeGraphChart', () => {
  beforeEach(() => {
    mockInit.mockClear()
    mockSetOption.mockClear()
    mockDispose.mockClear()
  })

  const mockNodes = [
    { id: 'n1', name: '5G渗透率', type: 'anomaly' as const, value: 55 },
    { id: 'n2', name: '基站数', type: 'upstream' as const, value: 22 },
  ]

  const mockEdges = [
    { source: 'n2', target: 'n1', relation: 'DEPENDS_ON', verified: true },
  ]

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
    const colorNodes: KnowledgeGraphNode[] = [
      { id: 'a', name: '异常中心', type: 'anomaly' },
      { id: 'b', name: '上游依赖', type: 'upstream' },
      { id: 'c', name: '已偏离', type: 'deviated' },
      { id: 'd', name: '正常', type: 'normal' },
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
})
