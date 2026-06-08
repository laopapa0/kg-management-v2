import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OBJECT_TYPE_DEFINITIONS, getObjectTypeOptions } from '@/models/indicatorModel';

/* ─── 类型 ─── */

export interface ObjectTypePropertyPanelProps {
  /** 要展示的字段 key 列表（只展示 enum 类型） */
  fieldKeys?: string[];
  /** 当前选中的值：字段 key → 值 */
  values: Record<string, string>;
  /** 值变更回调 */
  onChange: (fieldKey: string, value: string) => void;
  /** 错误信息：字段 key → 错误文本 */
  errors?: Record<string, string>;
}

type FieldTreeNode =
  | { id: string; name: string; nodeType: 'group'; children: FieldTreeNode[] }
  | { id: string; name: string; nodeType: 'field'; fieldKey: string };

/* ─── 字段树构建 ─── */

function buildFieldTree(fieldKeys?: string[]): FieldTreeNode[] {
  return OBJECT_TYPE_DEFINITIONS.map((g) => ({
    id: g.id,
    name: g.name,
    nodeType: 'group' as const,
    children: g.fields
      .filter((f) => f.type === 'enum' && (!fieldKeys || fieldKeys.includes(f.key)))
      .map((f) => ({
        id: f.key,
        name: f.label,
        nodeType: 'field' as const,
        fieldKey: f.key,
      })),
  })).filter((g) => g.children.length > 0);
}

/* ─── 子组件：树节点渲染 ─── */

function TreeNodeView({
  node,
  selectedField,
  onSelectField,
}: {
  node: FieldTreeNode;
  selectedField: string | null;
  onSelectField: (fieldKey: string) => void;
}) {
  if (node.nodeType === 'group') {
    return (
      <div>
        <div className="text-[11px] text-dark-text-tertiary mb-1">{node.name}</div>
        <div className="pl-2 space-y-0.5">
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              selectedField={selectedField}
              onSelectField={onSelectField}
            />
          ))}
        </div>
      </div>
    );
  }

  const isSelected = selectedField === node.fieldKey;
  return (
    <button
      data-testid={`field-${node.fieldKey}`}
      onClick={() => onSelectField(node.fieldKey)}
      className={cn(
        'w-full text-left text-[13px] px-2 py-1 rounded transition-colors cursor-pointer',
        isSelected
          ? 'bg-[var(--accent-noc)]/10 text-[var(--accent-noc)] font-medium'
          : 'text-dark-text-primary hover:bg-dark-page'
      )}
    >
      {node.name}
    </button>
  );
}

/* ─── 主组件 ─── */

export default function ObjectTypePropertyPanel({
  fieldKeys,
  values,
  onChange,
  errors,
}: ObjectTypePropertyPanelProps) {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const tree = useMemo(() => buildFieldTree(fieldKeys), [fieldKeys]);

  const enumOptions = selectedField
    ? getObjectTypeOptions(selectedField)
    : undefined;

  // 缓存字段名映射
  const fieldNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of tree) {
      if (group.nodeType !== 'group') continue;
      for (const node of group.children) {
        if (node.nodeType === 'field') {
          map.set(node.fieldKey, node.name);
        }
      }
    }
    return map;
  }, [tree]);

  return (
    <div className="flex gap-3">
      {/* 左侧：字段树 */}
      <div className="w-[180px] shrink-0">
        <div className="text-[13px] font-medium text-dark-text-primary mb-2">对象类型属性</div>
        <div className="space-y-2">
          {tree.map((group) => (
            <TreeNodeView
              key={group.id}
              node={group}
              selectedField={selectedField}
              onSelectField={setSelectedField}
            />
          ))}
        </div>
      </div>

      {/* 右侧：枚举值下拉框 */}
      <div className="flex-1 min-w-0">
        {selectedField && enumOptions && enumOptions.length > 0 ? (
          <div>
            <div className="text-[11px] text-dark-text-tertiary mb-1.5">
              {fieldNameMap.get(selectedField) ?? selectedField}
            </div>
            <Select
              value={values[selectedField] || ''}
              onValueChange={(v) => onChange(selectedField, v)}
            >
              <SelectTrigger
                className={cn(
                  'h-9 text-[13px]',
                  errors?.[selectedField] && 'border-error-500 ring-2 ring-[#fef2f2]'
                )}
              >
                <SelectValue placeholder={`请选择${fieldNameMap.get(selectedField) ?? ''}`} />
              </SelectTrigger>
              <SelectContent>
                {enumOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors?.[selectedField] && (
              <p className="text-[12px] text-error-500 mt-1">{errors[selectedField]}</p>
            )}
          </div>
        ) : selectedField ? (
          <div className="text-[13px] text-dark-text-tertiary">该字段暂无可选枚举值</div>
        ) : (
          <div className="text-[13px] text-dark-text-tertiary pt-4">请从左侧选择一个字段</div>
        )}
      </div>
    </div>
  );
}
