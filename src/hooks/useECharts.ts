import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'

export function useECharts(
  containerRef: React.RefObject<HTMLDivElement | null>,
  option: echarts.EChartsOption,
): echarts.ECharts | null {
  const [instance, setInstance] = useState<echarts.ECharts | null>(null)
  const optionRef = useRef(option)
  optionRef.current = option

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const inst = echarts.init(el, 'dark')
    setInstance(inst)
    inst.setOption(optionRef.current)

    const ro = new ResizeObserver(() => {
      inst.resize()
    })
    ro.observe(el)

    return () => {
      ro.disconnect()
      inst.dispose()
      setInstance(null)
    }
  }, [containerRef])

  useEffect(() => {
    if (!instance) return
    instance.setOption(option, { notMerge: true })
  }, [option, instance])

  return instance
}
