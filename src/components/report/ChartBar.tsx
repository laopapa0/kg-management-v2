import { useRef } from 'react'
import * as echarts from 'echarts'
import { useECharts } from '@/hooks/useECharts'

interface ChartBarProps {
  option: echarts.EChartsOption
}

export default function ChartBar({ option }: ChartBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  useECharts(containerRef, option)
  return <div ref={containerRef} className="chart-bar" style={{ width: '100%', height: 300 }} />
}
