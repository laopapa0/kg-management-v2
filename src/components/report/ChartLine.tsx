import { useRef } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'

interface ChartLineProps {
  option: echarts.EChartsOption
}

export default function ChartLine({ option }: ChartLineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useECharts(containerRef, option)
  return <div ref={containerRef} className="chart-line" style={{ width: '100%', height: 300 }} />
}
