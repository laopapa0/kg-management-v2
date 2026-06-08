import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  AlertCircle,
  Box,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SearchInput from '@/components/SearchInput';
import DataTable from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import { OBJECT_TYPE_DEFINITIONS } from '@/models/indicatorModel';
import type { Indicator } from '@/models/indicatorModel';
import type { AvailableIndicator } from '../noc/inspection/mockData';
import { availableIndicators } from '../noc/inspection/mockData';

/* ─── 类型定义 ─── */
interface FieldTreeNode {
  id: string;
  name: string;
  nodeType: 'group' | 'field';
  fieldKey?: keyof Indicator;
  fieldType?: 'enum' | 'text' | 'boolean';
  children?: FieldTreeNode[];
}

interface EnumValue {
  id: string;
  sort: number;
  code: string;
  value: string;
  displayName: string;
  status: '启用' | '停用';
}

/* ─── 字段定义树（基于 OBJECT_TYPE_DEFINITIONS）─── */
const objectTypeFieldTree: FieldTreeNode[] = [
  {
    id: 'root',
    name: '指标体系',
    nodeType: 'group',
    children: OBJECT_TYPE_DEFINITIONS.map((group) => ({
      id: group.id,
      name: group.name,
      nodeType: 'group' as const,
      children: group.fields.map((field) => ({
        id: `field-${String(field.key)}`,
        name: field.label,
        nodeType: 'field' as const,
        fieldKey: field.key,
        fieldType: field.type,
      })),
    })),
  },
];

