import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  AlertTriangle,
  FolderTree,
   ChevronRight,
  ChevronDown,
     X,
  GripVertical,
   Check,
  FileText,
  Code2,
  GitBranch,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import DataTable, { type Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ─── 类型 ─── */
interface RuleCategory {
  id: string;
  name: string;
  children?: RuleCategory[];
}

interface RuleItem {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  paramSummary: string;
  parentRule: string | null;
  status: 'enabled' | 'disabled';
  updatedAt: string;
}

interface ConflictItem {
  id: string;
  type: string;
  rules: string[];
  description: string;
  severity: '严重' | '警告' | '一般' | '提示';
}

/* ─── Mock 数据 ─── */
const ruleCategoryTree: RuleCategory[] = [
  {
    id: 'cat-abnormal', name: '异常规则',
    children: [
      {
        id: 'cat-indicator-alert', name: '指标预警',
        children: [
          { id: 'cat-threshold', name: '阈值上下限' },
          { id: 'cat-topn', name: 'TOPN 监控' },
        ],
      },
      {
        id: 'cat-anomaly-algo', name: '异常算法',
        children: [
          { id: 'cat-fluctuation', name: '波动算法' },
          { id: 'cat-pearson', name: '皮尔逊算法' },
        ],
      },
    ],
  },
  { id: 'cat-quality', name: '质量规则', children: [] },
  { id: 'cat-compliance', name: '合规规则', children: [] },
];

const ruleListData: RuleItem[] = [
  { id: 'RULE-001', code: 'RULE-001', name: '通用上限告警', category: '异常规则 > 指标预警 > 阈值上下限', type: '阈值', paramSummary: 'upperLimit, alertLevel', parentRule: null, status: 'enabled', updatedAt: '2026-05-20 14:30' },
  { id: 'RULE-002', code: 'RULE-002', name: '通用下限告警', category: '异常规则 > 指标预警 > 阈值上下限', type: '阈值', paramSummary: 'lowerLimit, alertLevel', parentRule: null, status: 'enabled', updatedAt: '2026-05-20 14:30' },
  { id: 'RULE-003', code: 'RULE-003', name: '5G用户上限告警', category: '异常规则 > 指标预警 > 阈值上下限', type: '阈值', paramSummary: 'upperLimit=95%', parentRule: 'RULE-001', status: 'enabled', updatedAt: '2026-05-25 09:00' },
  { id: 'RULE-004', code: 'RULE-004', name: '同比波动检测', category: '异常规则 > 异常算法 > 波动算法', type: '波动', paramSummary: 'compareType=yoy, threshold', parentRule: null, status: 'enabled', updatedAt: '2026-05-18 11:20' },
  { id: 'RULE-005', code: 'RULE-005', name: '环比波动检测', category: '异常规则 > 异常算法 > 波动算法', type: '波动', paramSummary: 'compareType=mom, threshold', parentRule: 'RULE-004', status: 'enabled', updatedAt: '2026-05-19 16:45' },
  { id: 'RULE-006', code: 'RULE-006', name: '孤立森林异常', category: '异常规则 > 异常算法 > 皮尔逊算法', type: '异常检测', paramSummary: 'algorithm=isolation_forest', parentRule: null, status: 'enabled', updatedAt: '2026-05-10 10:00' },
  { id: 'RULE-007', code: 'RULE-007', name: 'TOP10降序监控', category: '异常规则 > 指标预警 > TOPN监控', type: 'TOPN', paramSummary: 'topN=10, desc', parentRule: null, status: 'enabled', updatedAt: '2026-05-22 13:15' },
  { id: 'RULE-008', code: 'RULE-008', name: '多条件组合规则', category: '异常规则 > 指标预警 > 阈值上下限', type: '复合', paramSummary: 'rules[], logicOp', parentRule: null, status: 'disabled', updatedAt: '2026-04-28 09:30' },
];

const conflictResultsData: ConflictItem[] = [
  { id: 'CF-001', type: '同名规则', rules: ['RULE-001', 'RULE-009'], description: '两个规则名称均为「通用上限告警」', severity: '警告' },
  { id: 'CF-002', type: '条件冲突', rules: ['RULE-003', 'RULE-010'], description: '对 5G用户渗透率 的上限阈值设置不同(95% vs 90%)', severity: '严重' },
  { id: 'CF-003', type: '范围重叠', rules: ['RULE-004', 'RULE-005'], description: '同比和环比检测的时间窗口重叠，可能重复告警', severity: '一般' },
  { id: 'CF-004', type: '冗余规则', rules: ['RULE-002', 'RULE-011'], description: '两个下限告警规则参数完全相同', severity: '警告' },
];

const defaultJsonSchema = `{
  "type": "object",
  "properties": {
    "upperLimit": {
      "type": "number",
      "title": "上限阈值",
      "description": "指标值超过此阈值时触发告警",
      "default": 95
    },
    "lowerLimit": {
      "type": "number",
      "title": "下限阈值",
      "description": "指标值低于此阈值时触发告警",
      "default": 5
    },
    "consecutiveCount": {
      "type": "integer",
      "title": "持续次数",
      "description": "连续几次超过阈值才告警",
      "default": 1,
      "minimum": 1,
      "maximum": 10
    },
    "alertLevel": {
      "type": "string",
      "title": "告警级别",
      "enum": ["紧急", "重要", "一般", "提示"],
      "default": "重要"
    }
  },
  "required": ["upperLimit", "lowerLimit"]
}`;

/* ─── 工具函数 ─── */
const getSeverityType = (severity: string): 'error' | 'warning' | 'default' | 'info' => {
  switch (severity) {
    case '严重': return 'error';
    case '警告': return 'warning';
    case '一般': return 'default';
    case '提示': return 'info';
    default: return 'default';
  }
};

/* ─── 树节点组件 ─── */
interface CatTreeNodeProps {
  node: RuleCategory;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (node: RuleCategory) => void;
  onToggleExpand: (id: string) => void;
}

function CatTreeNode({ node, selectedId, expandedIds, onSelect, onToggleExpand }: CatTreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        onClick={() => { onSelect(node); if (hasChildren) onToggleExpand(node.id); }}
        className={cn(
          'flex items-center h-9 px-2 rounded-md cursor-pointer transition-colors duration-100 select-none',
          isSelected ? 'bg-[#f3f0ff] text-[#7c5cfc] relative' : 'hover:bg-[#e8ecf1] text-[#4a5568]',
        )}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#7c5cfc] rounded-r-full" />
        )}
        {hasChildren ? (
          <span className="mr-1 text-[#9ba4b3]" onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px] mr-1" />
        )}
        <FolderTree size={14} className={cn('mr-2 shrink-0', isSelected ? 'text-[#7c5cfc]' : 'text-[#9ba4b3]')} />
        <span className={cn('text-[13px] truncate', isSelected && 'font-medium')}>{node.name}</span>
      </div>
      {hasChildren && isExpanded && (
        <div style={{ paddingLeft: '16px' }}>
          {node.children!.map((child) => (
            <CatTreeNode
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

/* ─── 主页面 ─── */
export default function NocRulePage() {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['cat-abnormal', 'cat-indicator-alert', 'cat-anomaly-algo']));
  const [treeSearch, setTreeSearch] = useState('');
  const [listSearch, setListSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [manageCatModalOpen, setManageCatModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null);
  const [conflictTab, setConflictTab] = useState<'pending' | 'resolved' | 'ignored'>('pending');
  const [detectingConflicts, setDetectingConflicts] = useState(false);
  const [, setConflictsDetected] = useState(false);
  const [jsonSchema, setJsonSchema] = useState(defaultJsonSchema);
  const [parentRule, setParentRule] = useState('');

  // Form state
  const [ruleForm, setRuleForm] = useState({
    name: '',
    category: '',
    type: '',
    description: '',
    status: true,
  });

  const selectedCat = useMemo(() => {
    if (!selectedCatId) return null;
    const find = (nodes: RuleCategory[]): RuleCategory | null => {
      for (const n of nodes) {
        if (n.id === selectedCatId) return n;
        if (n.children) { const f = find(n.children); if (f) return f; }
      }
      return null;
    };
    return find(ruleCategoryTree);
  }, [selectedCatId]);

  const filteredRules = useMemo(() => {
    let data = [...ruleListData];
    if (listSearch.trim()) {
      data = data.filter(r => r.name.toLowerCase().includes(listSearch.toLowerCase()));
    }
    if (typeFilter !== '全部') {
      data = data.filter(r => r.type === typeFilter);
    }
    if (selectedCat) {
      data = data.filter(r => r.category.includes(selectedCat.name));
    }
    return data;
  }, [listSearch, typeFilter, selectedCat]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openNewRuleModal = () => {
    setEditingRule(null);
    setRuleForm({ name: '', category: '', type: '', description: '', status: true });
    setJsonSchema(defaultJsonSchema);
    setParentRule('');
    setEditModalOpen(true);
  };

  const openEditRuleModal = (rule: RuleItem) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      category: rule.category,
      type: rule.type,
      description: '当指标值连续 N 次超过设定的上限阈值时触发告警，适用于监控指标是否超出正常范围的场景。',
      status: rule.status === 'enabled',
    });
    setJsonSchema(defaultJsonSchema);
    setParentRule(rule.parentRule || '');
    setEditModalOpen(true);
  };

  const handleDetectConflict = () => {
    setConflictModalOpen(true);
    setDetectingConflicts(true);
    setConflictsDetected(false);
    setTimeout(() => {
      setDetectingConflicts(false);
      setConflictsDetected(true);
    }, 1500);
  };

  /* ─── 规则表格列 ─── */
  const ruleColumns: Column<RuleItem>[] = [
    { key: 'code', title: '规则编码', width: 'w-[100px]' },
    { key: 'name', title: '规则名称' },
    { key: 'category', title: '分类' },
    {
      key: 'type',
      title: '类型',
      width: 'w-[80px]',
      render: (record: RuleItem) => (
        <StatusBadge text={record.type} type="noc" />
      ),
    },
    { key: 'paramSummary', title: '参数模板摘要' },
    {
      key: 'parentRule',
      title: '父规则',
      render: (record: RuleItem) => (
        record.parentRule ? (
          <span className="text-[12px] text-[#7c5cfc] bg-[#f3f0ff] px-2 py-0.5 rounded">
            ↳ {record.parentRule}
          </span>
        ) : (
          <span className="text-[12px] text-[#9ba4b3]">—</span>
        )
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: 'w-[70px]',
      render: (record: RuleItem) => (
        <Switch
          checked={record.status === 'enabled'}
          onCheckedChange={() => {}}
          className="data-[state=checked]:bg-[#7c5cfc]"
        />
      ),
    },
    { key: 'updatedAt', title: '最后修改', width: 'w-[130px]' },
    {
      key: 'action',
      title: '操作',
      width: 'w-[120px]',
      render: (record: RuleItem) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openEditRuleModal(record)} className="text-[12px] text-[#3478f6] hover:underline">编辑</button>
          <button className="text-[12px] text-[#ef4444] hover:underline">删除</button>
        </div>
      ),
    },
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
          <h1 className="text-[28px] font-semibold text-[#1a202c] leading-tight tracking-[-0.02em]">业务规则管理</h1>
          <p className="text-[13px] text-[#6b7789] mt-1">维护业务规则模板与分类体系，定义参数JSON Schema与继承关系</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={openNewRuleModal} className="bg-[#3478f6] hover:bg-[#1d5ee0] h-9 px-4 text-[14px]">
            <Plus size={16} className="mr-1.5" />
            新增规则
          </Button>
          <Button onClick={handleDetectConflict} variant="outline" className="h-9 px-4 text-[14px] border-[#dde1e8] text-[#4a5568] hover:bg-[#f8f9fb]">
            <AlertTriangle size={16} className="mr-1.5" />
            检测冲突
          </Button>
          <Button onClick={() => setManageCatModalOpen(true)} variant="outline" className="h-9 px-4 text-[14px] border-[#dde1e8] text-[#4a5568] hover:bg-[#f8f9fb]">
            <FolderTree size={16} className="mr-1.5" />
            管理分类
          </Button>
        </div>
      </div>

      {/* ── 左右分栏 ── */}
      <div className="flex gap-0 border border-[#e8ecf1] rounded-lg bg-white overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {/* 左侧：分类树 */}
        <div className="w-[240px] min-w-[240px] bg-[#f8f9fb] border-r border-[#e8ecf1] flex flex-col">
          <div className="p-3 border-b border-[#e8ecf1]">
            <SearchInput
              placeholder="搜索分类"
              value={treeSearch}
              onChange={setTreeSearch}
              width="w-full"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {ruleCategoryTree.map((node) => (
              <CatTreeNode
                key={node.id}
                node={node}
                selectedId={selectedCatId}
                expandedIds={expandedIds}
                onSelect={(n) => setSelectedCatId(n.id)}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
          {selectedCat && (
            <div className="p-3 border-t border-[#e8ecf1] bg-[#f3f0ff]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#7c5cfc] font-medium">已选分类: {selectedCat.name}</span>
                <button onClick={() => setSelectedCatId(null)} className="text-[#7c5cfc] hover:text-[#5a3fd6]">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：规则列表 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 工具栏 */}
          <div className="flex items-center justify-between p-4 border-b border-[#e8ecf1]">
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="搜索规则名称"
                value={listSearch}
                onChange={setListSearch}
                width="w-52"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-36 text-[14px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部类型</SelectItem>
                  <SelectItem value="阈值">阈值</SelectItem>
                  <SelectItem value="波动">波动</SelectItem>
                  <SelectItem value="异常检测">异常检测</SelectItem>
                  <SelectItem value="TOPN">TOPN</SelectItem>
                  <SelectItem value="复合">复合</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <span className="text-[13px] text-[#6b7789]">共 {filteredRules.length} 条</span>
          </div>

          {/* 表格 */}
          <div className="flex-1 overflow-y-auto p-4">
            <DataTable
              columns={ruleColumns as unknown as Column<Record<string, unknown>>[]}
              data={filteredRules as unknown as Record<string, unknown>[]}
              rowKey="id"
            />
          </div>
        </div>
      </div>

      {/* ── 新增/编辑规则弹窗 ── */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="w-[720px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold">
              {editingRule ? '编辑规则' : '新增规则'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-2">
            <TabsList className="w-full bg-[#f8f9fb] h-9">
              <TabsTrigger value="basic" className="text-[13px] flex-1 data-[state=active]:bg-white">
                <FileText size={14} className="mr-1.5" />基本信息
              </TabsTrigger>
              <TabsTrigger value="params" className="text-[13px] flex-1 data-[state=active]:bg-white">
                <Code2 size={14} className="mr-1.5" />参数定义
              </TabsTrigger>
              <TabsTrigger value="inherit" className="text-[13px] flex-1 data-[state=active]:bg-white">
                <GitBranch size={14} className="mr-1.5" />继承关系
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: 基本信息 */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[13px] text-[#4a5568]">规则编码</Label>
                  <Input
                    defaultValue={editingRule?.code || ''}
                    disabled={!!editingRule}
                    placeholder="自动生成"
                    className="mt-1 h-9 text-[14px] bg-[#f8f9fb]"
                  />
                </div>
                <div>
                  <Label className="text-[13px] text-[#4a5568]">规则名称 <span className="text-[#ef4444]">*</span></Label>
                  <Input
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入规则名称"
                    className="mt-1 h-9 text-[14px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[13px] text-[#4a5568]">所属分类</Label>
                  <Select value={ruleForm.category} onValueChange={(v) => setRuleForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-[14px]">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="阈值-上限告警">阈值 {'>'} 上限告警</SelectItem>
                      <SelectItem value="阈值-下限告警">阈值 {'>'} 下限告警</SelectItem>
                      <SelectItem value="波动-同比波动">波动 {'>'} 同比波动</SelectItem>
                      <SelectItem value="波动-环比波动">波动 {'>'} 环比波动</SelectItem>
                      <SelectItem value="异常-算法异常">异常 {'>'} 算法异常</SelectItem>
                      <SelectItem value="TOPN-TOPN降序">TOPN {'>'} TOPN降序</SelectItem>
                      <SelectItem value="复合-多条件组合">复合 {'>'} 多条件组合</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[13px] text-[#4a5568]">规则类型</Label>
                  <Select value={ruleForm.type} onValueChange={(v) => setRuleForm(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger className="mt-1 h-9 text-[14px]">
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="阈值">阈值</SelectItem>
                      <SelectItem value="波动">波动</SelectItem>
                      <SelectItem value="异常检测">异常检测</SelectItem>
                      <SelectItem value="TOPN">TOPN</SelectItem>
                      <SelectItem value="复合">复合</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[13px] text-[#4a5568]">规则逻辑描述</Label>
                <Textarea
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="用自然语言描述规则逻辑..."
                  className="mt-1 text-[14px] min-h-[100px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[13px] text-[#4a5568]">状态</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#4a5568]">{ruleForm.status ? '启用' : '停用'}</span>
                  <Switch checked={ruleForm.status} onCheckedChange={(v) => setRuleForm(prev => ({ ...prev, status: v }))} />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: 参数定义 */}
            <TabsContent value="params" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-medium text-[#4a5568]">参数定义（JSON Schema）</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[12px] border-[#dde1e8]">
                    校验 JSON
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[12px] text-[#3478f6]">
                    格式化
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e293b] rounded-l-md flex flex-col items-center pt-2 text-[#64748b] text-[11px] font-mono select-none">
                  {jsonSchema.split('\n').map((_, i) => (
                    <div key={i} className="leading-5">{i + 1}</div>
                  ))}
                </div>
                <Textarea
                  value={jsonSchema}
                  onChange={(e) => setJsonSchema(e.target.value)}
                  className="pl-12 text-[13px] font-mono min-h-[200px] bg-[#1e293b] text-[#e2e8f0] border-[#334155] rounded-md leading-5"
                  spellCheck={false}
                />
              </div>
            </TabsContent>

            {/* Tab 3: 继承关系 */}
            <TabsContent value="inherit" className="space-y-4 mt-4">
              <div>
                <Label className="text-[13px] text-[#4a5568]">父规则选择</Label>
                <Select value={parentRule} onValueChange={setParentRule}>
                  <SelectTrigger className="mt-1 h-9 text-[14px]">
                    <SelectValue placeholder="选择可继承的父规则（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RULE-001">RULE-001 通用上限告警</SelectItem>
                    <SelectItem value="RULE-002">RULE-002 通用下限告警</SelectItem>
                    <SelectItem value="RULE-004">RULE-004 同比波动检测</SelectItem>
                  </SelectContent>
                </Select>
                {parentRule && (
                  <div className="mt-3 p-3 bg-[#f8f9fb] rounded-md border border-[#e8ecf1]">
                    <p className="text-[12px] text-[#6b7789] mb-2">父规则参数预览（只读）</p>
                    <pre className="text-[12px] font-mono text-[#4a5568] bg-white p-2 rounded border border-[#e8ecf1] overflow-x-auto">
{`{
  "upperLimit": 95,
  "alertLevel": "重要",
  "consecutiveCount": 1
}`}
                    </pre>
                  </div>
                )}
                <p className="text-[12px] text-[#9ba4b3] mt-2">子规则将继承父规则的所有参数，可覆盖部分参数值</p>
              </div>

              {/* 子规则列表 */}
              {editingRule && ruleListData.some(r => r.parentRule === editingRule.id) && (
                <div className="mt-4">
                  <h3 className="text-[14px] font-medium text-[#4a5568] mb-2">继承此规则的子规则</h3>
                  <div className="border border-[#e8ecf1] rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-[#f1f3f6]">
                        <tr className="border-b border-[#e8ecf1]">
                          <th className="h-8 px-3 text-left text-[12px] font-medium text-[#4a5568]">子规则编码</th>
                          <th className="h-8 px-3 text-left text-[12px] font-medium text-[#4a5568]">子规则名称</th>
                          <th className="h-8 px-3 text-left text-[12px] font-medium text-[#4a5568]">覆盖参数</th>
                          <th className="h-8 px-3 text-left text-[12px] font-medium text-[#4a5568]">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ruleListData.filter(r => r.parentRule === editingRule.id).map((sub) => (
                          <tr key={sub.id} className="border-b border-[#e8ecf1] hover:bg-[#f8f9fb]">
                            <td className="h-9 px-3 text-[13px] text-[#4a5568]">{sub.code}</td>
                            <td className="h-9 px-3 text-[13px] text-[#4a5568]">{sub.name}</td>
                            <td className="h-9 px-3 text-[12px] text-[#7c5cfc]">{sub.paramSummary}</td>
                            <td className="h-9 px-3">
                              <button className="text-[12px] text-[#3478f6] hover:underline">查看</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e8ecf1]">
            <Button variant="outline" className="h-9 px-4 text-[14px] border-[#dde1e8]" onClick={() => setEditModalOpen(false)}>
              取消
            </Button>
            <Button className="h-9 px-4 text-[14px] bg-[#3478f6] hover:bg-[#1d5ee0]" onClick={() => setEditModalOpen(false)}>
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 冲突检测弹窗 ── */}
      <Dialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
        <DialogContent className="w-[800px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold flex items-center gap-2">
              <AlertTriangle size={20} className="text-[#f59e0b]" />
              规则冲突检测结果
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {detectingConflicts ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="w-8 h-8 border-2 border-[#3478f6] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[14px] text-[#6b7789]">正在检测规则冲突...</p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="flex items-center gap-4 mb-4 border-b border-[#e8ecf1]">
                  {(['pending', 'resolved', 'ignored'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setConflictTab(tab)}
                      className={cn(
                        'pb-2 text-[14px] font-medium transition-colors border-b-2',
                        conflictTab === tab
                          ? 'text-[#3478f6] border-[#3478f6]'
                          : 'text-[#6b7789] border-transparent hover:text-[#4a5568]'
                      )}
                    >
                      {tab === 'pending' ? '待处理' : tab === 'resolved' ? '已处理' : '已忽略'}
                      {tab === 'pending' && <span className="ml-1 text-[12px]">({conflictResultsData.length})</span>}
                    </button>
                  ))}
                </div>

                {conflictTab === 'pending' && (
                  <div className="space-y-2">
                    {conflictResultsData.map((conflict, idx) => (
                      <motion.div
                        key={conflict.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="border border-[#e8ecf1] rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-[#4a5568]">{conflict.type}</span>
                            <StatusBadge text={conflict.severity} type={getSeverityType(conflict.severity)} />
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="text-[12px] text-[#3478f6] hover:underline">查看详情</button>
                            <button className="text-[12px] text-[#10b981] hover:underline">标记已处理</button>
                            <button className="text-[12px] text-[#9ba4b3] hover:underline">忽略</button>
                          </div>
                        </div>
                        <p className="text-[13px] text-[#6b7789] mb-1">{conflict.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[#9ba4b3]">涉及规则:</span>
                          {conflict.rules.map((r) => (
                            <span key={r} className="text-[12px] px-2 py-0.5 rounded bg-[#eef4ff] text-[#3478f6]">{r}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {conflictTab === 'resolved' && (
                  <div className="py-12 text-center text-[#9ba4b3]">
                    <Check size={48} className="mx-auto mb-3 text-[#c4cad4]" />
                    <p className="text-[14px] text-[#6b7789]">暂无已处理记录</p>
                  </div>
                )}

                {conflictTab === 'ignored' && (
                  <div className="py-12 text-center text-[#9ba4b3]">
                    <X size={48} className="mx-auto mb-3 text-[#c4cad4]" />
                    <p className="text-[14px] text-[#6b7789]">暂无已忽略记录</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* ── 管理分类弹窗 ── */}
      <Dialog open={manageCatModalOpen} onOpenChange={setManageCatModalOpen}>
        <DialogContent className="w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold">管理规则分类</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {ruleCategoryTree.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center h-10 px-3 bg-[#f8f9fb] rounded-md border border-[#e8ecf1]">
                  <GripVertical size={14} className="text-[#c4cad4] mr-2 cursor-grab" />
                  <FolderTree size={14} className="text-[#9ba4b3] mr-2" />
                  <span className="flex-1 text-[14px] text-[#4a5568]">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button className="text-[12px] text-[#3478f6] hover:underline">编辑</button>
                    <button className="text-[12px] text-[#ef4444] hover:underline">删除</button>
                  </div>
                </div>
                {cat.children && cat.children.map((child) => (
                  <div key={child.id} className="flex items-center h-9 px-3 ml-6 mt-1 rounded-md border border-[#e8ecf1] hover:bg-[#f8f9fb]">
                    <GripVertical size={14} className="text-[#c4cad4] mr-2 cursor-grab" />
                    <span className="flex-1 text-[13px] text-[#4a5568]">{child.name}</span>
                    <div className="flex items-center gap-2">
                      <button className="text-[12px] text-[#3478f6] hover:underline">编辑</button>
                      <button className="text-[12px] text-[#ef4444] hover:underline">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e8ecf1]">
            <Button variant="outline" size="sm" className="h-8 text-[13px] border-[#dde1e8]">
              <Plus size={14} className="mr-1" />
              新增顶级分类
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-9 px-4 text-[14px] border-[#dde1e8]" onClick={() => setManageCatModalOpen(false)}>
                取消
              </Button>
              <Button className="h-9 px-4 text-[14px] bg-[#3478f6] hover:bg-[#1d5ee0]" onClick={() => setManageCatModalOpen(false)}>
                保存排序
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
