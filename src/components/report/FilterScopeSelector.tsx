import { useState, useMemo, useCallback } from 'react'
import { X, ListFilter, ArrowLeftRight } from 'lucide-react'
import TreeView from '@/components/tree/TreeView'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { buildIndicatorTree } from '@/utils/attachmentTree'
import type { IndicatorTreeNode } from '@/utils/attachmentTree'
import type { TagNode, Rule, IndicatorAttachment } from '@/models/indicatorAttachmentModel'
import { buildTagTree, buildRuleTree } from '@/models/indicatorAttachmentModel'
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
  const ruleTree = useMemo(() => buildRuleTree(allRules), [allRules])

  // ── 本地选中状态（与 props.value 同步） ──
  const [checkedIndicatorIds, setCheckedIndicatorIds] = useState<Set<string>>(
    new Set(value.includedIndicatorIds),
  )
  const [checkedTagIds, setCheckedTagIds] = useState<Set<string>>(new Set())
  const [checkedRuleIds, setCheckedRuleIds] = useState<Set<string>>(new Set(value.excludedRuleIds))
  const [checkedRelationIds, setCheckedRelationIds] = useState<Set<string>>(
    new Set(value.excludedLinkRelationIds),
  )
  const [chipExcludedIds, setChipExcludedIds] = useState<Set<string>>(new Set())
  const [activeDeptName, setActiveDeptName] = useState<string>('全部')
  const [crossDeptMode, setCrossDeptMode] = useState(false)
  const [selectedDeptNames, setSelectedDeptNames] = useState<Set<string>>(
    new Set(departments.map((d) => d.name)),
  )

  const deptIndicators = useMemo(
    () =>
      activeDeptName === '全部'
        ? allIndicators
        : allIndicators.filter((ind) => ind.department === activeDeptName),
    [allIndicators, activeDeptName],
  )
  const deptTagNodes = useMemo(() => {
    if (activeDeptName === '全部') return allTagNodes
    const dept = departments.find((d) => d.name === activeDeptName)
    return dept ? getTagNodes(dept.id) : []
  }, [allTagNodes, activeDeptName, departments])

  const indicatorTree = useMemo(() => buildIndicatorTree(deptIndicators), [deptIndicators])
  const tagTree = useMemo(() => buildTagTree(deptTagNodes), [deptTagNodes])

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
    for (const id of chipExcludedIds) {
      union.delete(id)
    }
    // 按选中部门过滤
    const deptIndicatorIds = new Set(
      allIndicators.filter((ind) => selectedDeptNames.has(ind.department)).map((ind) => ind.id),
    )
    return new Set([...union].filter((id) => deptIndicatorIds.has(id)))
  }, [includedByTree, includedByTags, chipExcludedIds, allIndicators, selectedDeptNames])

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
        for (const id of ids) {
          next.delete(id)
        }
      } else {
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

  // ── Chip 删除 ──
  const removeChipIndicator = useCallback(
    (id: string) => {
      setChipExcludedIds((prev) => new Set(prev).add(id))
      setCheckedIndicatorIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [],
  )

  return (
    <div data-testid="filter-scope-selector" className="flex flex-col gap-4 text-dark-text-primary">
      {/* 统计行 + 部门筛选 — sticky 固定在 Step 2 区域顶部 */}
      <div className="sticky top-0 z-10 flex flex-col gap-2 rounded-lg border border-dark-border bg-dark-card-l1/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <span>
            已选 <span className="font-medium text-dark-text-primary">{stats.count}</span> 个指标，覆盖{' '}
            <span className="font-medium text-dark-text-primary">{stats.departments}</span> 个部门
          </span>
          <div className="flex items-center gap-1">
            <button
              data-testid="cross-dept-toggle"
              onClick={() => setCrossDeptMode((v) => !v)}
              className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                crossDeptMode
                  ? 'bg-dark-accent-primary/15 text-dark-accent-primary'
                  : 'text-dark-text-tertiary hover:text-dark-text-secondary'
              }`}
              title={crossDeptMode ? '跨部门关联已开启' : '仅本部门关联'}
            >
              <ArrowLeftRight size={13} />
              跨部门关联
            </button>
            {unionIndicatorIds.size > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  data-testid="indicator-chip-popover-trigger"
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-dark-accent-primary hover:bg-dark-accent-primary/10"
                >
                  <ListFilter size={13} />
                  已选指标 ({unionIndicatorIds.size})
                </button>
              </PopoverTrigger>
              <PopoverContent
                data-testid="indicator-chip-popover-content"
                className="w-80 max-h-64 overflow-y-auto bg-dark-card-l1 border-dark-border p-3"
                side="bottom"
                align="end"
              >
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(unionIndicatorIds).map((id) => {
                    const ind = allIndicators.find((i) => i.id === id)
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 rounded-full bg-dark-accent-primary/15 px-2 py-0.5 text-[11px] text-dark-accent-primary"
                      >
                        {ind?.name ?? id}
                        <button
                          data-testid={`chip-remove-${id}`}
                          onClick={() => removeChipIndicator(id)}
                          className="ml-0.5 rounded-full hover:bg-dark-accent-primary/30"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
          </div>
        </div>
        {/* 部门筛选标签 */}
        <div className="grid grid-cols-4 gap-1.5">
          <div
            data-testid="dept-filter-all"
            onClick={() => setActiveDeptName('全部')}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors ${
              activeDeptName === '全部'
                ? 'border-dark-accent-primary bg-dark-card-l1'
                : 'border-dark-border bg-dark-page hover:bg-dark-card-l2'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDeptNames((prev) => {
                  if (prev.size === departments.length) return new Set()
                  return new Set(departments.map((d) => d.name))
                })
              }}
              className={`text-xs shrink-0 ${selectedDeptNames.size === departments.length ? 'text-dark-accent-primary' : 'text-dark-text-tertiary'}`}
            >
              {selectedDeptNames.size === departments.length ? '✓' : '☐'}
            </button>
            <span className={`text-xs ${activeDeptName === '全部' ? 'text-dark-text-primary' : 'text-dark-text-secondary'}`}>全部</span>
          </div>
          {departments.map((dept) => {
            const isActive = activeDeptName === dept.name
            const isSelected = selectedDeptNames.has(dept.name)
            return (
              <div
                key={dept.id}
                data-testid={`dept-filter-${dept.id}`}
                onClick={() => setActiveDeptName(dept.name)}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors ${
                  isActive
                    ? 'border-dark-accent-primary bg-dark-card-l1'
                    : 'border-dark-border bg-dark-page hover:bg-dark-card-l2'
                }`}
              >
                <button
                  data-testid={`dept-checkbox-${dept.id}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDeptNames((prev) => {
                      const next = new Set(prev)
                      if (next.has(dept.name)) next.delete(dept.name)
                      else next.add(dept.name)
                      return next
                    })
                  }}
                  className={`text-xs shrink-0 ${isSelected ? 'text-dark-accent-primary' : 'text-dark-text-tertiary'}`}
                >
                  {isSelected ? '✓' : '☐'}
                </button>
                <span className={`text-xs ${isActive ? 'text-dark-text-primary' : 'text-dark-text-secondary'}`}>{dept.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 指标树 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1/95 p-4 backdrop-blur-sm">
        <h3 className="mb-2 font-medium text-dark-text-primary">指标树范围</h3>
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
      <div className="rounded-lg border border-dark-border bg-dark-card-l1/95 p-4 backdrop-blur-sm">
        <h3 className="mb-2 font-medium text-dark-text-primary">标签范围</h3>
        <TreeView
          nodes={tagTree}
          renderNode={(node) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                data-testid={`scope-tag-checkbox-${node.id}`}
                checked={checkedTagIds.has(node.id)}
                onChange={() => toggleTag(node.id)}
                onClick={(e) => e.stopPropagation()}
                className="size-4 cursor-pointer accent-dark-accent-primary"
              />
              <span>{node.name}</span>
            </div>
          )}
        />
        </div>

      {/* 剔除规则 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1/95 p-4 backdrop-blur-sm">
        <h3 className="mb-2 font-medium text-dark-text-primary">剔除规则</h3>
        <TreeView
          nodes={ruleTree}
          renderNode={(node) => (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                data-testid={`scope-rule-checkbox-${node.id}`}
                checked={checkedRuleIds.has(node.id)}
                onChange={() => toggleRule(node.id)}
                onClick={(e) => e.stopPropagation()}
                className="size-4 cursor-pointer accent-dark-accent-primary"
              />
              <span>{node.name}</span>
            </div>
          )}
        />
      </div>

      {/* 剔除关联关系 */}
      <div className="rounded-lg border border-dark-border bg-dark-card-l1/95 p-4 backdrop-blur-sm">
        <h3 className="mb-2 font-medium text-dark-text-primary">剔除关联关系</h3>
        {LINK_RELATION_TYPES.map((rel) => (
          <div key={rel.id} className="flex items-center gap-2 h-9 px-3">
            <input
              type="checkbox"
              data-testid={`scope-relation-checkbox-${rel.id}`}
              checked={checkedRelationIds.has(rel.id)}
              onChange={() => toggleRelation(rel.id)}
              className="size-4 cursor-pointer accent-dark-accent-primary"
            />
            <span>{rel.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
