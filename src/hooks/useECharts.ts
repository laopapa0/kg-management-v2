import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function useECharts(
  containerRef: React.RefObject<HTMLDivElement | null>,
  option: echarts.EChartsOption,
) {
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const instance = echarts.init(el, 'dark')
    instanceRef.current = instance
    instance.setOption(option)

    const ro = new ResizeObserver(() => {
      instance.resize()
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      instance.dispose()
      instanceRef.current = null
    }
  }, [containerRef, option])
}
