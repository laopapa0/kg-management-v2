import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle,
  Pencil,
  RotateCcw,
  FileText,
  Network,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import StatusBadge from '@/components/StatusBadge';
import DataTable from '@/components/DataTable';
import type { Column } from '@/components/DataTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { toast } from 'sonner';
import ObjectTypePropertyPanel from '@/components/ObjectTypePropertyPanel';

/* ─── 动画 ─── */
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

const expandAnimation = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: 'easeInOut' as const },
};

/* ─── Mock 数据 ─── */
const currentIndicator = {
  id: 'IND-2024-0056',
  name: '5G用户渗透率',
  alias: '5G渗透率',
  status: '已发布',
  level1: '发展',
  level2: '用户发展',
  granularity: '省分',
  businessCaliber: '5G用户数 / 移动用户总数 × 100%',
  calcMethod: '比率计算',
  unit: '百分比',
  frequency: '日',
  descriptionScope: '适用于全网5G业务发展监控',
  descriptionFeatures: '反映5G网络用户渗透程度',
  descriptionMeaning: '衡量5G业务普及程度的核心指标',
  aggregateFunction: 'AVG',
  customExpression: 'SUM(5G用户数) / SUM(移动用户总数) * 100',
  sourceTable: 'dwd_5g_user_indicator',
  sourceSQL: "SELECT COUNT(DISTINCT user_id) / total_users AS penetration_rate FROM dwd_5g_user WHERE month = '2024-05'",
  dimensions: ['区局', 'BD', '产品'],
  inboundLinks: 3,
  outboundLinks: 2,
  rules: [
    { name: '5G用户波动告警', type: '阈值告警', params: { upperLimit: 95, lowerLimit: 5 }, displayParams: '上限: 95%, 下限: 5%' },
    { name: '收入异常检测', type: '异常检测', params: { sensitivity: '中', window: '7天' }, displayParams: '敏感度: 中, 窗口: 7天' },
  ],
};

const changeTypeOptions = [
  {
    value: 'noc_review' as const,
    label: '修改基础信息 / 核心属性',
    description: '修改名称、别名、描述、口径、计算方式、单位等。提交 NOC 审核后生效。',
    badge: '需 NOC 审核',
    badgeType: 'warning' as const,
    borderColor: 'border-[#f59e0b]',
    hoverBorder: 'hover:border-[#f59e0b]',
    fields: ['名称 / 别名', '描述', '业务口径', '计算方式', '计量单位'],
  },
  {
    value: 'self_publish' as const,
    label: '修改计算方式 / 维度映射 / 关系边 / 规则',
    description: '修改聚合函数、维度组合、链接关系、业务规则参数等。基于业务自审 checklist 确认后直接发布。',
    badge: '自行处理',
    badgeType: 'primary' as const,
    borderColor: 'border-[#3478f6]',
    hoverBorder: 'hover:border-[#3478f6]',
    fields: ['聚合函数', '维度组合', '链接关系', '规则参数'],
  },
];

const unitOptions = ['个', '户', '百分比', '元', '分钟', '次', 'MB', 'GB'];
const frequencyOptions = ['实时', '小时', '日', '周', '月', '季度', '年'];
const calcMethodOptions = ['直接取值', '比率计算', '汇总统计', '自定义'];
const aggregateOptions = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];
const dimensionOptions = ['区局', 'BD', '产品', '渠道', '客户类型', '时间', '网络类型', '套餐档位'];

/* ─── 类型 ─── */
type ChangeType = 'noc_review' | 'self_publish' | null;

/* ─── 验证 ─── */
const editSchemaBranchA = z.object({
  changeReason: z.string().min(10, '变更说明至少10个字符').max(1000),
});

/* ─── 规则参数类型 ─── */
interface RuleParamConfig {
  name: string;
  type: string;
  params: Record<string, unknown>;
  displayParams: string;
}

