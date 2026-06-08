import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Filter,
  PlusCircle,
  Pencil,
  CheckCircle,
  XCircle,
  ArrowRight,
  X,
  AlertTriangle,
  FileText,
  Activity,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* ─── 类型 ─── */
interface AuditItem {
  id: string;
  type: '新增' | '变更';
  dept: string;
  submitTime: string;
  indicatorName: string;
  applicant: string;
  urgency: '普通' | '紧急';
  status: 'pending' | 'completed';
  result?: '通过' | '驳回' | '转交';
  auditor?: string;
}

interface DiffRow {
  field: string;
  oldValue: string;
  newValue: string;
  changeType: string;
}

/* ─── Mock 数据 ─── */
const pendingAudits: AuditItem[] = [
  { id: 'AUD-2026-0056', type: '新增', dept: '业务一部', submitTime: '05-29 09:30', indicatorName: '5G用户渗透率', applicant: '张三', urgency: '普通', status: 'pending' },
  { id: 'AUD-2026-0055', type: '变更', dept: '业务二部', submitTime: '05-29 08:45', indicatorName: '宽带故障修复时长', applicant: '李四', urgency: '紧急', status: 'pending' },
  { id: 'AUD-2026-0054', type: '新增', dept: '业务三部', submitTime: '05-28 17:20', indicatorName: 'FTTR安装成功率', applicant: '王五', urgency: '普通', status: 'pending' },
  { id: 'AUD-2026-0053', type: '变更', dept: '业务一部', submitTime: '05-28 15:10', indicatorName: '政企收入占比', applicant: '赵六', urgency: '普通', status: 'pending' },
  { id: 'AUD-2026-0052', type: '新增', dept: '业务四部', submitTime: '05-28 11:30', indicatorName: '千兆端口利用率', applicant: '钱七', urgency: '紧急', status: 'pending' },
  { id: 'AUD-2026-0051', type: '新增', dept: '业务一部', submitTime: '05-28 09:00', indicatorName: '云业务收入', applicant: '孙八', urgency: '普通', status: 'pending' },
  { id: 'AUD-2026-0050', type: '变更', dept: '业务三部', submitTime: '05-27 16:50', indicatorName: '客户投诉处理率', applicant: '周九', urgency: '普通', status: 'pending' },
  { id: 'AUD-2026-0049', type: '新增', dept: '业务二部', submitTime: '05-27 14:20', indicatorName: '5G基站覆盖率', applicant: '吴十', urgency: '普通', status: 'pending' },
];

const completedAudits: AuditItem[] = [
  { id: 'AUD-2026-0048', type: '新增', dept: '业务一部', submitTime: '05-29 08:00', indicatorName: '移动用户净增数', applicant: '王一', urgency: '普通', status: 'completed', result: '通过', auditor: '审核员A' },
  { id: 'AUD-2026-0047', type: '变更', dept: '业务二部', submitTime: '05-29 07:30', indicatorName: 'ARPU值计算口径', applicant: '李二', urgency: '普通', status: 'completed', result: '驳回', auditor: '审核员B' },
  { id: 'AUD-2026-0046', type: '新增', dept: '业务三部', submitTime: '05-28 18:00', indicatorName: '家庭宽带满意度', applicant: '张三', urgency: '普通', status: 'completed', result: '转交', auditor: '审核员A' },
  { id: 'AUD-2026-0045', type: '变更', dept: '业务一部', submitTime: '05-28 16:30', indicatorName: '网络故障响应时长', applicant: '赵四', urgency: '紧急', status: 'completed', result: '通过', auditor: '审核员C' },
  { id: 'AUD-2026-0044', type: '新增', dept: '业务四部', submitTime: '05-28 14:00', indicatorName: '5G流量DOU值', applicant: '钱五', urgency: '普通', status: 'completed', result: '通过', auditor: '审核员A' },
];

/* 变更对比 Mock 数据 */
const mockDiffData: DiffRow[] = [
  { field: '指标名称', oldValue: '5G用户渗透率', newValue: '5G用户渗透率(调整后)', changeType: '修改' },
  { field: '对象类型（一级）', oldValue: '发展', newValue: '经营', changeType: '修改' },
  { field: '对象类型（二级）', oldValue: '用户发展', newValue: '收入分析', changeType: '修改' },
  { field: '业务口径', oldValue: '5G用户数/移动用户总数*100%', newValue: '5G在网用户数/移动在网用户总数*100%', changeType: '修改' },
  { field: '计算方式', oldValue: '比率计算', newValue: '直接取值', changeType: '修改' },
];

