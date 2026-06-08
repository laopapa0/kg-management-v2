import type { RefObject } from 'react'

interface ConnectionLineProps {
  pathRef: RefObject<SVGPathElement | null>
  isValidHover: boolean
  isInvalidHover: boolean
}

export default function ConnectionLine({
  pathRef,
  isValidHover,
  isInvalidHover,
}: ConnectionLineProps) {
  const strokeColor = isInvalidHover
    ? 'var(--dark-conn-line-invalid)'
    : isValidHover
      ? 'var(--dark-conn-line-valid)'
      : 'var(--dark-conn-line-default)'

  const markerId = isInvalidHover
    ? 'conn-arrow-invalid'
    : isValidHover
      ? 'conn-arrow-valid'
      : 'conn-arrow'

  return (
    <path
      ref={pathRef}
      data-testid="connection-line-path"
      stroke={strokeColor}
      strokeWidth={isValidHover ? 3 : 2.5}
      strokeDasharray="6 4"
      fill="none"
      markerEnd={`url(#${markerId})`}
      className={isInvalidHover ? '' : 'animate-ant-line'}
      style={{
        animationDuration: isValidHover ? '0.3s' : '0.5s',
      }}
    />
  )
}
