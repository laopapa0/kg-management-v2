import { useMemo } from 'react'
import { Scale } from 'lucide-react'
import TreeView, { type TreeNode } from '@/components/tree/TreeView'
import EmptyState from '@/components/empty-state/EmptyState'
import RuleSummaryBadge from '@/components/rule/RuleSummaryBadge'
import { useAttachmentStore } from '@/stores/attachmentStore'
import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'
import { buildRuleTree } from '@/models/indicatorAttachmentModel'
import { walkRules } from '@/utils/attachmentTree'

interface RuleTreeNode extends TreeNode {
  rule: Rule
}

export default function RulePanel() {
  const rules = useAttachmentStore((state) => state.rules)
  const indicators = useAttachmentStore((state) => state.indicators)
  const ruleParameters = useAttachmentStore((state) => state.ruleParameters)

  const tree = useMemo(() => buildRuleTree(rules), [rules])

  const attachedCountByRule = useMemo(() => {
    const map = new Map<string, number>()
    for (const indicator of indicators) {
      for (const ruleId of indicator.ruleIds) {
        map.set(ruleId, (map.get(ruleId) ?? 0) + 1)
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
      })),
    [tree],
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
      <TreeView
        nodes={rootNodes}
        renderNode={(node) => {
          const fullRule = nodeMap.get(node.id)
          if (!fullRule) return null

          const count = attachedCountByRule.get(fullRule.id) ?? 0
          const params = parametersByRule.get(fullRule.id) ?? []

          return (
            <div
              data-testid={`rule-row-${fullRule.id}`}
              className="flex items-center justify-between gap-2"
            >
              <span className="truncate text-sm text-dark-text-primary">
                {fullRule.name}
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <RuleSummaryBadge rule={fullRule} parameters={params} />
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
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
