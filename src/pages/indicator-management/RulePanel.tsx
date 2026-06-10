import { useMemo, useState, useEffect, useCallback } from 'react'
import { Scale, Search, Settings } from 'lucide-react'
import ParameterDrawer from './ParameterDrawer'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import RuleSummaryBadge from '@/components/rule/RuleSummaryBadge'
import TreeSearchInput, { type SearchMode } from '@/components/search/TreeSearchInput'
import AttachedBadge from '@/components/connection/AttachedBadge'
import BatchDetachMenu from '@/components/connection/BatchDetachMenu'
import { Switch } from '@/components/ui/switch'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
import { buildRuleTree } from '@/models/indicatorAttachmentModel'
import { walkRules } from '@/utils/attachmentTree'

interface RuleTreeNode extends TreeNode {
  rule: Rule
}

interface SearchResult {
  matchedIds: Set<string>
  ancestorIds: Set<string>
}

function computeSearchResult(tree: Rule[], term: string): SearchResult {
  if (!term) {
    return { matchedIds: new Set<string>(), ancestorIds: new Set<string>() }
  }
  const lower = term.toLowerCase()
  const matchedIds = new Set<string>()

  function dfs(node: Rule): boolean {
    let isMatch = node.name.toLowerCase().includes(lower)
    for (const child of node.children ?? []) {
      if (dfs(child)) isMatch = true
    }
    if (isMatch) matchedIds.add(node.id)
    return isMatch
  }

  for (const root of tree) dfs(root)

  const ancestorIds = new Set<string>()
  function markAncestors(nodes: Rule[]) {
    for (const node of nodes) {
      for (const child of node.children ?? []) {
        if (matchedIds.has(child.id) || ancestorIds.has(child.id)) {
          ancestorIds.add(node.id)
        }
        markAncestors(node.children ?? [])
      }
    }
  }
  markAncestors(tree)

  return { matchedIds, ancestorIds }
}

