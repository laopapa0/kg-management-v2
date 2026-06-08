import { useState, useCallback, useMemo } from 'react';
import {
  Upload, Download, GitBranch, Plus, RefreshCw,
  Box, Link, History, CheckCircle, XCircle, ChevronRight, X,
  Database, ArrowRightLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

/* ─── 类型 ─── */
interface Version extends Record<string, unknown> {
  id: string;
  version: string;
  name: string;
  createdAt: string;
  creator: string;
  nodeCount: number;
  relationCount: number;
  changeSummary: string;
  status: 'current' | 'historical';
}

interface DataSource extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  dbType: string;
  host: string;
  port: number;
  dbName: string;
  username: string;
  status: 'connected' | 'failed' | 'untested';
  lastSync: string;
  tableCount: number;
}

interface TableMapping extends Record<string, unknown> {
  sourceField: string;
  sourceType: string;
  mappingType: string;
  target: string;
}

interface SourceField extends Record<string, unknown> {
  name: string;
  type: string;
  comment: string;
}

/* ─── 常量 ─── */
const statusBadgeMap: Record<string, { text: string; type: 'success' | 'error' | 'default' }> = {
  connected: { text: '已连接', type: 'success' },
  failed: { text: '连接失败', type: 'error' },
  untested: { text: '未测试', type: 'default' },
};

const dbTypeOptions = ['Oracle', 'MySQL', 'PostgreSQL', 'SQLServer', 'Hive', 'ClickHouse', 'MongoDB'];
const defaultPorts: Record<string, number> = { Oracle: 1521, MySQL: 3306, PostgreSQL: 5432, SQLServer: 1433, Hive: 10000, ClickHouse: 8123, MongoDB: 27017 };

const initialVersions: Version[] = [
  { id: 'v2.3.1', version: 'v2.3.1', name: '日常更新', createdAt: '2026-05-29 08:00', creator: '系统', nodeCount: 1247, relationCount: 3856, changeSummary: '新增5个指标, 12条关系', status: 'current' },
  { id: 'v2.3.0', version: 'v2.3.0', name: '月度版本', createdAt: '2026-05-01 00:00', creator: '系统', nodeCount: 1242, relationCount: 3844, changeSummary: '月度数据归档', status: 'historical' },
  { id: 'v2.2.3', version: 'v2.2.3', name: '规则更新', createdAt: '2026-04-28 15:30', creator: '管理员', nodeCount: 1237, relationCount: 3832, changeSummary: '更新异常检测规则', status: 'historical' },
  { id: 'v2.2.2', version: 'v2.2.2', name: '指标接入', createdAt: '2026-04-15 09:00', creator: '系统', nodeCount: 1230, relationCount: 3810, changeSummary: '新增7个指标', status: 'historical' },
  { id: 'v2.2.1', version: 'v2.2.1', name: '关系调整', createdAt: '2026-04-08 11:20', creator: '管理员', nodeCount: 1223, relationCount: 3795, changeSummary: '修复血缘关系', status: 'historical' },
  { id: 'v2.2.0', version: 'v2.2.0', name: '季度版本', createdAt: '2026-04-01 00:00', creator: '系统', nodeCount: 1223, relationCount: 3795, changeSummary: '季度数据归档', status: 'historical' },
  { id: 'v2.1.5', version: 'v2.1.5', name: '紧急修复', createdAt: '2026-03-28 18:00', creator: '管理员', nodeCount: 1215, relationCount: 3780, changeSummary: '修复循环依赖', status: 'historical' },
  { id: 'v2.1.4', version: 'v2.1.4', name: '标签更新', createdAt: '2026-03-15 10:30', creator: '系统', nodeCount: 1215, relationCount: 3780, changeSummary: '更新标签配置', status: 'historical' },
];

const initialDataSources: DataSource[] = [
  { id: 'DS-001', code: 'DS-001', name: '经营数据仓库', dbType: 'Oracle', host: '10.0.1.100', port: 1521, dbName: 'BIDW', username: 'etl_user', status: 'connected', lastSync: '2026-05-29 08:00', tableCount: 12 },
  { id: 'DS-002', code: 'DS-002', name: '用户中心', dbType: 'MySQL', host: '10.0.1.101', port: 3306, dbName: 'user_center', username: 'app_reader', status: 'connected', lastSync: '2026-05-29 07:30', tableCount: 8 },
  { id: 'DS-003', code: 'DS-003', name: '网络监控系统', dbType: 'PostgreSQL', host: '10.0.1.102', port: 5432, dbName: 'nms_db', username: 'nms_user', status: 'failed', lastSync: '2026-05-28 12:00', tableCount: 5 },
  { id: 'DS-004', code: 'DS-004', name: '客服数据湖', dbType: 'Hive', host: '10.0.1.103', port: 10000, dbName: 'cs_data_lake', username: 'hive_user', status: 'connected', lastSync: '2026-05-29 06:00', tableCount: 15 },
];

