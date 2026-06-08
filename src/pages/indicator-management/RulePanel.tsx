import { useMemo, useState, useEffect } from 'react'
import { Scale, Search } from 'lucide-react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import RuleSummaryBadge from '@/components/rule/RuleSummaryBadge'
import TreeSearchInput from '@/components/search/TreeSearchInput'
import AttachedBadge from '@/components/connection/AttachedBadge'
import BatchDetachMenu from '@/components/connection/BatchDetachMenu'
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

export default function RulePanel() {
  const rules = useAttachmentStore((state) => state.rules)
  const indicators = useAttachmentStore((state) => state.indicators)
  const ruleParameters = useAttachmentStore((state) => state.ruleParameters)

  const tree = useMemo(() => buildRuleTree(rules), [rules])

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')

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

  const rootNodes: RuleTreeNode[] = useMemo(
    () =>
      tree.map((node) => ({
        id: node.id,
        rule: node,
        children:
          node.children && node.children.length > 0
            ? node.children.map((child) => ({ id: child.id, rule: child }))
            : undefined,
      })),
    [tree],
  )

  const isSearchActive = Boolean(debouncedTerm)
  const hasMatches = matchedIds.size > 0

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
      <div className="sticky top-0 z-10 bg-dark-card-l1 pb-2 pt-1">
        <TreeSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
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
          nodes={rootNodes}
          expanded={expanded}
          onExpandedChange={setUserExpanded}
          renderNode={(node, { isHovered }) => {
            const fullRule = nodeMap.get(node.id)
            if (!fullRule) return null

            const count = attachedCountByRule.get(fullRule.id) ?? 0
            const params = parametersByRule.get(fullRule.id) ?? []
            const attachedList = attachedIndicatorsByRule.get(fullRule.id) ?? []
            const isDimmed =
              isSearchActive &&
              !matchedIds.has(fullRule.id) &&
              !ancestorIds.has(fullRule.id)

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
                  className={[
                    'flex items-center justify-between gap-2 transition-opacity duration-200',
                    isDimmed ? 'opacity-[0.35]' : 'opacity-100',
                  ].join(' ')}
                >
                  <span className="truncate text-sm text-dark-text-primary">
                    {fullRule.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
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
                            ? 'bg-[#3B82F6]/15 text-[#4DA6FF]'
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
    </div>
  )
}
