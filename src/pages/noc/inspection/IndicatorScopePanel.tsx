import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { OBJECT_TYPE_DEFINITIONS, getObjectTypeOptions, type Indicator } from '@/models/indicatorModel';
import { filterIndicators } from '@/utils/indicatorFilter';
import { availableIndicators, INDICATOR_TAGS } from './mockData';

/* ─── 类型 ─── */

interface IndicatorScopePanelProps {
  selectedCategories: string[];
  selectedTags: string[];
  onChange: (categories: string[], tags: string[]) => void;
}

type FieldTreeNode =
  | { id: string; name: string; nodeType: 'root'; children: FieldTreeNode[] }
  | { id: string; name: string; nodeType: 'group'; children: FieldTreeNode[] }
  | { id: string; name: string; nodeType: 'field'; fieldKey: string };

/* ─── 字段树构建（只保留 enum 类型字段） ─── */

function buildFieldTree(): Extract<FieldTreeNode, { nodeType: 'root' }> {
  const groups = OBJECT_TYPE_DEFINITIONS.map((g) => ({
    id: g.id,
    name: g.name,
    nodeType: 'group' as const,
    children: g.fields
      .filter((f) => f.type === 'enum')
      .map((f) => ({
        id: f.key,
        name: f.label,
        nodeType: 'field' as const,
        fieldKey: f.key,
      })),
  })).filter((g) => g.children.length > 0);

  return {
    id: 'root',
    name: '指标体系',
    nodeType: 'root',
    children: groups,
  };
}

const FIELD_TREE = buildFieldTree();

/* ─── 子组件：树渲染 ─── */

