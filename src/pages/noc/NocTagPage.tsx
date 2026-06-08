import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FolderPlus,
  Tag,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Pencil,
  Save,
  X,
  Settings,
  Trash2,
  Edit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import DataTable, { type Column } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ─── 类型 ─── */
interface TagNode {
  id: string;
  name: string;
  level: number;
  code?: string;
  status?: 'enabled' | 'disabled';
  children?: TagNode[];
}

interface ConstraintRow {
  objectType: string;
  level1: string;
  allowed: boolean;
  constraintType?: 'required' | 'recommended' | 'optional';
}

interface TaggingRecord {
  indicator: string;
  user: string;
  time: string;
}

interface AttrValueTagConfig {
  id: string;
  objectType: string;
  enumValue: string;
  tags: string[];
}

/* ─── Mock 数据 ─── */
const tagCategoryTree: TagNode[] = [
  {
    id: 'cat-biz', name: '业务分类', level: 1, children: [
      { id: 'cat-biz-1', name: '监控级别', level: 2, children: [
        { id: 'tag-001', name: '重点监控', level: 3, code: 'TAG-BIZ-MON-001', status: 'enabled' },
        { id: 'tag-002', name: '常规监控', level: 3, code: 'TAG-BIZ-MON-002', status: 'enabled' },
        { id: 'tag-003', name: '临时监控', level: 3, code: 'TAG-BIZ-MON-003', status: 'enabled' },
      ]},
      { id: 'cat-biz-2', name: '指标级别', level: 2, children: [
        { id: 'tag-004', name: '考核指标', level: 3, code: 'TAG-BIZ-LVL-001', status: 'enabled' },
        { id: 'tag-005', name: '上报指标', level: 3, code: 'TAG-BIZ-LVL-002', status: 'enabled' },
        { id: 'tag-006', name: '参考指标', level: 3, code: 'TAG-BIZ-LVL-003', status: 'enabled' },
      ]},
    ],
  },
  {
    id: 'cat-quality', name: '数据质量', level: 1, children: [
      { id: 'cat-quality-1', name: '置信度', level: 2, children: [
        { id: 'tag-007', name: '高置信度', level: 3, code: 'TAG-Q-CONF-001', status: 'enabled' },
        { id: 'tag-008', name: '中置信度', level: 3, code: 'TAG-Q-CONF-002', status: 'enabled' },
        { id: 'tag-009', name: '低置信度', level: 3, code: 'TAG-Q-CONF-003', status: 'disabled' },
      ]},
      { id: 'cat-quality-2', name: '口径状态', level: 2, children: [
        { id: 'tag-010', name: '口径明确', level: 3, code: 'TAG-Q-CAL-001', status: 'enabled' },
        { id: 'tag-011', name: '口径待确认', level: 3, code: 'TAG-Q-CAL-002', status: 'enabled' },
      ]},
    ],
  },
  {
    id: 'cat-mgmt', name: '管理属性', level: 1, children: [
      { id: 'cat-mgmt-1', name: '指标等级', level: 2, children: [
        { id: 'tag-012', name: '核心指标', level: 3, code: 'TAG-M-LVL-001', status: 'enabled' },
        { id: 'tag-013', name: '普通指标', level: 3, code: 'TAG-M-LVL-002', status: 'enabled' },
        { id: 'tag-014', name: '试点指标', level: 3, code: 'TAG-M-LVL-003', status: 'enabled' },
        { id: 'tag-015', name: '下线指标', level: 3, code: 'TAG-M-LVL-004', status: 'disabled' },
      ]},
      { id: 'cat-mgmt-2', name: '关注等级', level: 2, children: [
        { id: 'tag-016', name: '重点关注区', level: 3, code: 'TAG-M-FOC-001', status: 'enabled' },
        { id: 'tag-017', name: '一般关注区', level: 3, code: 'TAG-M-FOC-002', status: 'enabled' },
      ]},
    ],
  },
  {
    id: 'cat-dept', name: '责任部门', level: 1, children: [
      { id: 'tag-018', name: '业务一部', level: 2, code: 'TAG-D-001', status: 'enabled' },
      { id: 'tag-019', name: '业务二部', level: 2, code: 'TAG-D-002', status: 'enabled' },
      { id: 'tag-020', name: '业务三部', level: 2, code: 'TAG-D-003', status: 'enabled' },
      { id: 'tag-021', name: '网络部', level: 2, code: 'TAG-D-004', status: 'enabled' },
      { id: 'tag-022', name: '客服部', level: 2, code: 'TAG-D-005', status: 'enabled' },
    ],
  },
];

