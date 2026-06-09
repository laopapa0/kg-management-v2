import {
  Link, ArrowRight, Combine, GitBranch, Shuffle,
  Layers, Replace, ExternalLink, ArrowLeftRight, TrendingUp,
  TrendingDown, Activity, BarChart3, PieChart, LineChart,
  Network, Share2, Merge, Split, Workflow,
} from 'lucide-react'

export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Link, ArrowRight, Combine, GitBranch, Shuffle,
  Layers, Replace, ExternalLink, ArrowLeftRight, TrendingUp,
  TrendingDown, Activity, BarChart3, PieChart, LineChart,
  Network, Share2, Merge, Split, Workflow,
}

export const ICON_NAMES = Object.keys(ICON_MAP)

export function IconRenderer({ name, size = 16 }: { name: string; size?: number }) {
  const Comp = ICON_MAP[name] || Link
  return <Comp size={size} className="text-dark-text-secondary" />
}