/* ─── 枚举值初始数据（按字段 key 存储）─── */
const initialEnumValues: Record<string, EnumValue[]> = {
  level1: [
    { id: 'ev-l1-1', sort: 1, code: 'L1-001', value: '经营', displayName: '经营', status: '启用' },
    { id: 'ev-l1-2', sort: 2, code: 'L1-002', value: '发展', displayName: '发展', status: '启用' },
    { id: 'ev-l1-3', sort: 3, code: 'L1-003', value: '交付', displayName: '交付', status: '启用' },
    { id: 'ev-l1-4', sort: 4, code: 'L1-004', value: '服务', displayName: '服务', status: '启用' },
  ],
  level2: [
    { id: 'ev-l2-1', sort: 1, code: 'L2-001', value: '收入', displayName: '收入', status: '启用' },
    { id: 'ev-l2-2', sort: 2, code: 'L2-002', value: '利润', displayName: '利润', status: '启用' },
    { id: 'ev-l2-3', sort: 3, code: 'L2-003', value: '成本', displayName: '成本', status: '启用' },
    { id: 'ev-l2-4', sort: 4, code: 'L2-004', value: '用户触达', displayName: '用户触达', status: '启用' },
    { id: 'ev-l2-5', sort: 5, code: 'L2-005', value: '用户留存', displayName: '用户留存', status: '启用' },
    { id: 'ev-l2-6', sort: 6, code: 'L2-006', value: '网络质量', displayName: '网络质量', status: '启用' },
    { id: 'ev-l2-7', sort: 7, code: 'L2-007', value: '交付效率', displayName: '交付效率', status: '启用' },
    { id: 'ev-l2-8', sort: 8, code: 'L2-008', value: '资源利用', displayName: '资源利用', status: '启用' },
    { id: 'ev-l2-9', sort: 9, code: 'L2-009', value: '客户满意度', displayName: '客户满意度', status: '启用' },
    { id: 'ev-l2-10', sort: 10, code: 'L2-010', value: '服务效率', displayName: '服务效率', status: '启用' },
    { id: 'ev-l2-11', sort: 11, code: 'L2-011', value: '投诉处理', displayName: '投诉处理', status: '启用' },
    { id: 'ev-l2-12', sort: 12, code: 'L2-012', value: '效益评估', displayName: '效益评估', status: '启用' },
    { id: 'ev-l2-13', sort: 13, code: 'L2-013', value: '成本控制', displayName: '成本控制', status: '启用' },
    { id: 'ev-l2-14', sort: 14, code: 'L2-014', value: '收入分析', displayName: '收入分析', status: '启用' },
    { id: 'ev-l2-15', sort: 15, code: 'L2-015', value: '业务发展', displayName: '业务发展', status: '启用' },
    { id: 'ev-l2-16', sort: 16, code: 'L2-016', value: '用户发展', displayName: '用户发展', status: '启用' },
  ],
  granularity: [
    { id: 'ev-g-1', sort: 1, code: 'G-001', value: '全局', displayName: '全局', status: '启用' },
    { id: 'ev-g-2', sort: 2, code: 'G-002', value: '省分', displayName: '省分', status: '启用' },
    { id: 'ev-g-3', sort: 3, code: 'G-003', value: '地市', displayName: '地市', status: '启用' },
    { id: 'ev-g-4', sort: 4, code: 'G-004', value: '区县', displayName: '区县', status: '启用' },
    { id: 'ev-g-5', sort: 5, code: 'G-005', value: '网格', displayName: '网格', status: '启用' },
  ],
  frequency: [
    { id: 'ev-f-1', sort: 1, code: 'F-001', value: '实时', displayName: '实时', status: '启用' },
    { id: 'ev-f-2', sort: 2, code: 'F-002', value: '日', displayName: '日', status: '启用' },
    { id: 'ev-f-3', sort: 3, code: 'F-003', value: '周', displayName: '周', status: '启用' },
    { id: 'ev-f-4', sort: 4, code: 'F-004', value: '月', displayName: '月', status: '启用' },
    { id: 'ev-f-5', sort: 5, code: 'F-005', value: '季', displayName: '季', status: '启用' },
    { id: 'ev-f-6', sort: 6, code: 'F-006', value: '年', displayName: '年', status: '启用' },
  ],
  unit: [
    { id: 'ev-u-1', sort: 1, code: 'U-001', value: '元', displayName: '元', status: '启用' },
    { id: 'ev-u-2', sort: 2, code: 'U-002', value: '百分比', displayName: '百分比', status: '启用' },
    { id: 'ev-u-3', sort: 3, code: 'U-003', value: '户', displayName: '户', status: '启用' },
    { id: 'ev-u-4', sort: 4, code: 'U-004', value: '分', displayName: '分', status: '启用' },
    { id: 'ev-u-5', sort: 5, code: 'U-005', value: '次', displayName: '次', status: '启用' },
    { id: 'ev-u-6', sort: 6, code: 'U-006', value: '个', displayName: '个', status: '启用' },
    { id: 'ev-u-7', sort: 7, code: 'U-007', value: 'GB', displayName: 'GB', status: '启用' },
    { id: 'ev-u-8', sort: 8, code: 'U-008', value: 'Mbps', displayName: 'Mbps', status: '启用' },
  ],
  department: [
    { id: 'ev-d-1', sort: 1, code: 'D-001', value: '市场部', displayName: '市场部', status: '启用' },
    { id: 'ev-d-2', sort: 2, code: 'D-002', value: '网络部', displayName: '网络部', status: '启用' },
    { id: 'ev-d-3', sort: 3, code: 'D-003', value: '客服部', displayName: '客服部', status: '启用' },
    { id: 'ev-d-4', sort: 4, code: 'D-004', value: '政企部', displayName: '政企部', status: '启用' },
    { id: 'ev-d-5', sort: 5, code: 'D-005', value: '财务部', displayName: '财务部', status: '启用' },
    { id: 'ev-d-6', sort: 6, code: 'D-006', value: '数据中心', displayName: '数据中心', status: '启用' },
  ],
  indicatorType: [
    { id: 'ev-it-1', sort: 1, code: 'IT-001', value: '基础指标', displayName: '基础指标', status: '启用' },
    { id: 'ev-it-2', sort: 2, code: 'IT-002', value: '衍生指标', displayName: '衍生指标', status: '启用' },
    { id: 'ev-it-3', sort: 3, code: 'IT-003', value: '复合指标', displayName: '复合指标', status: '启用' },
  ],
};

/* ─── 工具函数 ─── */
function findNodeById(nodes: FieldTreeNode[], id: string): FieldTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function flattenNodes(nodes: FieldTreeNode[]): FieldTreeNode[] {
  const result: FieldTreeNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenNodes(node.children));
    }
  }
  return result;
}