const rejectReasons = ['口径不符合规范', '信息不完整', '与已有指标冲突', '其他'];
const transferOptions = ['审核员A', '审核员B', '审核员C', '技术专家'];

/* ─── 工具函数 ─── */
const getTypeBadgeType = (type: string): 'primary' | 'warning' => {
  return type === '新增' ? 'primary' : 'warning';
};

const getUrgencyBadgeType = (urgency: string): 'error' | 'default' => {
  return urgency === '紧急' ? 'error' : 'default';
};

const getResultBadgeType = (result: string): 'success' | 'error' | 'primary' => {
  switch (result) {
    case '通过': return 'success';
    case '驳回': return 'error';
    case '转交': return 'primary';
    default: return 'primary';
  }
};

const getSeverityBadgeType = (severity: string): 'error' | 'warning' | 'default' => {
  switch (severity) {
    case '高': return 'error';
    case '中': return 'warning';
    case '低': return 'default';
    default: return 'default';
  }
};

const getChangeTypeBadgeType = (type: string): 'warning' | 'primary' | 'error' => {
  switch (type) {
    case '修改': return 'warning';
    case '新增': return 'primary';
    case '删除': return 'error';
    default: return 'warning';
  }
};

/* ─── 主页面 ─── */
export default function NocAuditPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [deptFilter, setDeptFilter] = useState('全部');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [rejectForm, setRejectForm] = useState({ reason: '', customReason: '' });
  const [transferForm, setTransferForm] = useState({ target: '', note: '' });

  const allAudits = useMemo(() => [...pendingAudits, ...completedAudits], []);

  const filteredData = useMemo(() => {
    let data = activeTab === 'pending' ? pendingAudits : activeTab === 'completed' ? completedAudits : allAudits;
    if (search.trim()) {
      data = data.filter(d => d.indicatorName.includes(search) || d.dept.includes(search));
    }
    if (typeFilter !== '全部') {
      data = data.filter(d => d.type === typeFilter);
    }
    if (deptFilter !== '全部') {
      data = data.filter(d => d.dept === deptFilter);
    }
    return data;
  }, [activeTab, search, typeFilter, deptFilter, allAudits]);

  const statsCards = [
    { label: '待审核（新增）', value: 8, icon: <PlusCircle size={20} />, bg: 'bg-dark-accent-primary/10', text: 'text-dark-accent-primary' },
    { label: '待审核（变更）', value: 4, icon: <Pencil size={20} />, bg: 'bg-warning-500/10', text: 'text-warning-600' },
    { label: '今日已审核', value: 15, icon: <CheckCircle size={20} />, bg: 'bg-success-500/10', text: 'text-success-600' },
    { label: '今日驳回', value: 2, icon: <XCircle size={20} />, bg: 'bg-error-500/10', text: 'text-error-600' },
  ];

  const openDrawer = (audit: AuditItem) => {
    setSelectedAudit(audit);
    setDrawerOpen(true);
  };

  const handleApprove = () => {
    setDrawerOpen(false);
    setSelectedAudit(null);
  };

  const handleReject = () => {
    setDrawerOpen(false);
    setRejectModalOpen(true);
  };

  const handleTransfer = () => {
    setDrawerOpen(false);
    setTransferModalOpen(true);
  };

  const confirmReject = () => {
    setRejectModalOpen(false);
    setRejectForm({ reason: '', customReason: '' });
    setSelectedAudit(null);
  };

  const confirmTransfer = () => {
    setTransferModalOpen(false);
    setTransferForm({ target: '', note: '' });
    setSelectedAudit(null);
  };

  /* ─── 待审核表格列 ─── */
  const pendingColumns: Column<AuditItem>[] = [
    { key: 'id', title: '申请单号', width: 'w-[130px]' },
    {
      key: 'type',
      title: '申请类型',
      width: 'w-[80px]',
      render: (record: AuditItem) => (
        <StatusBadge text={record.type} type={getTypeBadgeType(record.type)} />
      ),
    },
    { key: 'dept', title: '业务部门' },
    { key: 'submitTime', title: '提交时间', width: 'w-[110px]' },
    { key: 'indicatorName', title: '指标名称' },
    { key: 'applicant', title: '申请人', width: 'w-[80px]' },
    {
      key: 'urgency',
      title: '紧急程度',
      width: 'w-[80px]',
      render: (record: AuditItem) => (
        <StatusBadge text={record.urgency} type={getUrgencyBadgeType(record.urgency)} />
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 'w-[80px]',
      render: (record: AuditItem) => (
        <Button
          size="sm"
          className="h-7 px-3 text-[12px] bg-success-500 hover:bg-success-600"
          onClick={() => openDrawer(record)}
        >
          审核
        </Button>
      ),
    },
  ];

  /* ─── 已审核表格列 ─── */
  const completedColumns: Column<AuditItem>[] = [
    { key: 'id', title: '申请单号', width: 'w-[130px]' },
    {
      key: 'type',
      title: '申请类型',
      width: 'w-[80px]',
      render: (record: AuditItem) => (
        <StatusBadge text={record.type} type={getTypeBadgeType(record.type)} />
      ),
    },
    { key: 'dept', title: '业务部门' },
    { key: 'indicatorName', title: '指标名称' },
    { key: 'applicant', title: '申请人', width: 'w-[80px]' },
    {
      key: 'result',
      title: '审核结果',
      width: 'w-[80px]',
      render: (record: AuditItem) => (
        <StatusBadge text={record.result || ''} type={getResultBadgeType(record.result || '')} />
      ),
    },
    { key: 'auditor', title: '审核人', width: 'w-[80px]' },
  ];

  const currentColumns = activeTab === 'completed' ? completedColumns : pendingColumns;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto"
    >
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[28px] font-semibold text-dark-text-primary leading-tight tracking-[-0.02em]">审核待办列表</h1>
          <p className="text-[13px] text-dark-text-secondary mt-1">审核业务部门提交的指标新增与变更申请，把控命名规范、业务口径与核心属性</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="h-9 px-3 text-[14px] text-dark-text-secondary hover:bg-dark-card-l2">
            <RefreshCw size={16} className="mr-1.5" />
            刷新
          </Button>
          <Button variant="ghost" className="h-9 px-3 text-[14px] text-dark-text-secondary hover:bg-dark-card-l2">
            <Filter size={16} className="mr-1.5" />
            筛选
          </Button>
        </div>
      </div>

      {/* ── Statistics Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={cn(
              'rounded-lg p-4 flex items-center gap-4',
              card.bg
            )}
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.text, 'bg-dark-elevated/60')}>
              {card.icon}
            </div>
            <div>
              <div className={cn('text-[24px] font-semibold leading-tight', card.text)}>{card.value}</div>
              <div className="text-[12px] text-dark-text-secondary mt-0.5">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 审核列表表格 ── */}
      <div className="border border-dark-border rounded-lg bg-dark-elevated">
        {/* 工具栏 */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            {(['pending', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-[14px] font-medium rounded-md transition-colors',
                  activeTab === tab
                    ? 'bg-dark-accent-primary/10 text-dark-accent-primary'
                    : 'text-dark-text-secondary hover:bg-dark-page'
                )}
              >
                {tab === 'pending' ? '待审核' : tab === 'completed' ? '已审核' : '全部'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="搜索指标名称或申请部门"
              value={search}
              onChange={setSearch}
              width="w-64"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-28 text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部类型</SelectItem>
                <SelectItem value="新增">新增</SelectItem>
                <SelectItem value="变更">变更</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 w-28 text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="全部">全部部门</SelectItem>
                <SelectItem value="业务一部">业务一部</SelectItem>
                <SelectItem value="业务二部">业务二部</SelectItem>
                <SelectItem value="业务三部">业务三部</SelectItem>
                <SelectItem value="业务四部">业务四部</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 表格 */}
        <div className="p-4">
          <DataTable
            columns={currentColumns as unknown as Column<Record<string, unknown>>[]}
            data={filteredData as unknown as Record<string, unknown>[]}
            rowKey="id"
          />
        </div>
      </div>

      {/* ── 审核详情 Drawer ── */}
      <AnimatePresence>
        {drawerOpen && selectedAudit && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => { setDrawerOpen(false); setSelectedAudit(null); }}
            />
            {/* 抽屉 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed right-0 top-0 bottom-0 w-[720px] bg-dark-elevated z-50 shadow-2xl overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="sticky top-0 bg-dark-elevated border-b border-dark-border px-6 py-4 z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[18px] font-semibold text-dark-text-primary">{selectedAudit.id}</h2>
                    <StatusBadge text={selectedAudit.type} type={getTypeBadgeType(selectedAudit.type)} />
                  </div>
                  <button
                    onClick={() => { setDrawerOpen(false); setSelectedAudit(null); }}
                    className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-dark-card-l2 transition-colors"
                  >
                    <X size={18} className="text-dark-text-secondary" />
                  </button>
                </div>
                <div className="flex items-center gap-6 text-[13px] text-dark-text-secondary">
                  <span>部门: <span className="text-dark-text-secondary">{selectedAudit.dept}</span></span>
                  <span>申请人: <span className="text-dark-text-secondary">{selectedAudit.applicant}</span></span>
                  <span>时间: <span className="text-dark-text-secondary">2026-{selectedAudit.submitTime}</span></span>
                  <span className="flex items-center gap-1">
                    紧急程度:
                    <StatusBadge text={selectedAudit.urgency} type={getUrgencyBadgeType(selectedAudit.urgency)} />
                  </span>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="px-6 py-4 pb-32">
                {selectedAudit.type === '新增' ? (
                  /* ═══ 新增审核 Drawer ═══ */
                  <div className="space-y-4">
                    {/* 指标完整信息展示 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="border border-dark-border rounded-lg p-5"
                    >
                      <h3 className="text-[16px] font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-dark-accent-primary" />
                        指标信息
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {[
                          { label: '指标名称', value: '5G用户渗透率' },
                          { label: '指标编码', value: 'IND-2024-0056' },
                          { label: '对象类型（一级）', value: '发展' },
                          { label: '对象类型（二级）', value: '用户发展' },
                          { label: '业务口径', value: '5G用户数 / 移动用户总数 × 100%' },
                          { label: '计算方式', value: '比率计算' },
                          { label: '计量单位', value: '百分比' },
                        ].map((item) => (
                          <div key={item.label}>
                            <Label className="text-[12px] text-dark-text-tertiary">{item.label}</Label>
                            <div className="text-[14px] text-dark-text-secondary mt-0.5">{item.value}</div>
                          </div>
                        ))}
                        <div className="col-span-2">
                          <Label className="text-[12px] text-dark-text-tertiary">描述</Label>
                          <div className="text-[14px] text-dark-text-secondary mt-0.5">适用于全网5G业务发展监控，涵盖个人用户及家庭用户</div>
                        </div>
                      </div>
                    </motion.div>

                    {/* 影响分析：依赖此指标的其他指标清单 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="border border-dark-border rounded-lg p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-semibold text-dark-text-primary flex items-center gap-2">
                          <Activity size={18} className="text-dark-accent-primary" />
                          影响分析
                        </h3>
                        <StatusBadge text="自动分析" type="noc" />
                      </div>
                      <p className="text-[12px] text-dark-text-secondary mb-3">以下指标可能依赖于该指标</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">指标名称</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">关系类型</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">影响说明</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { indicator: '5G流量占比', relationType: 'DEPENDS_ON', description: '该指标依赖5G用户渗透率' },
                              { indicator: '全网约收入', relationType: '间接影响', description: '通过5G套餐收入间接影响' },
                            ].map((row, idx) => (
                              <tr key={idx} className="h-10 border-b border-dark-border hover:bg-dark-page">
                                <td className="px-3 text-[14px] text-dark-text-secondary">{row.indicator}</td>
                                <td className="px-3 text-[13px] text-[var(--accent-noc)]">{row.relationType}</td>
                                <td className="px-3 text-[13px] text-dark-text-secondary">{row.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* 同义冲突提示 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="border border-error-200 rounded-lg p-5 bg-error-500/10"
                    >
                      <h3 className="text-[16px] font-semibold text-error-600 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} />
                        同义冲突警告
                      </h3>
                      <p className="text-[13px] text-dark-text-secondary mb-3">检测到以下已有指标与该指标口径可能冲突：</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-error-100 border-b border-error-200">
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">已有指标</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">口径说明</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">相似度</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { indicator: '5G在网用户率', caliber: '5G在网用户数/移动出账用户总数', similarity: 85 },
                              { indicator: '5G网络渗透率', caliber: '5G网络覆盖用户/总用户数', similarity: 72 },
                            ].map((row, idx) => (
                              <tr key={idx} className="h-10 border-b border-error-200">
                                <td className="px-3 text-[14px] text-dark-text-secondary">{row.indicator}</td>
                                <td className="px-3 text-[13px] text-dark-text-secondary">{row.caliber}</td>
                                <td className="px-3">
                                  <span className="text-[13px] font-medium text-error-600">{row.similarity}%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button className="mt-3 text-[13px] text-dark-accent-primary hover:underline">查看详情对比</button>
                    </motion.div>
                  </div>
                ) : (
                  /* ═══ 变更审核 Drawer ═══ */
                  <div className="space-y-4">
                    {/* 修改前后对比 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="border border-dark-border rounded-lg p-5"
                    >
                      <h3 className="text-[16px] font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
                        <GitBranch size={18} className="text-dark-accent-primary" />
                        修改前后对比
                      </h3>
                      <p className="text-[12px] text-dark-text-secondary mb-3">系统自动记录修改前后对比</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">字段名</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">修改前</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">修改后</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">变更类型</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockDiffData.map((row, idx) => (
                              <tr key={idx} className="h-10 border-b border-dark-border">
                                <td className="px-3 text-[14px] text-dark-text-secondary">{row.field}</td>
                                <td className="px-3">
                                  <span className="text-[13px] text-dark-text-tertiary bg-dark-card-l2 px-2 py-0.5 rounded line-through">{row.oldValue}</span>
                                </td>
                                <td className="px-3">
                                  <span className="text-[13px] text-warning-600 bg-warning-500/10 px-2 py-0.5 rounded">{row.newValue}</span>
                                </td>
                                <td className="px-3">
                                  <StatusBadge text={row.changeType} type={getChangeTypeBadgeType(row.changeType)} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* 影响分析：受变更影响的下游指标/关系清单 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="border border-dark-border rounded-lg p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[16px] font-semibold text-dark-text-primary flex items-center gap-2">
                          <Activity size={18} className="text-dark-accent-primary" />
                          变更影响分析
                        </h3>
                        <StatusBadge text="自动分析" type="noc" />
                      </div>
                      <p className="text-[12px] text-dark-text-secondary mb-3">以下下游指标/关系将受本次变更影响</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-dark-card-l2 border-b-2 border-dark-border">
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">受影响指标</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">影响类型</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">影响程度</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-dark-text-secondary">建议操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { indicator: '5G流量占比', impactType: '血缘关系', severity: '中' as const, suggestion: '检查是否需要同步调整' },
                              { indicator: '全网约收入', impactType: '间接计算', severity: '低' as const, suggestion: '无需操作' },
                              { indicator: '5G用户波动告警', impactType: '规则参数', severity: '高' as const, suggestion: '需同步更新规则阈值' },
                            ].map((row, idx) => (
                              <tr key={idx} className="h-10 border-b border-dark-border hover:bg-dark-page">
                                <td className="px-3 text-[14px] text-dark-text-secondary">{row.indicator}</td>
                                <td className="px-3 text-[13px] text-dark-text-secondary">{row.impactType}</td>
                                <td className="px-3">
                                  <StatusBadge text={row.severity} type={getSeverityBadgeType(row.severity)} />
                                </td>
                                <td className="px-3 text-[13px] text-dark-text-secondary">{row.suggestion}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* 同义冲突提示 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="border border-error-200 rounded-lg p-5 bg-error-500/10"
                    >
                      <h3 className="text-[16px] font-semibold text-error-600 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} />
                        同义冲突警告
                      </h3>
                      <p className="text-[13px] text-dark-text-secondary mb-3">检测到以下已有指标与变更后的指标口径可能冲突：</p>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-error-100 border-b border-error-200">
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">已有指标</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">口径说明</th>
                              <th className="h-9 px-3 text-left text-[13px] font-medium text-error-900">相似度</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { indicator: '5G在网用户率', caliber: '5G在网用户数/移动出账用户总数', similarity: 78 },
                            ].map((row, idx) => (
                              <tr key={idx} className="h-10 border-b border-error-200">
                                <td className="px-3 text-[14px] text-dark-text-secondary">{row.indicator}</td>
                                <td className="px-3 text-[13px] text-dark-text-secondary">{row.caliber}</td>
                                <td className="px-3">
                                  <span className="text-[13px] font-medium text-error-600">{row.similarity}%</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <button className="mt-3 text-[13px] text-dark-accent-primary hover:underline">查看详情对比</button>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* 审核操作区（固定底部） */}
              <div className="sticky bottom-0 bg-dark-elevated border-t border-dark-border px-6 py-4 flex items-center justify-center gap-4">
                <Button
                  onClick={handleApprove}
                  className="h-11 px-8 text-[15px] bg-success-500 hover:bg-success-600"
                >
                  <CheckCircle size={18} className="mr-2" />
                  通过
                </Button>
                <Button
                  onClick={handleReject}
                  className="h-11 px-8 text-[15px] bg-error-500 hover:bg-error-600"
                >
                  <XCircle size={18} className="mr-2" />
                  驳回
                </Button>
                <Button
                  onClick={handleTransfer}
                  className="h-11 px-8 text-[15px] bg-dark-accent-primary hover:bg-dark-accent-primary-active"
                >
                  <ArrowRight size={18} className="mr-2" />
                  转交
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 驳回弹窗 ── */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold flex items-center gap-2">
              <XCircle size={20} className="text-error-500" />
              驳回申请
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-[13px] text-dark-text-secondary">驳回原因 <span className="text-error-500">*</span></Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {rejectReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setRejectForm(prev => ({ ...prev, reason }))}
                    className={cn(
                      'px-3 py-1.5 text-[12px] rounded-md border transition-colors',
                      rejectForm.reason === reason
                        ? 'border-error-500 bg-error-500/10 text-error-600'
                        : 'border-dark-border-hover text-dark-text-secondary hover:border-error-500 hover:text-error-600'
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">详细说明</Label>
              <Textarea
                value={rejectForm.customReason}
                onChange={(e) => setRejectForm(prev => ({ ...prev, customReason: e.target.value }))}
                placeholder="请填写驳回原因..."
                className="mt-1 text-[14px] min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="h-9 px-4 text-[14px] border-dark-border-hover" onClick={() => setRejectModalOpen(false)}>
              取消
            </Button>
            <Button
              className="h-9 px-4 text-[14px] bg-error-500 hover:bg-error-600"
              onClick={confirmReject}
              disabled={!rejectForm.reason && !rejectForm.customReason}
            >
              确认驳回
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 转交弹窗 ── */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent className="w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold flex items-center gap-2">
              <ArrowRight size={20} className="text-dark-accent-primary" />
              转交审核
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-[13px] text-dark-text-secondary">转交人 <span className="text-error-500">*</span></Label>
              <Select value={transferForm.target} onValueChange={(v) => setTransferForm(prev => ({ ...prev, target: v }))}>
                <SelectTrigger className="mt-1 h-9 text-[14px]">
                  <SelectValue placeholder="选择转交人" />
                </SelectTrigger>
                <SelectContent>
                  {transferOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[13px] text-dark-text-secondary">转交说明</Label>
              <Textarea
                value={transferForm.note}
                onChange={(e) => setTransferForm(prev => ({ ...prev, note: e.target.value }))}
                placeholder="选填，说明转交原因..."
                className="mt-1 text-[14px] min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" className="h-9 px-4 text-[14px] border-dark-border-hover" onClick={() => setTransferModalOpen(false)}>
              取消
            </Button>
            <Button
              className="h-9 px-4 text-[14px] bg-dark-accent-primary hover:bg-dark-accent-primary-active"
              onClick={confirmTransfer}
              disabled={!transferForm.target}
            >
              确认转交
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
