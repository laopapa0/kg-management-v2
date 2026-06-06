import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Upload,
  Download,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  KeyRound,
  Type,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import SearchInput from '@/components/SearchInput';
import DataTable from '@/components/DataTable';
import type { Column } from '@/components/DataTable';

/* ─── 类型定义 ─── */
interface Property extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  type: string;
  isPrimary: boolean;
  isTitle: boolean;
  defaultValue: string;
  validation: string;
  description: string;
  referencedCount: number;
}

interface PropertyReference extends Record<string, unknown> {
  objectType: string;
  level1: string;
  level2: string;
  isRequired: boolean;
  linkedAt: string;
}

/* ─── Mock 数据 ─── */
const propertyDictionary: Property[] = [
  { id: 'PROP-001', code: 'PROP-001', name: '用户编号', type: '字符串', isPrimary: true, isTitle: true, defaultValue: '', validation: '^[A-Z0-9]{10}$', description: '用户唯一标识编号', referencedCount: 8 },
  { id: 'PROP-002', code: 'PROP-002', name: '用户状态', type: '枚举', isPrimary: false, isTitle: false, defaultValue: 'active', validation: '', description: '用户当前状态', referencedCount: 5 },
  { id: 'PROP-003', code: 'PROP-003', name: '入网时间', type: '日期', isPrimary: false, isTitle: false, defaultValue: '', validation: '', description: '用户入网时间', referencedCount: 6 },
  { id: 'PROP-004', code: 'PROP-004', name: '套餐类型', type: '字符串', isPrimary: false, isTitle: false, defaultValue: '', validation: '', description: '用户订购的套餐类型', referencedCount: 3 },
  { id: 'PROP-005', code: 'PROP-005', name: 'ARPU值', type: '浮点', isPrimary: false, isTitle: true, defaultValue: '0.00', validation: '>=0', description: '每用户平均收入', referencedCount: 9 },
  { id: 'PROP-006', code: 'PROP-006', name: '流量使用量', type: '浮点', isPrimary: false, isTitle: false, defaultValue: '0.00', validation: '>=0', description: '用户流量使用量(GB)', referencedCount: 7 },
  { id: 'PROP-007', code: 'PROP-007', name: '归属区局', type: '字符串', isPrimary: false, isTitle: false, defaultValue: '', validation: '', description: '用户归属的区局', referencedCount: 12 },
  { id: 'PROP-008', code: 'PROP-008', name: '归属BD', type: '字符串', isPrimary: false, isTitle: false, defaultValue: '', validation: '', description: '用户归属的业务区', referencedCount: 6 },
  { id: 'PROP-009', code: 'PROP-009', name: '收入金额', type: '浮点', isPrimary: false, isTitle: true, defaultValue: '0.00', validation: '>=0', description: '收入金额', referencedCount: 10 },
  { id: 'PROP-010', code: 'PROP-010', name: '更新时间', type: '日期', isPrimary: false, isTitle: false, defaultValue: '', validation: '', description: '数据更新时间', referencedCount: 15 },
  { id: 'PROP-011', code: 'PROP-011', name: '是否有效', type: '布尔', isPrimary: false, isTitle: false, defaultValue: 'true', validation: '', description: '记录是否有效', referencedCount: 11 },
  { id: 'PROP-012', code: 'PROP-012', name: '指标编码', type: '字符串', isPrimary: true, isTitle: true, defaultValue: '', validation: '^IND-[0-9]{4}-[0-9]{4}$', description: '指标唯一编码', referencedCount: 20 },
];

const fieldTypeOptions = ['全部', '字符串', '整数', '浮点', '日期', '布尔', '枚举'];

