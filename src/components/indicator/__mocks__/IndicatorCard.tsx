export interface IndicatorCardProps {
  id: string
  name: string
  code: string
  level1: string
  level2: string
  source?: string
  state?: 'default' | 'hover' | 'selected' | 'attached'
  onClick?: () => void
}

export default function IndicatorCard({ id, name, onClick }: IndicatorCardProps) {
  return (
    <div data-testid="indicator-card" data-indicator-id={id} onClick={onClick}>
      {name || id}
    </div>
  )
}