/* ─── 递归树渲染组件 ─── */
function TreeRenderer({
  nodes,
  expandedIds,
  selectedId,
  onToggle,
  onSelect,
  depth = 0,
}: {
  nodes: FieldTreeNode[];
  expandedIds: Set<string>;
  selectedId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        return (
          <div key={node.id}>
            <TreeNodeRow
              node={node}
              expanded={isExpanded}
              selected={selectedId === node.id}
              onToggle={() => onToggle(node.id)}
              onSelect={() => onSelect(node.id)}
              depth={depth}
            />
            <AnimatePresence initial={false}>
              {hasChildren && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="overflow-hidden"
                >
                  <TreeRenderer
                    nodes={node.children!}
                    expandedIds={expandedIds}
                    selectedId={selectedId}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    depth={depth + 1}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
}

function TreeNodeRow({
  node,
  expanded,
  selected,
  onToggle,
  onSelect,
  depth,
}: {
  node: FieldTreeNode;
  expanded: boolean;
  selected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  depth: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isField = node.nodeType === 'field';

  return (
    <div
      className={cn(
        'flex items-center h-9 rounded-md cursor-pointer transition-colors duration-100 select-none group',
        selected
          ? 'bg-[var(--accent-noc)]/10 text-[var(--accent-noc)] relative'
          : 'hover:bg-dark-tree-hover-bg text-dark-text-secondary'
      )}
      style={{ margin: '0 6px', paddingLeft: 10 + depth * 16 }}
      onClick={() => {
        onSelect();
        if (hasChildren) onToggle();
      }}
    >
      {selected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent-noc)] rounded-r-full" />
      )}
      {hasChildren ? (
        <span
          className="mr-1 text-dark-text-tertiary hover:text-dark-text-secondary"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      ) : (
        <span className="w-[14px] mr-1" />
      )}
      {isField ? (
        <Box size={15} className="mr-2 shrink-0 text-[var(--accent-noc)]" />
      ) : expanded ? (
        <FolderOpen size={15} className="mr-2 shrink-0 text-warning-500" />
      ) : (
        <Folder size={15} className="mr-2 shrink-0 text-dark-text-tertiary" />
      )}
      <span className="text-[13px] truncate">{node.name}</span>
    </div>
  );
}

/* ─── 主页面组件 ─── */
export default function PlatformObjectTypePage() {
  /* 状态 */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));
  const [treeSearch, setTreeSearch] = useState('');
  const [leftWidth] = useState(280);

  /* 枚举值状态 */
  const [enumValues, setEnumValues] = useState<Record<string, EnumValue[]>>(initialEnumValues);
  const [enumModalOpen, setEnumModalOpen] = useState(false);
  const [editingEnum, setEditingEnum] = useState<EnumValue | null>(null);
  const [enumForm, setEnumForm] = useState({ code: '', value: '', displayName: '', status: true });

  /* 指标平表筛选 */
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [selectedEnumFilter, setSelectedEnumFilter] = useState<string | null>(null);

  /* 选中节点 */
  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    return findNodeById(objectTypeFieldTree, selectedId);
  }, [selectedId]);

  const selectedFieldKey = selectedNode?.fieldKey;

  /* 树展开/折叠 */
  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allIds = new Set(flattenNodes(objectTypeFieldTree).map((n) => n.id));
    setExpandedIds(allIds);
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  /* 过滤树 */
  const filteredTree = useMemo(() => {
    if (!treeSearch.trim()) return objectTypeFieldTree;
    const keyword = treeSearch.toLowerCase();
    const filterNodes = (nodes: FieldTreeNode[]): FieldTreeNode[] => {
      const result: FieldTreeNode[] = [];
      for (const node of nodes) {
        const match = node.name.toLowerCase().includes(keyword);
        const filteredChildren = node.children ? filterNodes(node.children) : undefined;
        if (match || (filteredChildren && filteredChildren.length > 0)) {
          result.push({ ...node, children: filteredChildren });
        }
      }
      return result;
    };
    return filterNodes(objectTypeFieldTree);
  }, [treeSearch]);

  /* 枚举值操作 */
  const currentEnums = selectedFieldKey ? enumValues[String(selectedFieldKey)] || [] : [];

  const openAddEnum = () => {
    setEditingEnum(null);
    setEnumForm({ code: '', value: '', displayName: '', status: true });
    setEnumModalOpen(true);
  };

  const openEditEnum = (ev: EnumValue) => {
    setEditingEnum(ev);
    setEnumForm({ code: ev.code, value: ev.value, displayName: ev.displayName, status: ev.status === '启用' });
    setEnumModalOpen(true);
  };

  const saveEnum = () => {
    if (!selectedFieldKey || !enumForm.code || !enumForm.value) return;
    const key = String(selectedFieldKey);
    setEnumValues((prev) => {
      const list = [...(prev[key] || [])];
      if (editingEnum) {
        const idx = list.findIndex((e) => e.id === editingEnum.id);
        if (idx >= 0) {
          list[idx] = { ...editingEnum, ...enumForm, status: enumForm.status ? '启用' : '停用' };
        }
      } else {
        list.push({
          id: `ev-${Date.now()}`,
          sort: list.length + 1,
          code: enumForm.code,
          value: enumForm.value,
          displayName: enumForm.displayName,
          status: enumForm.status ? '启用' : '停用',
        });
      }
      return { ...prev, [key]: list };
    });
    setEnumModalOpen(false);
  };

  const deleteEnum = (id: string) => {
    if (!selectedFieldKey) return;
    const key = String(selectedFieldKey);
    setEnumValues((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((e) => e.id !== id),
    }));
  };

  /* 指标平表筛选 */
  const filteredIndicators = useMemo(() => {
    let result = [...availableIndicators];

    // 搜索筛选
    if (indicatorSearch.trim()) {
      const q = indicatorSearch.toLowerCase();
      result = result.filter(
        (ind) =>
          ind.name.toLowerCase().includes(q) ||
          ind.code.toLowerCase().includes(q)
      );
    }

    // 枚举值筛选（如果选中了某个枚举值）
    if (selectedEnumFilter && selectedFieldKey) {
      result = result.filter((ind) => {
        const fieldValue = ind[selectedFieldKey as keyof typeof ind];
        return fieldValue === selectedEnumFilter;
      });
    }

    return result;
  }, [indicatorSearch, selectedEnumFilter, selectedFieldKey]);

  /* 枚举表格列 */
  const enumColumns: Column<EnumValue>[] = [
    { key: 'sort', title: '排序', width: 'w-16', align: 'center' },
    { key: 'code', title: '枚举编码' },
    { key: 'value', title: '枚举值' },
    { key: 'displayName', title: '显示名称' },
    {
      key: 'status',
      title: '状态',
      render: (record) => (
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium',
            record.status === '启用'
              ? 'bg-success-500/10 text-success-600'
              : 'bg-error-500/10 text-error-600'
          )}
        >
          {record.status}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 'w-36',
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => openEditEnum(record)}>
            编辑
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-error-500 hover:text-error-600" onClick={() => deleteEnum(record.id)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  /* 指标平表列 */
  const indicatorColumns: Column<AvailableIndicator>[] = [
    { key: 'code', title: '指标编码', width: 'w-32' },
    { key: 'name', title: '指标名称' },
    { key: 'level1', title: '一级', width: 'w-20' },
    { key: 'level2', title: '二级', width: 'w-24' },
    { key: 'granularity', title: '颗粒度', width: 'w-20' },
    { key: 'frequency', title: '关注频率', width: 'w-20' },
    { key: 'unit', title: '单位', width: 'w-16' },
    { key: 'department', title: '部门', width: 'w-20' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-[calc(100dvh-48px-24px)] flex flex-col">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-display">对象类型管理</h1>
          <p className="text-small text-dark-text-secondary mt-1">维护指标对象类型的字段定义与枚举值，管理指标平表数据</p>
        </div>
      </div>

      {/* 左右分栏 */}
      <div className="flex-1 flex overflow-hidden rounded-lg border border-dark-border bg-dark-elevated">
        {/* 左侧面板 - 字段定义树 */}
        <div
          className="flex flex-col border-r border-dark-border bg-dark-page"
          style={{ width: leftWidth, minWidth: 200, maxWidth: 480 }}
        >
          {/* 树工具栏 */}
          <div className="p-3 border-b border-dark-border bg-dark-elevated">
            <SearchInput
              placeholder="搜索对象类型字段"
              value={treeSearch}
              onChange={setTreeSearch}
              width="w-full"
              className="mb-2"
            />
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-dark-text-tertiary">对象类型字段</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-dark-text-secondary" onClick={expandAll}>
                  展开全部
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] text-dark-text-secondary" onClick={collapseAll}>
                  收起全部
                </Button>
              </div>
            </div>
          </div>

          {/* 树内容 */}
          <div className="flex-1 overflow-y-auto p-2">
            <TreeRenderer
              nodes={filteredTree}
              expandedIds={expandedIds}
              selectedId={selectedId}
              onToggle={toggleExpand}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* 分隔条 */}
        <div className="w-1 bg-dark-card-l3 shrink-0" />

        {/* 右侧面板 */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedNode ? (
            /* 空状态 */
            <div className="flex flex-col items-center justify-center h-full text-dark-text-tertiary">
              <Box size={64} className="text-dark-text-tertiary mb-4" />
              <p className="text-body text-dark-text-secondary">请从左侧选择一个对象类型字段</p>
              <p className="text-[13px] text-dark-text-tertiary mt-1">查看字段枚举值及关联指标</p>
            </div>
          ) : selectedNode.nodeType === 'group' ? (
            /* 分组节点 - 仅展示指标平表 */
            <div className="space-y-6">
              <h2 className="text-h2">{selectedNode.name}</h2>
              <div className="bg-dark-elevated rounded-lg border border-dark-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                  <h3 className="text-[14px] font-medium text-dark-text-primary">指标列表</h3>
                  <SearchInput
                    placeholder="搜索指标名称或编码"
                    value={indicatorSearch}
                    onChange={setIndicatorSearch}
                    width="w-64"
                  />
                </div>
                <div className="p-5">
                  <DataTable columns={indicatorColumns} data={filteredIndicators} rowKey="id" />
                </div>
              </div>
            </div>
          ) : (
            /* 字段节点 - 枚举值管理 + 指标平表 */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-h2">{selectedNode.name}</h2>
                <span className="text-[13px] text-dark-text-tertiary">
                  字段类型：{selectedNode.fieldType === 'enum' ? '枚举' : selectedNode.fieldType === 'boolean' ? '布尔' : '文本'}
                </span>
              </div>

              {/* 上方：枚举值管理（仅枚举类型字段） */}
              {selectedNode.fieldType === 'enum' ? (
                <div className="bg-dark-elevated rounded-lg border border-dark-border">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                    <h3 className="text-[14px] font-medium text-dark-text-primary">枚举值管理</h3>
                    <Button size="sm" variant="outline" className="h-8 border-dark-border-hover" onClick={openAddEnum}>
                      <Plus size={14} className="mr-1" />
                      添加枚举值
                    </Button>
                  </div>
                  <div className="p-5">
                    {currentEnums.length > 0 ? (
                      <DataTable columns={enumColumns} data={currentEnums} rowKey="id" />
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle size={32} className="text-dark-text-tertiary mx-auto mb-2" />
                        <p className="text-[13px] text-dark-text-secondary">暂无枚举值</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-dark-elevated rounded-lg border border-dark-border p-6">
                  <AlertCircle size={24} className="text-dark-text-tertiary mb-2" />
                  <p className="text-[13px] text-dark-text-secondary">
                    当前字段类型为「{selectedNode.fieldType === 'boolean' ? '布尔' : '文本'}」，无需配置枚举值
                  </p>
                </div>
              )}

              {/* 下方：指标平表列表 */}
              <div className="bg-dark-elevated rounded-lg border border-dark-border">
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[14px] font-medium text-dark-text-primary">关联指标</h3>
                    {selectedEnumFilter && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[var(--accent-noc)]/10 text-[var(--accent-noc)]">
                        {selectedNode.name} = {selectedEnumFilter}
                        <button
                          className="ml-1 text-[var(--accent-noc)] hover:text-[var(--accent-noc)]"
                          onClick={() => setSelectedEnumFilter(null)}
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                  <SearchInput
                    placeholder="搜索指标名称或编码"
                    value={indicatorSearch}
                    onChange={setIndicatorSearch}
                    width="w-64"
                  />
                </div>
                <div className="p-5">
                  <DataTable columns={indicatorColumns} data={filteredIndicators} rowKey="id" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── 枚举值弹窗 ─── */}
      <Dialog open={enumModalOpen} onOpenChange={setEnumModalOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-h3">{editingEnum ? '编辑枚举值' : '添加枚举值'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>枚举编码</Label>
              <Input value={enumForm.code} onChange={(e) => setEnumForm({ ...enumForm, code: e.target.value })} className="mt-1" placeholder="如 ENUM-001" />
            </div>
            <div>
              <Label>枚举值</Label>
              <Input value={enumForm.value} onChange={(e) => setEnumForm({ ...enumForm, value: e.target.value })} className="mt-1" placeholder="如 经营" />
            </div>
            <div>
              <Label>显示名称</Label>
              <Input value={enumForm.displayName} onChange={(e) => setEnumForm({ ...enumForm, displayName: e.target.value })} className="mt-1" placeholder="如 经营" />
            </div>
            <div className="flex items-center gap-3">
              <Label>状态</Label>
              <Switch checked={enumForm.status} onCheckedChange={(v) => setEnumForm({ ...enumForm, status: v })} />
              <span className="text-[13px] text-dark-text-secondary">{enumForm.status ? '启用' : '停用'}</span>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEnumModalOpen(false)}>取消</Button>
            <Button className="bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white" onClick={saveEnum}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
