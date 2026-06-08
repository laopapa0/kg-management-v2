import * as echarts from 'echarts'
import ChartContainer from './ChartContainer'

interface ChartLineProps {
  option: echarts.EChartsOption
}

export default function ChartLine({ option }: ChartLineProps) {
  return <ChartContainer option={option} className="chart-line" />
}