const constraintMockData: ConstraintRow[] = [
  { objectType: '营业收入', level1: '经营', allowed: true, constraintType: 'recommended' },
  { objectType: '5G用户', level1: '发展', allowed: true, constraintType: 'recommended' },
  { objectType: '移动用户', level1: '发展', allowed: true, constraintType: 'optional' },
  { objectType: '宽带用户', level1: '发展', allowed: true, constraintType: 'optional' },
  { objectType: '故障率', level1: '交付', allowed: true, constraintType: 'optional' },
  { objectType: '客户满意度', level1: '服务', allowed: true, constraintType: 'recommended' },
  { objectType: 'ARPU值', level1: '经营', allowed: false },
  { objectType: '网络成本', level1: '经营', allowed: false },
];

const recentTaggings: TaggingRecord[] = [
  { indicator: '5G用户渗透率', user: '张三', time: '2026-05-29 09:30' },
  { indicator: '宽带故障率', user: '李四', time: '2026-05-29 08:45' },
  { indicator: '客户满意度', user: '王五', time: '2026-05-28 17:20' },
  { indicator: 'FTTR安装量', user: '赵六', time: '2026-05-28 15:10' },
  { indicator: '千兆端口利用率', user: '钱七', time: '2026-05-28 11:30' },
];

/* 属性值标签 Mock 数据 */
const objectTypeOptions = ['区局', 'BD', '产品', '渠道'];

const enumValueMap: Record<string, string[]> = {
  '区局': ['浦东', '黄浦', '静安', '徐汇', '长宁', '普陀', '虹口', '杨浦'],
  'BD': ['BD-东区', 'BD-西区', 'BD-南区', 'BD-北区', 'BD-中区'],
  '产品': ['5G套餐', 'FTTR', '千兆宽带', '云业务', '物联网卡', '亲情网'],
  '渠道': ['营业厅', '网上营业厅', 'APP', '微信小程序', '客服热线', '代理商'],
};

const allTagsForSelect = [
  '重点关注区', '高优先级', '主推产品', '5G业务', '创新业务',
  '常规监控', '考核指标', '核心指标', '普通指标', '试点指标',
];

const attrValueTagMockData: AttrValueTagConfig[] = [
  { id: 'AVT-001', objectType: '区局', enumValue: '浦东', tags: ['重点关注区', '高优先级'] },
  { id: 'AVT-002', objectType: '区局', enumValue: '黄浦', tags: ['重点关注区'] },
  { id: 'AVT-003', objectType: '产品', enumValue: '5G套餐', tags: ['主推产品', '5G业务'] },
  { id: 'AVT-004', objectType: '产品', enumValue: 'FTTR', tags: ['创新业务'] },
];

/* ─── 工具函数 ─── */
const findNodeById = (nodes: TagNode[], id: string): TagNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

const isLeafNode = (node: TagNode): boolean => !node.children || node.children.length === 0;

const getAllTags = (nodes: TagNode[]): TagNode[] => {
  const tags: TagNode[] = [];
  for (const node of nodes) {
    if (isLeafNode(node) && node.code) tags.push(node);
    if (node.children) tags.push(...getAllTags(node.children));
  }
  return tags;
};

const getParentChain = (nodes: TagNode[], targetId: string, chain: TagNode[] = []): TagNode[] => {
  for (const node of nodes) {
    if (node.id === targetId) return [...chain, node];
    if (node.children) {
      const result = getParentChain(node.children, targetId, [...chain, node]);
      if (result.length > 0) return result;
    }
  }
  return [];
};

const countTagsInNode = (node: TagNode): number => {
  if (isLeafNode(node) && node.code) return 1;
  if (!node.children) return 0;
  return node.children.reduce((sum, child) => sum + countTagsInNode(child), 0);
};

const filterTree = (nodes: TagNode[], keyword: string): TagNode[] => {
  if (!keyword.trim()) return nodes;
  const result: TagNode[] = [];
  for (const node of nodes) {
    const match = node.name.toLowerCase().includes(keyword.toLowerCase());
    const filteredChildren = node.children ? filterTree(node.children, keyword) : [];
    if (match || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
    }
  }
  return result;
};

/* ─── 树节点组件 ─── */
interface TreeNodeProps {
  node: TagNode;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (node: TagNode) => void;
  onToggleExpand: (id: string) => void;
}

