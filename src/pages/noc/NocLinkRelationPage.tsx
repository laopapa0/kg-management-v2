import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  AlertTriangle,
  Play,
  Table,
  Network,
  ArrowRight,
  Link,
  Combine,
  GitBranch,
  Shuffle,
  Eye,
  Check,
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
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SearchInput from '@/components/SearchInput';
import DataTable from '@/components/DataTable';
import type { Column } from '@/components/DataTable';

/* ─── 类型定义 ─── */
interface RelationType extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  sourceScope: string[];
  targetScope: string[];
  direction: '有向' | '无向';
  color: string;
  icon: string;
  description: string;
}

interface RelationInstance extends Record<string, unknown> {
  id: string;
  source: string;
  sourceId: string;
  target: string;
  targetId: string;
  type: string;
  confidence: number;
  description: string;
}

interface QualityIssue extends Record<string, unknown> {
  id: string;
  checkItem: string;
  type: string;
  severity: '严重' | '警告' | '一般' | '提示';
  objects: string;
  time: string;
}

/* ─── Mock 数据 ─── */
const relationTypeDefinitions: RelationType[] = [
  { id: 'REL-T-001', code: 'DEPENDS_ON', name: '依赖关系', sourceScope: ['发展', '经营'], targetScope: ['发展', '经营'], direction: '有向', color: '#3478f6', icon: 'Link', description: '源指标依赖于目标指标' },
  { id: 'REL-T-002', code: 'CAUSES', name: '因果关系', sourceScope: ['交付'], targetScope: ['服务'], direction: '有向', color: '#f59e0b', icon: 'ArrowRight', description: '源指标影响目标指标' },
  { id: 'REL-T-003', code: 'AGGREGATES', name: '聚合关系', sourceScope: ['经营'], targetScope: ['发展', '交付'], direction: '有向', color: '#10b981', icon: 'Combine', description: '源指标由目标指标聚合而来' },
  { id: 'REL-T-004', code: 'DERIVED_FROM', name: '衍生关系', sourceScope: ['发展'], targetScope: ['发展'], direction: '有向', color: '#7c5cfc', icon: 'GitBranch', description: '源指标由目标指标衍生计算' },
  { id: 'REL-T-005', code: 'CORRELATES', name: '相关关系', sourceScope: ['全部'], targetScope: ['全部'], direction: '无向', color: '#6b7789', icon: 'Shuffle', description: '两指标之间存在相关性' },
];

const relationInstances: RelationInstance[] = [
  { id: 'REL-001', source: '5G用户渗透率', sourceId: 'IND-0056', target: '5G流量占比', targetId: 'IND-0057', type: 'DEPENDS_ON', confidence: 95, description: '5G用户增长带动流量增长' },
  { id: 'REL-002', source: '各区局收入', sourceId: 'IND-0201', target: '全网约收入', targetId: 'IND-0200', type: 'AGGREGATES', confidence: 100, description: '汇总各区局收入数据' },
  { id: 'REL-003', source: '网络故障率', sourceId: 'IND-0034', target: '客户满意度', targetId: 'IND-0089', type: 'CAUSES', confidence: 78, description: '网络故障影响客户体验' },
  { id: 'REL-004', source: '宽带用户数', sourceId: 'IND-0102', target: '千兆用户占比', targetId: 'IND-0105', type: 'DERIVED_FROM', confidence: 88, description: '基于宽带用户总数计算' },
  { id: 'REL-005', source: 'FTTR安装量', sourceId: 'IND-0120', target: '家庭业务收入', targetId: 'IND-0203', type: 'DEPENDS_ON', confidence: 82, description: 'FTTR带动家庭业务' },
];