/* ─── 主页面 ─── */
export default function IndicatorEditPage() {
  const navigate = useNavigate();
  useParams<{ id: string }>();

  const [changeType, setChangeType] = useState<ChangeType>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [editRuleDrawer, setEditRuleDrawer] = useState<RuleParamConfig | null>(null);

  // Branch A form state
  const [branchAForm, setBranchAForm] = useState({
    newName: currentIndicator.name,
    newAlias: currentIndicator.alias,
    newLevel1: currentIndicator.level1,
    newLevel2: currentIndicator.level2,
    newGranularity: currentIndicator.granularity,
    newCaliber: currentIndicator.businessCaliber,
    newCalcMethod: currentIndicator.calcMethod,
    newUnit: currentIndicator.unit,
    newFrequency: currentIndicator.frequency,
    changeReason: '',
  });

  // Track which fields are modified in Branch A
  const getModifiedFields = useCallback(() => {
    const modified: { field: string; before: string; after: string }[] = [];
    if (branchAForm.newName !== currentIndicator.name) {
      modified.push({ field: '指标名称', before: currentIndicator.name, after: branchAForm.newName });
    }
    if (branchAForm.newAlias !== currentIndicator.alias) {
      modified.push({ field: '指标别名', before: currentIndicator.alias, after: branchAForm.newAlias });
    }
    if (branchAForm.newLevel1 !== currentIndicator.level1) {
      modified.push({ field: '一级分类', before: currentIndicator.level1, after: branchAForm.newLevel1 });
    }
    if (branchAForm.newLevel2 !== currentIndicator.level2) {
      modified.push({ field: '二级分类', before: currentIndicator.level2, after: branchAForm.newLevel2 });
    }
    if (branchAForm.newGranularity !== currentIndicator.granularity) {
      modified.push({ field: '颗粒度', before: currentIndicator.granularity, after: branchAForm.newGranularity });
    }
    if (branchAForm.newCaliber !== currentIndicator.businessCaliber) {
      modified.push({ field: '业务口径', before: currentIndicator.businessCaliber, after: branchAForm.newCaliber });
    }
    if (branchAForm.newCalcMethod !== currentIndicator.calcMethod) {
      modified.push({ field: '计算方式', before: currentIndicator.calcMethod, after: branchAForm.newCalcMethod });
    }
    if (branchAForm.newUnit !== currentIndicator.unit) {
      modified.push({ field: '计量单位', before: currentIndicator.unit, after: branchAForm.newUnit });
    }
    if (branchAForm.newFrequency !== currentIndicator.frequency) {
      modified.push({ field: '更新频率', before: currentIndicator.frequency, after: branchAForm.newFrequency });
    }
    return modified;
  }, [branchAForm]);

  // Branch B form state
  const [branchBForm, setBranchBForm] = useState({
    newAggregate: currentIndicator.aggregateFunction,
    newExpression: currentIndicator.customExpression,
    newDimensions: [...currentIndicator.dimensions],
    newSourceTable: currentIndicator.sourceTable ?? 'dwd_5g_user_indicator',
    newSourceSQL: currentIndicator.sourceSQL ?? "SELECT COUNT(DISTINCT user_id) / total_users AS penetration_rate FROM dwd_5g_user WHERE month = '2024-05'",
  });

  // Detect modified fields for visual indicators
  const isFieldModified = (field: keyof typeof branchAForm, original: string) => {
    return branchAForm[field] !== original;
  };

  const handleBranchAChange = useCallback((field: keyof typeof branchAForm, value: string) => {
    setBranchAForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleBranchBChange = useCallback((field: keyof typeof branchBForm, value: string | string[]) => {
    setBranchBForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleDimensionToggle = useCallback((dim: string) => {
    setBranchBForm((prev) => {
      const current = [...prev.newDimensions];
      const exists = current.includes(dim);
      return {
        ...prev,
        newDimensions: exists ? current.filter((d) => d !== dim) : [...current, dim],
      };
    });
  }, []);

  const handleSubmitBranchA = useCallback(() => {
    const result = editSchemaBranchA.safeParse({ changeReason: branchAForm.changeReason });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (getModifiedFields().length === 0) {
      toast.warning('未检测到任何字段变更');
      return;
    }
    setShowConfirm(true);
  }, [branchAForm.changeReason, getModifiedFields]);

  const handleConfirmSubmitA = useCallback(() => {
    setShowConfirm(false);
    toast.success('变更申请已提交 NOC 审核');
    setTimeout(() => navigate('/'), 500);
  }, [navigate]);

  const handlePublishBranchB = useCallback(() => {
    setShowPublishConfirm(true);
  }, []);

  const handleConfirmPublishB = useCallback(() => {
    setShowPublishConfirm(false);
    toast.success('变更已发布');
    setTimeout(() => navigate('/'), 500);
  }, [navigate]);

  const modifiedFields = getModifiedFields();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[960px] mx-auto pb-24"
    >
      {/* ── Section 1: Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="mb-3 h-8 px-3 text-[13px]"
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={14} className="mr-1" />
            返回
          </Button>
          <h1 className="text-[28px] font-semibold text-[#1a202c] leading-tight">
            变更对象实例（指标）
          </h1>
          <p className="text-[13px] text-[#6b7789] mt-1">
            修改已发布指标的基础信息、计算方式、维度映射或业务规则，根据变更类型走审核或自审流程
          </p>
        </div>
        <div className="bg-white border border-[#e8ecf1] rounded-lg p-4 shadow-sm">
          <span className="text-[12px] text-[#9ba4b3] font-mono">{currentIndicator.id}</span>
          <h4 className="text-[16px] font-medium text-[#2d3748]">{currentIndicator.name}</h4>
          <StatusBadge text={currentIndicator.status} type="success" className="mt-1" />
        </div>
      </div>

      {/* ── Section 2: 变更类型选择 ── */}
      <motion.div {...fadeIn} className="mb-6">
        <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-lg p-5">
          <h3 className="text-[16px] font-medium text-[#2d3748] flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-[#f59e0b]" />
            请选择变更类型
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {changeTypeOptions.map((option, index) => {
              const isSelected = changeType === option.value;
              return (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.15 }}
                  onClick={() => setChangeType(option.value)}
                  className={cn(
                    'relative text-left p-4 bg-white rounded-lg border-2 transition-all duration-200',
                    isSelected ? `${option.borderColor} shadow-md` : 'border-[#e8ecf1] hover:shadow-sm',
                    option.hoverBorder
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                      isSelected ? `border-[${option.badgeType === 'warning' ? '#f59e0b' : '#3478f6'}] bg-[${option.badgeType === 'warning' ? '#f59e0b' : '#3478f6'}]` : 'border-[#c4cad4]'
                    )}
                      style={isSelected ? {
                        borderColor: option.badgeType === 'warning' ? '#f59e0b' : '#3478f6',
                        backgroundColor: option.badgeType === 'warning' ? '#f59e0b' : '#3478f6',
                      } : undefined}
                    >
                      {isSelected && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[15px] font-medium text-[#2d3748]">{option.label}</h4>
                      <p className="text-[13px] text-[#6b7789] mt-1">{option.description}</p>
                      <StatusBadge
                        text={option.badge}
                        type={option.badgeType}
                        className="mt-2"
                      />
                      <div className="mt-2 flex flex-wrap gap-1">
                        {option.fields.map((f) => (
                          <span key={f} className="text-[11px] text-[#9ba4b3] bg-[#f8f9fb] px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Section 3A: 需 NOC 审核表单 ── */}
      <AnimatePresence>
        {changeType === 'noc_review' && (
          <motion.div {...expandAnimation} className="space-y-6 overflow-hidden">
            {/* Card 1: 选择指标 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">选择要变更的指标</h3>
                </div>
                <div className="p-5">
                  <SearchInput
                    placeholder="搜索已发布指标名称或编码"
                    value={currentIndicator.name}
                    onChange={() => {}}
                    width="w-full"
                  />
                  <div className="mt-3 bg-[#eef4ff] border border-[#bcd3ff] rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[12px] text-[#3478f6] font-mono">{currentIndicator.id}</span>
                      <h4 className="text-[16px] font-medium text-[#154bc4] mt-0.5">{currentIndicator.name}</h4>
                      <StatusBadge text="已发布" type="success" className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: 变更字段编辑 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">变更内容</h3>
                  <p className="text-[13px] text-[#6b7789] mt-1">
                    以下字段的修改将生成变更申请单，提交 NOC 审核
                  </p>
                </div>
                <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-4">
                  {/* 指标名称 */}
                  <div className={cn(
                    'relative pl-3 transition-colors',
                    isFieldModified('newName', currentIndicator.name) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">指标名称</Label>
                      {isFieldModified('newName', currentIndicator.name) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.name}</div>
                    <div className="relative">
                      <Input
                        value={branchAForm.newName}
                        onChange={(e) => handleBranchAChange('newName', e.target.value)}
                        className={cn(
                          'h-9',
                          isFieldModified('newName', currentIndicator.name) && 'border-[#fcd34d]'
                        )}
                      />
                      {isFieldModified('newName', currentIndicator.name) && (
                        <button
                          onClick={() => handleBranchAChange('newName', currentIndicator.name)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ba4b3] hover:text-[#3478f6] transition-colors"
                          title="恢复原值"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 指标别名 */}
                  <div className={cn(
                    'relative pl-3 transition-colors',
                    isFieldModified('newAlias', currentIndicator.alias) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">指标别名</Label>
                      {isFieldModified('newAlias', currentIndicator.alias) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.alias}</div>
                    <div className="relative">
                      <Input
                        value={branchAForm.newAlias}
                        onChange={(e) => handleBranchAChange('newAlias', e.target.value)}
                        className={cn(
                          'h-9',
                          isFieldModified('newAlias', currentIndicator.alias) && 'border-[#fcd34d]'
                        )}
                      />
                      {isFieldModified('newAlias', currentIndicator.alias) && (
                        <button
                          onClick={() => handleBranchAChange('newAlias', currentIndicator.alias)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9ba4b3] hover:text-[#3478f6] transition-colors"
                          title="恢复原值"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 对象类型属性 - 跨两列 */}
                  <div className={cn(
                    'col-span-2 relative pl-3 transition-colors',
                    (isFieldModified('newLevel1', currentIndicator.level1) || isFieldModified('newLevel2', currentIndicator.level2) || isFieldModified('newGranularity', currentIndicator.granularity)) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">对象类型属性</Label>
                      {(isFieldModified('newLevel1', currentIndicator.level1) || isFieldModified('newLevel2', currentIndicator.level2) || isFieldModified('newGranularity', currentIndicator.granularity)) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">
                      原值：{currentIndicator.level1} / {currentIndicator.level2} / {currentIndicator.granularity}
                    </div>
                    <div className={cn(
                      'rounded-lg border border-[#e8ecf1] p-3',
                      (isFieldModified('newLevel1', currentIndicator.level1) || isFieldModified('newLevel2', currentIndicator.level2) || isFieldModified('newGranularity', currentIndicator.granularity)) && 'border-[#fcd34d]'
                    )}>
                      <ObjectTypePropertyPanel
                        fieldKeys={['level1', 'level2', 'granularity']}
                        values={{
                          level1: branchAForm.newLevel1,
                          level2: branchAForm.newLevel2,
                          granularity: branchAForm.newGranularity,
                        }}
                        onChange={(fieldKey, value) => {
                          const map: Record<string, keyof typeof branchAForm> = {
                            level1: 'newLevel1',
                            level2: 'newLevel2',
                            granularity: 'newGranularity',
                          };
                          const branchKey = map[fieldKey];
                          if (branchKey) handleBranchAChange(branchKey, value);
                        }}
                      />
                    </div>
                  </div>

                  {/* 业务口径 - 跨两列 */}
                  <div className={cn(
                    'col-span-2 relative pl-3 transition-colors',
                    isFieldModified('newCaliber', currentIndicator.businessCaliber) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">业务口径</Label>
                      {isFieldModified('newCaliber', currentIndicator.businessCaliber) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.businessCaliber}</div>
                    <Textarea
                      value={branchAForm.newCaliber}
                      onChange={(e) => handleBranchAChange('newCaliber', e.target.value)}
                      className={cn(
                        'min-h-[80px]',
                        isFieldModified('newCaliber', currentIndicator.businessCaliber) && 'border-[#fcd34d]'
                      )}
                    />
                  </div>

                  {/* 计算方式 */}
                  <div className={cn(
                    'relative pl-3 transition-colors',
                    isFieldModified('newCalcMethod', currentIndicator.calcMethod) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">计算方式</Label>
                      {isFieldModified('newCalcMethod', currentIndicator.calcMethod) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.calcMethod}</div>
                    <Select
                      value={branchAForm.newCalcMethod}
                      onValueChange={(v) => handleBranchAChange('newCalcMethod', v)}
                    >
                      <SelectTrigger className={cn(
                        'h-9',
                        isFieldModified('newCalcMethod', currentIndicator.calcMethod) && 'border-[#fcd34d]'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {calcMethodOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 计量单位 */}
                  <div className={cn(
                    'relative pl-3 transition-colors',
                    isFieldModified('newUnit', currentIndicator.unit) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">计量单位</Label>
                      {isFieldModified('newUnit', currentIndicator.unit) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.unit}</div>
                    <Select
                      value={branchAForm.newUnit}
                      onValueChange={(v) => handleBranchAChange('newUnit', v)}
                    >
                      <SelectTrigger className={cn(
                        'h-9',
                        isFieldModified('newUnit', currentIndicator.unit) && 'border-[#fcd34d]'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 更新频率 */}
                  <div className={cn(
                    'relative pl-3 transition-colors',
                    isFieldModified('newFrequency', currentIndicator.frequency) && 'border-l-[3px] border-l-[#f59e0b] bg-[#fffbeb]'
                  )}>
                    <div className="flex items-center gap-2 mb-1">
                      <Label className="text-[14px] font-medium text-[#2d3748]">更新频率</Label>
                      {isFieldModified('newFrequency', currentIndicator.frequency) && (
                        <StatusBadge text="已修改" type="warning" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#9ba4b3] mb-1">原值：{currentIndicator.frequency}</div>
                    <Select
                      value={branchAForm.newFrequency}
                      onValueChange={(v) => handleBranchAChange('newFrequency', v)}
                    >
                      <SelectTrigger className={cn(
                        'h-9',
                        isFieldModified('newFrequency', currentIndicator.frequency) && 'border-[#fcd34d]'
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: 变更说明 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">变更说明</h3>
                </div>
                <div className="p-5">
                  <Textarea
                    value={branchAForm.changeReason}
                    onChange={(e) => handleBranchAChange('changeReason', e.target.value)}
                    placeholder="请说明变更原因、影响范围..."
                    className="min-h-[100px]"
                  />
                  <p className="text-[12px] text-[#9ba4b3] mt-1">必填，至少 10 个字符</p>
                </div>
              </div>
            </motion.div>

            {/* Card 4: 修改前后对比 */}
            {modifiedFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                  <div className="px-5 py-4 border-b border-[#e8ecf1]">
                    <h3 className="text-[16px] font-medium text-[#2d3748]">修改对比预览</h3>
                    <p className="text-[13px] text-[#6b7789] mt-1">系统自动生成，提交前请确认</p>
                  </div>
                  <div className="p-5">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f1f3f6] border-b-2 border-[#e8ecf1]">
                          <th className="h-10 px-4 text-left text-[13px] font-medium text-[#4a5568]">字段名</th>
                          <th className="h-10 px-4 text-left text-[13px] font-medium text-[#4a5568]">修改前</th>
                          <th className="h-10 px-4 text-left text-[13px] font-medium text-[#4a5568]">修改后</th>
                          <th className="h-10 px-4 text-left text-[13px] font-medium text-[#4a5568]">变更类型</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modifiedFields.map((field, index) => (
                          <motion.tr
                            key={field.field}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="border-b border-[#e8ecf1]"
                          >
                            <td className="px-4 py-3 text-[14px] text-[#2d3748] font-medium">{field.field}</td>
                            <td className="px-4 py-3 text-[14px] text-[#9ba4b3] bg-[#f8f9fb] line-through">{field.before}</td>
                            <td className="px-4 py-3 text-[14px] text-[#2d3748] bg-[#fffbeb] font-medium">{field.after}</td>
                            <td className="px-4 py-3">
                              <StatusBadge text="修改" type="warning" />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 底部操作栏 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf1] px-6 py-4 z-30 flex items-center justify-between"
              style={{ marginLeft: 240 }}
            >
              <Button
                variant="outline"
                className="h-9 px-4 text-[14px]"
                onClick={() => toast.info('草稿已保存')}
              >
                保存草稿
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-[14px]"
                  onClick={() => navigate('/')}
                >
                  取消
                </Button>
                <Button
                  className="h-10 px-6 text-[14px] bg-[#3478f6] hover:bg-[#1d5ee0] text-white"
                  onClick={handleSubmitBranchA}
                >
                  <FileText size={16} className="mr-1.5" />
                  提交审核
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 3B: 自行处理表单 ── */}
      <AnimatePresence>
        {changeType === 'self_publish' && (
          <motion.div {...expandAnimation} className="space-y-6 overflow-hidden">
            {/* Card 1: 选择指标 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">选择要变更的指标</h3>
                </div>
                <div className="p-5">
                  <SearchInput
                    placeholder="搜索已发布指标名称或编码"
                    value={currentIndicator.name}
                    onChange={() => {}}
                    width="w-full"
                  />
                  <div className="mt-3 bg-[#eef4ff] border border-[#bcd3ff] rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[12px] text-[#3478f6] font-mono">{currentIndicator.id}</span>
                      <h4 className="text-[16px] font-medium text-[#154bc4] mt-0.5">{currentIndicator.name}</h4>
                      <StatusBadge text="已发布" type="success" className="mt-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: 度量映射 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">度量映射（可选）</h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-6">
                  {/* 左卡片：指标间计算关系 */}
                  <div className="border border-[#e8ecf1] rounded-lg p-4">
                    <h4 className="text-[15px] font-medium text-[#2d3748] mb-1">指标间计算关系（可选填）</h4>
                    <p className="text-[12px] text-[#9ba4b3] mb-4">该指标通过图谱中已有指标计算得出</p>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">聚合函数</Label>
                      <div className="mt-1 p-2 bg-[#f1f3f6] rounded text-[13px] text-[#9ba4b3]">
                        当前值：{currentIndicator.aggregateFunction}
                      </div>
                      <Select
                        value={branchBForm.newAggregate}
                        onValueChange={(v) => handleBranchBChange('newAggregate', v)}
                      >
                        <SelectTrigger className="mt-2 h-9">
                          <SelectValue placeholder="选择新值" />
                        </SelectTrigger>
                        <SelectContent>
                          {aggregateOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-4">
                      <Label className="text-[14px] font-medium text-[#2d3748]">自定义表达式</Label>
                      <div className="mt-1 p-2 bg-[#f1f3f6] rounded text-[13px] text-[#9ba4b3] font-mono">
                        当前值：{currentIndicator.customExpression}
                      </div>
                      <Input
                        value={branchBForm.newExpression}
                        onChange={(e) => handleBranchBChange('newExpression', e.target.value)}
                        className="mt-2 h-9 font-mono text-[13px]"
                      />
                    </div>
                  </div>
                  {/* 右卡片：大数据溯源 */}
                  <div className="border border-[#e8ecf1] rounded-lg p-4">
                    <h4 className="text-[15px] font-medium text-[#2d3748] mb-1">大数据溯源（可选填）</h4>
                    <p className="text-[12px] text-[#9ba4b3] mb-4">该指标独立存在，直接从大数据表通过 SQL 查询得出</p>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">数据源表名</Label>
                      <Input
                        value={branchBForm.newSourceTable}
                        onChange={(e) => handleBranchBChange('newSourceTable', e.target.value)}
                        className="mt-1.5 h-9 font-mono text-[13px]"
                        placeholder="dwd_5g_user_indicator"
                      />
                      <p className="text-[12px] text-[#9ba4b3] mt-1">示例：dwd_5g_user_indicator</p>
                    </div>
                    <div className="mt-4">
                      <Label className="text-[14px] font-medium text-[#2d3748]">SQL 语句</Label>
                      <Textarea
                        value={branchBForm.newSourceSQL}
                        onChange={(e) => handleBranchBChange('newSourceSQL', e.target.value)}
                        className="mt-1.5 font-mono text-[13px] min-h-[100px]"
                        placeholder="SELECT COUNT(DISTINCT user_id) / total_users AS penetration_rate FROM dwd_5g_user WHERE month = '2024-05'"
                      />
                      <p className="text-[12px] text-[#9ba4b3] mt-1">为 LLM 提供指标溯源信息，帮助 AI 理解指标来源</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: 维度映射 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">维度映射</h3>
                </div>
                <div className="p-5">
                  <div className="mb-4">
                    <Label className="text-[13px] text-[#6b7789]">当前维度</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {currentIndicator.dimensions.map((dim) => (
                        <span key={dim} className="px-2 py-0.5 bg-[#f1f3f6] text-[#9ba4b3] text-[12px] rounded">
                          {dim}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">新维度选择</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {dimensionOptions.map((dim) => {
                      const isSelected = branchBForm.newDimensions.includes(dim);
                      return (
                        <button
                          key={dim}
                          onClick={() => handleDimensionToggle(dim)}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors',
                            isSelected
                              ? 'bg-[#eef4ff] border-[#3478f6] text-[#3478f6]'
                              : 'bg-white border-[#dde1e8] text-[#4a5568] hover:border-[#9ba4b3]'
                          )}
                        >
                          {isSelected && <CheckCircle size={12} className="inline mr-1" />}
                          {dim}
                        </button>
                      );
                    })}
                  </div>
                  {/* 业务知识关联（预留） */}
                  <div className="mt-6 pt-6 border-t border-[#e8ecf1]">
                    <h4 className="text-[15px] font-medium text-[#2d3748] mb-1">业务知识关联（预留）</h4>
                    <p className="text-[12px] text-[#9ba4b3] mb-4">
                      后续将支持关联业务知识库条目，描述指标的业务口径含义（如套餐指标 = WiFi指标 + 宽带指标 + 流量指标）
                    </p>
                    <div className="grid grid-cols-2 gap-6 opacity-50">
                      <div>
                        <Label className="text-[14px] font-medium text-[#2d3748]">知识库条目搜索</Label>
                        <Input disabled placeholder="功能开发中" className="mt-1.5 h-9" />
                      </div>
                      <div>
                        <Label className="text-[14px] font-medium text-[#2d3748]">知识库条目多选</Label>
                        <Input disabled placeholder="功能开发中" className="mt-1.5 h-9" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: 链接关系 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">链接关系</h3>
                </div>
                <div className="p-5">
                  <p className="text-[14px] text-[#6b7789] mb-4">
                    当前有 {currentIndicator.inboundLinks} 条入链，{currentIndicator.outboundLinks} 条出链
                  </p>
                  <p className="text-[13px] text-[#9ba4b3] mb-3">
                    如需修改链接关系，请前往血缘画布进行详细配置
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/lineage')}
                  >
                    <Network size={14} className="mr-1.5" />
                    前往血缘画布配置
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Card 5: 业务规则参数 */}
            <motion.div {...fadeIn}>
              <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-sm">
                <div className="px-5 py-4 border-b border-[#e8ecf1]">
                  <h3 className="text-[16px] font-medium text-[#2d3748]">业务规则参数</h3>
                </div>
                <div className="p-0">
                  <DataTable
                    columns={[
                      { key: 'name', title: '规则名称' },
                      { key: 'type', title: '规则类型' },
                      { key: 'displayParams', title: '当前参数' },
                      {
                        key: 'action',
                        title: '操作',
                        render: (_: Record<string, unknown>, rowIndex: number) => (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[12px]"
                            onClick={() => setEditRuleDrawer(currentIndicator.rules[rowIndex])}
                          >
                            <Pencil size={12} className="mr-1" />
                            编辑参数
                          </Button>
                        ),
                      },
                    ] as Column<Record<string, unknown>>[]}
                    data={currentIndicator.rules.map((r) => ({
                      name: r.name,
                      type: r.type,
                      displayParams: r.displayParams,
                      action: '',
                    }))}
                    rowKey={(record) => String(record.name)}
                  />
                </div>
              </div>
            </motion.div>

            {/* 底部操作栏 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf1] px-6 py-4 z-30 flex items-center justify-between"
              style={{ marginLeft: 240 }}
            >
              <Button
                variant="outline"
                className="h-9 px-4 text-[14px]"
                onClick={() => toast.info('草稿已保存')}
              >
                保存草稿
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-9 px-4 text-[14px]"
                  onClick={() => navigate('/')}
                >
                  取消
                </Button>
                <Button
                  className="h-10 px-6 text-[14px] bg-[#10b981] hover:bg-[#059669] text-white"
                  onClick={handlePublishBranchB}
                >
                  确认发布
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 确认弹窗: Branch A ── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">确认提交变更审核？</DialogTitle>
            <DialogDescription className="text-[14px] text-[#6b7789] mt-2">
              变更字段数：<strong>{modifiedFields.length}</strong> 个<br />
              变更指标：<strong>{currentIndicator.name}</strong><br />
              <span className="text-[#f59e0b] mt-2 block">
                审核期间该指标将处于锁定状态
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              取消
            </Button>
            <Button
              className="bg-[#3478f6] hover:bg-[#1d5ee0] text-white"
              onClick={handleConfirmSubmitA}
            >
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 确认弹窗: Branch B ── */}
      <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">确认发布变更？</DialogTitle>
            <DialogDescription className="text-[14px] text-[#6b7789] mt-2">
              变更将直接发布生效，请确认变更内容无误。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowPublishConfirm(false)}>
              取消
            </Button>
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={handleConfirmPublishB}
            >
              确认发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 编辑规则参数 Drawer ── */}
      <Drawer open={!!editRuleDrawer} onOpenChange={() => setEditRuleDrawer(null)}>
        <DrawerContent className="sm:max-w-[480px]">
          <DrawerHeader>
            <DrawerTitle className="text-[18px]">编辑规则参数</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            {editRuleDrawer && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">规则名称</Label>
                  <Input value={editRuleDrawer.name} disabled className="mt-1.5 h-9 bg-[#f1f3f6]" />
                </div>
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">规则类型</Label>
                  <Input value={editRuleDrawer.type} disabled className="mt-1.5 h-9 bg-[#f1f3f6]" />
                </div>
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">当前参数</Label>
                  <div className="mt-1.5 p-3 bg-[#f8f9fb] rounded-md text-[13px] text-[#4a5568] font-mono">
                    {editRuleDrawer.displayParams}
                  </div>
                </div>
                {editRuleDrawer.type === '阈值告警' && (
                  <>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">上限 (%)</Label>
                      <Input
                        type="number"
                        defaultValue={editRuleDrawer.params.upperLimit as number}
                        className="mt-1.5 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">下限 (%)</Label>
                      <Input
                        type="number"
                        defaultValue={editRuleDrawer.params.lowerLimit as number}
                        className="mt-1.5 h-9"
                      />
                    </div>
                  </>
                )}
                {editRuleDrawer.type === '异常检测' && (
                  <>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">敏感度</Label>
                      <Select defaultValue={editRuleDrawer.params.sensitivity as string}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="高">高</SelectItem>
                          <SelectItem value="中">中</SelectItem>
                          <SelectItem value="低">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[14px] font-medium text-[#2d3748]">窗口</Label>
                      <Select defaultValue={editRuleDrawer.params.window as string}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3天">3天</SelectItem>
                          <SelectItem value="7天">7天</SelectItem>
                          <SelectItem value="14天">14天</SelectItem>
                          <SelectItem value="30天">30天</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <DrawerFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setEditRuleDrawer(null)}>
              取消
            </Button>
            <Button
              className="bg-[#3478f6] hover:bg-[#1d5ee0] text-white"
              onClick={() => {
                setEditRuleDrawer(null);
                toast.success('规则参数已更新');
              }}
            >
              保存
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  );
}
