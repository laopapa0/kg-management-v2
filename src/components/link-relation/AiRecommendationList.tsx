import { useState, useMemo, useRef } from 'react'
import { Sparkles, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import EmptyState from '@/components/empty-state/EmptyState'
import type { AiRecommendation } from '@/models/linkRelationModel'

interface Props {
  recommendations: AiRecommendation[]
  onApply?: (ids: string[]) => void
}

const PAGE_SIZE = 20

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500'
  if (confidence >= 0.5) return 'bg-yellow-500'
  return 'bg-slate-500'
}

function confidencePct(c: number): string {
  return `${Math.round(c * 100)}%`
}

export default function AiRecommendationList({ recommendations, onApply }: Props) {
  const [filter, setFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all')
  const [sourceDept, setSourceDept] = useState('全部')
  const [targetDept, setTargetDept] = useState('全部')
  const [relationType, setRelationType] = useState('全部')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set())
  const [showConfirm, setShowConfirm] = useState(false)
  const pendingApplyRef = useRef<string[]>([])

  const deptOptions = useMemo(
    () => ['全部', '财务部', '市场部', '网络部', '客服部'],
    [],
  )

  const relationTypeOptions = useMemo(
    () => ['全部', ...new Set(recommendations.map((r) => r.relationTypeName))],
    [recommendations],
  )

  const sorted = useMemo(
    () => [...recommendations].sort((a, b) => b.confidence - a.confidence),
    [recommendations],
  )

  const filtered = useMemo(() => {
    let result = sorted
    if (filter === 'high') result = result.filter((r) => r.confidence >= 0.8)
    else if (filter === 'mid') result = result.filter((r) => r.confidence >= 0.5 && r.confidence < 0.8)
    else if (filter === 'low') result = result.filter((r) => r.confidence < 0.5)

    if (sourceDept !== '全部') result = result.filter((r) => r.sourceDepartment === sourceDept)
    if (targetDept !== '全部') result = result.filter((r) => r.targetDepartment === targetDept)
    if (relationType !== '全部') result = result.filter((r) => r.relationTypeName === relationType)

    return result
  }, [sorted, filter, sourceDept, targetDept, relationType])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const pageIds = new Set(paginated.map((r) => r.id))
  const isAllPageSelected = paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id))

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      if (isAllPageSelected) {
        const next = new Set(prev)
        for (const id of pageIds) next.delete(id)
        return next
      }
      return new Set([...prev, ...pageIds])
    })
  }

  function openApplyConfirm() {
    pendingApplyRef.current = paginated.filter((r) => selectedIds.has(r.id)).map((r) => r.id)
    setShowConfirm(true)
  }

  function handleApply() {
    const ids = pendingApplyRef.current
    if (ids.length === 0) return
    onApply?.(ids)
    setAppliedIds((prev) => new Set([...prev, ...ids]))
    setSelectedIds(new Set())
    setShowConfirm(false)
    toast.success(`已应用 ${ids.length} 条AI推荐`, {
      description: '点击撤销',
      action: {
        label: '撤销',
        onClick: () => {
          setAppliedIds((prev) => {
            const next = new Set(prev)
            for (const id of ids) next.delete(id)
            return next
          })
        },
      },
    })
  }

  const selectedCount = paginated.filter((r) => selectedIds.has(r.id)).length

  if (recommendations.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="size-6" />}
        title="暂无AI推荐"
        description="当前没有AI推荐的关系数据"
      />
    )
  }

  return (
    <div data-testid="ai-recommendation-list">
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <Select
          value={filter}
          onValueChange={(v) => { setFilter(v as typeof filter); setPage(1) }}
        >
          <SelectTrigger data-testid="ai-confidence-filter" className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            <SelectItem value="high">{'>'}80%</SelectItem>
            <SelectItem value="mid">50-80%</SelectItem>
            <SelectItem value="low">{'<'}50%</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceDept} onValueChange={(v) => { setSourceDept(v); setPage(1) }}>
          <SelectTrigger data-testid="ai-src-dept-filter" className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {deptOptions.map((d) => (
              <SelectItem key={d} value={d}>{d === '全部' ? '来源指标部门' : d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={targetDept} onValueChange={(v) => { setTargetDept(v); setPage(1) }}>
          <SelectTrigger data-testid="ai-tgt-dept-filter" className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {deptOptions.map((d) => (
              <SelectItem key={d} value={d}>{d === '全部' ? '目标指标部门' : d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={relationType} onValueChange={(v) => { setRelationType(v); setPage(1) }}>
          <SelectTrigger data-testid="ai-relation-type-filter" className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {relationTypeOptions.map((t) => (
              <SelectItem key={t} value={t}>{t === '全部' ? '关系类型' : t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-dark-text-secondary">
          共 {filtered.length} 条
        </span>
      </div>

      {/* 操作栏 */}
      {selectedCount > 0 && (
        <div data-testid="ai-action-bar" className="mb-3 flex items-center gap-3">
          <span data-testid="ai-selected-count" className="text-sm text-dark-text-primary">
            已选 {selectedCount} 条
          </span>
          <Button
            data-testid="ai-apply-button"
            onClick={openApplyConfirm}
            size="sm"
          >
            应用
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-dark-border overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-dark-border text-dark-text-secondary">
              <th className="text-left font-medium px-3 py-3 w-10">
                <input
                  type="checkbox"
                  data-testid="ai-check-all"
                  checked={isAllPageSelected}
                  onChange={toggleAll}
                  className="size-4 cursor-pointer accent-dark-accent-primary"
                />
              </th>
              <th className="text-left font-medium px-4 py-3 w-16">置信度</th>
              <th className="text-left font-medium px-4 py-3">来源指标</th>
              <th className="text-left font-medium px-4 py-3">目标指标</th>
              <th className="text-left font-medium px-4 py-3">关系类型</th>
              <th className="text-left font-medium px-4 py-3">推荐理由</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((rec) => {
              const isApplied = appliedIds.has(rec.id)
              return (
                <tr
                  key={rec.id}
                  data-testid="ai-rec-row"
                  className={`border-b border-dark-border last:border-b-0 hover:bg-dark-page ${isApplied ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      data-testid="ai-check-item"
                      checked={selectedIds.has(rec.id)}
                      disabled={isApplied}
                      onChange={() => toggleSelect(rec.id)}
                      className="size-4 cursor-pointer accent-dark-accent-primary disabled:cursor-not-allowed disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      data-testid={`ai-confidence-${rec.id}`}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-white ${confidenceColor(rec.confidence)}`}
                    >
                      <TrendingUp size={12} className="mr-1" />
                      {confidencePct(rec.confidence)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${isApplied ? 'text-dark-text-tertiary' : 'text-dark-text-primary'}`}>
                    {rec.sourceIndicatorName}
                    {isApplied && <span className="ml-2 text-[11px] text-dark-text-tertiary">已应用</span>}
                  </td>
                  <td className={`px-4 py-3 ${isApplied ? 'text-dark-text-tertiary' : 'text-dark-text-primary'}`}>{rec.targetIndicatorName}</td>
                  <td className={`px-4 py-3 ${isApplied ? 'text-dark-text-tertiary' : 'text-dark-text-secondary'}`}>{rec.relationTypeName}</td>
                  <td className={`px-4 py-3 max-w-[200px] truncate ${isApplied ? 'text-dark-text-tertiary' : 'text-dark-text-secondary'}`}>{rec.reason}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div data-testid="ai-pagination" className="flex items-center justify-center gap-1 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              data-testid={`ai-page-${p}`}
              onClick={() => setPage(p)}
              className={`h-8 w-8 rounded text-sm ${
                p === page
                  ? 'bg-dark-accent-primary text-white'
                  : 'text-dark-text-secondary hover:bg-dark-tree-hover-bg'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* 确认弹窗 */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-dark-card-l1 text-dark-text-primary border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-dark-text-primary">应用AI推荐</AlertDialogTitle>
            <AlertDialogDescription className="text-dark-text-secondary">
              确定要应用这 {selectedCount} 条推荐到血缘画布？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="ai-apply-cancel" className="border-dark-border text-dark-text-primary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary">取消</AlertDialogCancel>
            <Button data-testid="ai-apply-confirm" onClick={handleApply}>确定</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
