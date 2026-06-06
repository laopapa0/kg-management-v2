import { useState, useCallback, useMemo } from 'react';
import { Plus, Upload, Download, Pencil, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import SearchInput from '@/components/SearchInput';
import DataTable, { type Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/* ─── 类型 ─── */
interface PropertyDef extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  type: string;
  mappingRule: string;
  mappingType: string;
  isPrimary: boolean;
  isTitle: boolean;
  description: string;
}

/* ─── 常量 ─── */
const fieldTypeOptions = ['字符串', '整数', '浮点', '日期', '布尔', '枚举', 'JSON'];
const mappingTypeOptions = ['SQL 表达式', '静态值', '函数映射', '无映射'];

const mappingTypeBadgeType: Record<string, 'primary' | 'default' | 'success'> = {
  'SQL 表达式': 'primary',
  '静态值': 'default',
  '函数映射': 'success',
  '无映射': 'default',
};

const functionMappingOptions = [
  { value: 'sequence', label: '序列生成' },
  { value: 'hash', label: '哈希编码' },
  { value: 'timestamp', label: '时间戳' },
  { value: 'uuid', label: 'UUID' },
  { value: 'custom', label: '自定义' },
];

const dataSourceTables = [
  { id: 'tbl-indicators', name: 't_indicators', description: '指标主表' },
  { id: 'tbl-caliber', name: 't_caliber_definition', description: '口径定义表' },
  { id: 'tbl-category', name: 't_category_mapping', description: '分类映射表' },
  { id: 'tbl-metrics', name: 't_metric_values', description: '指标数值表' },
];

const initialProperties: PropertyDef[] = [
  { id: 'PATTR-001', code: 'PATTR-001', name: '指标编码', type: '字符串', mappingRule: 'IND_${seq}', mappingType: '函数映射', isPrimary: true, isTitle: true, description: '指标的唯一编码，通过序列自动生成' },
  { id: 'PATTR-002', code: 'PATTR-002', name: '指标名称', type: '字符串', mappingRule: 'indicator_name', mappingType: 'SQL 表达式', isPrimary: false, isTitle: true, description: '指标的中文名称' },
  { id: 'PATTR-003', code: 'PATTR-003', name: '业务口径', type: '字符串', mappingRule: 'caliber_desc', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标的业务口径说明' },
  { id: 'PATTR-004', code: 'PATTR-004', name: '计算方式', type: '枚举', mappingRule: 'calc_method', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标的计算方式' },
  { id: 'PATTR-005', code: 'PATTR-005', name: '计量单位', type: '枚举', mappingRule: 'unit_code', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标的计量单位' },
  { id: 'PATTR-006', code: 'PATTR-006', name: '更新频率', type: '枚举', mappingRule: "'日'", mappingType: '静态值', isPrimary: false, isTitle: false, description: '数据更新频率，默认每日' },
  { id: 'PATTR-007', code: 'PATTR-007', name: '对象类型一级', type: '枚举', mappingRule: 'level1', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标所属的一级' },
  { id: 'PATTR-008', code: 'PATTR-008', name: '对象类型二级', type: '枚举', mappingRule: 'level2', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标所属的二级' },
  { id: 'PATTR-009', code: 'PATTR-009', name: 'ARPU值', type: '浮点', mappingRule: 'revenue / user_count', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '每用户平均收入' },
  { id: 'PATTR-010', code: 'PATTR-010', name: '状态', type: '布尔', mappingRule: 'status = 1', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: '指标状态：启用/停用' },
  { id: 'PATTR-011', code: 'PATTR-011', name: '创建时间', type: '日期', mappingRule: 'NOW()', mappingType: '函数映射', isPrimary: false, isTitle: false, description: '记录创建时间' },
  { id: 'PATTR-012', code: 'PATTR-012', name: '扩展属性', type: 'JSON', mappingRule: 'custom_props', mappingType: 'SQL 表达式', isPrimary: false, isTitle: false, description: 'JSON格式的扩展属性' },
];

/* ─── 页面组件 ─── */
export default function PlatformPropertyPage() {
  const [data, setData] = useState<PropertyDef[]>(initialProperties);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [mappingTypeFilter, setMappingTypeFilter] = useState('全部');
  const [primaryFilter, setPrimaryFilter] = useState('全部');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<PropertyDef>>({});
  const [funcType, setFuncType] = useState('sequence');

  const resetFilters = useCallback(() => {
    setSearch('');
    setTypeFilter('全部');
    setMappingTypeFilter('全部');
    setPrimaryFilter('全部');
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (search && !item.name.includes(search) && !item.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== '全部' && item.type !== typeFilter) return false;
      if (mappingTypeFilter !== '全部' && item.mappingType !== mappingTypeFilter) return false;
      if (primaryFilter === '主键' && !item.isPrimary) return false;
      if (primaryFilter === '非主键' && item.isPrimary) return false;
      return true;
    });
  }, [data, search, typeFilter, mappingTypeFilter, primaryFilter]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm({
      code: '',
      name: '',
      type: '字符串',
      mappingRule: '',
      mappingType: 'SQL 表达式',
      isPrimary: false,
      isTitle: false,
      description: '',
    });
    setFuncType('sequence');
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((record: PropertyDef) => {
    setEditingId(record.id);
    setForm({ ...record });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name || !form.code) return;
    if (editingId) {
      setData(prev => prev.map(item => item.id === editingId ? { ...item, ...(form as PropertyDef) } : item));
    } else {
      const newItem: PropertyDef = { ...(form as PropertyDef), id: form.code || `PATTR-${Date.now()}` };
      setData(prev => [...prev, newItem]);
    }
    setModalOpen(false);
  }, [editingId, form]);

  const handleDelete = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    setDeleteConfirm(null);
  }, []);

  const updateForm = useCallback((key: keyof PropertyDef, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const renderMappingRule = (r: PropertyDef) => {
    if (!r.mappingRule) return <span className="text-[#c4cad4]">—</span>;
    if (r.mappingType === '静态值') {
      return <code className="text-[12px] font-mono bg-[#f1f3f6] px-1.5 py-0.5 rounded text-[#4a5568]">&apos;{r.mappingRule}&apos;</code>;
    }
    if (r.mappingType === '函数映射') {
      return <code className="text-[12px] font-mono bg-[#ecfdf5] px-1.5 py-0.5 rounded text-[#059669]">{r.mappingRule}</code>;
    }
    return <code className="text-[12px] font-mono bg-[#f1f3f6] px-1.5 py-0.5 rounded text-[#4a5568]">{r.mappingRule}</code>;
  };

  const columns: Column<PropertyDef>[] = useMemo(() => [
    { key: 'code', title: '属性编码', width: 'w-24' },
    { key: 'name', title: '属性名称', width: 'w-24' },
    { key: 'type', title: '字段类型', width: 'w-20', align: 'center' },
    { key: 'mappingRule', title: '映射规则', width: 'w-32', render: renderMappingRule },
    {
      key: 'mappingType',
      title: '映射类型',
      width: 'w-24',
      align: 'center',
      render: (r: PropertyDef) => (
        <StatusBadge text={r.mappingType} type={mappingTypeBadgeType[r.mappingType] || 'default'} />
      ),
    },
    {
      key: 'isPrimary',
      title: '是否主键',
      width: 'w-20',
      align: 'center',
      render: (r: PropertyDef) => (
        r.isPrimary ? <Check size={16} className="text-[#10b981] mx-auto" /> : <span className="text-[#c4cad4]">—</span>
      ),
    },
    {
      key: 'isTitle',
      title: '是否标题键',
      width: 'w-20',
      align: 'center',
      render: (r: PropertyDef) => (
        r.isTitle ? <Check size={16} className="text-[#10b981] mx-auto" /> : <span className="text-[#c4cad4]">—</span>
      ),
    },
    { key: 'description', title: '描述', render: (r: PropertyDef) => <span className="truncate max-w-[180px] inline-block">{r.description}</span> },
    {
      key: 'action',
      title: '操作',
      width: 'w-28',
      align: 'center',
      render: (r: PropertyDef) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[13px]" onClick={() => openEdit(r)}>
            <Pencil size={13} className="mr-1" />编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[13px] text-[#ef4444] hover:text-[#dc2626]"
            onClick={() => setDeleteConfirm(r.id)}
          >
            <Trash2 size={13} className="mr-1" />删除
          </Button>
        </div>
      ),
    },
  ], [openEdit]);

  const currentMappingType = form.mappingType || 'SQL 表达式';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-display">属性管理</h1>
          <p className="text-small text-[#6b7789] mt-1">统一管理所有属性的元数据，是图谱自动抽取和查询的基础</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate} className="bg-[#3478f6] hover:bg-[#1d5ee0] h-9">
            <Plus size={16} className="mr-1" />新增属性
          </Button>
          <Button variant="outline" className="h-9 border-[#dde1e8]">
            <Upload size={16} className="mr-1" />批量导入
          </Button>
          <Button variant="outline" className="h-9 border-[#dde1e8]">
            <Download size={16} className="mr-1" />导出
          </Button>
        </div>
      </div>

      {/* ── 搜索过滤工具栏 ── */}
      <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-5 py-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            placeholder="搜索属性名称或编码"
            value={search}
            onChange={setSearch}
            width="w-[280px]"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部类型</SelectItem>
              {fieldTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={mappingTypeFilter} onValueChange={setMappingTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部映射</SelectItem>
              {mappingTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={primaryFilter} onValueChange={setPrimaryFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部主键</SelectItem>
              <SelectItem value="主键">主键</SelectItem>
              <SelectItem value="非主键">非主键</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-9 ml-auto" onClick={resetFilters}>
            重置
          </Button>
        </div>
      </div>

      {/* ── 属性字段表格 ── */}
      <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <DataTable
          columns={columns}
          data={filteredData}
          rowKey="id"
          pagination={{
            current: 1,
            pageSize: 10,
            total: filteredData.length,
            onChange: () => {},
          }}
        />
      </div>

      {/* ── 新增/编辑弹窗 ── */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">{editingId ? '编辑属性' : '新增属性'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 基本信息区 */}
            <div>
              <h3 className="text-h3 mb-3">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#2d3748]">属性编码</label>
                  <input
                    type="text"
                    value={form.code || ''}
                    onChange={e => updateForm('code', e.target.value)}
                    disabled={!!editingId}
                    className={cn(
                      'h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568]',
                      'focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]',
                      'disabled:bg-[#f1f3f6] disabled:text-[#9ba4b3]'
                    )}
                    placeholder="如 PATTR-001"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#2d3748]">属性名称 <span className="text-[#ef4444]">*</span></label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={e => updateForm('name', e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]"
                    placeholder="属性显示名称"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#2d3748]">字段类型</label>
                  <Select value={form.type || '字符串'} onValueChange={v => updateForm('type', v)}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!form.isPrimary}
                      onCheckedChange={v => updateForm('isPrimary', v)}
                    />
                    <label className="text-[14px] text-[#4a5568]">是否主键</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!!form.isTitle}
                      onCheckedChange={v => updateForm('isTitle', v)}
                    />
                    <label className="text-[14px] text-[#4a5568]">是否标题键</label>
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[14px] font-medium text-[#2d3748]">描述</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => updateForm('description', e.target.value)}
                    className="w-full min-h-[50px] px-3 py-2 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] resize-y"
                    placeholder="属性的业务说明"
                  />
                </div>
              </div>
            </div>

            {/* 映射规则区 */}
            <div className="border-t border-[#e8ecf1] pt-4">
              <h3 className="text-h3 mb-1">映射规则</h3>
              <p className="text-[12px] text-[#9ba4b3] mb-3">定义如何从数据源抽取该属性</p>
              <RadioGroup
                value={currentMappingType}
                onValueChange={v => updateForm('mappingType', v)}
                className="flex flex-wrap gap-x-4 gap-y-2 mb-4"
              >
                {mappingTypeOptions.map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <RadioGroupItem value={t} id={`map-${t}`} />
                    <label htmlFor={`map-${t}`} className="text-[14px] text-[#4a5568] cursor-pointer">{t}</label>
                  </div>
                ))}
              </RadioGroup>

              {currentMappingType === 'SQL 表达式' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#2d3748]">数据源表</label>
                    <Select defaultValue="tbl-indicators">
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSourceTables.map(t => <SelectItem key={t.id} value={t.id}>{t.name} — {t.description}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#2d3748]">SQL 表达式</label>
                    <textarea
                      value={form.mappingRule || ''}
                      onChange={e => updateForm('mappingRule', e.target.value)}
                      className="w-full min-h-[50px] px-3 py-2 rounded-md border border-[#dde1e8] text-[14px] font-mono text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] resize-y"
                      placeholder="如: caliber_desc"
                    />
                    <p className="text-[12px] text-[#9ba4b3]">引用数据源表中的字段名即可</p>
                  </div>
                </div>
              )}

              {currentMappingType === '静态值' && (
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-[#2d3748]">静态值</label>
                  <input
                    type="text"
                    value={form.mappingRule || ''}
                    onChange={e => updateForm('mappingRule', e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]"
                    placeholder="输入固定值..."
                  />
                  <p className="text-[12px] text-[#9ba4b3]">所有实例将使用此固定值</p>
                </div>
              )}

              {currentMappingType === '函数映射' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#2d3748]">函数名</label>
                    <Select value={funcType} onValueChange={setFuncType}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {functionMappingOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {funcType === 'sequence' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-medium text-[#2d3748]">前缀</label>
                        <input type="text" className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]" placeholder="如 IND_" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-medium text-[#2d3748]">起始值</label>
                        <input type="number" className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]" placeholder="如 1" />
                      </div>
                    </div>
                  )}
                  {funcType === 'timestamp' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-medium text-[#2d3748]">时区</label>
                        <Select defaultValue="Asia/Shanghai">
                          <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[14px] font-medium text-[#2d3748]">格式</label>
                        <input type="text" className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]" placeholder="yyyy-MM-dd HH:mm:ss" />
                      </div>
                    </div>
                  )}
                  {funcType === 'custom' && (
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-medium text-[#2d3748]">自定义函数</label>
                      <textarea
                        value={form.mappingRule || ''}
                        onChange={e => updateForm('mappingRule', e.target.value)}
                        className="w-full min-h-[60px] px-3 py-2 rounded-md border border-[#dde1e8] text-[14px] font-mono text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] resize-y"
                        placeholder="输入自定义函数..."
                      />
                    </div>
                  )}
                  {funcType !== 'custom' && funcType !== 'sequence' && funcType !== 'timestamp' && (
                    <div className="space-y-1.5">
                      <label className="text-[14px] font-medium text-[#2d3748]">函数表达式</label>
                      <textarea
                        value={form.mappingRule || ''}
                        onChange={e => updateForm('mappingRule', e.target.value)}
                        className="w-full min-h-[50px] px-3 py-2 rounded-md border border-[#dde1e8] text-[14px] font-mono text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] resize-y"
                        placeholder="函数表达式..."
                      />
                    </div>
                  )}
                </div>
              )}

              {currentMappingType === '无映射' && (
                <p className="text-[14px] text-[#9ba4b3] py-2">该属性不参与自动抽取，需手动维护</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="border-[#dde1e8]">取消</Button>
            <Button onClick={handleSave} className="bg-[#3478f6] hover:bg-[#1d5ee0]">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 删除确认弹窗 ── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[400px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-[14px] text-[#4a5568] py-4">
            删除后不可恢复，是否继续？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="border-[#dde1e8]">取消</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