const sourceTables = [
  { id: 'tbl-indicators', name: 't_indicators', description: '指标主表', fieldCount: 10 },
  { id: 'tbl-caliber', name: 't_caliber_definition', description: '口径定义表', fieldCount: 6 },
  { id: 'tbl-level', name: 't_level_mapping', description: '层级映射表', fieldCount: 4 },
  { id: 'tbl-metrics', name: 't_metric_values', description: '指标数值表', fieldCount: 8 },
];

const sourceTableFields: SourceField[] = [
  { name: 'indicator_id', type: 'VARCHAR(30)', comment: '指标唯一编码' },
  { name: 'indicator_name', type: 'VARCHAR(100)', comment: '指标名称' },
  { name: 'caliber_desc', type: 'VARCHAR(500)', comment: '口径说明' },
  { name: 'level1', type: 'VARCHAR(20)', comment: '一级' },
  { name: 'level2', type: 'VARCHAR(20)', comment: '二级' },
  { name: 'calc_method', type: 'VARCHAR(20)', comment: '计算方式' },
  { name: 'unit_code', type: 'VARCHAR(10)', comment: '计量单位' },
  { name: 'status', type: 'INT', comment: '状态' },
  { name: 'create_time', type: 'DATETIME', comment: '创建时间' },
  { name: 'custom_props', type: 'JSON', comment: '扩展属性' },
];

const initialMappings: TableMapping[] = [
  { sourceField: 'indicator_id', sourceType: 'VARCHAR(30)', mappingType: '直接映射', target: '指标编码 (PATTR-001)' },
  { sourceField: 'indicator_name', sourceType: 'VARCHAR(100)', mappingType: '直接映射', target: '指标名称 (PATTR-002)' },
  { sourceField: 'caliber_desc', sourceType: 'VARCHAR(500)', mappingType: '直接映射', target: '业务口径 (PATTR-003)' },
  { sourceField: 'level1', sourceType: 'VARCHAR(20)', mappingType: '直接映射', target: '对象类型一级 (PATTR-007)' },
  { sourceField: 'level2', sourceType: 'VARCHAR(20)', mappingType: '直接映射', target: '对象类型二级 (PATTR-008)' },
  { sourceField: 'calc_method', sourceType: 'VARCHAR(20)', mappingType: '条件映射', target: '计算方式 (PATTR-004)' },
  { sourceField: 'unit_code', sourceType: 'VARCHAR(10)', mappingType: '直接映射', target: '计量单位 (PATTR-005)' },
  { sourceField: 'status', sourceType: 'INT', mappingType: '条件映射', target: '状态 (PATTR-010)' },
  { sourceField: 'create_time', sourceType: 'DATETIME', mappingType: '转换函数', target: '创建时间 (PATTR-011)' },
  { sourceField: 'custom_props', sourceType: 'JSON', mappingType: '直接映射', target: '扩展属性 (PATTR-012)' },
];

const graphProperties = [
  { name: '指标编码 (PATTR-001)', type: '字符串' },
  { name: '指标名称 (PATTR-002)', type: '字符串' },
  { name: '业务口径 (PATTR-003)', type: '字符串' },
  { name: '计算方式 (PATTR-004)', type: '枚举' },
  { name: '计量单位 (PATTR-005)', type: '枚举' },
  { name: '对象类型一级 (PATTR-007)', type: '枚举' },
  { name: '对象类型二级 (PATTR-008)', type: '枚举' },
  { name: '状态 (PATTR-010)', type: '布尔' },
  { name: '创建时间 (PATTR-011)', type: '日期' },
  { name: '扩展属性 (PATTR-012)', type: 'JSON' },
];

