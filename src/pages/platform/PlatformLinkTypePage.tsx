import { useState, useCallback, useMemo } from 'react';
import {
  Plus, Upload, Download, Pencil, Trash2,
  ArrowRight, ArrowLeftRight, Link, Combine, GitBranch,
  Shuffle, Layers, Replace, ExternalLink, TrendingUp, TrendingDown,
  Activity, BarChart3, PieChart, LineChart, Network, Share2,
  Merge, Split, Workflow, Search, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

import SearchInput from '@/components/SearchInput';
import DataTable, { type Column } from '@/components/DataTable';

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
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

/* ─── 类型 ─── */
interface LinkTypeDef extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  displayName: string;
  direction: '有向' | '无向';
  color: string;
  icon: string;
  sourceTypes: string[];
  targetTypes: string[];
  description: string;
}

/* ─── 常量 ─── */
const presetColors = [
  '#3478f6', '#f59e0b', '#10b981', '#7c5cfc',
  '#6b7789', '#ec4899', '#f97316', '#06b6d4',
  '#ef4444', '#eab308', '#6366f1', '#14b8a6',
];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Link, ArrowRight, Combine, GitBranch, Shuffle, Layers, Replace, ExternalLink,
  ArrowLeftRight, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, LineChart,
  Network, Share2, Merge, Split, Workflow,
};

const iconNames = Object.keys(iconMap);

const objectTypeCategoryOptions = ['全部', '经营', '发展', '交付', '服务'];

const initialLinkTypes: LinkTypeDef[] = [
  { id: 'LKT-001', code: 'LKT-001', name: 'DEPENDS_ON', displayName: '依赖关系', direction: '有向', color: '#3478f6', icon: 'Link', sourceTypes: ['全部'], targetTypes: ['全部'], description: '源指标依赖于目标指标的存在或值' },
  { id: 'LKT-002', code: 'LKT-002', name: 'CAUSES', displayName: '因果关系', direction: '有向', color: '#f59e0b', icon: 'ArrowRight', sourceTypes: ['交付'], targetTypes: ['服务'], description: '源指标的变化会导致目标指标的变化' },
  { id: 'LKT-003', code: 'LKT-003', name: 'AGGREGATES', displayName: '聚合关系', direction: '有向', color: '#10b981', icon: 'Combine', sourceTypes: ['经营'], targetTypes: ['发展', '交付'], description: '源指标由多个目标指标聚合汇总而来' },
  { id: 'LKT-004', code: 'LKT-004', name: 'DERIVED_FROM', displayName: '衍生关系', direction: '有向', color: '#7c5cfc', icon: 'GitBranch', sourceTypes: ['发展'], targetTypes: ['发展'], description: '源指标通过计算从目标指标衍生而来' },
  { id: 'LKT-005', code: 'LKT-005', name: 'CORRELATES', displayName: '相关关系', direction: '无向', color: '#6b7789', icon: 'Shuffle', sourceTypes: ['全部'], targetTypes: ['全部'], description: '两指标之间存在统计相关性' },
  { id: 'LKT-006', code: 'LKT-006', name: 'PART_OF', displayName: '组成关系', direction: '有向', color: '#ec4899', icon: 'Layers', sourceTypes: ['全部'], targetTypes: ['全部'], description: '源指标是目标指标的组成部分' },
  { id: 'LKT-007', code: 'LKT-007', name: 'REPLACES', displayName: '替代关系', direction: '有向', color: '#f97316', icon: 'Replace', sourceTypes: ['全部'], targetTypes: ['全部'], description: '源指标替代了目标指标' },
  { id: 'LKT-008', code: 'LKT-008', name: 'REFERENCES', displayName: '引用关系', direction: '有向', color: '#06b6d4', icon: 'ExternalLink', sourceTypes: ['全部'], targetTypes: ['全部'], description: '源指标引用了目标指标的定义' },
];

