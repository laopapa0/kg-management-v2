import { useState, useMemo, useCallback } from 'react'
import TreeView from '@/components/tree/TreeView'
import { buildIndicatorTree } from '@/utils/attachmentTree'
import type { IndicatorTreeNode } from '@/utils/attachmentTree'
import type { TagNode, Rule, IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { buildTagTree } from '@/models/indicatorAttachmentModel'
import {
  getDepartments,
  getIndicators,
  getTagNodes,
  getRules,
} from '@/utils/attachmentStorage'

export interface FilterScopeValue {
  includedIndicatorIds: string[]
  excludedRuleIds: string[]
  excludedLinkRelationIds: string[]
}

export interface FilterScopeSelectorProps {
  value: FilterScopeValue
  onChange: (value: FilterScopeValue) => void
}

/** 标准关联关系类型 */
const LINK_RELATION_TYPES = [
  { id: 'rel-depends', name: '依赖关系' },
  { id: 'rel-causes', name: '因果关系' },
  { id: 'rel-aggregates', name: '聚合关系' },
  { id: 'rel-derived', name: '衍生关系' },
  { id: 'rel-correlates', name: '相关关系' },
]

/** 收集某节点下的所有后代 ID（含自身） */
function collectDescendantIds(node: IndicatorTreeNode): string[] {
  const result: string[] = [node.id]
  if (node.children) {
    for (const child of node.children) {
      result.push(...collectDescendantIds(child))
    }
  }
  return result
}

/** 从所有指标中找出关联了指定标签的指标 ID */
function getIndicatorsByTagIds(
  indicators: IndicatorAttachment[],
  tagIds: Set<string>,
): string[] {
  return indicators
    .filter((ind) => ind.tagIds.some((tid) => tagIds.has(tid)))
    .map((ind) => ind.id)
}

export default function FilterScopeSelector({ value, onChange }: FilterScopeSelectorProps) {
  // ── 读取跨部门全量数据 ──
  const departments = useMemo(() => getDepartments(), [])
  const allIndicators = useMemo(
    () => departments.flatMap((d) => getIndicators(d.id)),
    [departments],
  )
  const allTagNodes = useMemo(
    () => departments.flatMap((d) => getTagNodes(d.id)),
    [departments],
  )
  const allRules = useMemo(() => getRules(), [])

  const indicatorTree = useMemo(() => buildIndicatorTree(allIndicators), [allIndicators])
  const tagTree = useMemo(() => buildTagTree(allTagNodes), [allTagNodes])

  // ── 本地选中状态（与 props.value 同步） ──
  const [checkedIndicatorIds, setCheckedIndicatorIds] = useState<Set<string>>(
    new Set(value.includedIndicatorIds),
  )
  const [checkedTagIds, setCheckedTagIds] = useState<Set<string>>(new Set())
  const [checkedRuleIds, setCheckedRuleIds] = useState<Set<string>>(new Set(value.excludedRuleIds))
  const [checkedRelationIds, setCheckedRelationIds] = useState<Set<string>>(
    new Set(value.excludedLinkRelationIds),
  )

  // ── 计算并集 ──
  const includedByTree = useMemo(() => {
    return new Set(checkedIndicatorIds)
  }, [checkedIndicatorIds])

  const includedByTags = useMemo(() => {
    return new Set(getIndicatorsByTagIds(allIndicators, checkedTagIds))
  }, [allIndicators, checkedTagIds])

  const unionIndicatorIds = useMemo(() => {
    const union = new Set(includedByTree)
    for (const id of includedByTags) {
      union.add(id)
    }
    return union
  }, [includedByTree, includedByTags])

  // ── 实时统计 ──
  const stats = useMemo(() => {
    const includedIndicators = allIndicators.filter((ind) => unionIndicatorIds.has(ind.id))
    const deptSet = new Set(includedIndicators.map((ind) => ind.department).filter(Boolean))
    return {
      count: includedIndicators.length,
      departments: deptSet.size,
    }
  }, [allIndicators, unionIndicatorIds])

  // ── 触发 onChange ──
  const emitChange = useCallback(
    (
      nextTreeIndicators: Set<string>,
      nextTagIds: Set<string>,
      nextRules: Set<string>,
      nextRelations: Set<string>,
    ) => {
      const byTags = new Set(getIndicatorsByTagIds(allIndicators, nextTagIds))
      const union = new Set(nextTreeIndicators)
      for (const id of byTags) {
        union.add(id)
      }
      onChange({
        includedIndicatorIds: Array.from(union),
        excludedRuleIds: Array.from(nextRules),
        excludedLinkRelationIds: Array.from(nextRelations),
      })
    },
    [allIndicators, onChange],
  )

  // ── 指标树 checkbox 切换 ──
  const toggleIndicator = useCallback(
    (node: IndicatorTreeNode) => {
      const ids = collectDescendantIds(node)
      const next = new Set(checkedIndicatorIds)
      const allChecked = ids.every((id) => next.has(id))

      if (allChecked) {
        // 全部已勾选 → 取消勾选
        for (const id of ids) {
          next.delete(id)
        }
      } else {
        // 部分或全部未勾选 → 勾选全部
        for (const id of ids) {
          next.add(id)
        }
      }

      setCheckedIndicatorIds(next)
      emitChange(next, checkedTagIds, checkedRuleIds, checkedRelationIds)
    },
    [checkedIndicatorIds, checkedTagIds, checkedRuleIds, checkedRelationIds, emitChange],
  )

  // ── 标签 checkbox 切换 ──
  const toggleTag = useCallback(
    (tagId: string) => {
      const next = new Set(checkedTagIds)
      if (next.has(tagId)) {
        next.delete(tagId)
      } else {
        next.add(tagId)
      }
      setCheckedTagIds(next)
      emitChange(checkedIndicatorIds, next, checkedRuleIds, checkedRelationIds)
    },
    [checkedTagIds, checkedIndicatorIds, checkedRuleIds, checkedRelationIds, emitChange],
  )

  // ── 规则 checkbox 切换 ──
  const toggleRule = useCallback(
    (ruleId: string) => {
      const next = new Set(checkedRuleIds)
      if (next.has(ruleId)) {
        next.delete(ruleId)
      } else {
        next.add(ruleId)
      }
      setCheckedRuleIds(next)
      emitChange(checkedIndicatorIds, checkedTagIds, next, checkedRelationIds)
    },
    [checkedRuleIds, checkedIndicatorIds, checkedTagIds, checkedRelationIds, emitChange],
  )

  // ── 关联关系 checkbox 切换 ──
  const toggleRelation = useCallback(
    (relationId: string) => {
      const next = new Set(checkedRelationIds)
      if (next.has(relationId)) {
        next.delete(relationId)
      } else {
        next.add(relationId)
      }
      setCheckedRelationIds(next)
      emitChange(checkedIndicatorIds, checkedTagIds, checkedRuleIds, next)
    },
    [checkedRelationIds, checkedIndicatorIds, checkedTagIds, checkedRuleIds, emitChange],
  )

  return (
    <div data-testid="filter-scope-selector" className="flex flex-col gap-4 text-dark-text-primary">
      {/* 指标树 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1 p-4">
        <h3 className="mb-2 font-medium text-dark-text-primary">指标范围</h3>
        <TreeView
          nodes={indicatorTree}
          renderNode={(node, context) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                data-testid={`scope-indicator-checkbox-${node.id}`}
                checked={checkedIndicatorIds.has(node.id)}
                onChange={() => toggleIndicator(node)}
                onClick={(e) => e.stopPropagation()}
                className="size-4 cursor-pointer accent-dark-accent-primary"
              />
              <span className={context.isSelected ? 'text-dark-accent-primary' : ''}>
                {node.indicator.name}
              </span>
            </div>
          )}
        />
      </div>

      {/* 标签树 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1 p-4">
        <h3 className="mb-2 font-medium text-dark-text-primary">标签范围</h3>
        <div className="flex flex-col gap-1">
          <TreeView
            nodes={tagTree}
            renderNode={(node) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid={`scope-tag-checkbox-${node.id}`}
                  checked={checkedTagIds.has(node.id)}
                  onChange={() => toggleTag(node.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="size-4 cursor-pointer accent-dark-accent-primary"
                />
                <span className="text-sm text-dark-text-secondary">{node.name}</span>
              </label>
            )}
          />
        </div>
      </div>

      {/* 剔除规则 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1 p-4">
        <h3 className="mb-2 font-medium text-dark-text-primary">剔除规则</h3>
        <div className="flex flex-col gap-1">
          <TreeView
            nodes={allRules}
            renderNode={(node) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid={`scope-rule-checkbox-${node.id}`}
                  checked={checkedRuleIds.has(node.id)}
                  onChange={() => toggleRule(node.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="size-4 cursor-pointer accent-dark-accent-primary"
                />
                <span className="text-sm text-dark-text-secondary">{node.name}</span>
              </label>
            )}
          />
        </div>
      </div>

      {/* 剔除关联关系 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1 p-4">
        <h3 className="mb-2 font-medium text-dark-text-primary">剔除关联关系</h3>
        <div className="flex flex-col gap-1">
          {LINK_RELATION_TYPES.map((rel) => (
            <label key={rel.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                data-testid={`scope-relation-checkbox-${rel.id}`}
                checked={checkedRelationIds.has(rel.id)}
                onChange={() => toggleRelation(rel.id)}
                className="size-4 cursor-pointer accent-dark-accent-primary"
              />
              <span className="text-sm text-dark-text-secondary">{rel.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 实时统计 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l2 p-3 text-sm text-dark-text-secondary">
        已选 <span className="font-medium text-dark-text-primary">{stats.count}</span> 个指标，覆盖{' '}
        <span className="font-medium text-dark-text-primary">{stats.departments}</span> 个部门
      </div>
    </div>
  )
}