/* ─── 页面组件 ─── */
export default function PlatformGraphPage() {
  const [activeTab, setActiveTab] = useState('graph');
  const [versions, setVersions] = useState<Version[]>(initialVersions);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);

  // Graph Tab state
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [importMode, setImportMode] = useState('full');
  const [conflictMode, setConflictMode] = useState('skip');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [versionDetail, setVersionDetail] = useState<Version | null>(null);
  const [compareVersions, setCompareVersions] = useState<{ open: boolean; vA: string; vB: string }>({ open: false, vA: 'v2.3.0', vB: 'v2.3.1' });
  const [rollbackConfirm, setRollbackConfirm] = useState<{ open: boolean; version: Version | null }>({ open: false, version: null });

  // DataSource Tab state
  const [dsModalOpen, setDsModalOpen] = useState(false);
  const [editingDsId, setEditingDsId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dsForm, setDsForm] = useState<Partial<DataSource>>({});
  const [mappingDrawerOpen, setMappingDrawerOpen] = useState(false);
  const [selectedDs, setSelectedDs] = useState<DataSource | null>(null);
  const [selectedTable, setSelectedTable] = useState('tbl-indicators');
  const [mappings, setMappings] = useState<TableMapping[]>(initialMappings);
  const [mappingTab, setMappingTab] = useState<'fields' | 'properties'>('fields');

  const currentVersion = versions.find(v => v.status === 'current');

  const statsCards = useMemo(() => [
    { label: '当前版本', value: currentVersion?.version || '—', icon: GitBranch, color: 'bg-dark-accent-primary/10', iconColor: 'text-dark-accent-primary' },
    { label: '历史版本数', value: String(versions.filter(v => v.status === 'historical').length), icon: History, color: 'bg-info-500/10', iconColor: 'text-info-500' },
    { label: '节点总数', value: String(currentVersion?.nodeCount?.toLocaleString() || '—'), icon: Box, color: 'bg-success-500/10', iconColor: 'text-success-500' },
    { label: '关系总数', value: String(currentVersion?.relationCount?.toLocaleString() || '—'), icon: Link, color: 'bg-warning-500/10', iconColor: 'text-warning-500' },
  ], [currentVersion, versions]);

  const handleStartImport = useCallback(() => {
    if (!uploadedFile) return;
    setImporting(true);
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setImporting(false);
            setUploadedFile(null);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  }, [uploadedFile]);

  const handleRollback = useCallback(() => {
    if (!rollbackConfirm.version) return;
    setVersions(prev => prev.map(v => ({
      ...v,
      status: v.id === rollbackConfirm.version!.id ? 'current' as const : 'historical' as const,
    })));
    setRollbackConfirm({ open: false, version: null });
  }, [rollbackConfirm.version]);

  const openDsCreate = useCallback(() => {
    setEditingDsId(null);
    setTestResult(null);
    setDsForm({
      code: '',
      name: '',
      dbType: 'MySQL',
      host: '',
      port: 3306,
      dbName: '',
      username: '',
      status: 'untested',
    });
    setDsModalOpen(true);
  }, []);

  const openDsEdit = useCallback((ds: DataSource) => {
    setEditingDsId(ds.id);
    setTestResult(null);
    setDsForm({ ...ds });
    setDsModalOpen(true);
  }, []);

  const handleDsSave = useCallback(() => {
    if (!dsForm.name || !dsForm.code) return;
    if (editingDsId) {
      setDataSources(prev => prev.map(ds => ds.id === editingDsId ? { ...ds, ...(dsForm as DataSource) } : ds));
    } else {
      const newDs: DataSource = { ...(dsForm as DataSource), id: dsForm.code || `DS-${Date.now()}`, lastSync: '-', tableCount: 0 };
      setDataSources(prev => [...prev, newDs]);
    }
    setDsModalOpen(false);
  }, [editingDsId, dsForm]);

  const handleTestConnection = useCallback(() => {
    const success = Math.random() > 0.3;
    setTestResult({
      success,
      message: success ? `连接成功，延迟 ${Math.floor(Math.random() * 50) + 5}ms` : '连接失败：无法访问目标主机，请检查网络配置',
    });
  }, []);

  const openMappingDrawer = useCallback((ds: DataSource) => {
    setSelectedDs(ds);
    setMappingDrawerOpen(true);
  }, []);

  const versionColumns: Column<Version>[] = useMemo(() => [
    { key: 'version', title: '版本号', width: 'w-20', render: (r: Version) => (
      <span className={cn('text-[14px] font-medium', r.status === 'current' ? 'text-dark-accent-primary' : 'text-dark-text-secondary')}>{r.version}</span>
    )},
    { key: 'name', title: '版本名称', width: 'w-24' },
    { key: 'createdAt', title: '创建时间', width: 'w-36' },
    { key: 'creator', title: '创建人', width: 'w-20' },
    { key: 'nodeCount', title: '节点数', width: 'w-20', align: 'right', render: (r: Version) => <span>{r.nodeCount.toLocaleString()}</span> },
    { key: 'relationCount', title: '关系数', width: 'w-20', align: 'right', render: (r: Version) => <span>{r.relationCount.toLocaleString()}</span> },
    { key: 'changeSummary', title: '变更摘要', render: (r: Version) => <span className="truncate max-w-[200px] inline-block">{r.changeSummary}</span> },
    {
      key: 'action',
      title: '操作',
      width: 'w-44',
      align: 'center',
      render: (r: Version) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => setVersionDetail(r)}>查看</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => setCompareVersions({ open: true, vA: r.version, vB: 'v2.3.1' })}>对比</Button>
          {r.status !== 'current' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-warning-500 hover:text-warning-600" onClick={() => setRollbackConfirm({ open: true, version: r })}>回滚</Button>
          )}
        </div>
      ),
    },
  ], []);

  const dsColumns: Column<DataSource>[] = useMemo(() => [
    { key: 'code', title: '数据源编码', width: 'w-24' },
    { key: 'name', title: '数据源名称', width: 'w-28' },
    { key: 'dbType', title: '数据库类型', width: 'w-24', align: 'center' },
    {
      key: 'status',
      title: '连接状态',
      width: 'w-24',
      align: 'center',
      render: (r: DataSource) => {
        const status = statusBadgeMap[r.status];
        return (
          <div className="flex items-center justify-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full', r.status === 'connected' ? 'bg-success-500' : r.status === 'failed' ? 'bg-error-500' : 'bg-dark-text-tertiary')} />
            <StatusBadge text={status.text} type={status.type} />
          </div>
        );
      },
    },
    { key: 'lastSync', title: '最后同步', width: 'w-32' },
    { key: 'tableCount', title: '关联表数', width: 'w-20', align: 'right' },
    {
      key: 'action',
      title: '操作',
      width: 'w-44',
      align: 'center',
      render: (r: DataSource) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={() => openDsEdit(r)}>编辑</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px]" onClick={handleTestConnection}>测试</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[12px] text-dark-accent-primary" onClick={() => openMappingDrawer(r)}>表结构映射</Button>
        </div>
      ),
    },
  ], [handleTestConnection, openDsEdit, openMappingDrawer]);

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
          <h1 className="text-display">图谱管理 / 数据源管理</h1>
          <p className="text-small text-dark-text-secondary mt-1">图谱导入导出、版本管理与数据源连接配置</p>
        </div>
        {activeTab === 'graph' && (
          <div className="flex gap-2">
            <Button className="bg-dark-accent-primary hover:bg-dark-accent-primary-active h-9">
              <Upload size={16} className="mr-1" />导入图谱
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover">
              <Download size={16} className="mr-1" />导出图谱
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover">
              <GitBranch size={16} className="mr-1" />创建版本
            </Button>
          </div>
        )}
        {activeTab === 'datasource' && (
          <div className="flex gap-2">
            <Button onClick={openDsCreate} className="bg-dark-accent-primary hover:bg-dark-accent-primary-active h-9">
              <Plus size={16} className="mr-1" />新增数据源
            </Button>
            <Button variant="outline" className="h-9 border-dark-border-hover">
              <RefreshCw size={16} className="mr-1" />测试全部连接
            </Button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-dark-elevated border border-dark-border">
          <TabsTrigger value="graph" className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary">
            <GitBranch size={14} className="mr-1" />图谱管理
          </TabsTrigger>
          <TabsTrigger value="datasource" className="data-[state=active]:text-dark-accent-primary data-[state=active]:border-b-2 data-[state=active]:border-dark-accent-primary">
            <Database size={14} className="mr-1" />数据源管理
          </TabsTrigger>
        </TabsList>

        {/* ═════════ Tab 1: 图谱管理 ═════════ */}
        <TabsContent value="graph" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4">
            {statsCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 flex items-center gap-3"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.color)}>
                  <card.icon size={20} className={card.iconColor} />
                </div>
                <div>
                  <p className="text-[12px] text-dark-text-secondary">{card.label}</p>
                  <p className="text-[18px] font-semibold text-dark-text-primary">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 图谱导入 */}
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-4 border-b border-dark-border">
              <h2 className="text-h2">图谱导入</h2>
              <p className="text-[12px] text-dark-text-tertiary mt-0.5">用于批量初始化或迁移图谱数据</p>
            </div>
            <div className="p-5">
              {!uploadedFile ? (
                <div
                  className={cn(
                    'border-2 border-dashed border-dark-border-hover rounded-xl p-8 text-center transition-all',
                    'hover:border-dark-accent-primary-hover hover:bg-dark-accent-primary/10/30 cursor-pointer'
                  )}
                  onClick={() => setUploadedFile('graph_data_v2.3.0.json')}
                >
                  <Upload size={48} className="text-dark-text-tertiary mx-auto mb-3" />
                  <p className="text-[14px] text-dark-text-secondary font-medium">点击或拖拽文件到此处上传</p>
                  <p className="text-[12px] text-dark-text-tertiary mt-1">支持 CSV (.csv) / JSON (.json) / 图数据库 Dump (.dump, .cypher)</p>
                  <p className="text-[12px] text-dark-text-tertiary">单个文件最大 100MB</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-dark-page rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-dark-accent-primary/10 flex items-center justify-center">
                      <Database size={20} className="text-dark-accent-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-dark-text-primary">{uploadedFile}</p>
                      <p className="text-[12px] text-dark-text-tertiary">JSON 格式 · 2.4 MB</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-[12px]">预览数据</Button>
                    <button onClick={() => setUploadedFile(null)} className="text-dark-text-tertiary hover:text-error-500"><X size={16} /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-dark-text-primary">导入模式</label>
                      <div className="flex gap-3">
                        {['full', 'incremental', 'append'].map(m => (
                          <button
                            key={m}
                            onClick={() => setImportMode(m)}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-[13px] border transition-colors',
                              importMode === m ? 'bg-dark-accent-primary/10 border-dark-accent-primary text-dark-accent-primary' : 'border-dark-border-hover text-dark-text-secondary hover:border-dark-text-tertiary'
                            )}
                          >
                            {m === 'full' ? '全量覆盖' : m === 'incremental' ? '增量更新' : '仅新增'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[14px] font-medium text-dark-text-primary">冲突处理</label>
                      <div className="flex gap-3">
                        {['skip', 'overwrite', 'merge'].map(m => (
                          <button
                            key={m}
                            onClick={() => setConflictMode(m)}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-[13px] border transition-colors',
                              conflictMode === m ? 'bg-dark-accent-primary/10 border-dark-accent-primary text-dark-accent-primary' : 'border-dark-border-hover text-dark-text-secondary hover:border-dark-text-tertiary'
                            )}
                          >
                            {m === 'skip' ? '跳过' : m === 'overwrite' ? '覆盖' : '合并'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {importing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-dark-text-secondary">正在导入...</span>
                        <span className="text-dark-accent-primary font-medium">{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-[12px] text-dark-text-tertiary">
                        {importProgress < 30 && '正在解析文件...'}
                        {importProgress >= 30 && importProgress < 60 && '检测到 1,247 个节点, 3,856 条关系'}
                        {importProgress >= 60 && importProgress < 100 && `正在导入节点 (${Math.floor(importProgress * 12.47)}/1247)...`}
                        {importProgress >= 100 && '导入完成: 1,247 节点, 3,856 关系, 耗时 12.3s'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleStartImport} className="bg-dark-accent-primary hover:bg-dark-accent-primary-active h-9">开始导入</Button>
                      <Button variant="outline" onClick={() => setUploadedFile(null)} className="h-9 border-dark-border-hover">取消</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 版本管理 */}
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-4 border-b border-dark-border">
              <h2 className="text-h2">版本管理</h2>
              <p className="text-[12px] text-dark-text-tertiary mt-0.5">用于追溯历史状态，支持回滚</p>
            </div>
            <div className="p-5">
              <DataTable
                columns={versionColumns}
                data={versions}
                rowKey="id"
                pagination={{
                  current: 1,
                  pageSize: 10,
                  total: versions.length,
                  onChange: () => {},
                }}
              />
            </div>
          </div>
        </TabsContent>

        {/* ═════════ Tab 2: 数据源管理 ═════════ */}
        <TabsContent value="datasource">
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
            <DataTable
              columns={dsColumns}
              data={dataSources}
              rowKey="id"
              pagination={{
                current: 1,
                pageSize: 10,
                total: dataSources.length,
                onChange: () => {},
              }}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* ── 版本详情弹窗 ── */}
      <Dialog open={!!versionDetail} onOpenChange={() => setVersionDetail(null)}>
        <DialogContent className="max-w-[640px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">版本详情 — {versionDetail?.version}</DialogTitle>
          </DialogHeader>
          {versionDetail && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: '版本号', value: versionDetail.version },
                  { label: '版本名称', value: versionDetail.name },
                  { label: '创建时间', value: versionDetail.createdAt },
                  { label: '创建人', value: versionDetail.creator },
                ].map(item => (
                  <div key={item.label} className="bg-dark-page rounded-lg p-3">
                    <p className="text-[11px] text-dark-text-tertiary mb-1">{item.label}</p>
                    <p className="text-[13px] font-medium text-dark-text-primary">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: '节点数', value: versionDetail.nodeCount },
                  { label: '关系数', value: versionDetail.relationCount },
                  { label: '对象类型数', value: 24 },
                  { label: '属性数', value: 156 },
                  { label: '规则数', value: 42 },
                ].map(item => (
                  <div key={item.label} className="text-center">
                    <p className="text-[18px] font-semibold text-dark-text-primary">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</p>
                    <p className="text-[11px] text-dark-text-tertiary">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-border pt-3">
                <p className="text-[14px] font-medium text-dark-text-primary mb-2">变更摘要</p>
                <p className="text-[13px] text-dark-text-secondary">{versionDetail.changeSummary}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── 版本对比弹窗 ── */}
      <Dialog open={compareVersions.open} onOpenChange={() => setCompareVersions(prev => ({ ...prev, open: false }))}>
        <DialogContent className="max-w-[900px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">版本对比</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="flex items-center gap-4">
              <Select value={compareVersions.vA} onValueChange={v => setCompareVersions(prev => ({ ...prev, vA: v }))}>
                <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {versions.map(v => <SelectItem key={v.id} value={v.version}>{v.version}</SelectItem>)}
                </SelectContent>
              </Select>
              <ArrowRightLeft size={16} className="text-dark-text-tertiary" />
              <Select value={compareVersions.vB} onValueChange={v => setCompareVersions(prev => ({ ...prev, vB: v }))}>
                <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {versions.map(v => <SelectItem key={v.id} value={v.version}>{v.version}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-dark-card-l2">
                  <tr className="border-b border-dark-border">
                    <th className="px-3 py-2 text-left font-medium text-dark-text-secondary">变更类型</th>
                    <th className="px-3 py-2 text-left font-medium text-dark-text-secondary">名称</th>
                    <th className="px-3 py-2 text-left font-medium text-dark-text-secondary">编码</th>
                    <th className="px-3 py-2 text-center font-medium text-dark-text-secondary">{compareVersions.vA}</th>
                    <th className="px-3 py-2 text-center font-medium text-dark-text-secondary">{compareVersions.vB}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: '新增', typeColor: 'text-success-500', name: '5G用户增长率', code: 'IND-1248', a: '—', b: '新增' },
                    { type: '新增', typeColor: 'text-success-500', name: '宽带续约率', code: 'IND-1249', a: '—', b: '新增' },
                    { type: '修改', typeColor: 'text-warning-500', name: 'ARPU值', code: 'IND-0356', a: '128.5', b: '135.2' },
                    { type: '不变', typeColor: 'text-dark-text-secondary', name: '用户总数', code: 'IND-0001', a: '存在', b: '存在' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-dark-border">
                      <td className={cn('px-3 py-2 font-medium', row.typeColor)}>{row.type}</td>
                      <td className="px-3 py-2 text-dark-text-secondary">{row.name}</td>
                      <td className="px-3 py-2 font-mono text-dark-text-secondary">{row.code}</td>
                      <td className="px-3 py-2 text-center text-dark-text-secondary">{row.a}</td>
                      <td className="px-3 py-2 text-center text-dark-text-secondary">{row.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 回滚确认弹窗 ── */}
      <Dialog open={rollbackConfirm.open} onOpenChange={() => setRollbackConfirm({ open: false, version: null })}>
        <DialogContent className="max-w-[480px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">确认回滚？</DialogTitle>
          </DialogHeader>
          <p className="text-[14px] text-dark-text-secondary py-4">
            将从 <strong>{currentVersion?.version}</strong> 回滚到 <strong>{rollbackConfirm.version?.version}</strong>。当前版本的数据将被备份。此操作不可撤销。是否继续？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackConfirm({ open: false, version: null })} className="border-dark-border-hover">取消</Button>
            <Button variant="destructive" onClick={handleRollback}>确认回滚</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 数据源新增/编辑弹窗 ── */}
      <Dialog open={dsModalOpen} onOpenChange={setDsModalOpen}>
        <DialogContent className="max-w-[560px]" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">{editingDsId ? '编辑数据源' : '新增数据源'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">数据源编码</label>
              <input
                type="text"
                value={dsForm.code || ''}
                onChange={e => setDsForm(prev => ({ ...prev, code: e.target.value }))}
                disabled={!!editingDsId}
                className={cn(
                  'h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary',
                  'focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20',
                  'disabled:bg-dark-card-l2 disabled:text-dark-text-tertiary'
                )}
                placeholder="如 DS-001"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">数据源名称 <span className="text-error-500">*</span></label>
              <input
                type="text"
                value={dsForm.name || ''}
                onChange={e => setDsForm(prev => ({ ...prev, name: e.target.value }))}
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
                placeholder="如 经营数据仓库"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">数据库类型</label>
              <Select
                value={dsForm.dbType || 'MySQL'}
                onValueChange={v => setDsForm(prev => ({ ...prev, dbType: v, port: defaultPorts[v] || 3306 }))}
              >
                <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dbTypeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">主机地址</label>
              <input
                type="text"
                value={dsForm.host || ''}
                onChange={e => setDsForm(prev => ({ ...prev, host: e.target.value }))}
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
                placeholder="如 10.0.1.100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">端口</label>
              <input
                type="number"
                value={dsForm.port || ''}
                onChange={e => setDsForm(prev => ({ ...prev, port: Number(e.target.value) }))}
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">数据库名</label>
              <input
                type="text"
                value={dsForm.dbName || ''}
                onChange={e => setDsForm(prev => ({ ...prev, dbName: e.target.value }))}
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">用户名</label>
              <input
                type="text"
                value={dsForm.username || ''}
                onChange={e => setDsForm(prev => ({ ...prev, username: e.target.value }))}
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">密码</label>
              <input
                type="password"
                placeholder="••••••••"
                className="h-9 w-full px-3 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">连接参数</label>
              <textarea
                className="w-full min-h-[50px] px-3 py-2 rounded-md border border-dark-border-hover text-[14px] font-mono text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20 resize-y"
                placeholder="如 charset=utf8&timeout=30"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-dark-text-primary">描述</label>
              <textarea
                className="w-full min-h-[50px] px-3 py-2 rounded-md border border-dark-border-hover text-[14px] text-dark-text-secondary focus:outline-none focus:border-dark-accent-primary-hover focus:ring-2 focus:ring-dark-accent-primary/20 resize-y"
              />
            </div>
          </div>

          {testResult && (
            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-lg mb-2', testResult.success ? 'bg-success-500/10' : 'bg-error-500/10')}>
              {testResult.success ? <CheckCircle size={16} className="text-success-500" /> : <XCircle size={16} className="text-error-500" />}
              <span className={cn('text-[13px]', testResult.success ? 'text-success-600' : 'text-error-600')}>{testResult.message}</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleTestConnection} className="border-dark-border-hover">
              <RefreshCw size={14} className="mr-1" />测试连接
            </Button>
            <Button variant="outline" onClick={() => setDsModalOpen(false)} className="border-dark-border-hover">取消</Button>
            <Button onClick={handleDsSave} className="bg-dark-accent-primary hover:bg-dark-accent-primary-active">保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 表结构映射 Drawer ── */}
      <Dialog open={mappingDrawerOpen} onOpenChange={setMappingDrawerOpen}>
        <DialogContent className="max-w-[960px] max-h-[90vh] overflow-y-auto" showCloseButton>
          <DialogHeader>
            <DialogTitle className="text-h2">表结构映射</DialogTitle>
          </DialogHeader>
          {selectedDs && (
            <div className="space-y-4 py-2">
              {/* 数据源信息 */}
              <div className="flex items-center gap-3 bg-dark-page rounded-lg p-3">
                <Database size={20} className="text-dark-accent-primary" />
                <span className="text-[14px] font-medium text-dark-text-primary">{selectedDs.name}</span>
                <span className="text-[12px] bg-dark-accent-primary/10 text-dark-accent-primary px-2 py-0.5 rounded">{selectedDs.dbType}</span>
                <span className="text-[12px] text-dark-text-tertiary">{selectedDs.host}:{selectedDs.port}/{selectedDs.dbName}</span>
                <div className="ml-auto">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="w-[220px] h-8 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sourceTables.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.fieldCount}字段)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 三列映射布局 */}
              <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-3">
                {/* 左列：源表字段 */}
                <div className="border border-dark-border rounded-lg overflow-hidden">
                  <div className="bg-dark-card-l2 px-3 py-2 border-b border-dark-border">
                    <p className="text-[13px] font-medium text-dark-text-primary">源表字段</p>
                  </div>
                  <div className="divide-y divide-[#e8ecf1] max-h-[400px] overflow-y-auto">
                    {sourceTableFields.map(f => (
                      <div key={f.name} className="px-3 py-2 hover:bg-dark-page cursor-grab active:cursor-grabbing">
                        <p className="text-[13px] font-medium text-dark-text-secondary">{f.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-dark-text-tertiary">{f.type}</span>
                          <span className="text-[11px] text-dark-text-tertiary">{f.comment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 中列：映射配置 */}
                <div className="border border-dark-border rounded-lg overflow-hidden">
                  <div className="bg-dark-card-l2 px-3 py-2 border-b border-dark-border flex items-center justify-between">
                    <p className="text-[13px] font-medium text-dark-text-primary">映射配置</p>
                    <span className="text-[11px] text-dark-text-tertiary">{mappings.length} 条映射</span>
                  </div>
                  {mappings.length === 0 ? (
                    <div className="p-8 text-center text-dark-text-tertiary">
                      <ArrowRightLeft size={24} className="mx-auto mb-2 text-dark-text-tertiary" />
                      <p className="text-[13px]">从左侧拖拽字段到此处开始映射</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e8ecf1] max-h-[400px] overflow-y-auto">
                      {mappings.map((m, i) => (
                        <div key={i} className="px-3 py-2 flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-medium text-dark-text-secondary truncate">{m.sourceField}</p>
                          </div>
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded shrink-0',
                            m.mappingType === '直接映射' ? 'bg-success-500/10 text-success-600' :
                            m.mappingType === '条件映射' ? 'bg-warning-500/10 text-warning-600' :
                            'bg-dark-accent-primary/10 text-dark-accent-primary'
                          )}>{m.mappingType}</span>
                          <ChevronRight size={12} className="text-dark-text-tertiary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] text-dark-text-secondary truncate">{m.target}</p>
                          </div>
                          <button
                            className="text-dark-text-tertiary hover:text-error-500 shrink-0"
                            onClick={() => setMappings(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 右列：图谱属性 */}
                <div className="border border-dark-border rounded-lg overflow-hidden">
                  <div className="bg-dark-card-l2 border-b border-dark-border">
                    <div className="flex">
                      {(['fields', 'properties'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setMappingTab(tab)}
                          className={cn(
                            'flex-1 px-2 py-2 text-[12px] font-medium transition-colors',
                            mappingTab === tab ? 'text-dark-accent-primary bg-dark-elevated' : 'text-dark-text-tertiary hover:text-dark-text-secondary'
                          )}
                        >
                          {tab === 'fields' ? '图谱属性' : '对象类型字段'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-[#e8ecf1] max-h-[370px] overflow-y-auto">
                    {graphProperties.map(p => (
                      <div key={p.name} className="px-3 py-2 hover:bg-dark-page cursor-grab active:cursor-grabbing">
                        <p className="text-[13px] font-medium text-dark-text-secondary">{p.name}</p>
                        <span className="text-[11px] text-dark-text-tertiary">{p.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部操作 */}
              <DialogFooter>
                <Button variant="outline" onClick={() => setMappingDrawerOpen(false)} className="border-dark-border-hover">取消</Button>
                <Button variant="outline" className="border-dark-border-hover">测试映射</Button>
                <Button onClick={() => setMappingDrawerOpen(false)} className="bg-dark-accent-primary hover:bg-dark-accent-primary-active">保存映射配置</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