function TreeNodeView({
  node,
  selectedField,
  onSelectField,
  searchQuery,
}: {
  node: FieldTreeNode;
  selectedField: string | null;
  onSelectField: (fieldKey: string) => void;
  searchQuery: string;
}) {
  const q = searchQuery.trim().toLowerCase();

  if (node.nodeType === 'root') {
    return (
      <div>
        <div className="text-[13px] font-medium text-[#1a202c] mb-2">{node.name}</div>
        <div className="pl-2 space-y-1">
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              selectedField={selectedField}
              onSelectField={onSelectField}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    );
  }

  if (node.nodeType === 'group') {
    const visibleChildren = q
      ? node.children.filter((c) => c.name.toLowerCase().includes(q))
      : node.children;
    if (visibleChildren.length === 0 && q) return null;

    return (
      <div>
        <div className="text-[11px] text-[#9ba4b3] mb-1">{node.name}</div>
        <div className="pl-2 space-y-0.5">
          {visibleChildren.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              selectedField={selectedField}
              onSelectField={onSelectField}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      </div>
    );
  }

  // field node
  if (q && !node.name.toLowerCase().includes(q)) return null;

  const isSelected = selectedField === node.fieldKey;
  return (
    <button
      data-testid={`field-${node.fieldKey}`}
      onClick={() => onSelectField(node.fieldKey)}
      className={`w-full text-left text-[13px] px-2 py-1 rounded transition-colors cursor-pointer ${
        isSelected
          ? 'bg-[#eef2ff] text-[#4f46e5] font-medium'
          : 'text-[#1a202c] hover:bg-[#f8fafc]'
      }`}
    >
      {node.name}
    </button>
  );
}

/* ─── 主组件 ─── */

export default function IndicatorScopePanel({
  selectedCategories,
  selectedTags,
  onChange,
}: IndicatorScopePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedEnumValues, setSelectedEnumValues] = useState<Record<string, string[]>>({});

  // 同步外部传入的 selectedCategories → selectedEnumValues['level1']
  useEffect(() => {
    setSelectedEnumValues((prev) => ({
      ...prev,
      level1: selectedCategories,
    }));
  }, [selectedCategories]);

  // 指标筛选（多字段 AND 逻辑）
  const matchedIndicators = useMemo(() => {
    const filters: Record<string, string[]> = {};
    for (const [key, values] of Object.entries(selectedEnumValues)) {
      if (values.length > 0) filters[key] = values;
    }
    return filterIndicators(availableIndicators, filters);
  }, [selectedEnumValues]);

  // 标签筛选（在字段筛选结果之上再过滤）
  const filteredByTags = useMemo(() => {
    if (selectedTags.length === 0) return matchedIndicators;
    return matchedIndicators.filter((ind) =>
      ind.tags.some((tag) => selectedTags.includes(tag))
    );
  }, [matchedIndicators, selectedTags]);

  const handleToggleEnum = (fieldKey: string, value: string, checked: boolean) => {
    setSelectedEnumValues((prev) => {
      const current = prev[fieldKey] || [];
      const next = checked
        ? [...new Set([...current, value])]
        : current.filter((v) => v !== value);
      const updated = { ...prev, [fieldKey]: next };

      // 同步触发 onChange（仅 level1 字段映射到 categories）
      if (fieldKey === 'level1') {
        onChange(next, selectedTags);
      }

      return updated;
    });
  };

  const isAllSelected =
    Object.values(selectedEnumValues).every((v) => v.length === 0) && selectedTags.length === 0;

  const enumOptions = selectedField
    ? getObjectTypeOptions(selectedField as keyof Indicator)
    : undefined;

  // 缓存字段名映射，避免每次渲染遍历树
  const fieldNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of FIELD_TREE.children) {
      if (group.nodeType !== 'group') continue;
      for (const node of group.children) {
        if (node.nodeType === 'field') {
          map.set(node.fieldKey, node.name);
        }
      }
    }
    return map;
  }, []);

  return (
    <div className="space-y-3">
      <h4 className="text-[14px] font-medium text-[#1a202c]">指标范围</h4>

      <div className="flex gap-3">
        {/* 左侧：字段树 */}
        <div className="flex-1 rounded-md border border-[#e8ecf1] bg-white p-3">
          <Input
            placeholder="搜索对象类型字段"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-[13px] border-[#e8ecf1] mb-3"
          />
          <div className="max-h-[320px] overflow-y-auto">
            <TreeNodeView
              node={FIELD_TREE}
              selectedField={selectedField}
              onSelectField={setSelectedField}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* 右侧：枚举值 + 指标预览 */}
        <div className="flex-1 rounded-md border border-[#e8ecf1] bg-white p-3 flex flex-col">
          {/* 枚举值复选框 */}
          {selectedField && enumOptions && enumOptions.length > 0 ? (
            <div className="mb-3">
              <div className="text-[11px] text-[#9ba4b3] mb-1.5">
                {fieldNameMap.get(selectedField) ?? selectedField}
              </div>
              <div className="flex flex-wrap gap-2">
                {enumOptions.map((opt) => (
                  <div key={opt} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`enum-${selectedField}-${opt}`}
                      checked={(selectedEnumValues[selectedField] || []).includes(opt)}
                      onCheckedChange={(checked) =>
                        handleToggleEnum(selectedField, opt, checked === true)
                      }
                      className="size-4"
                    />
                    <label
                      htmlFor={`enum-${selectedField}-${opt}`}
                      className="text-[13px] text-[#1a202c] cursor-pointer select-none"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : selectedField ? (
            <div className="text-[13px] text-[#9ba4b3] mb-3">该字段暂无可选枚举值</div>
          ) : null}

          {/* 数量统计 */}
          <div className="text-[13px] font-medium text-[#1a202c] mb-3">
            {isAllSelected
              ? `已选择全部 ${filteredByTags.length} 个指标`
              : `已选择 ${filteredByTags.length} 个指标`}
          </div>

          {/* 指标预览列表（平铺） */}
          <div className="flex-1 overflow-y-auto max-h-[300px]">
            <div className="flex flex-wrap gap-1.5">
              {filteredByTags.map((ind) => (
                <span
                  key={ind.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-white border border-[#e8ecf1] text-[#1a202c]"
                >
                  {ind.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
