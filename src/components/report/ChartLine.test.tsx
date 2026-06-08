import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import ChartLine from './ChartLine'

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

describe('ChartLine', () => {
  beforeEach(() => {
    mockInit.mockClear()
    mockSetOption.mockClear()
    mockDispose.mockClear()
  })

  const mockOption = {
    xAxis: { type: 'category' as const, data: ['Mon', 'Tue'] },
    yAxis: { type: 'value' as const },
    series: [{ type: 'line' as const, data: [120, 200], smooth: true, areaStyle: {} }],
  }

  it('renders chart container and calls echarts.init with dark theme', () => {
    render(<ChartLine option={mockOption} />)
    expect(mockInit).toHaveBeenCalledTimes(1)
    const callArg = mockInit.mock.calls[0][0]
    expect(callArg).toBeInstanceOf(HTMLDivElement)
    expect(mockInit.mock.calls[0][1]).toBe('dark')
  })

  it('calls setOption with the provided option', () => {
    render(<ChartLine option={mockOption} />)
    expect(mockSetOption).toHaveBeenCalledWith(mockOption)
  })

  it('disposes echarts instance on unmount', () => {
    const { unmount } = render(<ChartLine option={mockOption} />)
    unmount()
    expect(mockDispose).toHaveBeenCalled()
  })

  it('observes container resize via ResizeObserver', () => {
    const observeSpy = vi.spyOn(global.ResizeObserver.prototype, 'observe')
    const { container } = render(<ChartLine option={mockOption} />)
    expect(observeSpy).toHaveBeenCalledTimes(1)
    const observedEl = observeSpy.mock.calls[0][0]
    expect(observedEl).toBe(container.querySelector('.chart-line'))
    observeSpy.mockRestore()
  })
})
