import { useRef } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'

interface ChartContainerProps {
  option: echarts.EChartsOption
  className?: string
  height?: number
}

export default function ChartContainer({ option, className, height = 300 }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useECharts(containerRef, option)
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height }}
    />
  )
}
