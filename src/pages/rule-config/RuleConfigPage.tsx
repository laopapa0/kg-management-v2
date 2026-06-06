import { useState, useCallback, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  X,
  AlertTriangle,
  BarChart3,
  Activity,
  TrendingUp,
  Code,
  CheckCircle2,
  Info,
  Trash2,
  Lightbulb,
  BookOpen,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  MousePointerClick,
  Layers,
  ChevronUp,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/SearchInput';
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
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

/* ─── Types ─── */
interface ConfiguredRule {
  id: string;
  name: string;
  type: string;
  categoryId: string;
  subCategoryId: string;
  templateId: string;
  indicators: string[];
  params: Record<string, unknown>;
  status: 'active' | 'draft';
  description: string;
  docs: KnowledgeDoc[];
  businessCalendar: string;
}

interface KnowledgeDoc {
  id: string;
  title: string;
  category: string;
  summary: string;
}

interface RuleParamDef {
  name: string;
  type: string;
  default: string;
}

/* ─── Static Data ─── */
const ruleCategories = [
  { id: 'abnormal', name: '异常规则', enabled: true, icon: 'ShieldAlert' },
  { id: 'quality', name: '质量规则', enabled: false, tooltip: '功能开发中', icon: 'ShieldCheck' },
  { id: 'compliance', name: '合规规则', enabled: false, tooltip: '功能开发中', icon: 'Settings2' },
] as const;

const ruleSubCategories: Record<string, Array<{ id: string; name: string; desc: string }>> = {
  abnormal: [
    { id: 'indicator_alert', name: '指标预警', desc: '传统阈值类规则，如上下限、TOPN 等' },
    { id: 'anomaly_algo', name: '异常算法', desc: '数据科学算法，如波动检测、相关性分析等' },
  ],
};

const ruleTemplatesDef: Record<string, Array<{ id: string; name: string; params: RuleParamDef[] }>> = {
  indicator_alert: [
    {
      id: 'threshold',
      name: '阈值上下限',
      params: [
        { name: 'upperLimit', type: 'number', default: '95' },
        { name: 'lowerLimit', type: 'number', default: '20' },
        { name: 'duration', type: 'number', default: '3' },
        { name: 'severity', type: 'select', default: '严重' },
      ],
    },
    {
      id: 'topn',
      name: 'TOPN 监控',
      params: [
        { name: 'nValue', type: 'number', default: '10' },
        { name: 'sortOrder', type: 'select', default: '降序' },
        { name: 'period', type: 'select', default: '日' },
      ],
    },
  ],
  anomaly_algo: [
    {
      id: 'fluctuation',
      name: '波动算法',
      params: [
        { name: 'windowSize', type: 'number', default: '7' },
        { name: 'threshold', type: 'number', default: '5' },
        { name: 'baseline', type: 'select', default: '均值' },
      ],
    },
    {
      id: 'pearson',
      name: '皮尔逊算法',
      params: [
        { name: 'correlationThreshold', type: 'number', default: '0.8' },
        { name: 'sampleWindow', type: 'number', default: '30' },
      ],
    },
  ],
};

const severityOptions = ['紧急', '严重', '重要', '一般', '提示'];
const sortOrderOptions = ['降序', '升序'];
const periodOptions = ['实时', '小时', '日', '周', '月'];
const baselineOptions = ['均值', '中位数', '移动平均', '指数平滑'];

/* ─── Tree Data Types & Hook ─── */
interface RuleTreeNode {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'template';
  children?: RuleTreeNode[];
}

function useRuleTree(rules: ConfiguredRule[]): RuleTreeNode[] {
  return useMemo(() => {
    return ruleCategories
      .filter((c) => c.enabled)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        type: 'category' as const,
        children: (ruleSubCategories[cat.id] || []).map((sub) => ({
          id: sub.id,
          name: sub.name,
          type: 'subcategory' as const,
          children: (ruleTemplatesDef[sub.id] || []).map((tmpl) => ({
            id: tmpl.id,
            name: tmpl.name,
            type: 'template' as const,
            ruleCount: rules.filter(
              (r) => r.categoryId === cat.id && r.subCategoryId === sub.id && r.templateId === tmpl.id
            ).length,
          })),
        })),
      }));
  }, [rules]);
}

interface TreeNodeProps {
  node: RuleTreeNode;
  selectedTemplateId: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectTemplate: (templateId: string) => void;
}

