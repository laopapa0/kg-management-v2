import * as echarts from 'echarts'
import ChartContainer from './ChartContainer'

interface ChartBarProps {
  option: echarts.EChartsOption
}

export default function ChartBar({ option }: ChartBarProps) {
  return <ChartContainer option={option} className="chart-bar" />
}
