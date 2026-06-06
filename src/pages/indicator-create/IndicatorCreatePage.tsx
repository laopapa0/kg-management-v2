import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
  ChevronLeft,
  CheckCircle,
  Circle,
  X,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import StatusBadge from '@/components/StatusBadge';
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

import { toast } from 'sonner';
import ObjectTypePropertyPanel from '@/components/ObjectTypePropertyPanel';

/* ─── 动画 ─── */
const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

/* ─── Mock 数据 ─── */
const indicatorOptions = [
  { code: 'IND-2024-0056', name: '5G用户渗透率', level1: '发展', source: '统一数据门户' },
  { code: 'IND-2024-0057', name: '5G流量占比', level1: '发展', source: '经营管理大屏' },
  { code: 'IND-2024-0102', name: '宽带用户数', level1: '发展', source: '统一数据门户' },
  { code: 'IND-2024-0089', name: '客户满意度', level1: '服务', source: '客户服务大屏' },
  { code: 'IND-2024-0034', name: '网络故障率', level1: '交付', source: '网络运营大屏' },
];


const sourceOptions = ['统一数据门户', '经营管理大屏', '网络运营大屏', '客户服务大屏'];
const unitOptions = ['个', '户', '百分比', '元', '分钟', '次', 'MB', 'GB'];
const frequencyOptions = ['实时', '小时', '日', '周', '月', '季度', '年'];
const calcMethodOptions = ['直接取值', '比率计算', '汇总统计', '自定义'];
const aggregateOptions = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];
const dimensionOptions = ['区局', 'BD', '产品', '渠道', '客户类型', '时间', '网络类型', '套餐档位'];