function TreeNodeItem({ node, selectedId, expandedIds, onSelect, onToggleExpand }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isLeaf = isLeafNode(node);

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(node.id);
    }
    onSelect(node);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center h-9 px-2 rounded-md cursor-pointer transition-colors duration-100 select-none',
          isSelected && isLeaf ? 'bg-dark-accent-primary/10 text-dark-accent-primary relative' : 'hover:bg-dark-tree-hover-bg text-dark-text-secondary',
        )}
        style={{ paddingLeft: `${8 + (node.level - 1) * 20}px` }}
      >
        {isSelected && isLeaf && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark-accent-primary rounded-r-full" />
        )}
        {hasChildren ? (
          <span className="mr-1 text-dark-text-tertiary" onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px] mr-1" />
        )}
        {isLeaf ? (
          <Tag size={14} className={cn('mr-2 shrink-0', isSelected ? 'text-dark-accent-primary' : 'text-dark-text-tertiary')} />
        ) : (
          <span className="mr-2 shrink-0 text-dark-text-tertiary">
            {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
        )}
        <span className={cn('text-[13px] truncate', isSelected && isLeaf && 'font-medium')}>
          {node.name}
        </span>
        {node.status === 'disabled' && (
          <span className="ml-2 text-[10px] text-dark-text-tertiary bg-dark-card-l2 px-1 rounded">已停用</span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 属性值标签配置页面 ─── */
function AttrValueTagConfigView() {
  const [selectedObjectType, setSelectedObjectType] = useState('');
  const [selectedEnumValues, setSelectedEnumValues] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [configs, setConfigs] = useState<AttrValueTagConfig[]>(attrValueTagMockData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AttrValueTagConfig | null>(null);

  const availableEnumValues = selectedObjectType ? (enumValueMap[selectedObjectType] || []) : [];

  const handleAddConfig = () => {
    if (!selectedObjectType || selectedEnumValues.length === 0 || selectedTags.length === 0) return;
    const newConfigs: AttrValueTagConfig[] = selectedEnumValues.map((ev) => ({
      id: `AVT-${String(configs.length + 1).padStart(3, '0')}`,
      objectType: selectedObjectType,
      enumValue: ev,
      tags: [...selectedTags],
    }));
    setConfigs((prev) => [...prev, ...newConfigs]);
    setSelectedEnumValues([]);
    setSelectedTags([]);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const handleEditConfig = (config: AttrValueTagConfig) => {
    setEditingId(config.id);
    setEditForm({ ...config });
  };

  const handleSaveEdit = () => {
    if (!editForm) return;
    setConfigs((prev) => prev.map((c) => (c.id === editingId ? editForm : c)));
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleToggleEnumValue = (value: string) => {
    setSelectedEnumValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const configColumns = [
    { key: 'objectType', title: '对象类型' },
    { key: 'enumValue', title: '枚举值' },
    {
      key: 'tags',
      title: '标签',
      render: (record: AttrValueTagConfig) => (
        <div className="flex flex-wrap gap-1">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded bg-dark-accent-primary/10 text-dark-accent-primary border border-dark-accent-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (record: AttrValueTagConfig) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditConfig(record)}
            className="text-[12px] text-dark-accent-primary hover:underline flex items-center gap-0.5"
          >
            <Edit size={12} />
            编辑
          </button>
          <button
            onClick={() => handleDeleteConfig(record.id)}
            className="text-[12px] text-error-500 hover:underline flex items-center gap-0.5"
          >
            <Trash2 size={12} />
            删除
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-semibold text-dark-text-primary">属性值标签配置</h2>
          <p className="text-[13px] text-dark-text-secondary mt-1">
            为对象类型的枚举值批量关联标签，自动打标到对应指标
          </p>
        </div>
      </div>

      {/* 配置表单 */}
      <div className="border border-dark-border rounded-lg p-5 mb-6 bg-dark-elevated">
        <h3 className="text-[14px] font-medium text-dark-text-secondary mb-4">新增配置</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* 对象类型选择器 */}
          <div>
            <Label className="text-[13px] text-dark-text-secondary">对象类型</Label>
            <Select value={selectedObjectType} onValueChange={setSelectedObjectType}>
              <SelectTrigger className="mt-1.5 h-9 text-[14px]">
                <SelectValue placeholder="选择对象类型" />
              </SelectTrigger>
              <SelectContent>
                {objectTypeOptions.map((ot) => (
                  <SelectItem key={ot} value={ot}>{ot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 枚举值选择器 */}
          <div>
            <Label className="text-[13px] text-dark-text-secondary">枚举值（多选）</Label>
            <div className="mt-1.5 relative">
              <Select>
                <SelectTrigger className="h-9 text-[14px]">
                  <SelectValue
                    placeholder={
                      selectedEnumValues.length > 0
                        ? `已选 ${selectedEnumValues.length} 项`
                        : '选择枚举值'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableEnumValues.length === 0 ? (
                    <div className="px-3 py-2 text-[13px] text-dark-text-tertiary">
                      请先选择对象类型
                    </div>
                  ) : (
                    availableEnumValues.map((ev) => (
                      <div
                        key={ev}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-dark-page text-[13px]"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleEnumValue(ev);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEnumValues.includes(ev)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-dark-border-hover accent-[#3478f6]"
                        />
                        <span className="text-dark-text-secondary">{ev}</span>
                      </div>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 标签选择器 */}
          <div>
            <Label className="text-[13px] text-dark-text-secondary">标签（多选搜索）</Label>
            <div className="mt-1.5 relative">
              <Select>
                <SelectTrigger className="h-9 text-[14px]">
                  <SelectValue
                    placeholder={
                      selectedTags.length > 0
                        ? `已选 ${selectedTags.length} 项`
                        : '选择标签'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-3 py-2 border-b border-dark-border">
                    <input
                      type="text"
                      placeholder="搜索标签..."
                      className="w-full text-[13px] px-2 py-1 border border-dark-border-hover rounded outline-none focus:border-dark-accent-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {allTagsForSelect.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-dark-page text-[13px]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleTag(tag);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-dark-border-hover accent-[#3478f6]"
                      />
                      <span className="text-dark-text-secondary">{tag}</span>
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={handleAddConfig}
            disabled={!selectedObjectType || selectedEnumValues.length === 0 || selectedTags.length === 0}
            className="h-8 px-4 text-[13px] bg-dark-accent-primary hover:bg-dark-accent-primary-active disabled:opacity-50"
          >
            <Plus size={14} className="mr-1" />
            添加配置
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedObjectType('');
              setSelectedEnumValues([]);
              setSelectedTags([]);
            }}
            className="h-8 px-4 text-[13px] border-dark-border-hover"
          >
            重置
          </Button>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editingId && editForm && (
        <div className="border border-dark-accent-primary/20 rounded-lg p-5 mb-6 bg-dark-page">
          <h3 className="text-[14px] font-medium text-dark-text-secondary mb-4">编辑配置</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-[13px] text-dark-text-secondary">对象类型</Label>
              <Input value={editForm.objectType} disabled className="mt-1.5 h-9 text-[14px] bg-dark-card-l2" />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">枚举值</Label>
              <Input value={editForm.enumValue} disabled className="mt-1.5 h-9 text-[14px] bg-dark-card-l2" />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">标签</Label>
              <Select
                value={editForm.tags.join(',')}
                onValueChange={(v) => {
                  const tagList = v.split(',').filter(Boolean);
                  setEditForm((prev) => prev ? { ...prev, tags: tagList } : null);
                }}
              >
                <SelectTrigger className="mt-1.5 h-9 text-[14px]">
                  <SelectValue placeholder="选择标签" />
                </SelectTrigger>
                <SelectContent>
                  {allTagsForSelect.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Button onClick={handleSaveEdit} className="h-8 px-4 text-[13px] bg-dark-accent-primary hover:bg-dark-accent-primary-active">
              <Save size={14} className="mr-1" />
              保存
            </Button>
            <Button variant="outline" onClick={handleCancelEdit} className="h-8 px-4 text-[13px] border-dark-border-hover">
              <X size={14} className="mr-1" />
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 已配置表格 */}
      <div className="border border-dark-border rounded-lg p-5 bg-dark-elevated">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-medium text-dark-text-secondary">
            已配置列表
            <span className="ml-2 text-[12px] text-dark-text-tertiary">共 {configs.length} 条</span>
          </h3>
        </div>
        <DataTable
          columns={configColumns as unknown as Column<Record<string, unknown>>[]}
          data={configs as unknown as Record<string, unknown>[]}
          rowKey="id"
        />
      </div>
    </motion.div>
  );
}

/* ─── 主页面 ─── */
export default function NocTagPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['cat-biz', 'cat-quality', 'cat-mgmt', 'cat-dept']));
  const [treeSearch, setTreeSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagNode | null>(null);
  const [constraints, setConstraints] = useState<ConstraintRow[]>(constraintMockData);

  // 新增：属性值标签视图状态
  const [activeView, setActiveView] = useState<'tag-tree' | 'attr-value-tag'>('tag-tree');

  // Form states
  const [tagForm, setTagForm] = useState({ name: '', category: '', description: '', sortOrder: 0 });
  const [catForm, setCatForm] = useState({ name: '', parent: '', sortOrder: 0, description: '' });

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(tagCategoryTree, selectedNodeId);
  }, [selectedNodeId]);

  const isLeafSelected = selectedNode ? isLeafNode(selectedNode) : false;

  const filteredTree = useMemo(() => filterTree(tagCategoryTree, treeSearch), [treeSearch]);

  const handleSelectNode = useCallback((node: TagNode) => {
    setSelectedNodeId(node.id);
    setIsEditing(false);
    setActiveView('tag-tree');
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    const allIds = new Set<string>();
    const collect = (nodes: TagNode[]) => {
      for (const n of nodes) {
        if (n.children) { allIds.add(n.id); collect(n.children); }
      }
    };
    collect(tagCategoryTree);
    setExpandedIds(allIds);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const handleConstraintChange = (index: number, allowed: boolean) => {
    setConstraints(prev => prev.map((c, i) => i === index ? { ...c, allowed, constraintType: allowed ? 'optional' : undefined } : c));
  };

  const handleConstraintTypeChange = (index: number, type: 'required' | 'recommended' | 'optional') => {
    setConstraints(prev => prev.map((c, i) => i === index ? { ...c, constraintType: type } : c));
  };

  const handleSelectAllConstraints = () => {
    setConstraints(prev => prev.map(c => ({ ...c, allowed: true, constraintType: c.constraintType || 'optional' })));
  };

  const handleDeselectAllConstraints = () => {
    setConstraints(prev => prev.map(c => ({ ...c, allowed: false, constraintType: undefined })));
  };

  const openNewTagModal = () => {
    setEditingTag(null);
    setTagForm({ name: '', category: '', description: '', sortOrder: 0 });
    setTagModalOpen(true);
  };

  const openEditTagModal = (tag: TagNode) => {
    setEditingTag(tag);
    setTagForm({ name: tag.name, category: '', description: '', sortOrder: 0 });
    setTagModalOpen(true);
  };

  const openNewCatModal = () => {
    setCatForm({ name: '', parent: '', sortOrder: 0, description: '' });
    setCatModalOpen(true);
  };

  const chain = useMemo(() => {
    if (!selectedNodeId) return [];
    return getParentChain(tagCategoryTree, selectedNodeId);
  }, [selectedNodeId]);

  const parentCatName = chain.length > 1 ? chain[chain.length - 2]?.name : '';

  /* ─── 分类详情表格列 ─── */
  const categoryTagColumns = [
    { key: 'name', title: '标签名称' },
    { key: 'code', title: '编码' },
    {
      key: 'status',
      title: '状态',
      render: (_: TagNode) => (
        <span className="text-[12px] px-2 py-0.5 rounded bg-success-500/10 text-success-600">启用</span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      render: (record: TagNode) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditTagModal(record)} className="text-[12px] text-dark-accent-primary hover:underline">编辑</button>
          <button className="text-[12px] text-error-500 hover:underline">删除</button>
        </div>
      ),
    },
  ];

  /* ─── 标签使用统计 ─── */
  const statsCards = [
    { label: '已打标指标数', value: 45 },
    { label: '已打标属性值数', value: 128 },
    { label: '使用部门数', value: 5 },
    { label: '本月新增打标', value: 12 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[28px] font-semibold text-dark-text-primary leading-tight tracking-[-0.02em]">标签管理</h1>
          <p className="text-[13px] text-dark-text-secondary mt-1">维护标签库的分类体系与命名规范，审核业务部门提交的新标签申请</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openNewTagModal} className="bg-dark-accent-primary hover:bg-dark-accent-primary-active h-9 px-4 text-[14px]">
            <Plus size={16} className="mr-1.5" />
            新增标签
          </Button>
          <Button onClick={openNewCatModal} variant="outline" className="h-9 px-4 text-[14px] border-dark-border-hover text-dark-text-secondary hover:bg-dark-page">
            <FolderPlus size={16} className="mr-1.5" />
            新建分类
          </Button>
        </div>
      </div>

      {/* ── 左右分栏 ── */}
      <div className="flex gap-0 border border-dark-border rounded-lg bg-dark-elevated overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左侧：标签分类树 */}
        <div className="w-[260px] min-w-[260px] bg-dark-page border-r border-dark-border flex flex-col">
          <div className="p-3 border-b border-dark-border">
            <SearchInput
              placeholder="搜索标签或分类"
              value={treeSearch}
              onChange={setTreeSearch}
              width="w-full"
            />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={handleExpandAll} className="text-[11px] text-dark-text-secondary hover:text-dark-accent-primary transition-colors">展开全部</button>
              <span className="text-dark-text-tertiary">|</span>
              <button onClick={handleCollapseAll} className="text-[11px] text-dark-text-secondary hover:text-dark-accent-primary transition-colors">收起全部</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {/* 标签分类分组 */}
            <div className="mb-2">
              <div className="px-2 py-1.5 text-[11px] font-medium text-dark-text-tertiary uppercase tracking-wider">
                标签分类
              </div>
              {filteredTree.map((node) => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  selectedId={selectedNodeId}
                  expandedIds={expandedIds}
                  onSelect={handleSelectNode}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </div>

            {/* 【新增】属性值标签节点 */}
            <div className="mt-2 pt-2 border-t border-dark-border">
              <div
                onClick={() => {
                  setActiveView('attr-value-tag');
                  setSelectedNodeId(null);
                }}
                className={cn(
                  'flex items-center h-9 px-2 rounded-md cursor-pointer transition-colors duration-100 select-none',
                  activeView === 'attr-value-tag'
                    ? 'bg-dark-accent-primary/10 text-dark-accent-primary relative font-medium'
                    : 'hover:bg-dark-tree-hover-bg text-dark-text-secondary'
                )}
              >
                {activeView === 'attr-value-tag' && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark-accent-primary rounded-r-full" />
                )}
                <Settings size={14} className={cn('mr-2 shrink-0', activeView === 'attr-value-tag' ? 'text-dark-accent-primary' : 'text-dark-text-tertiary')} />
                <span className="text-[13px] truncate">属性值标签</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：详情区 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'attr-value-tag' ? (
            <AttrValueTagConfigView />
          ) : !selectedNode ? (
            <div className="flex flex-col items-center justify-center h-full text-dark-text-tertiary">
              <Tag size={64} className="text-dark-text-tertiary mb-4" />
              <p className="text-[14px] text-dark-text-secondary">请从左侧选择一个标签或分类</p>
            </div>
          ) : !isLeafSelected ? (
            /* ── 分类详情视图 ── */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-semibold text-dark-text-primary">分类详情</h2>
                <Button variant="outline" size="sm" className="h-8 text-[13px] border-dark-border-hover" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? <><X size={14} className="mr-1" />取消</> : <><Pencil size={14} className="mr-1" />编辑</>}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[13px] text-dark-text-secondary">分类名称</Label>
                    <Input defaultValue={selectedNode.name} disabled={!isEditing} className="mt-1 h-9 text-[14px]" />
                  </div>
                  <div>
                    <Label className="text-[13px] text-dark-text-secondary">父分类</Label>
                    <Select disabled={!isEditing}>
                      <SelectTrigger className="mt-1 h-9 text-[14px]">
                        <SelectValue placeholder={parentCatName || '顶级分类'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">顶级分类</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[13px] text-dark-text-secondary">分类编码</Label>
                    <Input defaultValue={selectedNode.id} disabled className="mt-1 h-9 text-[14px] bg-dark-page" />
                  </div>
                  <div>
                    <Label className="text-[13px] text-dark-text-secondary">包含标签数</Label>
                    <div className="mt-1 h-9 flex items-center text-[14px] text-dark-text-secondary">{countTagsInNode(selectedNode)}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-[13px] text-dark-text-secondary">描述</Label>
                  <Textarea defaultValue="" disabled={!isEditing} className="mt-1 text-[14px] min-h-[80px]" placeholder="分类描述..." />
                </div>
              </div>

              {/* 分类下标签列表 */}
              <div className="mt-8">
                <h3 className="text-[16px] font-semibold text-dark-text-primary mb-3">标签列表</h3>
                <DataTable
                  columns={categoryTagColumns as unknown as Column<Record<string, unknown>>[]}
                  data={(selectedNode.children?.filter(c => c.code) ?? []) as unknown as Record<string, unknown>[]}
                  rowKey="id"
                />
              </div>
            </motion.div>
          ) : (
            /* ── 标签详情视图 ── */
            <div className="space-y-6">
              {/* Card 1: 基本信息 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0 }}
                className="border border-dark-border rounded-lg p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-semibold text-dark-text-primary">标签详情</h2>
                  <Button variant="outline" size="sm" className="h-8 text-[13px] border-dark-border-hover" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? <><Save size={14} className="mr-1" />保存</> : <><Pencil size={14} className="mr-1" />编辑</>}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">标签名称</Label>
                      <Input defaultValue={selectedNode.name} disabled={!isEditing} className="mt-1 h-9 text-[14px]" />
                    </div>
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">标签编码</Label>
                      <Input defaultValue={selectedNode.code} disabled className="mt-1 h-9 text-[14px] bg-dark-page" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">所属分类</Label>
                      <Select disabled={!isEditing}>
                        <SelectTrigger className="mt-1 h-9 text-[14px]">
                          <SelectValue placeholder={parentCatName} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat-biz">业务分类</SelectItem>
                          <SelectItem value="cat-quality">数据质量</SelectItem>
                          <SelectItem value="cat-mgmt">管理属性</SelectItem>
                          <SelectItem value="cat-dept">责任部门</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">排序号</Label>
                      <Input type="number" defaultValue={1} disabled={!isEditing} className="mt-1 h-9 text-[14px]" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[13px] text-dark-text-secondary">命名规范说明</Label>
                    <Textarea
                      defaultValue="用于标识需要重点关注的业务指标，由业务部门申请，NOC 审核后使用"
                      disabled={!isEditing}
                      className="mt-1 text-[14px] min-h-[80px]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[13px] text-dark-text-secondary">状态</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-dark-text-secondary">{selectedNode.status === 'enabled' ? '启用' : '停用'}</span>
                        <Switch checked={selectedNode.status === 'enabled'} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">创建时间</Label>
                      <div className="mt-1 text-[13px] text-dark-text-secondary">2026-01-15 10:30</div>
                    </div>
                    <div>
                      <Label className="text-[13px] text-dark-text-secondary">最后修改</Label>
                      <div className="mt-1 text-[13px] text-dark-text-secondary">2026-05-20 14:20</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: 关联约束配置 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="border border-dark-border rounded-lg p-5"
              >
                <div className="mb-4">
                  <h2 className="text-[18px] font-semibold text-dark-text-primary">关联约束</h2>
                  <p className="text-[12px] text-dark-text-secondary mt-0.5">规定哪些标签可以打给哪些对象类型</p>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <Button variant="outline" size="sm" className="h-7 text-[12px] border-dark-border-hover" onClick={handleSelectAllConstraints}>
                    全选
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[12px] border-dark-border-hover" onClick={handleDeselectAllConstraints}>
                    取消全选
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">对象类型</th>
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">一级</th>
                        <th className="h-9 px-3 text-center text-[13px] font-medium text-dark-text-secondary">允许打标</th>
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">约束方式</th>
                      </tr>
                    </thead>
                    <tbody>
                      {constraints.map((row, idx) => (
                        <tr key={idx} className="h-10 border-b border-dark-border hover:bg-dark-page">
                          <td className="px-3 text-[14px] text-dark-text-secondary">{row.objectType}</td>
                          <td className="px-3 text-[14px] text-dark-text-secondary">{row.level1}</td>
                          <td className="px-3 text-center">
                            <input
                              type="checkbox"
                              checked={row.allowed}
                              onChange={(e) => handleConstraintChange(idx, e.target.checked)}
                              className="w-4 h-4 rounded border-dark-border-hover text-dark-accent-primary accent-[#3478f6]"
                            />
                          </td>
                          <td className="px-3">
                            {row.allowed && (
                              <div className="flex items-center gap-3">
                                {(['required', 'recommended', 'optional'] as const).map((type) => (
                                  <label key={type} className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`constraint-${idx}`}
                                      checked={row.constraintType === type}
                                      onChange={() => handleConstraintTypeChange(idx, type)}
                                      className="w-3.5 h-3.5 accent-[#3478f6]"
                                    />
                                    <span className="text-[12px] text-dark-text-secondary">
                                      {type === 'required' ? '必须' : type === 'recommended' ? '推荐' : '可选'}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Card 3: 使用统计 */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="border border-dark-border rounded-lg p-5"
              >
                <h2 className="text-[18px] font-semibold text-dark-text-primary mb-4">使用统计</h2>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {statsCards.map((stat) => (
                    <div key={stat.label} className="bg-dark-page rounded-lg p-4 text-center">
                      <div className="text-[24px] font-semibold text-dark-text-primary">{stat.value}</div>
                      <div className="text-[12px] text-dark-text-secondary mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <h3 className="text-[14px] font-medium text-dark-text-secondary mb-3">最近打标记录</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">指标名称</th>
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">打标人</th>
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">打标时间</th>
                        <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTaggings.map((record, idx) => (
                        <tr key={idx} className="h-10 border-b border-dark-border hover:bg-dark-page">
                          <td className="px-3 text-[14px] text-dark-text-secondary">{record.indicator}</td>
                          <td className="px-3 text-[14px] text-dark-text-secondary">{record.user}</td>
                          <td className="px-3 text-[13px] text-dark-text-tertiary">{record.time}</td>
                          <td className="px-3">
                            <button className="text-[12px] text-error-500 hover:underline">移除标签</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* ── 新增/编辑标签弹窗 ── */}
      <Dialog open={tagModalOpen} onOpenChange={setTagModalOpen}>
        <DialogContent className="w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold">
              {editingTag ? '编辑标签' : '新增标签'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-[13px] text-dark-text-secondary">标签名称 <span className="text-error-500">*</span></Label>
              <Input
                value={tagForm.name}
                onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入标签名称"
                className="mt-1 h-9 text-[14px]"
              />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">所属分类</Label>
              <Select value={tagForm.category} onValueChange={(v) => setTagForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="mt-1 h-9 text-[14px]">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cat-biz-1">监控级别</SelectItem>
                  <SelectItem value="cat-biz-2">指标级别</SelectItem>
                  <SelectItem value="cat-quality-1">置信度</SelectItem>
                  <SelectItem value="cat-quality-2">口径状态</SelectItem>
                  <SelectItem value="cat-mgmt-1">指标等级</SelectItem>
                  <SelectItem value="cat-mgmt-2">关注等级</SelectItem>
                  <SelectItem value="cat-dept">责任部门</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">命名规范说明</Label>
              <Textarea
                value={tagForm.description}
                onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述该标签的命名规范..."
                className="mt-1 text-[14px] min-h-[80px]"
              />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">排序号</Label>
              <Input
                type="number"
                value={tagForm.sortOrder}
                onChange={(e) => setTagForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="mt-1 h-9 text-[14px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="h-9 px-4 text-[14px] border-dark-border-hover" onClick={() => setTagModalOpen(false)}>
              取消
            </Button>
            <Button className="h-9 px-4 text-[14px] bg-dark-accent-primary hover:bg-dark-accent-primary-active" onClick={() => setTagModalOpen(false)}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 新建分类弹窗 ── */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold">新建分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-[13px] text-dark-text-secondary">分类名称 <span className="text-error-500">*</span></Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入分类名称"
                className="mt-1 h-9 text-[14px]"
              />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">父分类</Label>
              <Select value={catForm.parent} onValueChange={(v) => setCatForm(prev => ({ ...prev, parent: v }))}>
                <SelectTrigger className="mt-1 h-9 text-[14px]">
                  <SelectValue placeholder="顶级分类（可选）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">顶级分类</SelectItem>
                  <SelectItem value="cat-biz">业务分类</SelectItem>
                  <SelectItem value="cat-quality">数据质量</SelectItem>
                  <SelectItem value="cat-mgmt">管理属性</SelectItem>
                  <SelectItem value="cat-dept">责任部门</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">排序号</Label>
              <Input
                type="number"
                value={catForm.sortOrder}
                onChange={(e) => setCatForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                className="mt-1 h-9 text-[14px]"
              />
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">描述</Label>
              <Textarea
                value={catForm.description}
                onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="分类描述..."
                className="mt-1 text-[14px] min-h-[60px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="h-9 px-4 text-[14px] border-dark-border-hover" onClick={() => setCatModalOpen(false)}>
              取消
            </Button>
            <Button className="h-9 px-4 text-[14px] bg-dark-accent-primary hover:bg-dark-accent-primary-active" onClick={() => setCatModalOpen(false)}>
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
