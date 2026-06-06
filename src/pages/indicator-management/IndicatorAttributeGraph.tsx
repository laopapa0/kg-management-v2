import { useMemo, useCallback, useState } from 'react'
import type { Indicator, ObjectTypeFieldDef } from '@/models/indicatorModel'
import { OBJECT_TYPE_DEFINITIONS } from '@/models/indicatorModel'

interface Props {
  indicator: Indicator
  onFieldClick?: (field: ObjectTypeFieldDef, value: unknown) => void
}

const SVG_SIZE = 600
const CENTER = SVG_SIZE / 2
const RADIUS = 220

/** 计算放射状坐标：角度从 -90°（顶部）开始，顺时针均匀分布 */
function getRadialPosition(index: number, total: number) {
  const angle = (-Math.PI / 2) + (2 * Math.PI * index) / total
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  }
}

export default function IndicatorAttributeGraph({ indicator, onFieldClick }: Props) {
  const [hoveredField, setHoveredField] = useState<string | null>(null)

  const fields = useMemo(() => {
    return OBJECT_TYPE_DEFINITIONS.flatMap((g) => g.fields)
  }, [])

  const getFieldValue = useCallback((field: ObjectTypeFieldDef) => {
    const value = indicator[field.key]
    if (field.type === 'boolean') {
      return value ? '是' : '否'
    }
    if (value === undefined || value === null || value === '') {
      return '-'
    }
    return String(value)
  }, [indicator])

  return (
    <svg viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="w-full h-full">
      {/* 中心与外围节点的连线 */}
      {fields.map((field, index) => {
        const pos = getRadialPosition(index, fields.length)
        return (
          <line
            key={`line-${field.key}`}
            x1={CENTER}
            y1={CENTER}
            x2={pos.x}
            y2={pos.y}
            stroke="#e8ecf1"
            strokeWidth={1}
          />
        )
      })}

      {/* 外围字段节点 */}
      {fields.map((field, index) => {
        const pos = getRadialPosition(index, fields.length)
        const value = getFieldValue(field)
        const isHovered = hoveredField === field.key

        return (
          <g
            key={field.key}
            transform={`translate(${pos.x}, ${pos.y})`}
            onMouseEnter={() => setHoveredField(field.key)}
            onMouseLeave={() => setHoveredField(null)}
            onClick={() => onFieldClick?.(field, indicator[field.key])}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            {/* 节点背景圆 */}
            <circle
              r={isHovered ? 42 : 40}
              fill="white"
              stroke={isHovered ? '#3478f6' : '#c4cad4'}
              strokeWidth={isHovered ? 2 : 1}
            />
            {/* 字段标签 */}
            <text
              y={-6}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#2d3748"
              fontSize={11}
              fontWeight={600}
            >
              {field.label}
            </text>
            {/* 字段值 */}
            <text
              y={10}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#6b7789"
              fontSize={10}
            >
              {value.length > 6 ? value.slice(0, 5) + '…' : value}
            </text>
          </g>
        )
      })}

      {/* 中心指标节点 */}
      <g transform={`translate(${CENTER}, ${CENTER})`}>
        <circle r={48} fill="#eef4ff" stroke="#3478f6" strokeWidth={2} />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#1a202c"
          fontSize={13}
          fontWeight={700}
        >
          {indicator.name.length > 8 ? indicator.name.slice(0, 7) + '…' : indicator.name}
        </text>
      </g>
    </svg>
  )
}