function RuleTreeNode({ node, selectedTemplateId, expandedIds, onToggleExpand, onSelectTemplate }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = node.type === 'template' && node.id === selectedTemplateId;

  return (
    <div>
      <div
        onClick={() => {
          if (node.type === 'template') {
            onSelectTemplate(node.id);
          } else if (hasChildren) {
            onToggleExpand(node.id);
          }
        }}
        className={cn(
          'flex items-center h-9 px-2 rounded-md cursor-pointer transition-colors duration-100',
          isSelected ? 'bg-[#eef4ff] text-[#3478f6] relative' : 'hover:bg-[#f8f9fb] text-[#4a5568]',
          node.type === 'subcategory' && 'pl-4',
          node.type === 'template' && 'pl-6'
        )}
      >
        {isSelected && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#3478f6] rounded-r-full" />
        )}
        {hasChildren && node.type !== 'template' ? (
          <span
            className="mr-1 text-[#9ba4b3]"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span className="w-[14px] mr-1" />
        )}
        <span className={cn('text-[13px] truncate', isSelected && 'font-medium')}>{node.name}</span>
        {node.type === 'template' && (
          <span className="ml-auto text-[11px] text-[#9ba4b3] bg-[#f1f3f6] px-1.5 py-0.5 rounded">
            {(node as any).ruleCount ?? 0} 条
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div style={{ paddingLeft: '12px' }}>
          {node.children!.map((child) => (
            <RuleTreeNode
              key={child.id}
              node={child}
              selectedTemplateId={selectedTemplateId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectTemplate={onSelectTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const knowledgeDocs: KnowledgeDoc[] = [
  { id: 'DOC-001', title: '5G业务发展规范 v2.3', category: '业务规范', summary: '定义5G业务发展的各项指标标准和口径' },
  { id: 'DOC-002', title: '收入指标计算口径说明', category: '口径说明', summary: '详细说明各类收入指标的计算方法和数据来源' },
  { id: 'DOC-003', title: '客户满意度评价标准', category: '评价标准', summary: '客户满意度指标的评价维度和打分标准' },
  { id: 'DOC-004', title: '网络质量监控指南', category: '监控指南', summary: '网络质量相关指标的监控方法和阈值建议' },
  { id: 'DOC-005', title: '宽带业务发展规范 v1.8', category: '业务规范', summary: '宽带业务发展的各项指标标准和口径说明' },
];

const availableIndicators = [
  { id: 'IND-0056', name: '5G用户渗透率', code: 'IND-2024-0056', level1: '发展', level2: '用户发展', unit: '百分比' },
  { id: 'IND-0057', name: '5G流量占比', code: 'IND-2024-0057', level1: '发展', level2: '用户留存', unit: '百分比' },
  { id: 'IND-0102', name: '宽带用户数', code: 'IND-2024-0102', level1: '发展', level2: '用户触达', unit: '户' },
  { id: 'IND-0089', name: '客户满意度', code: 'IND-2024-0089', level1: '服务', level2: '客户满意度', unit: '分' },
  { id: 'IND-0076', name: '全网约收入', code: 'IND-2024-0076', level1: '经营', level2: '收入', unit: '元' },
  { id: 'IND-0034', name: '网络故障率', code: 'IND-2024-0034', level1: '交付', level2: '网络质量', unit: '百分比' },
  { id: 'IND-0201', name: '移动业务收入', code: 'IND-2024-0201', level1: '经营', level2: '收入', unit: '元' },
  { id: 'IND-0151', name: '用户ARPU', code: 'IND-2024-0151', level1: '经营', level2: '收入分析', unit: '元' },
  { id: 'IND-0401', name: '宽带续费率', code: 'IND-2024-0401', level1: '发展', level2: '用户留存', unit: '百分比' },
  { id: 'IND-0402', name: '政企收入', code: 'IND-2024-0402', level1: '经营', level2: '收入', unit: '元' },
];

const mockConfiguredRules: ConfiguredRule[] = [
  {
    id: 'R001',
    name: '5G用户渗透率_异常算法_波动算法',
    type: '波动算法',
    categoryId: 'abnormal',
    subCategoryId: 'anomaly_algo',
    templateId: 'fluctuation',
    indicators: ['5G用户渗透率'],
    params: { windowSize: '7', threshold: '5', baseline: '均值' },
    status: 'active',
    description: '监控5G用户渗透率的波动情况，窗口7天',
    docs: [],
    businessCalendar: 'workday',
  },
  {
    id: 'R002',
    name: '5G用户渗透率_指标预警_阈值上下限',
    type: '阈值上下限',
    categoryId: 'abnormal',
    subCategoryId: 'indicator_alert',
    templateId: 'threshold',
    indicators: ['5G用户渗透率'],
    params: { upperLimit: '95', lowerLimit: '20', duration: '3', severity: '严重' },
    status: 'active',
    description: '5G用户渗透率阈值监控，下限20%，上限95%',
    docs: [knowledgeDocs[0]],
    businessCalendar: 'workday',
  },
  {
    id: 'R003',
    name: '宽带续费率_指标预警_阈值上下限',
    type: '阈值上下限',
    categoryId: 'abnormal',
    subCategoryId: 'indicator_alert',
    templateId: 'threshold',
    indicators: ['宽带续费率'],
    params: { upperLimit: '90', lowerLimit: '30', duration: '5', severity: '重要' },
    status: 'draft',
    description: '宽带续费率阈值监控',
    docs: [],
    businessCalendar: 'workday',
  },
];

/* ─── Category Icon Helper ─── */
function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const props = { size: 20, className };
  switch (name) {
    case 'ShieldAlert':
      return <ShieldAlert {...props} />;
    case 'ShieldCheck':
      return <ShieldCheck {...props} />;
    case 'Settings2':
      return <Settings2 {...props} />;
    default:
      return <Layers {...props} />;
  }
}

/* ─── Template icon map (for param section header) ─── */
function getTemplateIcon(id: string) {
  switch (id) {
    case 'threshold':
      return <AlertTriangle size={18} className="text-[#ef4444]" />;
    case 'topn':
      return <BarChart3 size={18} className="text-[#3478f6]" />;
    case 'fluctuation':
      return <TrendingUp size={18} className="text-[#10b981]" />;
    case 'pearson':
      return <Activity size={18} className="text-[#f59e0b]" />;
    default:
      return <Code size={18} className="text-[#4a5568]" />;
  }
}

function getTemplateBg(id: string) {
  switch (id) {
    case 'threshold':
      return 'bg-[#fef2f2]';
    case 'topn':
      return 'bg-[#eef4ff]';
    case 'fluctuation':
      return 'bg-[#ecfdf5]';
    case 'pearson':
      return 'bg-[#fffbeb]';
    default:
      return 'bg-[#f1f3f6]';
  }
}

/* ─── Select options helper ─── */
function getSelectOptions(paramName: string): string[] {
  if (paramName === 'severity') return severityOptions;
  if (paramName === 'sortOrder') return sortOrderOptions;
  if (paramName === 'period') return periodOptions;
  if (paramName === 'baseline') return baselineOptions;
  return [];
}

/* ─── Param label helper ─── */
function getParamLabel(paramName: string): string {
  const labels: Record<string, string> = {
    upperLimit: '上限值',
    lowerLimit: '下限值',
    duration: '持续次数',
    severity: '告警级别',
    nValue: '取前 N 值',
    sortOrder: '排序方向',
    period: '统计周期',
    windowSize: '窗口大小',
    threshold: '阈值',
    baseline: '基线类型',
    correlationThreshold: '相关系数阈值',
    sampleWindow: '样本窗口',
  };
  return labels[paramName] || paramName;
}

/* ─── Get template name by id ─── */
function getTemplateName(templateId: string): string {
  for (const subCat of Object.values(ruleTemplatesDef)) {
    const tmpl = subCat.find((t) => t.id === templateId);
    if (tmpl) return tmpl.name;
  }
  return templateId;
}

/* ═════════════════════════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════════════════════════ */
export default function RuleConfigPage() {
  const navigate = useNavigate();

  /* ─── State ─── */
  const [rules, setRules] = useState<ConfiguredRule[]>(mockConfiguredRules);

  // Template filter (empty = show all indicators)
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Tree expansion state
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['abnormal', 'indicator_alert', 'anomaly_algo'])
  );
  const ruleTree = useRuleTree(rules);

  // Search states
  const [treeSearch, setTreeSearch] = useState('');
  const [indicatorSearch, setIndicatorSearch] = useState('');

  // Expanded indicator rows
  const [expandedIndicatorIds, setExpandedIndicatorIds] = useState<Set<string>>(new Set());

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingDialogRule, setEditingDialogRule] = useState<ConfiguredRule | null>(null);

  // Dialog cascade state (independent from page level)
  const [dialogCategoryId, setDialogCategoryId] = useState('');
  const [dialogSubCategoryId, setDialogSubCategoryId] = useState('');
  const [dialogTemplateId, setDialogTemplateId] = useState('');

  // Dialog form fields
  const [dialogRuleName, setDialogRuleName] = useState('');
  const [dialogIndicators, setDialogIndicators] = useState<string[]>([]);
  const [dialogParams, setDialogParams] = useState<Record<string, unknown>>({});
  const [dialogDescription, setDialogDescription] = useState('');
  const [dialogDocs, setDialogDocs] = useState<KnowledgeDoc[]>([]);
  const [dialogBusinessCalendar, setDialogBusinessCalendar] = useState('workday');

  // Doc search
  const [docSearch, setDocSearch] = useState('');
  const [showDocDropdown, setShowDocDropdown] = useState(false);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState('');

  // Publish dialog
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  /* ─── Computed ─── */
  const filteredIndicators = useMemo(() => {
    let data = [...availableIndicators];

    // Filter by selected template
    if (selectedTemplateId) {
      data = data.filter((ind) =>
        rules.some(
          (r) => r.templateId === selectedTemplateId && r.indicators.includes(ind.name)
        )
      );
    }

    // Filter by search
    if (indicatorSearch.trim()) {
      data = data.filter((ind) =>
        ind.name.toLowerCase().includes(indicatorSearch.toLowerCase())
      );
    }

    return data;
  }, [rules, selectedTemplateId, indicatorSearch]);

  const filteredTree = useMemo(() => {
    if (!treeSearch.trim()) return ruleTree;
    const term = treeSearch.toLowerCase();
    return ruleTree
      .map((cat) => {
        const matchedChildren = cat.children?.filter(
          (sub) =>
            sub.name.toLowerCase().includes(term) ||
            sub.children?.some((tmpl) => tmpl.name.toLowerCase().includes(term))
        );
        if (cat.name.toLowerCase().includes(term)) return cat;
        if (matchedChildren && matchedChildren.length > 0) {
          return { ...cat, children: matchedChildren };
        }
        return null;
      })
      .filter(Boolean) as RuleTreeNode[];
  }, [ruleTree, treeSearch]);

  const selectedTemplateName = selectedTemplateId
    ? getTemplateName(selectedTemplateId)
    : '';

  const selectedTemplatePath = useMemo(() => {
    if (!selectedTemplateId) return [];
    for (const cat of ruleCategories) {
      const subs = ruleSubCategories[cat.id];
      if (!subs) continue;
      for (const sub of subs) {
        const tmpls = ruleTemplatesDef[sub.id];
        if (!tmpls) continue;
        if (tmpls.some((t) => t.id === selectedTemplateId)) {
          return [cat.name, sub.name, getTemplateName(selectedTemplateId)];
        }
      }
    }
    return [];
  }, [selectedTemplateId]);

  /* ─── Helpers ─── */
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleIndicatorExpand = useCallback((indicatorId: string) => {
    setExpandedIndicatorIds((prev) => {
      const next = new Set(prev);
      if (next.has(indicatorId)) next.delete(indicatorId);
      else next.add(indicatorId);
      return next;
    });
  }, []);

  const handleSelectTemplate = useCallback((tmplId: string) => {
    setSelectedTemplateId((prev) => (prev === tmplId ? '' : tmplId));
    setExpandedIndicatorIds(new Set());
  }, []);

  const getIndicatorRules = useCallback(
    (indicatorName: string) => {
      if (selectedTemplateId) {
        return rules.filter(
          (r) => r.templateId === selectedTemplateId && r.indicators.includes(indicatorName)
        );
      }
      return rules.filter((r) => r.indicators.includes(indicatorName));
    },
    [rules, selectedTemplateId]
  );

  const getIndicatorStatus = useCallback(
    (indicatorName: string): { text: string; className: string } => {
      const indRules = rules.filter((r) => r.indicators.includes(indicatorName));
      if (indRules.length === 0) {
        return { text: '未配置', className: 'bg-[#f1f3f6] text-[#9ba4b3]' };
      }
      if (indRules.some((r) => r.status === 'active')) {
        return { text: '启用', className: 'bg-[#ecfdf5] text-[#059669]' };
      }
      return { text: '草稿', className: 'bg-[#fffbeb] text-[#d97706]' };
    },
    [rules]
  );

  const getParamSummary = (params: Record<string, unknown>): string => {
    return Object.entries(params)
      .map(([k, v]) => `${getParamLabel(k)}: ${v}`)
      .join(' / ');
  };

  /* ─── Dialog helpers ─── */
  const resetDialog = useCallback(() => {
    setDialogCategoryId('');
    setDialogSubCategoryId('');
    setDialogTemplateId('');
    setDialogRuleName('');
    setDialogIndicators([]);
    setDialogParams({});
    setDialogDescription('');
    setDialogDocs([]);
    setDialogBusinessCalendar('workday');
    setDocSearch('');
    setShowDocDropdown(false);
    setEditingDialogRule(null);
  }, []);

  const openAddDialog = useCallback(() => {
    resetDialog();
    // If a template is selected on the page, default to it in the dialog
    if (selectedTemplateId) {
      for (const cat of ruleCategories) {
        const subs = ruleSubCategories[cat.id];
        if (!subs) continue;
        for (const sub of subs) {
          const tmpls = ruleTemplatesDef[sub.id];
          if (!tmpls) continue;
          if (tmpls.some((t) => t.id === selectedTemplateId)) {
            setDialogCategoryId(cat.id);
            setDialogSubCategoryId(sub.id);
            setDialogTemplateId(selectedTemplateId);
            const tmpl = tmpls.find((t) => t.id === selectedTemplateId);
            if (tmpl) {
              const defaults: Record<string, unknown> = {};
              tmpl.params.forEach((p) => (defaults[p.name] = p.default));
              setDialogParams(defaults);
              setDialogRuleName(tmpl.name);
            }
            break;
          }
        }
      }
    } else {
      // Default to first enabled category
      const defaultCat = ruleCategories.find((c) => c.enabled);
      if (defaultCat) {
        setDialogCategoryId(defaultCat.id);
        const subs = ruleSubCategories[defaultCat.id];
        if (subs && subs.length > 0) {
          setDialogSubCategoryId(subs[0].id);
          const tmpls = ruleTemplatesDef[subs[0].id];
          if (tmpls && tmpls.length > 0) {
            setDialogTemplateId(tmpls[0].id);
            const defaults: Record<string, unknown> = {};
            tmpls[0].params.forEach((p) => (defaults[p.name] = p.default));
            setDialogParams(defaults);
            setDialogRuleName(tmpls[0].name);
          }
        }
      }
    }
    setShowDialog(true);
  }, [resetDialog, selectedTemplateId]);

  const openEditDialog = useCallback(
    (rule: ConfiguredRule) => {
      resetDialog();
      setEditingDialogRule(rule);
      setDialogCategoryId(rule.categoryId);
      setDialogSubCategoryId(rule.subCategoryId);
      setDialogTemplateId(rule.templateId);
      setDialogRuleName(rule.name);
      setDialogIndicators(rule.indicators);
      setDialogParams(rule.params);
      setDialogDescription(rule.description);
      setDialogDocs(rule.docs);
      setDialogBusinessCalendar(rule.businessCalendar);
      setShowDialog(true);
    },
    [resetDialog]
  );

  const handleSaveDialog = useCallback(() => {
    if (!dialogRuleName.trim()) {
      toast.error('请输入规则名称');
      return;
    }
    if (dialogIndicators.length === 0) {
      toast.error('请至少选择一个关联指标');
      return;
    }
    if (!dialogTemplateId) {
      toast.error('请选择规则模板');
      return;
    }

    if (editingDialogRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingDialogRule.id
            ? {
                ...r,
                name: dialogRuleName,
                type: getTemplateName(dialogTemplateId),
                categoryId: dialogCategoryId,
                subCategoryId: dialogSubCategoryId,
                templateId: dialogTemplateId,
                indicators: dialogIndicators,
                params: dialogParams,
                description: dialogDescription,
                docs: dialogDocs,
                businessCalendar: dialogBusinessCalendar,
              }
            : r
        )
      );
      toast.success('规则已更新');
    } else {
      const newRule: ConfiguredRule = {
        id: `R${String(rules.length + 1).padStart(3, '0')}`,
        name: dialogRuleName,
        type: getTemplateName(dialogTemplateId),
        categoryId: dialogCategoryId,
        subCategoryId: dialogSubCategoryId,
        templateId: dialogTemplateId,
        indicators: dialogIndicators,
        params: dialogParams,
        status: 'active',
        description: dialogDescription,
        docs: dialogDocs,
        businessCalendar: dialogBusinessCalendar,
      };
      setRules((prev) => [...prev, newRule]);
      toast.success('规则已添加');
    }

    setShowDialog(false);
    resetDialog();
  }, [
    dialogRuleName,
    dialogIndicators,
    dialogTemplateId,
    editingDialogRule,
    dialogCategoryId,
    dialogSubCategoryId,
    dialogParams,
    dialogDescription,
    dialogDocs,
    dialogBusinessCalendar,
    rules.length,
    resetDialog,
  ]);

  const handleDeleteRule = useCallback(() => {
    setRules((prev) => prev.filter((r) => r.id !== deleteTargetId));
    setShowDeleteDialog(false);
    setDeleteTargetId('');
    toast.success('规则已删除');
  }, [deleteTargetId]);

  const handlePublish = useCallback(() => {
    setShowPublishDialog(false);
    toast.success(`已成功发布 ${rules.length} 条规则到图谱`);
  }, [rules.length]);

  /* ─── Dialog cascade handlers ─── */
  const handleDialogCategoryChange = useCallback((catId: string) => {
    setDialogCategoryId(catId);
    setDialogSubCategoryId('');
    setDialogTemplateId('');
    setDialogParams({});
    const subs = ruleSubCategories[catId];
    if (subs && subs.length > 0) {
      setDialogSubCategoryId(subs[0].id);
      const tmpls = ruleTemplatesDef[subs[0].id];
      if (tmpls && tmpls.length > 0) {
        setDialogTemplateId(tmpls[0].id);
        const defaults: Record<string, unknown> = {};
        tmpls[0].params.forEach((p) => (defaults[p.name] = p.default));
        setDialogParams(defaults);
        setDialogRuleName(tmpls[0].name);
      }
    }
  }, []);

  const handleDialogSubCategoryChange = useCallback((subId: string) => {
    setDialogSubCategoryId(subId);
    setDialogTemplateId('');
    setDialogParams({});
    const tmpls = ruleTemplatesDef[subId];
    if (tmpls && tmpls.length > 0) {
      setDialogTemplateId(tmpls[0].id);
      const defaults: Record<string, unknown> = {};
      tmpls[0].params.forEach((p) => (defaults[p.name] = p.default));
      setDialogParams(defaults);
      setDialogRuleName(tmpls[0].name);
    }
  }, []);

  const handleDialogTemplateChange = useCallback((tmplId: string) => {
    setDialogTemplateId(tmplId);
    const tmpl = ruleTemplatesDef[dialogSubCategoryId]?.find((t) => t.id === tmplId);
    if (tmpl) {
      const defaults: Record<string, unknown> = {};
      tmpl.params.forEach((p) => (defaults[p.name] = p.default));
      setDialogParams(defaults);
      setDialogRuleName(tmpl.name);
    }
  }, [dialogSubCategoryId]);

  /* ─── Doc helpers ─── */
  const filteredDocs = useMemo(
    () =>
      knowledgeDocs.filter(
        (d) =>
          d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
          d.category.includes(docSearch)
      ),
    [docSearch]
  );

  const addDoc = (doc: KnowledgeDoc) => {
    if (!dialogDocs.find((d) => d.id === doc.id)) {
      setDialogDocs((prev) => [...prev, doc]);
    }
    setDocSearch('');
    setShowDocDropdown(false);
  };

  const removeDoc = (docId: string) => {
    setDialogDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  /* ═════════════════════════════════════════════════════════════════
     JSX
     ═════════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-64px)]"
    >
      {/* ─── Page Header ─── */}
      <div className="shrink-0 px-6 pt-5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center h-7 px-3 rounded-md border border-[#dde1e8] bg-white text-[13px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors mb-3"
            >
              <ArrowLeft size={14} className="mr-1" />
              返回
            </button>
            <h1 className="text-[22px] font-semibold text-[#1a202c] leading-tight tracking-tight">
              配置业务规则
            </h1>
            <p className="text-[13px] text-[#6b7789] mt-1">
              维护业务规则与指标的关联关系，支持多种规则模板配置
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Content: Left + Right ─── */}
      <div className="flex-1 flex overflow-hidden px-6 pb-20 gap-5 min-h-0">
        {/* ═══ Left Panel: Rule Tree ═══ */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-[320px] shrink-0 bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden"
        >
          {/* Left Header */}
          <div className="shrink-0 px-4 py-3.5 border-b border-[#e8ecf1] flex justify-between items-center">
            <h2 className="text-[15px] font-semibold text-[#2d3748]">规则目录</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#f1f3f6] text-[#4a5568]">
              {rules.length} 条
            </span>
          </div>

          {/* Tree Search */}
          <div className="shrink-0 px-3 py-2.5 border-b border-[#e8ecf1]">
            <SearchInput
              placeholder="搜索分类或模板"
              value={treeSearch}
              onChange={setTreeSearch}
              width="w-full"
            />
          </div>

          {/* Tree (scrollable) */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              {filteredTree.length === 0 && (
                <div className="text-center py-10 text-[13px] text-[#9ba4b3]">
                  无匹配分类
                </div>
              )}
              {filteredTree.map((node) => (
                <RuleTreeNode
                  key={node.id}
                  node={node}
                  selectedTemplateId={selectedTemplateId}
                  expandedIds={expandedIds}
                  onToggleExpand={handleToggleExpand}
                  onSelectTemplate={handleSelectTemplate}
                />
              ))}
            </div>
          </ScrollArea>

          {/* Left: Add Button */}
          <div className="shrink-0 p-3 border-t border-[#e8ecf1] bg-[#fafbfc]">
            <button
              onClick={openAddDialog}
              className="w-full h-9 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-[#c4cad4] text-[13px] text-[#3478f6] font-medium hover:border-[#3478f6] hover:bg-[#eef4ff] transition-all"
            >
              <Plus size={15} />
              添加新规则
            </button>
          </div>
        </motion.div>

        {/* ═══ Right Panel: Indicator Table ═══ */}
        <div className="flex-1 min-w-0 bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
          {/* Right Header: Filter tag + Search + Add */}
          <div className="shrink-0 px-5 py-3.5 border-b border-[#e8ecf1]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-[#2d3748]">
                  指标列表
                </h2>
                {selectedTemplateId && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#eef4ff] text-[12px] text-[#3478f6]">
                    <span>已筛选：{selectedTemplatePath.join(' > ')}</span>
                    <button
                      onClick={() => setSelectedTemplateId('')}
                      className="hover:text-[#1d5ee0]"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={openAddDialog}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#3478f6] text-white text-[13px] font-medium hover:bg-[#1d5ee0] transition-colors"
              >
                <Plus size={14} />
                添加新规则
              </button>
            </div>
            <div className="flex items-center gap-3">
              <SearchInput
                placeholder="搜索指标名称"
                value={indicatorSearch}
                onChange={setIndicatorSearch}
                width="w-64"
              />
              <span className="text-[13px] text-[#6b7789]">
                共 {filteredIndicators.length} 个指标
              </span>
            </div>
          </div>

          {/* Table (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              {filteredIndicators.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-[#f1f3f6] flex items-center justify-center mx-auto mb-3">
                    <Search size={20} className="text-[#c4cad4]" />
                  </div>
                  <p className="text-[14px] text-[#9ba4b3]">
                    {indicatorSearch
                      ? '未找到匹配的指标'
                      : selectedTemplateId
                        ? '该模板下暂无指标配置规则'
                        : '暂无数据'}
                  </p>
                </div>
              ) : (
                <div className="border border-[#e8ecf1] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#f1f3f6]">
                      <tr className="border-b border-[#e8ecf1]">
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568] w-10"></th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">指标名称</th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">指标编码</th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">一级/二级</th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">单位</th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568] w-[80px]">状态</th>
                        <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568] w-[80px]">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIndicators.map((ind) => {
                        const status = getIndicatorStatus(ind.name);
                        const isExpanded = expandedIndicatorIds.has(ind.id);
                        const indRules = getIndicatorRules(ind.name);
                        return (
                          <Fragment key={ind.id}>
                            <tr
                              onClick={() => toggleIndicatorExpand(ind.id)}
                              className="border-b border-[#e8ecf1] hover:bg-[#f8f9fb] cursor-pointer"
                            >
                              <td className="h-11 px-4">
                                {isExpanded ? (
                                  <ChevronUp size={14} className="text-[#9ba4b3]" />
                                ) : (
                                  <ChevronDown size={14} className="text-[#9ba4b3]" />
                                )}
                              </td>
                              <td className="h-11 px-4 text-[13px] text-[#2d3748] font-medium">{ind.name}</td>
                              <td className="h-11 px-4 text-[12px] text-[#9ba4b3] font-mono">{ind.code}</td>
                              <td className="h-11 px-4 text-[12px] text-[#6b7789]">{ind.level1} &gt; {ind.level2}</td>
                              <td className="h-11 px-4 text-[12px] text-[#6b7789]">{ind.unit}</td>
                              <td className="h-11 px-4">
                                <span className={cn('text-[11px] px-2 py-0.5 rounded', status.className)}>
                                  {status.text}
                                </span>
                              </td>
                              <td className="h-11 px-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAddDialog();
                                  }}
                                  className="text-[12px] text-[#3478f6] hover:underline"
                                >
                                  添加规则
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-[#fafbfc]">
                                <td colSpan={7} className="px-4 py-3">
                                  {indRules.length === 0 ? (
                                    <div className="text-center py-6 text-[13px] text-[#9ba4b3]">
                                      <p>暂无规则</p>
                                      <button
                                        onClick={openAddDialog}
                                        className="mt-2 text-[12px] text-[#3478f6] hover:underline"
                                      >
                                        为此指标添加规则
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="border border-[#e8ecf1] rounded-lg overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-[#f1f3f6]">
                                          <tr className="border-b border-[#e8ecf1]">
                                            <th className="h-8 px-3 text-left text-[11px] font-medium text-[#4a5568]">规则名称</th>
                                            {!selectedTemplateId && (
                                              <th className="h-8 px-3 text-left text-[11px] font-medium text-[#4a5568]">模板类型</th>
                                            )}
                                            <th className="h-8 px-3 text-left text-[11px] font-medium text-[#4a5568]">参数</th>
                                            <th className="h-8 px-3 text-left text-[11px] font-medium text-[#4a5568] w-[60px]">状态</th>
                                            <th className="h-8 px-3 text-left text-[11px] font-medium text-[#4a5568] w-[80px]">操作</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {indRules.map((rule) => (
                                            <tr key={rule.id} className="border-b border-[#e8ecf1] last:border-0 hover:bg-white">
                                              <td className="h-9 px-3 text-[12px] text-[#2d3748]">{rule.name}</td>
                                              {!selectedTemplateId && (
                                                <td className="h-9 px-3 text-[11px] text-[#6b7789]">{rule.type}</td>
                                              )}
                                              <td className="h-9 px-3 text-[11px] text-[#6b7789]">{getParamSummary(rule.params)}</td>
                                              <td className="h-9 px-3">
                                                <span className={cn('text-[10px] px-1.5 py-0.5 rounded', rule.status === 'active' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#f1f3f6] text-[#9ba4b3]')}>
                                                  {rule.status === 'active' ? '启用' : '草稿'}
                                                </span>
                                              </td>
                                              <td className="h-9 px-3">
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() => openEditDialog(rule)}
                                                    className="text-[11px] text-[#3478f6] hover:underline"
                                                  >
                                                    编辑
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      setDeleteTargetId(rule.id);
                                                      setShowDeleteDialog(true);
                                                    }}
                                                    className="text-[11px] text-[#ef4444] hover:underline"
                                                  >
                                                    删除
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Fixed Action Bar ─── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf1] px-6 py-3.5 flex justify-between items-center z-40"
        style={{ marginLeft: 240 }}
      >
        <div className="text-[13px] text-[#6b7789]">
          共 <span className="font-medium text-[#2d3748]">{rules.length}</span> 条规则
          {rules.filter((r) => r.status === 'active').length > 0 && (
            <span className="ml-2">
              (<span className="text-[#10b981]">{rules.filter((r) => r.status === 'active').length} 条启用</span>
              {rules.filter((r) => r.status === 'draft').length > 0 &&
                ` / ${rules.filter((r) => r.status === 'draft').length} 条草稿`}
              )
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              toast.success('草稿已保存');
            }}
            className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
          >
            保存草稿
          </button>
          <button
            onClick={() => setShowPublishDialog(true)}
            className="h-10 px-6 rounded-md bg-[#3478f6] text-white text-[14px] font-medium hover:bg-[#1d5ee0] transition-colors shadow-sm"
          >
            确认发布到图谱
          </button>
        </div>
      </motion.div>

      {/* ─── Delete Confirm Dialog ─── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#1a202c]">
              确认删除规则？
            </DialogTitle>
          </DialogHeader>
          <p className="text-[14px] text-[#6b7789] py-2">
            删除后无法恢复，该规则将不再生效。
          </p>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowDeleteDialog(false)}
              className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleDeleteRule}
              className="h-9 px-4 rounded-md bg-[#ef4444] text-white text-[14px] font-medium hover:bg-[#dc2626] transition-colors"
            >
              删除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Publish Confirm Dialog ─── */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#1a202c]">
              确认发布规则？
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-[#f8f9fb] space-y-3">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">指标数</span>
                <span className="font-medium text-[#2d3748]">
                  {new Set(rules.flatMap((r) => r.indicators)).size} 个
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">发布规则数</span>
                <span className="font-medium text-[#2d3748]">{rules.length} 条</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">启用规则</span>
                <span className="font-medium text-[#10b981]">
                  {rules.filter((r) => r.status === 'active').length} 条
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">草稿规则</span>
                <span className="font-medium text-[#f59e0b]">
                  {rules.filter((r) => r.status === 'draft').length} 条
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#6b7789] mt-3">
              发布后将更新图谱中的规则配置
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowPublishDialog(false)}
              className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handlePublish}
              className="h-9 px-4 rounded-md bg-[#3478f6] text-white text-[14px] font-medium hover:bg-[#1d5ee0] transition-colors"
            >
              确认发布
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Rule Dialog ─── */}
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowDialog(false);
            resetDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px]">
              {editingDialogRule ? '编辑规则' : '添加新规则'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Cascade selects */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[13px] text-[#4a5568]">规则大类</Label>
                <select
                  value={dialogCategoryId}
                  onChange={(e) => handleDialogCategoryChange(e.target.value)}
                  className="mt-1.5 h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] bg-white focus:outline-none focus:border-[#5a96ff]"
                >
                  {ruleCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} disabled={!cat.enabled}>
                      {cat.name} {!cat.enabled && '(开发中)'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[13px] text-[#4a5568]">规则子类</Label>
                <select
                  value={dialogSubCategoryId}
                  onChange={(e) => handleDialogSubCategoryChange(e.target.value)}
                  className="mt-1.5 h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] bg-white focus:outline-none focus:border-[#5a96ff]"
                >
                  {(ruleSubCategories[dialogCategoryId] || []).map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-[13px] text-[#4a5568]">规则模板</Label>
                <select
                  value={dialogTemplateId}
                  onChange={(e) => handleDialogTemplateChange(e.target.value)}
                  className="mt-1.5 h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] bg-white focus:outline-none focus:border-[#5a96ff]"
                >
                  {(ruleTemplatesDef[dialogSubCategoryId] || []).map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rule name */}
            <div>
              <Label className="text-[14px] font-medium">规则名称</Label>
              <Input
                value={dialogRuleName}
                onChange={(e) => setDialogRuleName(e.target.value)}
                placeholder="输入规则名称"
                className="mt-1.5 h-9"
              />
            </div>

            {/* Indicator select */}
            <div>
              <Label className="text-[14px] font-medium">
                关联指标 <span className="text-[#ef4444]">*</span>
              </Label>
              <Select
                value={dialogIndicators[0] || ''}
                onValueChange={(v) => setDialogIndicators(v ? [v] : [])}
              >
                <SelectTrigger className="mt-1.5 h-9">
                  <SelectValue placeholder="选择指标" />
                </SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((ind) => (
                    <SelectItem key={ind.id} value={ind.name}>
                      {ind.name} ({ind.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic params */}
            {dialogTemplateId && (
              <div className="border-t border-[#e8ecf1] pt-4">
                <h4 className="text-[14px] font-medium text-[#2d3748] mb-3 flex items-center gap-2">
                  {getTemplateIcon(dialogTemplateId)}
                  <span>规则参数</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {(ruleTemplatesDef[dialogSubCategoryId] || [])
                    .find((t) => t.id === dialogTemplateId)
                    ?.params.map((paramDef) => (
                      <div key={paramDef.name}>
                        <label className="block text-[13px] text-[#4a5568] mb-1">
                          {getParamLabel(paramDef.name)}
                        </label>
                        {paramDef.type === 'select' ? (
                          <select
                            value={String(dialogParams[paramDef.name] ?? paramDef.default)}
                            onChange={(e) =>
                              setDialogParams((prev) => ({
                                ...prev,
                                [paramDef.name]: e.target.value,
                              }))
                            }
                            className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] bg-white focus:outline-none focus:border-[#5a96ff]"
                          >
                            {getSelectOptions(paramDef.name).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="number"
                            step={paramDef.name === 'correlationThreshold' ? '0.1' : '1'}
                            value={String(dialogParams[paramDef.name] ?? paramDef.default)}
                            onChange={(e) =>
                              setDialogParams((prev) => ({
                                ...prev,
                                [paramDef.name]: e.target.value,
                              }))
                            }
                            className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] focus:outline-none focus:border-[#5a96ff]"
                          />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Knowledge docs */}
            <div className="border-t border-[#e8ecf1] pt-4">
              <Label className="text-[14px] font-medium">关联知识文档</Label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => {
                    setDocSearch(e.target.value);
                    setShowDocDropdown(true);
                  }}
                  onFocus={() => setShowDocDropdown(true)}
                  placeholder="搜索知识文档..."
                  className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] focus:outline-none focus:border-[#5a96ff]"
                />
                {showDocDropdown && filteredDocs.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-[#e8ecf1] rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => addDoc(doc)}
                        className="w-full px-3 py-2 text-left hover:bg-[#f8f9fb] text-[13px]"
                      >
                        <div className="font-medium text-[#2d3748]">{doc.title}</div>
                        <div className="text-[11px] text-[#9ba4b3]">{doc.category}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {dialogDocs.length > 0 && (
                <div className="mt-2 space-y-2">
                  {dialogDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-[#f8f9fb] border border-[#e8ecf1]"
                    >
                      <BookOpen size={14} className="text-[#3478f6] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-[#2d3748]">{doc.title}</div>
                        <div className="text-[11px] text-[#9ba4b3]">{doc.summary}</div>
                      </div>
                      <button
                        onClick={() => removeDoc(doc.id)}
                        className="text-[#9ba4b3] hover:text-[#ef4444]"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Business calendar */}
            <div>
              <Label className="text-[14px] font-medium">业务日历</Label>
              <select
                value={dialogBusinessCalendar}
                onChange={(e) => setDialogBusinessCalendar(e.target.value)}
                className="mt-1.5 h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[13px] bg-white focus:outline-none focus:border-[#5a96ff]"
              >
                <option value="workday">工作日</option>
                <option value="holiday">节假日</option>
                <option value="all">全天候</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <Label className="text-[14px] font-medium">规则描述</Label>
              <Textarea
                value={dialogDescription}
                onChange={(e) => setDialogDescription(e.target.value)}
                placeholder="说明规则逻辑、适用条件..."
                className="mt-1.5 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetDialog();
              }}
            >
              取消
            </Button>
            <Button className="bg-[#3478f6] hover:bg-[#1d5ee0] text-white" onClick={handleSaveDialog}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