const propReferencesMap: Record<string, PropertyReference[]> = {
  'PROP-001': [
    { objectType: '5G用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '移动用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '宽带用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-02-01' },
    { objectType: '政企客户', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '家庭客户', level1: '经营', level2: '收入分析', isRequired: false, linkedAt: '2026-02-10' },
    { objectType: '网络资源', level1: '交付', level2: '资源利用', isRequired: false, linkedAt: '2026-03-01' },
    { objectType: '故障工单', level1: '交付', level2: '网络质量', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '投诉工单', level1: '服务', level2: '投诉处理', isRequired: false, linkedAt: '2026-03-10' },
  ],
  'PROP-002': [
    { objectType: '5G用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '移动用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '宽带用户', level1: '发展', level2: '用户发展', isRequired: false, linkedAt: '2026-02-01' },
    { objectType: '政企客户', level1: '经营', level2: '收入分析', isRequired: false, linkedAt: '2026-02-10' },
    { objectType: '家庭客户', level1: '经营', level2: '收入分析', isRequired: false, linkedAt: '2026-02-10' },
  ],
  'PROP-005': [
    { objectType: '5G用户', level1: '发展', level2: '用户发展', isRequired: false, linkedAt: '2026-01-15' },
    { objectType: '移动用户', level1: '发展', level2: '用户发展', isRequired: false, linkedAt: '2026-01-15' },
    { objectType: '宽带用户', level1: '发展', level2: '用户发展', isRequired: false, linkedAt: '2026-02-01' },
    { objectType: '营业收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '政企收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '家庭收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: 'ARPU', level1: '经营', level2: '效益评估', isRequired: true, linkedAt: '2026-03-01' },
    { objectType: 'ROI', level1: '经营', level2: '效益评估', isRequired: false, linkedAt: '2026-03-01' },
    { objectType: '整体满意度', level1: '服务', level2: '客户满意度', isRequired: false, linkedAt: '2026-03-10' },
  ],
  'PROP-012': [
    { objectType: '5G用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '移动用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-01-15' },
    { objectType: '宽带用户', level1: '发展', level2: '用户发展', isRequired: true, linkedAt: '2026-02-01' },
    { objectType: '营业收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '政企收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '家庭收入', level1: '经营', level2: '收入分析', isRequired: true, linkedAt: '2026-02-10' },
    { objectType: '故障率', level1: '交付', level2: '网络质量', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '覆盖率', level1: '交付', level2: '网络质量', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '安装时长', level1: '交付', level2: '交付效率', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '整体满意度', level1: '服务', level2: '客户满意度', isRequired: true, linkedAt: '2026-03-10' },
    { objectType: '接通率', level1: '服务', level2: '服务效率', isRequired: true, linkedAt: '2026-03-10' },
    { objectType: '一次解决率', level1: '服务', level2: '服务效率', isRequired: true, linkedAt: '2026-03-10' },
    { objectType: 'NPS评分', level1: '服务', level2: '客户满意度', isRequired: true, linkedAt: '2026-03-10' },
    { objectType: 'ARPU', level1: '经营', level2: '效益评估', isRequired: true, linkedAt: '2026-03-01' },
    { objectType: 'ROI', level1: '经营', level2: '效益评估', isRequired: true, linkedAt: '2026-03-01' },
    { objectType: '5G套餐', level1: '发展', level2: '业务发展', isRequired: true, linkedAt: '2026-01-20' },
    { objectType: 'FTTR', level1: '发展', level2: '业务发展', isRequired: true, linkedAt: '2026-01-20' },
    { objectType: '带宽利用率', level1: '交付', level2: '资源利用', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '端口利用率', level1: '交付', level2: '资源利用', isRequired: true, linkedAt: '2026-03-05' },
    { objectType: '网络成本', level1: '经营', level2: '成本控制', isRequired: true, linkedAt: '2026-02-15' },
  ],
};

// 为其他属性生成引用数据
function generateReferences(propId: string, _propName?: string): PropertyReference[] {
  const count = propertyDictionary.find((p) => p.id === propId)?.referencedCount || 3;
  const objectTypes = [
    { name: '5G用户', level1: '发展', level2: '用户发展' },
    { name: '移动用户', level1: '发展', level2: '用户发展' },
    { name: '宽带用户', level1: '发展', level2: '用户发展' },
    { name: '营业收入', level1: '经营', level2: '收入分析' },
    { name: '政企收入', level1: '经营', level2: '收入分析' },
    { name: '家庭收入', level1: '经营', level2: '收入分析' },
    { name: '故障率', level1: '交付', level2: '网络质量' },
    { name: '覆盖率', level1: '交付', level2: '网络质量' },
    { name: '整体满意度', level1: '服务', level2: '客户满意度' },
    { name: '接通率', level1: '服务', level2: '服务效率' },
    { name: 'ARPU', level1: '经营', level2: '效益评估' },
    { name: 'ROI', level1: '经营', level2: '效益评估' },
  ];
  const refs: PropertyReference[] = [];
  for (let i = 0; i < Math.min(count, objectTypes.length); i++) {
    refs.push({
      objectType: objectTypes[i].name,
      level1: objectTypes[i].level1,
      level2: objectTypes[i].level2,
      isRequired: i < count / 2,
      linkedAt: `2026-${String(1 + (i % 5)).padStart(2, '0')}-${String(10 + (i % 20)).padStart(2, '0')}`,
    });
  }
  return refs;
}

/* ─── 主页面组件 ─── */
export default function NocPropertyPage() {
  /* 数据状态 */
  const [properties, setProperties] = useState<Property[]>(propertyDictionary);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* 搜索过滤 */
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [primaryFilter, setPrimaryFilter] = useState('全部');
  const [titleFilter, setTitleFilter] = useState('全部');

  /* 分页 */
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* 属性弹窗 */
  const [propModalOpen, setPropModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [propForm, setPropForm] = useState({
    name: '', type: '', isPrimary: false, isTitle: false,
    defaultValue: '', validation: '', description: '',
  });

  /* 删除确认 */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProp, setDeletingProp] = useState<Property | null>(null);

  /* 过滤数据 */
  const filteredData = useMemo(() => {
    let result = [...properties];
    if (search.trim()) {
      const kw = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
      );
    }
    if (typeFilter !== '全部') {
      result = result.filter((p) => p.type === typeFilter);
    }
    if (primaryFilter !== '全部') {
      result = result.filter((p) => (primaryFilter === '是主键' ? p.isPrimary : !p.isPrimary));
    }
    if (titleFilter !== '全部') {
      result = result.filter((p) => (titleFilter === '是标题键' ? p.isTitle : !p.isTitle));
    }
    return result;
  }, [properties, search, typeFilter, primaryFilter, titleFilter]);

  /* 分页数据 */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  /* 打开新增 */
  const openAdd = () => {
    setEditingProp(null);
    setPropForm({
      name: '', type: '', isPrimary: false, isTitle: false,
      defaultValue: '', validation: '', description: '',
    });
    setPropModalOpen(true);
  };

  /* 打开编辑 */
  const openEdit = (prop: Property) => {
    setEditingProp(prop);
    setPropForm({
      name: prop.name, type: prop.type, isPrimary: prop.isPrimary, isTitle: prop.isTitle,
      defaultValue: prop.defaultValue, validation: prop.validation, description: prop.description,
    });
    setPropModalOpen(true);
  };

  /* 保存属性 */
  const saveProperty = () => {
    if (!propForm.name || !propForm.type) return;
    if (editingProp) {
      setProperties((prev) => prev.map((p) =>
        p.id === editingProp.id
          ? { ...p, ...propForm, name: propForm.name, type: propForm.type }
          : p
      ));
    } else {
      const newId = `PROP-${String(properties.length + 1).padStart(3, '0')}`;
      setProperties((prev) => [...prev, {
        id: newId, code: newId, ...propForm,
        referencedCount: 0,
      }]);
    }
    setPropModalOpen(false);
  };

  /* 删除 */
  const openDelete = (prop: Property) => {
    setDeletingProp(prop);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (!deletingProp) return;
    setProperties((prev) => prev.filter((p) => p.id !== deletingProp.id));
    setDeleteDialogOpen(false);
    setDeletingProp(null);
  };

  /* 获取引用数据 */
  const getReferences = (propId: string): PropertyReference[] => {
    return propReferencesMap[propId] || generateReferences(propId, '');
  };

  /* 切换展开 */
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => prev === id ? null : id);
  };

  /* 重置过滤 */
  const resetFilters = () => {
    setSearch('');
    setTypeFilter('全部');
    setPrimaryFilter('全部');
    setTitleFilter('全部');
    setPage(1);
  };

  /* 主表格列 */
  const mainColumns: Column<Property>[] = [
    {
      key: 'expand',
      title: '',
      width: 'w-10',
      align: 'center',
      render: (record) => (
        <button onClick={() => toggleExpand(record.id)} className="text-[#9ba4b3] hover:text-[#6b7789] transition-colors">
          {expandedId === record.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      ),
    },
    { key: 'code', title: '属性编码', width: 'w-28' },
    { key: 'name', title: '属性名称' },
    {
      key: 'type',
      title: '字段类型',
      width: 'w-24',
      align: 'center',
      render: (record) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-[#f1f3f6] text-[#4a5568]">
          {record.type}
        </span>
      ),
    },
    {
      key: 'isPrimary',
      title: '是否主键',
      width: 'w-24',
      align: 'center',
      render: (record) => record.isPrimary ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-medium bg-[#ecfdf5] text-[#059669]">
          <KeyRound size={10} /> 是
        </span>
      ) : (
        <span className="text-[#9ba4b3] text-[12px]">—</span>
      ),
    },
    {
      key: 'isTitle',
      title: '是否标题键',
      width: 'w-24',
      align: 'center',
      render: (record) => record.isTitle ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-medium bg-[#eef4ff] text-[#3478f6]">
          <Type size={10} /> 是
        </span>
      ) : (
        <span className="text-[#9ba4b3] text-[12px]">—</span>
      ),
    },
    { key: 'description', title: '描述' },
    {
      key: 'referencedCount',
      title: '被引用数',
      width: 'w-20',
      align: 'center',
      render: (record) => (
        <span className={cn(
          'inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-medium',
          record.referencedCount >= 10 ? 'bg-[#f3f0ff] text-[#7c5cfc]' : 'bg-[#f1f3f6] text-[#6b7789]'
        )}>
          {record.referencedCount}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 'w-28',
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => openEdit(record)}>
            <Pencil size={12} className="mr-1" />编辑
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-[#ef4444] hover:text-[#dc2626]" onClick={() => openDelete(record)}>
            <Trash2 size={12} className="mr-1" />删除
          </Button>
        </div>
      ),
    },
  ];

  /* 引用子表格列 */
  const refColumns: Column<PropertyReference>[] = [
    { key: 'objectType', title: '对象类型名称' },
    { key: 'level1', title: '所属分类', render: (record) => `${record.level1} > ${record.level2}` },
    {
      key: 'isRequired',
      title: '是否必挂',
      width: 'w-24',
      align: 'center',
      render: (record) => (
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium',
          record.isRequired ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#f1f3f6] text-[#9ba4b3]'
        )}>
          {record.isRequired ? '必挂' : '可选'}
        </span>
      ),
    },
    { key: 'linkedAt', title: '引用时间', width: 'w-32' },
    {
      key: 'action',
      title: '操作',
      width: 'w-24',
      render: () => (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-[#ef4444] hover:text-[#dc2626]">
          解除关联
        </Button>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-display">属性管理</h1>
          <p className="text-small text-[#6b7789] mt-1">维护指标对象的属性定义，管理属性中英文名称、数据类型与映射关系</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="h-9 bg-[#7c5cfc] hover:bg-[#6b4ce0] text-white" onClick={openAdd}>
            <Plus size={16} className="mr-1" />
            新增属性
          </Button>
          <Button variant="outline" className="h-9 border-[#dde1e8] text-[#4a5568]">
            <Upload size={16} className="mr-1" />
            批量导入
          </Button>
          <Button variant="outline" className="h-9 border-[#dde1e8] text-[#4a5568]">
            <Download size={16} className="mr-1" />
            导出
          </Button>
        </div>
      </div>

      {/* 搜索过滤工具栏 */}
      <div className="bg-white rounded-lg border border-[#e8ecf1] p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            placeholder="搜索属性名称或编码"
            value={search}
            onChange={setSearch}
            width="w-[280px]"
          />
          <div className="flex items-center gap-2">
            <Label className="text-[12px] text-[#6b7789] whitespace-nowrap">字段类型</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-32 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypeOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[12px] text-[#6b7789] whitespace-nowrap">主键</Label>
            <Select value={primaryFilter} onValueChange={setPrimaryFilter}>
              <SelectTrigger className="h-9 w-28 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="是主键">是主键</SelectItem>
                <SelectItem value="非主键">非主键</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[12px] text-[#6b7789] whitespace-nowrap">标题键</Label>
            <Select value={titleFilter} onValueChange={setTitleFilter}>
              <SelectTrigger className="h-9 w-28 text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部</SelectItem>
                <SelectItem value="是标题键">是标题键</SelectItem>
                <SelectItem value="非标题键">非标题键</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="h-8 text-[12px] text-[#6b7789]" onClick={resetFilters}>
              <X size={12} className="mr-1" />重置过滤
            </Button>
          </div>
        </div>
      </div>

      {/* 属性字典表格 */}
      <div className="bg-white rounded-lg border border-[#e8ecf1]">
        <div className="p-5">
          <DataTable
            columns={mainColumns}
            data={paginatedData}
            rowKey="id"
            onRowClick={(record) => toggleExpand(record.id)}
            pagination={{
              current: page,
              pageSize,
              total: filteredData.length,
              onChange: setPage,
            }}
          />
        </div>

        {/* 展开的行 - 引用详情 */}
        <AnimatePresence>
          {expandedId && paginatedData.find((p) => p.id === expandedId) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="overflow-hidden border-t border-[#e8ecf1] bg-[#f8f9fb]"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronDown size={14} className="text-[#7c5cfc]" />
                  <h3 className="text-[14px] font-medium text-[#2d3748]">
                    「{paginatedData.find((p) => p.id === expandedId)?.name}」被引用的对象类型
                  </h3>
                  <span className="text-[12px] text-[#9ba4b3]">
                    (共 {getReferences(expandedId).length} 个)
                  </span>
                </div>
                <div className="bg-white rounded-lg border border-[#e8ecf1] overflow-hidden">
                  <DataTable columns={refColumns} data={getReferences(expandedId)} rowKey="objectType" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 新增/编辑属性弹窗 ─── */}
      <Dialog open={propModalOpen} onOpenChange={setPropModalOpen}>
        <DialogContent className="max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-h3">{editingProp ? '编辑属性' : '新增属性'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-2">
            <div>
              <Label>属性编码</Label>
              <Input value={editingProp?.code || ''} disabled className="mt-1 bg-[#f1f3f6] text-[#9ba4b3]" placeholder="系统自动生成" />
            </div>
            <div>
              <Label>属性名称 <span className="text-[#ef4444]">*</span></Label>
              <Input
                value={propForm.name}
                onChange={(e) => setPropForm({ ...propForm, name: e.target.value })}
                className="mt-1"
                placeholder="如 用户编号"
              />
            </div>
            <div>
              <Label>字段类型 <span className="text-[#ef4444]">*</span></Label>
              <Select value={propForm.type} onValueChange={(v) => setPropForm({ ...propForm, type: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="请选择" /></SelectTrigger>
                <SelectContent>
                  {fieldTypeOptions.filter((o) => o !== '全部').map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>默认值</Label>
              <Input
                value={propForm.defaultValue}
                onChange={(e) => setPropForm({ ...propForm, defaultValue: e.target.value })}
                className="mt-1"
                placeholder="可选"
              />
            </div>
            <div className="col-span-2 flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label className="text-[13px] cursor-pointer">是否主键</Label>
                <Switch
                  checked={propForm.isPrimary}
                  onCheckedChange={(v) => setPropForm({ ...propForm, isPrimary: v })}
                />
                <span className={cn('text-[13px] font-medium', propForm.isPrimary ? 'text-[#059669]' : 'text-[#9ba4b3]')}>
                  {propForm.isPrimary ? '✓ 是主键' : '否'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-[13px] cursor-pointer">是否标题键</Label>
                <Switch
                  checked={propForm.isTitle}
                  onCheckedChange={(v) => setPropForm({ ...propForm, isTitle: v })}
                />
                <span className={cn('text-[13px] font-medium', propForm.isTitle ? 'text-[#3478f6]' : 'text-[#9ba4b3]')}>
                  {propForm.isTitle ? '✓ 是标题键' : '否'}
                </span>
              </div>
            </div>
            <div className="col-span-2">
              <Label>校验规则</Label>
              <Textarea
                value={propForm.validation}
                onChange={(e) => setPropForm({ ...propForm, validation: e.target.value })}
                className="mt-1 font-mono text-[13px]"
                rows={2}
                placeholder="如正则表达式或范围规则"
              />
            </div>
            <div className="col-span-2">
              <Label>描述</Label>
              <Textarea
                value={propForm.description}
                onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                className="mt-1"
                rows={3}
                placeholder="属性的业务说明"
              />
            </div>
          </div>
          <p className="text-[12px] text-[#9ba4b3] mt-3">
            属性的修改将同步影响所有引用该属性的对象类型
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setPropModalOpen(false)}>取消</Button>
            <Button
              className="bg-[#7c5cfc] hover:bg-[#6b4ce0] text-white"
              onClick={saveProperty}
              disabled={!propForm.name || !propForm.type}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── 删除确认弹窗 ─── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-h3 flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#f59e0b]" />
              确认删除
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#6b7789] pt-2">
              {deletingProp && (
                <>
                  确定要删除属性「<span className="font-medium text-[#2d3748]">{deletingProp.name}</span>」吗？
                  {deletingProp.referencedCount > 0 && (
                    <span className="block mt-2 text-[#ef4444]">
                      该属性被 {deletingProp.referencedCount} 个对象类型引用，删除将影响这些对象类型。
                    </span>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white" onClick={confirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