const qualityIssuesData: QualityIssue[] = [
  { id: 'QI-001', checkItem: '循环依赖检测', type: '循环依赖', severity: '严重', objects: '收入指标 → 成本指标 → 收入指标', time: '2026-05-29 10:30' },
  { id: 'QI-002', checkItem: '同名不同义检测', type: '同名不同义', severity: '警告', objects: '「用户满意度」在不同部门定义不同', time: '2026-05-29 10:30' },
  { id: 'QI-003', checkItem: '无效链接检测', type: '无效链接', severity: '一般', objects: 'REL-012 指向已删除指标', time: '2026-05-29 10:30' },
  { id: 'QI-004', checkItem: '孤立节点检测', type: '孤立节点', severity: '提示', objects: '3 个指标无任何关系链接', time: '2026-05-29 10:30' },
  { id: 'QI-005', checkItem: '枚举值关联检测', type: '关联缺失', severity: '警告', objects: '「经营」与「效能」之间缺少业务关联定义', time: '2026-05-29 10:30' },
];

const objectTypeCategories = ['全部', '经营', '发展', '交付', '服务'];

const relationTypeOptions = ['DEPENDS_ON', 'CAUSES', 'AGGREGATES', 'DERIVED_FROM', 'CORRELATES'];

/* ─── 严重程度 Badge ─── */
function SeverityBadge({ severity }: { severity: QualityIssue['severity'] }) {
  const styles: Record<string, { bg: string; text: string }> = {
    '严重': { bg: 'bg-error-500/10', text: 'text-error-600' },
    '警告': { bg: 'bg-warning-500/10', text: 'text-warning-600' },
    '一般': { bg: 'bg-dark-accent-primary/10', text: 'text-dark-accent-primary' },
    '提示': { bg: 'bg-dark-card-l2', text: 'text-dark-text-secondary' },
  };
  const s = styles[severity] || styles['提示'];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium', s.bg, s.text)}>
      {severity}
    </span>
  );
}

/* ─── 关系类型图标 ─── */
function RelationIcon({ icon, color, size = 16 }: { icon: string; color: string; size?: number }) {
  const props = { size, style: { color } };
  switch (icon) {
    case 'ArrowRight': return <ArrowRight {...props} />;
    case 'Combine': return <Combine {...props} />;
    case 'GitBranch': return <GitBranch {...props} />;
    case 'Shuffle': return <Shuffle {...props} />;
    default: return <Link {...props} />;
  }
}

