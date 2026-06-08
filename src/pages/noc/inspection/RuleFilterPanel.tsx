import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ruleTreeData,
  getLeafIds,
  getNodePath,
  filterRuleTree,
  type RuleTreeNode,
} from './mockData';

interface RuleFilterPanelProps {
  selectedRuleIds: string[];
  onChange: (selectedRuleIds: string[]) => void;
}

type CheckState = 'checked' | 'unchecked' | 'indeterminate';

function getNodeCheckState(node: RuleTreeNode, selectedSet: Set<string>): CheckState {
  const leafIds = getLeafIds(node);
  const selectedCount = leafIds.filter((id) => selectedSet.has(id)).length;
  if (selectedCount === 0) return 'unchecked';
  if (selectedCount === leafIds.length) return 'checked';
  return 'indeterminate';
}

function TreeNodeItem({
  node,
  selectedSet,
  onToggle,
  expandedIds,
  onToggleExpand,
}: {
  node: RuleTreeNode;
  selectedSet: Set<string>;
  onToggle: (node: RuleTreeNode, checked: boolean) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  const isLeaf = !node.children || node.children.length === 0;
  const isExpanded = expandedIds.has(node.id);
  const checkState = getNodeCheckState(node, selectedSet);
  const checkboxRef = useRef<HTMLButtonElement>(null);

  // 设置 indeterminate 视觉状态
  useEffect(() => {
    const el = checkboxRef.current;
    if (el) {
      if (checkState === 'indeterminate') {
        el.setAttribute('data-state', 'indeterminate');
        el.setAttribute('aria-checked', 'mixed');
      } else {
        el.setAttribute('data-state', checkState);
        el.setAttribute('aria-checked', String(checkState === 'checked'));
      }
    }
  }, [checkState]);

  const checkboxValue =
    checkState === 'checked' ? true : checkState === 'indeterminate' ? 'indeterminate' : false;

  return (
    <div>
      <div className="flex items-center gap-1.5 py-1.5 hover:bg-dark-page rounded-md px-1">
        {!isLeaf && (
          <button
            type="button"
            aria-label={isExpanded ? '折叠' : '展开'}
            onClick={() => onToggleExpand(node.id)}
            className="text-dark-text-tertiary hover:text-dark-text-secondary p-0.5"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        {isLeaf && <span className="w-[18px]" />}

        <Checkbox
          ref={checkboxRef}
          id={`rule-node-${node.id}`}
          checked={checkboxValue as boolean}
          onCheckedChange={(checked) => onToggle(node, checked === true)}
          className="size-4"
        />
        <label
          htmlFor={`rule-node-${node.id}`}
          className="text-[13px] text-dark-text-primary cursor-pointer select-none flex-1"
        >
          {node.name}
        </label>
      </div>

      {!isLeaf && isExpanded && (
        <div className="pl-5">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedSet={selectedSet}
              onToggle={onToggle}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RuleFilterPanel({ selectedRuleIds, onChange }: RuleFilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['abnormal']));

  const selectedSet = useMemo(() => new Set(selectedRuleIds), [selectedRuleIds]);

  const filteredTree = useMemo(
    () => filterRuleTree(ruleTreeData, searchQuery),
    [searchQuery]
  );

  // 搜索时自动展开所有节点
  const displayExpandedIds = useMemo(() => {
    if (!searchQuery.trim()) return expandedIds;
    const allIds = new Set<string>();
    function collect(nodes: RuleTreeNode[]) {
      for (const node of nodes) {
        allIds.add(node.id);
        if (node.children) collect(node.children);
      }
    }
    collect(filteredTree);
    return allIds;
  }, [searchQuery, filteredTree, expandedIds]);

  const handleToggle = (node: RuleTreeNode, checked: boolean) => {
    const leafIds = getLeafIds(node);
    if (checked) {
      onChange([...new Set([...selectedRuleIds, ...leafIds])]);
    } else {
      onChange(selectedRuleIds.filter((id) => !leafIds.includes(id)));
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRemove = (id: string) => {
    onChange(selectedRuleIds.filter((rid) => rid !== id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-[14px] font-medium text-dark-text-primary">异常规则排除</h4>

      <div className="flex gap-3">
        {/* 左侧：规则树 */}
        <div className="flex-1 rounded-md border border-dark-border bg-dark-elevated p-3">
          <Input
            placeholder="搜索规则名称"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-[13px] border-dark-border mb-3"
          />
          <div className="max-h-[280px] overflow-y-auto">
            {filteredTree.map((node) => (
              <TreeNodeItem
                key={node.id}
                node={node}
                selectedSet={selectedSet}
                onToggle={handleToggle}
                expandedIds={displayExpandedIds}
                onToggleExpand={handleToggleExpand}
              />
            ))}
            {filteredTree.length === 0 && (
              <p className="text-[13px] text-dark-text-tertiary text-center py-4">无匹配规则</p>
            )}
          </div>
        </div>

        {/* 右侧：已选列表 */}
        <div className="flex-1 rounded-md border border-dark-border bg-dark-elevated p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-dark-text-secondary">
              已排除 {selectedRuleIds.length} 条规则
            </span>
            {selectedRuleIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 text-[12px] text-error-600 hover:text-error-600 hover:bg-red-50"
              >
                一键清空
              </Button>
            )}
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-2">
            {selectedRuleIds.length === 0 ? (
              <p className="text-[13px] text-dark-text-tertiary text-center py-4">暂未排除任何规则</p>
            ) : (
              selectedRuleIds.map((id) => {
                const path = getNodePath(ruleTreeData, id);
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 rounded-md bg-dark-page px-3 py-2"
                  >
                    <span className="text-[12px] text-dark-text-primary truncate">{path || id}</span>
                    <button
                      type="button"
                      onClick={() => handleRemove(id)}
                      aria-label={`移除 ${path || id}`}
                      className="text-dark-text-tertiary hover:text-error-600 shrink-0 p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
