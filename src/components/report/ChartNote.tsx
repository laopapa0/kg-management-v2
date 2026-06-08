interface ChartNoteProps {
  text: string
  source: string
}

export default function ChartNote({ text, source }: ChartNoteProps) {
  return (
    <div className="chart-note rounded-md bg-dark-card-l2 px-4 py-3 text-xs text-dark-text-secondary">
      <p>{text}</p>
      <p className="mt-1 text-dark-text-tertiary">{source}</p>
    </div>
  )
}