/* ─── 图标渲染 ─── */
function IconRenderer({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const IconComp = iconMap[name] || Link;
  return <IconComp size={size} className={className} />;
}

/* ─── 页面组件 ─── */
export default function PlatformLinkTypePage() {
  const [data, setData] = useState<LinkTypeDef[]>(initialLinkTypes);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState('全部');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('全部');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState('');

  const [form, setForm] = useState<Partial<LinkTypeDef>>({});

  const resetFilters = useCallback(() => {
    setSearch('');
    setDirectionFilter('全部');
    setSourceTypeFilter('全部');
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.displayName.includes(search) && !item.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (directionFilter !== '全部' && item.direction !== directionFilter) return false;
      if (sourceTypeFilter !== '全部' && !item.sourceTypes.includes(sourceTypeFilter) && !item.sourceTypes.includes('全部')) return false;
      return true;
    });
  }, [data, search, directionFilter, sourceTypeFilter]);

  const openCreate = useCallback(() => {
    setEditingId(null);
    setForm({
      code: '',
      name: '',
      displayName: '',
      direction: '有向',
      color: '#3478f6',
      icon: 'Link',
      sourceTypes: ['全部'],
      targetTypes: ['全部'],
      description: '',
    });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((record: LinkTypeDef) => {
    setEditingId(record.id);
    setForm({ ...record });
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.name || !form.code) return;
    if (editingId) {
      setData(prev => prev.map(item => item.id === editingId ? { ...item, ...(form as LinkTypeDef) } : item));
    } else {
      const newItem: LinkTypeDef = { ...(form as LinkTypeDef), id: form.code || `LKT-${Date.now()}` };
      setData(prev => [...prev, newItem]);
    }
    setModalOpen(false);
  }, [editingId, form]);

  const handleDelete = useCallback((id: string) => {
    setData(prev => prev.filter(item => item.id !== id));
    setDeleteConfirm(null);
  }, []);

  const updateForm = useCallback((key: keyof LinkTypeDef, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredIcons = useMemo(() => {
    return iconNames.filter(n => n.toLowerCase().includes(iconSearch.toLowerCase()));
  }, [iconSearch]);

  const columns: Column<LinkTypeDef>[] = useMemo(() => [
    { key: 'code', title: '类型编码', width: 'w-24' },
    { key: 'name', title: '类型名称', width: 'w-28' },
    { key: 'displayName', title: '显示名称', width: 'w-24' },
    {
      key: 'direction',
      title: '方向性',
      width: 'w-20',
      align: 'center',
      render: (r: LinkTypeDef) => (
        <div className="flex items-center justify-center gap-1">
          <IconRenderer
            name={r.direction === '有向' ? 'ArrowRight' : 'ArrowLeftRight'}
            size={14}
            className="text-[#4a5568]"
          />
          <span className="text-[13px]">{r.direction}</span>
        </div>
      ),
    },
    {
      key: 'color',
      title: '颜色',
      width: 'w-28',
      render: (r: LinkTypeDef) => (
        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full border border-[#e8ecf1] shrink-0"
            style={{ backgroundColor: r.color }}
          />
          <code className="text-[12px] font-mono text-[#4a5568]">{r.color}</code>
        </div>
      ),
    },
    {
      key: 'icon',
      title: '图标',
      width: 'w-24',
      align: 'center',
      render: (r: LinkTypeDef) => (
        <div className="flex items-center justify-center gap-1.5">
          <IconRenderer name={r.icon} size={18} className="text-[#4a5568]" />
          <span className="text-[12px] text-[#6b7789]">{r.icon}</span>
        </div>
      ),
    },
    { key: 'sourceTypes', title: '允许源对象类型', width: 'w-28', render: (r: LinkTypeDef) => <span className="text-[13px]">{r.sourceTypes.join(', ')}</span> },
    { key: 'targetTypes', title: '允许目标对象类型', width: 'w-28', render: (r: LinkTypeDef) => <span className="text-[13px]">{r.targetTypes.join(', ')}</span> },
    { key: 'description', title: '描述', render: (r: LinkTypeDef) => <span className="truncate max-w-[180px] inline-block">{r.description}</span> },
    {
      key: 'action',
      title: '操作',
      width: 'w-28',
      align: 'center',
      render: (r: LinkTypeDef) => (
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
          <h1 className="text-display">链接类型管理</h1>
          <p className="text-small text-[#6b7789] mt-1">定义边的关系语义与展示风格</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreate} className="bg-[#3478f6] hover:bg-[#1d5ee0] h-9">
            <Plus size={16} className="mr-1" />新增链接类型
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
            placeholder="搜索类型名称或编码"
            value={search}
            onChange={setSearch}
            width="w-[280px]"
          />
          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部">全部方向</SelectItem>
              <SelectItem value="有向">有向</SelectItem>
              <SelectItem value="无向">无向</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceTypeFilter} onValueChange={setSourceTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {objectTypeCategoryOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="h-9 ml-auto" onClick={resetFilters}>
            重置
          </Button>
        </div>
      </div>

      {/* ── 链接类型表格 ── */}
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
        <DialogContent className="max-w-[600px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">{editingId ? '编辑链接类型' : '新增链接类型'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">类型编码</label>
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
                placeholder="如 LKT-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">类型名称 <span className="text-[#ef4444]">*</span></label>
              <input
                type="text"
                value={form.name || ''}
                onChange={e => updateForm('name', e.target.value)}
                className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]"
                placeholder="如 DEPENDS_ON"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">显示名称 <span className="text-[#ef4444]">*</span></label>
              <input
                type="text"
                value={form.displayName || ''}
                onChange={e => updateForm('displayName', e.target.value)}
                className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]"
                placeholder="中文显示名称"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">方向性</label>
              <RadioGroup
                value={form.direction || '有向'}
                onValueChange={v => updateForm('direction', v)}
                className="flex gap-4 h-9 items-center"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="有向" id="dir-directed" />
                  <label htmlFor="dir-directed" className="text-[14px] text-[#4a5568] cursor-pointer">有向</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="无向" id="dir-undirected" />
                  <label htmlFor="dir-undirected" className="text-[14px] text-[#4a5568] cursor-pointer">无向</label>
                </div>
              </RadioGroup>
            </div>
            {/* 颜色选择器 */}
            <div className="col-span-2 space-y-2">
              <label className="text-[14px] font-medium text-[#2d3748]">颜色</label>
              <div className="flex items-center gap-4">
                <div className="flex gap-2 flex-wrap">
                  {presetColors.map(c => (
                    <button
                      key={c}
                      className={cn(
                        'w-8 h-8 rounded-md border-2 transition-all',
                        form.color === c ? 'border-[#2d3748] scale-110' : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: c }}
                      onClick={() => updateForm('color', c)}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span
                    className="w-6 h-6 rounded border border-[#e8ecf1]"
                    style={{ backgroundColor: form.color || '#3478f6' }}
                  />
                  <input
                    type="text"
                    value={form.color || ''}
                    onChange={e => updateForm('color', e.target.value)}
                    className="h-9 w-[100px] px-2 rounded-md border border-[#dde1e8] text-[13px] font-mono text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff]"
                    placeholder="#3478f6"
                  />
                </div>
              </div>
            </div>
            {/* 图标选择器 */}
            <div className="col-span-2 space-y-2">
              <label className="text-[14px] font-medium text-[#2d3748]">图标</label>
              <div className="relative">
                <button
                  onClick={() => setIconPickerOpen(!iconPickerOpen)}
                  className="flex items-center gap-2 h-9 px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] hover:border-[#5a96ff] transition-colors w-[200px]"
                >
                  <IconRenderer name={form.icon || 'Link'} size={16} />
                  <span>{form.icon || 'Link'}</span>
                </button>
                <AnimatePresence>
                  {iconPickerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 top-full mt-1 z-20 bg-white border border-[#e8ecf1] rounded-lg shadow-lg p-3 w-[360px]"
                    >
                      <div className="relative mb-2">
                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ba4b3]" />
                        <input
                          type="text"
                          value={iconSearch}
                          onChange={e => setIconSearch(e.target.value)}
                          className="h-8 w-full pl-8 pr-7 rounded-md border border-[#dde1e8] text-[13px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff]"
                          placeholder="搜索图标..."
                        />
                        {iconSearch && (
                          <button onClick={() => setIconSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ba4b3]">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-6 gap-1 max-h-[200px] overflow-y-auto">
                        {filteredIcons.map(name => (
                          <button
                            key={name}
                            onClick={() => { updateForm('icon', name); setIconPickerOpen(false); }}
                            className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-md transition-colors',
                              form.icon === name ? 'bg-[#eef4ff] border border-[#3478f6]' : 'hover:bg-[#f8f9fb] border border-transparent'
                            )}
                          >
                            <IconRenderer name={name} size={20} className="text-[#4a5568]" />
                            <span className="text-[10px] text-[#6b7789] truncate max-w-full">{name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {/* 源/目标对象类型 */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">允许源对象类型</label>
              <div className="flex flex-wrap gap-2">
                {objectTypeCategoryOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      const current = form.sourceTypes || [];
                      if (current.includes(opt)) {
                        updateForm('sourceTypes', current.filter(v => v !== opt));
                      } else {
                        updateForm('sourceTypes', [...current, opt]);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-[13px] border transition-colors',
                      (form.sourceTypes || []).includes(opt)
                        ? 'bg-[#eef4ff] border-[#3478f6] text-[#3478f6]'
                        : 'bg-white border-[#dde1e8] text-[#4a5568] hover:border-[#9ba4b3]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">允许目标对象类型</label>
              <div className="flex flex-wrap gap-2">
                {objectTypeCategoryOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      const current = form.targetTypes || [];
                      if (current.includes(opt)) {
                        updateForm('targetTypes', current.filter(v => v !== opt));
                      } else {
                        updateForm('targetTypes', [...current, opt]);
                      }
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-[13px] border transition-colors',
                      (form.targetTypes || []).includes(opt)
                        ? 'bg-[#eef4ff] border-[#3478f6] text-[#3478f6]'
                        : 'bg-white border-[#dde1e8] text-[#4a5568] hover:border-[#9ba4b3]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-[#2d3748]">描述</label>
              <textarea
                value={form.description || ''}
                onChange={e => updateForm('description', e.target.value)}
                className="w-full min-h-[60px] px-3 py-2 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] resize-y"
                placeholder="链接类型的业务说明"
              />
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