/* ─── 验证 Schema ─── */
const createIndicatorSchema = z.object({
  indicatorCode: z.string().min(1, '请选择大屏指标'),
  indicatorName: z.string().min(2, '指标名称至少2个字符').max(100, '指标名称不超过100个字符'),
  level1: z.string().min(1, '请选择一级分类'),
  level2: z.string().min(1, '请选择二级分类'),
  granularity: z.string().min(1, '请选择颗粒度'),
  businessCaliber: z.string().max(500, '业务口径不超过500字符').optional(),
  calcMethod: z.string().optional(),
  unit: z.string().optional(),
  frequency: z.string().optional(),
  descriptionScope: z.string().max(1000).optional(),
  descriptionFeatures: z.string().max(1000).optional(),
  descriptionMeaning: z.string().max(1000).optional(),
  aggregateFunction: z.string().optional(),
  customExpression: z.string().max(500).optional(),
  dimensions: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof createIndicatorSchema>;

/* ─── 步骤指示器 ─── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ['选择指标', '编辑映射', '提交审核'];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStep > stepNum;
        const isCurrent = currentStep === stepNum;
        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 && (
              <div className={cn(
                'w-8 h-[2px]',
                isCompleted || isCurrent ? 'bg-[#10b981]' : 'bg-[#c4cad4]'
              )} />
            )}
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors',
              isCompleted && 'bg-[#ecfdf5] text-[#059669]',
              isCurrent && 'bg-[#eef4ff] text-[#3478f6]',
              !isCompleted && !isCurrent && 'text-[#9ba4b3]'
            )}>
              {isCompleted ? (
                <CheckCircle size={14} />
              ) : (
                <Circle size={14} className={cn(isCurrent ? 'text-[#3478f6]' : 'text-[#c4cad4]')} />
              )}
              <span>{stepNum}. {label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── 主页面 ─── */
export default function IndicatorCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    indicatorCode: '',
    indicatorName: '',
    level1: '',
    level2: '',
    granularity: '',
    businessCaliber: '',
    calcMethod: '',
    unit: '',
    frequency: '',
    descriptionScope: '',
    descriptionFeatures: '',
    descriptionMeaning: '',
    aggregateFunction: '',
    customExpression: '',
    dimensions: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // 点击外部关闭搜索结果
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredIndicators = searchQuery
    ? indicatorOptions.filter(
        (ind) =>
          ind.name.includes(searchQuery) ||
          ind.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const selectedIndicator = indicatorOptions.find(
    (ind) => ind.code === formData.indicatorCode
  );

  const handleSelectIndicator = useCallback((indicator: (typeof indicatorOptions)[0]) => {
    setFormData((prev) => ({
      ...prev,
      indicatorCode: indicator.code,
      indicatorName: indicator.name,
      level1: indicator.level1,
      level2: '',
      unit: '百分比',
      frequency: '日',
      calcMethod: '比率计算',
      businessCaliber: `${indicator.name} = ...`,
    }));
    setShowSearchResults(false);
    setSearchQuery('');
    setCurrentStep(2);
  }, []);

  const handleClearIndicator = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      indicatorCode: '',
      indicatorName: '',
      level1: '',
      level2: '',
      granularity: '',
      businessCaliber: '',
      calcMethod: '',
      unit: '',
      frequency: '',
    }));
    setCurrentStep(1);
  }, []);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleDimensionToggle = useCallback((dim: string) => {
    setFormData((prev) => {
      const current = prev.dimensions || [];
      const exists = current.includes(dim);
      return {
        ...prev,
        dimensions: exists ? current.filter((d) => d !== dim) : [...current, dim],
      };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    const result = createIndicatorSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof FormData;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      toast.error('请检查表单填写是否正确');
      return;
    }
    setShowConfirm(true);
  }, [formData]);

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirm(false);
    toast.success('已提交 NOC 审核');
    setTimeout(() => navigate('/'), 500);
  }, [navigate]);


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
            新增对象实例（指标）
          </h1>
          <p className="text-[13px] text-[#6b7789] mt-1">
            基于大屏指标创建图谱对象实例，完成基础信息、度量映射与维度映射配置
          </p>
        </div>
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* ── Section 2: 选择大屏指标 ── */}
      <motion.div {...fadeIn} className="mb-6">
        <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="px-5 py-4 border-b border-[#e8ecf1]">
            <h3 className="text-[16px] font-medium text-[#2d3748]">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#eef4ff] text-[#3478f6] text-[12px] font-semibold mr-2">1</span>
              选择大屏指标
            </h3>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {/* 大屏来源 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">
                    大屏来源
                  </Label>
                  <Select
                    value={formData.indicatorCode ? selectedIndicator?.source : ''}
                    onValueChange={() => {}}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请选择大屏来源" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 指标搜索 */}
                <div ref={searchRef} className="relative">
                  <Label className="text-[14px] font-medium text-[#2d3748]">
                    指标搜索 <span className="text-[#ef4444]">*</span>
                  </Label>
                  <div className="mt-1.5">
                    <SearchInput
                      placeholder="搜索指标名称或编码"
                      value={searchQuery}
                      onChange={(v) => {
                        setSearchQuery(v);
                        setShowSearchResults(v.length > 0);
                      }}
                      width="w-full"
                    />
                  </div>
                  <AnimatePresence>
                    {showSearchResults && filteredIndicators.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-20 w-full mt-1 bg-white border border-[#e8ecf1] rounded-md shadow-lg overflow-hidden"
                      >
                        {filteredIndicators.map((ind) => (
                          <button
                            key={ind.code}
                            onClick={() => handleSelectIndicator(ind)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f8f9fb] border-b border-[#e8ecf1] last:border-0 text-left transition-colors"
                          >
                            <span className="text-[12px] text-[#9ba4b3] font-mono">{ind.code}</span>
                            <span className="text-[14px] text-[#2d3748] font-medium">{ind.name}</span>
                            <StatusBadge text={ind.level1} type="primary" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 已选指标展示 */}
              <AnimatePresence>
                {selectedIndicator && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#eef4ff] border border-[#bcd3ff] rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[12px] text-[#3478f6] font-mono">{selectedIndicator.code}</span>
                      <h4 className="text-[16px] font-medium text-[#154bc4] mt-0.5">{selectedIndicator.name}</h4>
                      <StatusBadge text={selectedIndicator.level1} type="primary" className="mt-1" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#9ba4b3] hover:text-[#ef4444]"
                      onClick={handleClearIndicator}
                    >
                      <X size={16} />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.indicatorCode && (
                <p className="text-[12px] text-[#ef4444] mt-1">{errors.indicatorCode}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 3: 基础信息映射 ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#e8ecf1]">
                <h3 className="text-[16px] font-medium text-[#2d3748]">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#eef4ff] text-[#3478f6] text-[12px] font-semibold mr-2">2</span>
                  基础信息映射
                </h3>
                <p className="text-[13px] text-[#6b7789] mt-1">
                  以下信息已从大屏指标自动带出，可根据需要编辑调整
                </p>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="p-5 grid grid-cols-2 gap-x-6 gap-y-4"
              >
                {/* 左列 */}
                <motion.div variants={staggerItem}>
                  <Label className="text-[14px] font-medium text-[#2d3748]">
                    指标名称 <span className="text-[#ef4444]">*</span>
                  </Label>
                  <Input
                    value={formData.indicatorName}
                    onChange={(e) => updateField('indicatorName', e.target.value)}
                    className={cn('mt-1.5 h-9', errors.indicatorName && 'border-[#ef4444] ring-2 ring-[#fef2f2]')}
                  />
                  {errors.indicatorName && (
                    <p className="text-[12px] text-[#ef4444] mt-1">{errors.indicatorName}</p>
                  )}
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Label className="text-[14px] font-medium text-[#2d3748]">指标编码</Label>
                  <Input
                    value={formData.indicatorCode}
                    disabled
                    className="mt-1.5 h-9 bg-[#f1f3f6] text-[#9ba4b3] cursor-not-allowed"
                  />
                </motion.div>

                <motion.div variants={staggerItem} className="col-span-2">
                  <Label className="text-[14px] font-medium text-[#2d3748]">
                    对象类型属性 <span className="text-[#ef4444]">*</span>
                  </Label>
                  <div className={cn('mt-1.5 rounded-lg border border-[#e8ecf1] p-3', (errors.level1 || errors.level2 || errors.granularity) && 'border-[#ef4444] ring-2 ring-[#fef2f2]')}>
                    <ObjectTypePropertyPanel
                      fieldKeys={['level1', 'level2', 'granularity']}
                      values={{
                        level1: formData.level1,
                        level2: formData.level2,
                        granularity: formData.granularity,
                      }}
                      onChange={(fieldKey, value) => updateField(fieldKey as keyof FormData, value as FormData[keyof FormData])}
                      errors={{
                        level1: errors.level1 || '',
                        level2: errors.level2 || '',
                        granularity: errors.granularity || '',
                      }}
                    />
                  </div>
                  {(errors.level1 || errors.level2 || errors.granularity) && (
                    <p className="text-[12px] text-[#ef4444] mt-1">
                      {errors.level1 || errors.level2 || errors.granularity}
                    </p>
                  )}
                </motion.div>

                {/* 业务口径 - 跨两列 */}
                <motion.div variants={staggerItem} className="col-span-2">
                  <Label className="text-[14px] font-medium text-[#2d3748]">业务口径</Label>
                  <Textarea
                    value={formData.businessCaliber}
                    onChange={(e) => updateField('businessCaliber', e.target.value)}
                    placeholder="5G用户渗透率 = 5G用户数 / 移动用户总数 × 100%"
                    className="mt-1.5 min-h-[80px] font-mono text-[13px]"
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Label className="text-[14px] font-medium text-[#2d3748]">计算方式</Label>
                  <Select
                    value={formData.calcMethod}
                    onValueChange={(v) => updateField('calcMethod', v)}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请选择计算方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {calcMethodOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Label className="text-[14px] font-medium text-[#2d3748]">计量单位</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) => updateField('unit', v)}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请选择计量单位" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Label className="text-[14px] font-medium text-[#2d3748]">更新频率</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(v) => updateField('frequency', v)}
                  >
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请选择更新频率" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 4: 详细描述（可选） ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#e8ecf1] flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-[#2d3748]">详细描述（可选）</h3>
                <StatusBadge text="可选" type="default" />
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">适用范围</Label>
                  <Textarea
                    value={formData.descriptionScope}
                    onChange={(e) => updateField('descriptionScope', e.target.value)}
                    placeholder="描述该指标适用的业务范围、部门、产品线..."
                    className="mt-1.5 min-h-[80px]"
                  />
                  <p className="text-[12px] text-[#9ba4b3] mt-1">
                    示例：适用于全网5G业务发展监控，涵盖个人用户及家庭用户
                  </p>
                </div>
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">核心特征</Label>
                  <Textarea
                    value={formData.descriptionFeatures}
                    onChange={(e) => updateField('descriptionFeatures', e.target.value)}
                    placeholder="描述该指标的核心特征、关键影响因素..."
                    className="mt-1.5 min-h-[80px]"
                  />
                  <p className="text-[12px] text-[#9ba4b3] mt-1">
                    示例：反映5G网络用户渗透程度，受终端价格、网络覆盖、套餐资费等因素影响
                  </p>
                </div>
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">业务含义</Label>
                  <Textarea
                    value={formData.descriptionMeaning}
                    onChange={(e) => updateField('descriptionMeaning', e.target.value)}
                    placeholder="描述该指标的业务含义、决策参考价值..."
                    className="mt-1.5 min-h-[80px]"
                  />
                  <p className="text-[12px] text-[#9ba4b3] mt-1">
                    示例：衡量5G业务普及程度的核心指标，用于评估市场发展策略效果
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 4.5: 数据源映射（新增） ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#e8ecf1]">
                <h3 className="text-[16px] font-medium text-[#2d3748]">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#eef4ff] text-[#3478f6] text-[12px] font-semibold mr-2">2.5</span>
                  数据源映射
                </h3>
                <p className="text-[13px] text-[#6b7789] mt-1">
                  绑定真实数据库表，后续自动同步数据，无需手动导入
                </p>
              </div>
              <div className="p-5 grid grid-cols-2 gap-6">
                {/* 数据源选择 */}
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">数据源选择</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请选择数据源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql_prod">MySQL 生产库</SelectItem>
                      <SelectItem value="oracle_ana">Oracle 分析库</SelectItem>
                      <SelectItem value="hive_dw">Hive 数仓</SelectItem>
                      <SelectItem value="clickhouse_rt">ClickHouse 实时库</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[12px] text-[#9ba4b3] mt-1">
                    还没有已配置的数据源？请先到平台维护中新增数据源
                  </p>
                </div>
                {/* 数据表选择 */}
                <div>
                  <Label className="text-[14px] font-medium text-[#2d3748]">数据表选择</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5 h-9">
                      <SelectValue placeholder="请先选择数据源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dwd_indicator_daily">dwd_indicator_daily</SelectItem>
                      <SelectItem value="dws_5g_user_monthly">dws_5g_user_monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[12px] text-[#9ba4b3] mt-1">
                    完成数据源选择后，将基于当前数据库读取真实表结构
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 5: 度量映射（并列双区） ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#e8ecf1] flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-[#2d3748]">度量映射（可选）</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#9ba4b3]">定义指标计算方式</span>
                  <StatusBadge text="可选" type="default" />
                </div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-6">
                {/* 左卡片：指标间计算关系 */}
                <div className="border border-[#e8ecf1] rounded-lg p-4">
                  <h4 className="text-[15px] font-medium text-[#2d3748] mb-1">指标间计算关系（可选填）</h4>
                  <p className="text-[12px] text-[#9ba4b3] mb-4">
                    该指标通过图谱中已有指标计算得出
                  </p>
                  <div>
                    <Label className="text-[14px] font-medium text-[#2d3748]">聚合函数</Label>
                    <Select
                      value={formData.aggregateFunction}
                      onValueChange={(v) => updateField('aggregateFunction', v)}
                    >
                      <SelectTrigger className="mt-1.5 h-9">
                        <SelectValue placeholder="请选择聚合函数" />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregateOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <Label className="text-[14px] font-medium text-[#2d3748] flex items-center gap-1">
                      自定义表达式
                      <span className="relative group">
                        <HelpCircle size={14} className="text-[#9ba4b3] cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[#1a202c] text-white text-[12px] rounded-md z-50">
                          支持 SQL 风格表达式，可引用其他指标
                        </span>
                      </span>
                    </Label>
                    <Input
                      value={formData.customExpression}
                      onChange={(e) => updateField('customExpression', e.target.value)}
                      placeholder="如: SUM(5G用户数) / SUM(移动用户总数) * 100"
                      className="mt-1.5 h-9 font-mono text-[13px]"
                    />
                  </div>
                </div>

                {/* 右卡片：大数据溯源 */}
                <div className="border border-[#e8ecf1] rounded-lg p-4">
                  <h4 className="text-[15px] font-medium text-[#2d3748] mb-1">大数据溯源（可选填）</h4>
                  <p className="text-[12px] text-[#9ba4b3] mb-4">
                    该指标独立存在，直接从大数据表通过 SQL 查询得出
                  </p>
                  <div>
                    <Label className="text-[14px] font-medium text-[#2d3748]">数据源表名</Label>
                    <Input
                      placeholder="如: dwd_5g_user_indicator"
                      className="mt-1.5 h-9 font-mono text-[13px]"
                    />
                    <p className="text-[12px] text-[#9ba4b3] mt-1">示例: dwd_5g_user_indicator</p>
                  </div>
                  <div className="mt-4">
                    <Label className="text-[14px] font-medium text-[#2d3748]">SQL 语句</Label>
                    <Textarea
                      placeholder="SELECT COUNT(DISTINCT user_id) / total_users AS penetration_rate FROM dwd_5g_user WHERE month = '2024-05'"
                      className="mt-1.5 font-mono text-[13px] min-h-[100px]"
                    />
                    <p className="text-[12px] text-[#9ba4b3] mt-1">为 LLM 提供指标溯源信息，帮助 AI 理解指标来源</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 6: 维度映射（可选） ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-4 border-b border-[#e8ecf1] flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-[#2d3748]">维度映射（可选）</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#9ba4b3]">定义按什么维度拆分指标</span>
                  <StatusBadge text="可选" type="default" />
                </div>
              </div>
              <div className="p-5">
                <Label className="text-[14px] font-medium text-[#2d3748]">维度字段多选</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dimensionOptions.map((dim) => {
                    const isSelected = (formData.dimensions || []).includes(dim);
                    return (
                      <motion.button
                        key={dim}
                        onClick={() => handleDimensionToggle(dim)}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-[13px] font-medium border transition-colors',
                          isSelected
                            ? 'bg-[#eef4ff] border-[#3478f6] text-[#3478f6]'
                            : 'bg-white border-[#dde1e8] text-[#4a5568] hover:border-[#9ba4b3]'
                        )}
                      >
                        {isSelected && <CheckCircle size={12} className="inline mr-1" />}
                        {dim}
                      </motion.button>
                    );
                  })}
                </div>

                {/* 已选维度展示 */}
                <AnimatePresence>
                  {(formData.dimensions || []).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4"
                    >
                      <Label className="text-[13px] text-[#6b7789]">已选维度</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(formData.dimensions || []).map((dim) => (
                          <motion.span
                            key={dim}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#eef4ff] text-[#3478f6] text-[12px] font-medium rounded"
                          >
                            {dim}
                            <button
                              onClick={() => handleDimensionToggle(dim)}
                              className="ml-0.5 hover:text-[#dc2626] transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[12px] text-[#9ba4b3] mt-4">
                  支持多维度组合分析，后续可扩展引用知识库中的业务维度定义
                </p>

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
        )}
      </AnimatePresence>

      {/* ── Section 7: 底部操作栏 ── */}
      <AnimatePresence>
        {formData.indicatorCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
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
                onClick={handleSubmit}
              >
                提交 NOC 审核
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 提交确认弹窗 ── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px]">确认提交审核？</DialogTitle>
            <DialogDescription className="text-[14px] text-[#6b7789] mt-2">
              提交后，NOC 将对该指标进行审核。审核期间不可修改。是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              取消
            </Button>
            <Button
              className="bg-[#3478f6] hover:bg-[#1d5ee0] text-white"
              onClick={handleConfirmSubmit}
            >
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