export default function RulePanel({ selectedIndicatorId }: { selectedIndicatorId?: string | null }) {
  const rules = useAttachmentStore((state) => state.rules)
  const setRules = useAttachmentStore((state) => state.setRules)
  const indicators = useAttachmentStore((state) => state.indicators)
  const ruleParameters = useAttachmentStore((state) => state.ruleParameters)

  const tree = useMemo(() => buildRuleTree(rules), [rules])

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('highlight')
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 150)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const [userExpanded, setUserExpanded] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of tree) {
      if (node.children && node.children.length > 0) initial.add(node.id)
    }
    return initial
  })

  const { matchedIds, ancestorIds } = useMemo(
    () => computeSearchResult(tree, debouncedTerm),
    [tree, debouncedTerm],
  )

  const expanded = useMemo(() => {
    const next = new Set(userExpanded)
    if (debouncedTerm) {
      for (const id of ancestorIds) next.add(id)
    }
    return next
  }, [userExpanded, ancestorIds, debouncedTerm])

  const attachedCountByRule = useMemo(() => {
    const map = new Map<string, number>()
    for (const indicator of indicators) {
      for (const ruleId of indicator.ruleIds) {
        map.set(ruleId, (map.get(ruleId) ?? 0) + 1)
      }
    }
    return map
  }, [indicators])

  const attachedIndicatorsByRule = useMemo(() => {
    const map = new Map<string, { id: string; name: string }[]>()
    for (const indicator of indicators) {
      for (const ruleId of indicator.ruleIds) {
        const list = map.get(ruleId) ?? []
        list.push({ id: indicator.id, name: indicator.name })
        map.set(ruleId, list)
      }
    }
    return map
  }, [indicators])

  const parametersByRule = useMemo(() => {
    const map = new Map<string, RuleParameter[]>()
    for (const param of ruleParameters) {
      const list = map.get(param.ruleId) ?? []
      list.push(param)
      map.set(param.ruleId, list)
    }
    return map
  }, [ruleParameters])

  const nodeMap = useMemo(() => {
    const map = new Map<string, Rule>()
    walkRules(tree, (node) => {
      map.set(node.id, node)
    })
    return map
  }, [tree])

  function toRuleTreeNode(node: Rule): RuleTreeNode {
    return {
      id: node.id,
      rule: node,
      children: node.children?.length ? node.children.map(toRuleTreeNode) : undefined,
    }
  }

  const rootNodes: RuleTreeNode[] = useMemo(
    () => tree.map(toRuleTreeNode),
    [tree],
  )

  function filterRuleTreeNodes(
    nodes: RuleTreeNode[],
    matched: Set<string>,
    ancestors: Set<string>,
  ): RuleTreeNode[] {
    return nodes
      .map((node) => {
        const filteredChildren = node.children
          ? filterRuleTreeNodes(node.children, matched, ancestors)
          : undefined
        const isMatch = matched.has(node.id)
        const isAncestor = ancestors.has(node.id)
        const hasMatchingChildren = filteredChildren && filteredChildren.length > 0
        if (isMatch || isAncestor || hasMatchingChildren) {
          return { ...node, children: filteredChildren }
        }
        return null
      })
      .filter(Boolean) as RuleTreeNode[]
  }

  const filteredRootNodes = useMemo(() => {
    if (searchMode !== 'filter' || !debouncedTerm) return rootNodes
    return filterRuleTreeNodes(rootNodes, matchedIds, ancestorIds)
  }, [searchMode, debouncedTerm, rootNodes, matchedIds, ancestorIds])

  const isSearchActive = Boolean(debouncedTerm)
  const hasMatches = matchedIds.size > 0

  const selectedIndicator = useMemo(
    () => (selectedIndicatorId ? indicators.find((i) => i.id === selectedIndicatorId) : null),
    [indicators, selectedIndicatorId],
  )

  const selectedRuleIds = useMemo(
    () => new Set(selectedIndicator?.ruleIds ?? []),
    [selectedIndicator],
  )

  const toggleRuleForIndicator = useCallback(
    (ruleId: string) => {
      if (!selectedIndicator) return
      const hasRule = selectedIndicator.ruleIds.includes(ruleId)
      const nextRuleIds = hasRule
        ? selectedIndicator.ruleIds.filter((id) => id !== ruleId)
        : [...selectedIndicator.ruleIds, ruleId]
      const next = indicators.map((i) =>
        i.id === selectedIndicator.id ? { ...i, ruleIds: nextRuleIds } : i,
      )
      setRules(rules) // keep rules unchanged; only indicators change
      const store = useAttachmentStore.getState()
      store.setIndicators(next)
    },
    [selectedIndicator, indicators, setRules, rules],
  )

  if (tree.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-2 pb-2" data-testid="rule-panel">
        <EmptyState
          icon={<Scale className="size-6" />}
          title="暂无规则"
          description="系统管理员尚未配置规则"
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2" data-testid="rule-panel">
      <div className="sticky top-0 z-20 bg-dark-card-l1/95 pb-2 pt-1 backdrop-blur-sm">
        <TreeSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          searchMode={searchMode}
          onModeChange={setSearchMode}
          placeholder="搜索规则..."
          data-testid="rule-search-input"
        />
      </div>

      {isSearchActive && !hasMatches ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="未找到匹配规则"
          description={`没有规则匹配 "${debouncedTerm}"，请尝试其他关键词`}
        />
      ) : (
        <TreeView
          nodes={filteredRootNodes}
          expanded={expanded}
          onExpandedChange={setUserExpanded}
          renderNode={(node, { isHovered }) => {
            const fullRule = nodeMap.get(node.id)
            if (!fullRule) return null

            const count = attachedCountByRule.get(fullRule.id) ?? 0
            const params = parametersByRule.get(fullRule.id) ?? []
            const attachedList = attachedIndicatorsByRule.get(fullRule.id) ?? []
            const isDisabled = fullRule.enabled === false
            const isDimmed =
              isSearchActive &&
              !matchedIds.has(fullRule.id) &&
              !ancestorIds.has(fullRule.id)

            const handleToggleEnabled = () => {
              const next = rules.map((r) =>
                r.id === fullRule.id ? { ...r, enabled: !(r.enabled ?? true) } : r,
              )
              setRules(next)
            }

            return (
              <BatchDetachMenu
                detachOptions={
                  count > 0
                    ? [
                        {
                          label: '移除所有规则挂靠',
                          count,
                          onConfirm: () => handleDetachAllFromRule(fullRule.id),
                        },
                      ]
                    : []
                }
              >
                <div
                  data-testid={`rule-row-${fullRule.id}`}
                  data-rule-id={fullRule.id}
                  data-dimmed={isDimmed || undefined}
                  data-disabled={isDisabled || undefined}
                  className={[
                    'flex items-center justify-between gap-2 transition-all duration-200',
                    isDimmed ? 'opacity-[0.35] scale-[0.98] pointer-events-none' : '',
                    isDisabled && !isDimmed ? 'opacity-40' : '',
                    !isDimmed && !isDisabled ? 'opacity-100' : '',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2">
                    {selectedIndicatorId && (
                      <span />)}
                    <Switch
                      data-testid={`rule-toggle-${fullRule.id}`}
                      checked={fullRule.enabled ?? true}
                      onCheckedChange={handleToggleEnabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="truncate text-sm text-dark-text-primary">
                      {fullRule.name}
                    </span>
                    {isDisabled && (
                      <span className="text-xs text-dark-text-tertiary">停用</span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      data-testid={`rule-config-btn-${fullRule.id}`}
                      onClick={() => {
                        setSelectedRuleId(fullRule.id)
                        setDrawerOpen(true)
                      }}
                      className="rounded p-0.5 text-dark-text-tertiary transition-colors hover:bg-dark-card-l2 hover:text-dark-text-secondary"
                      title="配置参数"
                    >
                      <Settings className="size-3.5" />
                    </button>
                    {selectedIndicatorId && selectedRuleIds.has(fullRule.id) && (
                      <button
                        type="button"
                        data-testid={`rule-config-settings-${fullRule.id}`}
                        onClick={() => {
                          setSelectedRuleId(fullRule.id)
                          setDrawerOpen(true)
                        }}
                        className="rounded px-2 py-0.5 text-xs font-medium text-dark-accent-primary border border-dark-accent-primary/30 hover:bg-dark-accent-primary/10"
                      >
                        设置
                      </button>
                    )}
                    <RuleSummaryBadge rule={fullRule} parameters={params} />
                    {isHovered && count > 0 ? (
                      <AttachedBadge
                        count={count}
                        indicators={attachedList}
                        onDeleteOne={(indicatorId) =>
                          handleDetachOneFromRule(fullRule.id, indicatorId)
                        }
                        onDeleteAll={() => handleDetachAllFromRule(fullRule.id)}
                      />
                    ) : (
                      <span
                        data-testid={`rule-count-${fullRule.id}`}
                        className={[
                          'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                          count > 0
                            ? 'bg-dark-accent-primary/15 text-dark-accent-primary'
                            : 'bg-dark-card-l2 text-dark-text-tertiary',
                        ].join(' ')}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </BatchDetachMenu>
            )
          }}
        />
      )}

      {selectedRuleId && (
        <ParameterDrawer
          ruleId={selectedRuleId}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open)
            if (!open) setSelectedRuleId(null)
          }}
        />
      )}
    </div>
  )
}
