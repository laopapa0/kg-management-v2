import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { BookOpen } from 'lucide-react'
import { getGeneratedReports, getReportsByPlanId } from '@/utils/generatedReportStorage'
import { useCommentStore } from '@/stores/commentStore'
import CommentThread from '@/components/report/CommentThread'
import KnowledgeGraphChart from '@/components/report/KnowledgeGraphChart'
import KnowledgeEditDialog from '@/components/knowledge/KnowledgeEditDialog'
import type { KnowledgeGraphNode, KnowledgeGraphEdge } from '@/components/report/KnowledgeGraphChart'
import type { GeneratedReport, GeneratedReportSection } from '@/models/generatedReportModel'

function sectionTitleMap(sections: GeneratedReportSection[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const s of sections) {
    map.set(s.id, s.title)
  }
  return map
}

function tryParseKnowledgeGraph(content: string): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
      return data
    }
  } catch {
    // not JSON
  }
  return null
}

export default function ReportDetailPage() {
  const navigate = useNavigate()
  const { reportId } = useParams<{ reportId: string }>()
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [kgEdgesMap, setKgEdgesMap] = useState<Record<string, KnowledgeGraphEdge[]>>({})
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSectionId, setEditSectionId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const allComments = useCommentStore((state) => state.comments)

  const report = useMemo(() => {
    const all = getGeneratedReports()
    return all.find((r) => r.id === reportId) ?? null
  }, [reportId])

  const versions = useMemo(() => {
    if (!report) return []
    return getReportsByPlanId(report.planId)
  }, [report])

  const compareReport = useMemo(() => {
    if (!compareVersionId) return null
    return versions.find((v) => v.id === compareVersionId) ?? null
  }, [compareVersionId, versions])

  const changedSectionIds = useMemo(() => {
    if (!report || !compareReport) return new Set<string>()
    const currentTitles = sectionTitleMap(report.sections)
    const compareTitles = sectionTitleMap(compareReport.sections)
    const changed = new Set<string>()
    for (const s of report.sections) {
      if (compareTitles.get(s.id) !== s.title) {
        changed.add(s.id)
      }
    }
    for (const s of compareReport.sections) {
      if (currentTitles.get(s.id) !== s.title) {
        changed.add(s.id)
      }
    }
    return changed
  }, [report, compareReport])

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  function getCommentCount(sectionId: string): number {
    const targetId = `${report!.id}:${report!.version}:${sectionId}`
    return allComments.filter((c) => c.targetId === targetId && c.targetType === 'report-section').length
  }

  function handleEdgeDelete(sectionId: string, edge: KnowledgeGraphEdge) {
    const current = kgEdgesMap[sectionId] ?? []
    setKgEdgesMap((prev) => ({
      ...prev,
      [sectionId]: current.filter((e) => !(e.source === edge.source && e.target === edge.target)),
    }))
    toast('关联关系已更新，建议重跑报告', {
      action: {
        label: '重跑',
        onClick: () => navigate('/reports/generate'),
      },
    })
  }

  function handleEdgeChange(sectionId: string, oldEdge: KnowledgeGraphEdge, newEdge: KnowledgeGraphEdge) {
    const current = kgEdgesMap[sectionId] ?? []
    setKgEdgesMap((prev) => ({
      ...prev,
      [sectionId]: current.map((e) =>
        e.source === oldEdge.source && e.target === oldEdge.target ? newEdge : e,
      ),
    }))
    toast('关联关系已更新，建议重跑报告', {
      action: {
        label: '重跑',
        onClick: () => navigate('/reports/generate'),
      },
    })
  }

  function openKnowledgeEdit(section: GeneratedReportSection) {
    setEditSectionId(section.id)
    setEditContent(section.content)
    setEditDialogOpen(true)
  }

  function handleKnowledgeSave(content: string) {
    // TODO: 实际业务中应更新知识库 store，关联到对应知识文件
    // 当前仅 toast 提示，不实现复杂内部逻辑（#80 要求）
    toast('知识已更新，建议重跑报告', {
      action: {
        label: '重跑',
        onClick: () => navigate('/reports/generate'),
      },
    })
  }

  if (!report) {
    return (
      <div className="flex h-full items-center justify-center bg-dark-page p-6 text-dark-text-primary">
        <p className="text-dark-text-secondary">报告不存在</p>
      </div>
    )
  }

  return (
    <div data-testid="report-detail-page" className="flex h-full flex-col gap-4 bg-dark-page p-6 text-dark-text-primary">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-h2 font-semibold text-dark-text-primary">{report.planName}</h2>
          <span data-testid="current-version-badge" className="rounded-full bg-dark-card-l2 px-3 py-1 text-sm text-dark-text-secondary">
            {report.version}
          </span>
          {compareReport && (
            <span className="text-sm text-dark-text-secondary">
              vs {compareReport.version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="rerun-generate-button"
            onClick={() => navigate('/reports/generate')}
            className="rounded-md bg-dark-accent-primary px-3 py-1 text-sm text-white hover:bg-dark-accent-primary/90"
          >
            重跑生成新版本
          </button>
          {compareReport && (
            <button
              data-testid="exit-compare-button"
              onClick={() => setCompareVersionId(null)}
              className="rounded-md border border-dark-border px-3 py-1 text-sm text-dark-text-secondary hover:bg-dark-card-l2"
            >
              退出对比
            </button>
          )}
        </div>
      </div>

      {/* 主体：内容 + 版本历史 */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* 报告内容 */}
        <div className="flex-1 rounded-lg border border-dark-border bg-dark-card-l1 p-4 overflow-auto">
          {compareReport ? (
            /* 对比模式：并排显示 */
            <div className="flex gap-4">
              {/* 左侧：当前版本 */}
              <div data-testid="compare-left" className="flex-1">
                <h4 className="mb-3 text-sm font-medium text-dark-text-secondary">{report.version}</h4>
                {report.sections.map((section) => (
                  <div
                    key={section.id}
                    data-testid={`compare-section-${section.id}`}
                    className={`mb-4 rounded-md border p-3 ${
                      changedSectionIds.has(section.id)
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-dark-border bg-dark-card-l2'
                    }`}
                  >
                    <h3 className="mb-2 font-medium text-dark-text-primary">{section.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-dark-text-secondary">{section.content}</p>
                  </div>
                ))}
              </div>
              {/* 右侧：对比版本 */}
              <div data-testid="compare-right" className="flex-1">
                <h4 className="mb-3 text-sm font-medium text-dark-text-secondary">{compareReport.version}</h4>
                {compareReport.sections.map((section) => (
                  <div
                    key={section.id}
                    data-testid={`compare-section-right-${section.id}`}
                    className={`mb-4 rounded-md border p-3 ${
                      changedSectionIds.has(section.id)
                        ? 'border-yellow-500/30 bg-yellow-500/10'
                        : 'border-dark-border bg-dark-card-l2'
                    }`}
                  >
                    <h3 className="mb-2 font-medium text-dark-text-primary">{section.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-dark-text-secondary">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 正常模式 */
            report.sections.map((section) => {
              const count = getCommentCount(section.id)
              const isExpanded = expandedSections.has(section.id)
              const kgData = tryParseKnowledgeGraph(section.content)
              if (kgData) {
                const edges = kgEdgesMap[section.id] ?? kgData.edges
                return (
                  <div key={section.id} data-testid={`report-section-${section.id}`} className="mb-4 rounded-md border border-dark-border bg-dark-card-l2 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium text-dark-text-primary">{section.title}</h3>
                    </div>
                    <KnowledgeGraphChart
                      nodes={kgData.nodes}
                      edges={edges}
                      editable
                      onEdgeDelete={(edge) => handleEdgeDelete(section.id, edge)}
                      onEdgeChange={(oldEdge, newEdge) => handleEdgeChange(section.id, oldEdge, newEdge)}
                    />
                  </div>
                )
              }
              return (
                <div key={section.id} data-testid={`report-section-${section.id}`} className="mb-4 rounded-md border border-dark-border bg-dark-card-l2 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-dark-text-primary">{section.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`update-knowledge-btn-${section.id}`}
                        onClick={() => openKnowledgeEdit(section)}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-dark-text-secondary hover:bg-dark-accent-primary/10 hover:text-dark-accent-primary"
                        title="更新知识"
                      >
                        <BookOpen size={14} />
                        更新知识
                      </button>
                      {count > 0 && (
                        <span data-testid={`comment-badge-${section.id}`} className="rounded-full bg-dark-accent-primary/20 px-2 py-0.5 text-xs text-dark-accent-primary">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-dark-text-secondary">{section.content}</p>
                  <button
                    data-testid={`comment-toggle-${section.id}`}
                    onClick={() => toggleSection(section.id)}
                    className="mt-2 text-xs text-dark-text-secondary hover:text-dark-accent-primary"
                  >
                    评论 ({count})
                  </button>
                  {isExpanded && (
                    <CommentThread
                      targetId={`${report.id}:${report.version}:${section.id}`}
                      targetType="report-section"
                    />
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* 版本历史面板 */}
        <div className="w-64 flex-shrink-0 rounded-lg border border-dark-border bg-dark-card-l1 p-4 overflow-auto">
          <h3 className="mb-3 font-medium text-dark-text-primary">版本历史</h3>
          <div className="flex flex-col gap-2">
            {versions.map((v) => (
              <div
                key={v.id}
                data-testid={`version-timeline-${v.id}`}
                onClick={() => {
                  setCompareVersionId(null)
                  navigate(`/reports/${v.id}`)
                }}
                className={`cursor-pointer rounded-md border p-2 text-sm ${
                  v.id === report.id
                    ? 'border-dark-accent-primary bg-dark-accent-primary/10'
                    : 'border-dark-border bg-dark-card-l2 hover:border-dark-border-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-dark-text-primary">{v.version}</span>
                  <span className="text-xs text-dark-text-secondary">
                    {v.triggerType === 'manual' ? '手动' : '自动'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-dark-text-secondary">
                  {new Date(v.generatedAt).toLocaleDateString('zh-CN')}
                </div>
                {v.id !== report.id && (
                  <button
                    data-testid={`version-compare-${v.id}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCompareVersionId(v.id)
                    }}
                    className="mt-1 text-xs text-dark-accent-primary hover:underline"
                  >
                    对比
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <KnowledgeEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialContent={editContent}
        onSave={handleKnowledgeSave}
        title="更新知识"
      />
    </div>
  )
}