/* ─── 图谱视图（简化 SVG） ─── */
function GraphView({ instances }: { instances: RelationInstance[] }) {
  const nodes = Array.from(new Set([...instances.map((i) => i.source), ...instances.map((i) => i.target)]));
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const centerX = 400;
    const centerY = 250;
    const radius = 180;
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      positions[node] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      };
    });
    return positions;
  }, [nodes.join(',')]);

  return (
    <div className="w-full h-[500px] bg-dark-page rounded-lg border border-dark-border relative overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 800 500">
        {instances.map((inst) => {
          const src = nodePositions[inst.source];
          const tgt = nodePositions[inst.target];
          if (!src || !tgt) return null;
          const typeDef = relationTypeDefinitions.find((t) => t.code === inst.type);
          return (
            <g key={inst.id}>
              <line
                x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={typeDef?.color || '#6b7789'}
                strokeWidth={2}
                strokeDasharray={typeDef?.direction === '无向' ? '5,5' : undefined}
                markerEnd={`url(#arrow-${inst.type})`}
              />
              <text
                x={(src.x + tgt.x) / 2}
                y={(src.y + tgt.y) / 2 - 6}
                textAnchor="middle"
                className="text-[10px]"
                fill={typeDef?.color || '#6b7789'}
              >
                {inst.type}
              </text>
            </g>
          );
        })}
        {nodes.map((node) => {
          const pos = nodePositions[node];
          if (!pos) return null;
          return (
            <g key={node}>
              <circle cx={pos.x} cy={pos.y} r={32} fill="#fff" stroke="#dde1e8" strokeWidth={2} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="text-[10px]" fill="#2d3748">
                {node.length > 4 ? node.slice(0, 4) + '...' : node}
              </text>
            </g>
          );
        })}
        {/* 箭头定义 */}
        <defs>
          {relationTypeDefinitions.map((t) => (
            <marker key={t.code} id={`arrow-${t.code}`} markerWidth="10" markerHeight="10" refX="42" refY="5" orient="auto">
              <path d="M0,0 L10,5 L0,10 L2,5 Z" fill={t.color} />
            </marker>
          ))}
        </defs>
      </svg>
      <div className="absolute top-3 right-3 bg-dark-elevated/90 rounded-md border border-dark-border p-2">
        <div className="text-[11px] text-dark-text-secondary mb-1">图例</div>
        {relationTypeDefinitions.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5 py-0.5">
            <div className="w-3 h-0.5 rounded" style={{ backgroundColor: t.color }} />
            <span className="text-[11px] text-dark-text-secondary">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 主页面组件 ─── */
export default function NocLinkRelationPage() {
  const [activeTab, setActiveTab] = useState<'type' | 'instance'>('type');

  /* 关系类型定义状态 */
  const [relTypes, setRelTypes] = useState<RelationType[]>(relationTypeDefinitions);
  const [relTypeModalOpen, setRelTypeModalOpen] = useState(false);
  const [editingRelType, setEditingRelType] = useState<RelationType | null>(null);
  const [relTypeForm, setRelTypeForm] = useState({
    code: '', name: '', sourceScope: [] as string[], targetScope: [] as string[],
    direction: '有向' as '有向' | '无向', color: '#3478f6', icon: 'Link', description: '',
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  /* 关系实例状态 */
  const [relInstances, setRelInstances] = useState<RelationInstance[]>(relationInstances);
  const [viewMode, setViewMode] = useState<'table' | 'graph'>('table');
  const [instanceModalOpen, setInstanceModalOpen] = useState(false);
  const [instanceForm, setInstanceForm] = useState({
    source: '', target: '', type: '', confidence: [80] as number[], description: '',
  });

  /* 质量监控状态 */
  const [qualityIssues] = useState<QualityIssue[]>(qualityIssuesData);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showQualityResults, setShowQualityResults] = useState(false);

  /* 关系类型操作 */
  const openAddRelType = () => {
    setEditingRelType(null);
    setRelTypeForm({ code: '', name: '', sourceScope: [], targetScope: [], direction: '有向', color: '#3478f6', icon: 'Link', description: '' });
    setRelTypeModalOpen(true);
  };
  const openEditRelType = (rt: RelationType) => {
    setEditingRelType(rt);
    setRelTypeForm({ ...rt, sourceScope: [...rt.sourceScope], targetScope: [...rt.targetScope] });
    setRelTypeModalOpen(true);
  };
  const saveRelType = () => {
    if (!relTypeForm.name) return;
    if (editingRelType) {
      setRelTypes((prev) => prev.map((r) => r.id === editingRelType.id ? { ...r, ...relTypeForm } : r));
    } else {
      const newId = `REL-T-${String(relTypes.length + 1).padStart(3, '0')}`;
      setRelTypes((prev) => [...prev, { id: newId, ...relTypeForm }]);
    }
    setRelTypeModalOpen(false);
  };
  const deleteRelType = (id: string) => {
    setRelTypes((prev) => prev.filter((r) => r.id !== id));
  };

  /* 关系实例操作 */
  const openAddInstance = () => {
    setInstanceForm({ source: '', target: '', type: '', confidence: [80], description: '' });
    setInstanceModalOpen(true);
  };
  const saveInstance = () => {
    if (!instanceForm.source || !instanceForm.target || !instanceForm.type) return;
    const newId = `REL-${String(relInstances.length + 1).padStart(3, '0')}`;
    setRelInstances((prev) => [...prev, {
      id: newId,
      source: instanceForm.source,
      sourceId: `IND-${Math.floor(Math.random() * 10000)}`,
      target: instanceForm.target,
      targetId: `IND-${Math.floor(Math.random() * 10000)}`,
      type: instanceForm.type,
      confidence: instanceForm.confidence[0],
      description: instanceForm.description,
    }]);
    setInstanceModalOpen(false);
  };
  const deleteInstance = (id: string) => {
    setRelInstances((prev) => prev.filter((r) => r.id !== id));
  };

  /* 质量检测 */
  const runDetection = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      setShowQualityResults(true);
    }, 1500);
  };

  /* 多选 */
  const toggleRowSelect = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const batchDelete = () => {
    setRelTypes((prev) => prev.filter((r) => !selectedRows.has(r.id)));
    setSelectedRows(new Set());
  };

  /* 关系类型表格列 */
  const relTypeColumns: Column<RelationType>[] = [
    {
      key: 'select', title: '', width: 'w-10', align: 'center',
      render: (record) => (
        <div
          className={cn(
            'w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors',
            selectedRows.has(record.id) ? 'bg-[var(--accent-noc)] border-[var(--accent-noc)]' : 'border-dark-border-hover hover:border-[var(--accent-noc)]'
          )}
          onClick={() => toggleRowSelect(record.id)}
        >
          {selectedRows.has(record.id) && <Check size={10} className="text-white" />}
        </div>
      ),
    },
    { key: 'id', title: '关系类型编码', width: 'w-28' },
    {
      key: 'name',
      title: '关系名称',
      render: (record) => (
        <div className="flex items-center gap-2">
          <RelationIcon icon={record.icon} color={record.color} />
          <span>{record.name}</span>
        </div>
      ),
    },
    { key: 'sourceScope', title: '源对象类型范围', render: (record) => record.sourceScope.join('、') },
    { key: 'targetScope', title: '目标对象类型范围', render: (record) => record.targetScope.join('、') },
    {
      key: 'direction',
      title: '方向性',
      width: 'w-20',
      align: 'center',
      render: (record) => (
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium',
          record.direction === '有向' ? 'bg-dark-accent-primary/10 text-dark-accent-primary' : 'bg-dark-card-l2 text-dark-text-secondary'
        )}>
          {record.direction}
        </span>
      ),
    },
    { key: 'description', title: '描述' },
    {
      key: 'action',
      title: '操作',
      width: 'w-28',
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => openEditRelType(record)}>
            <Pencil size={12} className="mr-1" />编辑
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-error-500 hover:text-error-600" onClick={() => deleteRelType(record.id)}>
            <Trash2 size={12} className="mr-1" />删除
          </Button>
        </div>
      ),
    },
  ];

  /* 关系实例表格列 */
  const instanceColumns: Column<RelationInstance>[] = [
    { key: 'id', title: '关系ID', width: 'w-24' },
    { key: 'source', title: '源对象实例' },
    {
      key: 'type',
      title: '关系类型',
      width: 'w-28',
      render: (record) => {
        const typeDef = relationTypeDefinitions.find((t) => t.code === record.type);
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: typeDef?.color || '#6b7789' }} />
            <span className="text-[12px]">{record.type}</span>
          </div>
        );
      },
    },
    { key: 'target', title: '目标对象实例' },
    {
      key: 'confidence',
      title: '置信度',
      width: 'w-24',
      align: 'center',
      render: (record) => (
        <span className={cn(
          'text-[13px] font-medium',
          record.confidence >= 90 ? 'text-success-600' : record.confidence >= 70 ? 'text-warning-600' : 'text-dark-text-secondary'
        )}>
          {record.confidence}%
        </span>
      ),
    },
    { key: 'description', title: '描述' },
    {
      key: 'action',
      title: '操作',
      width: 'w-24',
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-error-500 hover:text-error-600" onClick={() => deleteInstance(record.id)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  /* 质量监控表格列 */
  const qualityColumns: Column<QualityIssue>[] = [
    { key: 'checkItem', title: '检测项' },
    { key: 'type', title: '问题类型', width: 'w-28' },
    {
      key: 'severity',
      title: '严重程度',
      width: 'w-24',
      align: 'center',
      render: (record) => <SeverityBadge severity={record.severity} />,
    },
    { key: 'objects', title: '涉及对象' },
    { key: 'time', title: '检测时间', width: 'w-40' },
    {
      key: 'action',
      title: '操作',
      width: 'w-36',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]">
            <Eye size={12} className="mr-1" />查看
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-error-500 hover:text-error-600">
            忽略
          </Button>
        </div>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-display">链接关系管理</h1>
          <p className="text-small text-dark-text-secondary mt-1">维护指标间的血缘链接关系，配置关联类型与属性映射</p>
        </div>
        {activeTab === 'type' ? (
          <div className="flex items-center gap-2">
            <Button className="h-9 bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white" onClick={openAddRelType}>
              <Plus size={16} className="mr-1" />
              新增关系类型
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover text-dark-text-secondary" onClick={() => setImportModalOpen(true)}>
              <Upload size={16} className="mr-1" />
              批量导入
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover text-dark-text-secondary">
              <Download size={16} className="mr-1" />
              导出
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button className="h-9 bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white" onClick={openAddInstance}>
              <Plus size={16} className="mr-1" />
              新增关系实例
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover text-dark-text-secondary">
              <AlertTriangle size={16} className="mr-1" />
              质量检测
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-dark-border mb-5">
        <button
          className={cn(
            'px-4 py-3 text-[14px] font-medium transition-colors relative',
            activeTab === 'type' ? 'text-[var(--accent-noc)]' : 'text-dark-text-secondary hover:text-dark-text-primary'
          )}
          onClick={() => setActiveTab('type')}
        >
          关系类型定义
          {activeTab === 'type' && (
            <motion.div layoutId="link-relation-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-noc)]" />
          )}
        </button>
        <button
          className={cn(
            'px-4 py-3 text-[14px] font-medium transition-colors relative',
            activeTab === 'instance' ? 'text-[var(--accent-noc)]' : 'text-dark-text-secondary hover:text-dark-text-primary'
          )}
          onClick={() => setActiveTab('instance')}
        >
          关系实例维护
          {activeTab === 'instance' && (
            <motion.div layoutId="link-relation-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-noc)]" />
          )}
        </button>
      </div>

      {/* Tab 内容 */}
      <AnimatePresence mode="wait">
        {activeTab === 'type' ? (
          <motion.div
            key="type-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* 批量操作栏 */}
            {selectedRows.size > 0 && (
              <div className="flex items-center justify-between bg-[var(--accent-noc)]/10 border border-dark-border rounded-lg px-4 py-2 mb-3">
                <span className="text-[13px] text-[var(--accent-noc)]">已选择 {selectedRows.size} 项</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-[12px] border-dark-border-hover" onClick={() => setSelectedRows(new Set())}>
                    取消选择
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[12px] border-dark-border-hover">
                    <Download size={12} className="mr-1" />批量导出
                  </Button>
                  <Button size="sm" className="h-7 text-[12px] bg-error-500 hover:bg-error-600 text-white" onClick={batchDelete}>
                    <Trash2 size={12} className="mr-1" />批量删除
                  </Button>
                </div>
              </div>
            )}

            {/* 关系类型表格 */}
            <div className="bg-dark-elevated rounded-lg border border-dark-border">
              <div className="p-5">
                <DataTable columns={relTypeColumns} data={relTypes} rowKey="id" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="instance-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* 关系实例卡片 */}
            <div className="bg-dark-elevated rounded-lg border border-dark-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
                <h2 className="text-h2">关系实例列表</h2>
                <div className="flex items-center gap-1 bg-dark-card-l2 rounded-md p-0.5">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded text-[13px] font-medium transition-colors',
                      viewMode === 'table' ? 'bg-dark-elevated text-dark-text-primary shadow-sm' : 'text-dark-text-secondary hover:text-dark-text-primary'
                    )}
                    onClick={() => setViewMode('table')}
                  >
                    <Table size={14} /> 表格视图
                  </button>
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded text-[13px] font-medium transition-colors',
                      viewMode === 'graph' ? 'bg-dark-elevated text-dark-text-primary shadow-sm' : 'text-dark-text-secondary hover:text-dark-text-primary'
                    )}
                    onClick={() => setViewMode('graph')}
                  >
                    <Network size={14} /> 图谱视图
                  </button>
                </div>
              </div>
              <div className="p-5">
                {viewMode === 'table' ? (
                  <DataTable columns={instanceColumns} data={relInstances} rowKey="id" />
                ) : (
                  <GraphView instances={relInstances} />
                )}
              </div>
            </div>

            {/* 质量监控 */}
            <div className="mt-6 bg-warning-500/10/30 rounded-lg border border-warning-300">
              <div className="flex items-center justify-between px-5 py-4 border-b border-warning-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-warning-500" />
                  <h2 className="text-h2">质量监控</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-warning-300 text-warning-600 hover:bg-warning-500/10"
                  onClick={runDetection}
                  disabled={isDetecting}
                >
                  {isDetecting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-warning-600 border-t-transparent rounded-full mr-2"
                      />
                      检测中...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="mr-1" /> 运行检测
                    </>
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {showQualityResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5">
                      <DataTable columns={qualityColumns} data={qualityIssues} rowKey="id" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showQualityResults && (
                <div className="px-5 py-8 text-center text-[13px] text-dark-text-tertiary">
                  点击「运行检测」开始质量检查
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 关系类型弹窗 ─── */}
      <Dialog open={relTypeModalOpen} onOpenChange={setRelTypeModalOpen}>
        <DialogContent className="max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-h3">{editingRelType ? '编辑关系类型' : '新增关系类型'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>关系类型编码 {editingRelType && <span className="text-dark-text-tertiary">(自动生成)</span>}</Label>
              <Input value={editingRelType?.id || ''} disabled className="mt-1 bg-dark-card-l2 text-dark-text-tertiary" />
            </div>
            <div>
              <Label>关系名称 <span className="text-error-500">*</span></Label>
              <Input value={relTypeForm.name} onChange={(e) => setRelTypeForm({ ...relTypeForm, name: e.target.value })} className="mt-1" placeholder="如 依赖关系" />
            </div>
            <div>
              <Label>源对象类型范围</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {objectTypeCategories.map((cat) => (
                  <button
                    key={cat}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors',
                      relTypeForm.sourceScope.includes(cat)
                        ? 'bg-[var(--accent-noc)]/10 border-[var(--accent-noc)] text-[var(--accent-noc)]'
                        : 'bg-dark-elevated border-dark-border-hover text-dark-text-secondary hover:border-dark-border-hover'
                    )}
                    onClick={() => {
                      setRelTypeForm((prev) => {
                        const has = prev.sourceScope.includes(cat);
                        return {
                          ...prev,
                          sourceScope: has ? prev.sourceScope.filter((s) => s !== cat) : [...prev.sourceScope, cat],
                        };
                      });
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>目标对象类型范围</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {objectTypeCategories.map((cat) => (
                  <button
                    key={cat}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors',
                      relTypeForm.targetScope.includes(cat)
                        ? 'bg-[var(--accent-noc)]/10 border-[var(--accent-noc)] text-[var(--accent-noc)]'
                        : 'bg-dark-elevated border-dark-border-hover text-dark-text-secondary hover:border-dark-border-hover'
                    )}
                    onClick={() => {
                      setRelTypeForm((prev) => {
                        const has = prev.targetScope.includes(cat);
                        return {
                          ...prev,
                          targetScope: has ? prev.targetScope.filter((s) => s !== cat) : [...prev.targetScope, cat],
                        };
                      });
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>方向性</Label>
              <RadioGroup
                value={relTypeForm.direction}
                onValueChange={(v) => setRelTypeForm({ ...relTypeForm, direction: v as '有向' | '无向' })}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="有向" id="dir-directed" />
                  <Label htmlFor="dir-directed" className="text-[13px] cursor-pointer">有向</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="无向" id="dir-undirected" />
                  <Label htmlFor="dir-undirected" className="text-[13px] cursor-pointer">无向</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>颜色</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={relTypeForm.color}
                    onChange={(e) => setRelTypeForm({ ...relTypeForm, color: e.target.value })}
                    className="w-10 h-9 rounded border border-dark-border-hover cursor-pointer"
                  />
                  <Input value={relTypeForm.color} onChange={(e) => setRelTypeForm({ ...relTypeForm, color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <Label>图标</Label>
                <Select value={relTypeForm.icon} onValueChange={(v) => setRelTypeForm({ ...relTypeForm, icon: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Link">Link</SelectItem>
                    <SelectItem value="ArrowRight">ArrowRight</SelectItem>
                    <SelectItem value="Combine">Combine</SelectItem>
                    <SelectItem value="GitBranch">GitBranch</SelectItem>
                    <SelectItem value="Shuffle">Shuffle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>描述</Label>
              <Textarea value={relTypeForm.description} onChange={(e) => setRelTypeForm({ ...relTypeForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRelTypeModalOpen(false)}>取消</Button>
            <Button className="bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white" onClick={saveRelType} disabled={!relTypeForm.name}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 批量导入弹窗 ─── */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-h3">批量导入关系类型</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <div className="border-2 border-dashed border-dark-border-hover rounded-lg p-8 text-center hover:border-dark-accent-primary-hover transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-dark-text-tertiary mb-3" />
              <p className="text-[14px] text-dark-text-secondary mb-1">点击或拖拽上传文件</p>
              <p className="text-[12px] text-dark-text-tertiary">支持 .csv, .xlsx, .xls</p>
            </div>
            <div className="mt-4 text-center">
              <Button variant="link" className="text-[var(--accent-noc)] text-[13px]">
                <Download size={14} className="mr-1" /> 下载导入模板
              </Button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setImportModalOpen(false)}>取消</Button>
            <Button className="bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white">确认导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 新增关系实例弹窗 ─── */}
      <Dialog open={instanceModalOpen} onOpenChange={setInstanceModalOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-h3">新增关系实例</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>源对象实例 <span className="text-error-500">*</span></Label>
              <SearchInput
                placeholder="搜索指标..."
                value={instanceForm.source}
                onChange={(v) => setInstanceForm({ ...instanceForm, source: v })}
                width="w-full"
                className="mt-1"
              />
            </div>
            <div>
              <Label>关系类型 <span className="text-error-500">*</span></Label>
              <select
                value={instanceForm.type}
                onChange={(e) => setInstanceForm({ ...instanceForm, type: e.target.value })}
                className="h-9 w-full mt-1 rounded-md border border-dark-border-hover bg-dark-elevated px-3 text-[14px] focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
              >
                <option value="">请选择</option>
                {relationTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>目标对象实例 <span className="text-error-500">*</span></Label>
              <SearchInput
                placeholder="搜索指标..."
                value={instanceForm.target}
                onChange={(v) => setInstanceForm({ ...instanceForm, target: v })}
                width="w-full"
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label>置信度</Label>
                <span className="text-[13px] font-medium text-[var(--accent-noc)]">{instanceForm.confidence[0]}%</span>
              </div>
              <Slider
                value={instanceForm.confidence}
                onValueChange={(v) => setInstanceForm({ ...instanceForm, confidence: v })}
                max={100}
                step={1}
                className="mt-3"
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea value={instanceForm.description} onChange={(e) => setInstanceForm({ ...instanceForm, description: e.target.value })} className="mt-1" rows={3} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setInstanceModalOpen(false)}>取消</Button>
            <Button
              className="bg-[var(--accent-noc)] hover:bg-[var(--accent-noc)] text-white"
              onClick={saveInstance}
              disabled={!instanceForm.source || !instanceForm.target || !instanceForm.type}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
