import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import {
  Database,
  ClipboardCheck,
  GitBranch,
  Shield,
  Plus,
  CheckCircle,
  AlertTriangle,
  Pencil,
  Tag,
  Network,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  BarChart3,
  FileText,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── 动画变体 ─── */
const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const listStagger: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const listItem: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

/* ─── Mock 数据 ─── */
const statsData = [
  { title: '已接入指标', value: 1247, change: 5.2, icon: Database, iconBg: 'bg-dark-accent-primary/10', iconColor: 'text-dark-accent-primary' },
  { title: '待审核申请', value: 12, change: -2, icon: ClipboardCheck, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-500' },
  { title: '血缘关系数', value: 3856, change: 8.1, icon: GitBranch, iconBg: 'bg-success-500/10', iconColor: 'text-success-500' },
  { title: '活跃规则数', value: 89, change: 3, icon: Shield, iconBg: 'bg-info-500/10', iconColor: 'text-info-500' },
];

const activityData = [
  { type: 'create', text: '业务一部 提交了 新增指标申请', target: '5G用户渗透率', time: '2 分钟前', Icon: Plus, iconColor: 'bg-dark-accent-primary', iconTextColor: 'text-white' },
  { type: 'approve', text: 'NOC 通过了 业务二部 的变更申请', target: '宽带故障率', time: '15 分钟前', Icon: CheckCircle, iconColor: 'bg-success-500', iconTextColor: 'text-white' },
  { type: 'warning', text: '系统检测到 循环依赖警告', target: '收入指标 → 成本指标 → 收入指标', time: '1 小时前', Icon: AlertTriangle, iconColor: 'bg-warning-500', iconTextColor: 'text-white' },
  { type: 'rule', text: '业务三部 发布了新规则', target: '阈值告警: 5G流量波动', time: '2 小时前', Icon: Shield, iconColor: 'bg-[var(--accent-noc)]', iconTextColor: 'text-white' },
  { type: 'update', text: 'NOC 更新了 对象类型定义', target: '新增 "颗粒度" 枚举值', time: '3 小时前', Icon: Pencil, iconColor: 'bg-dark-text-tertiary', iconTextColor: 'text-white' },
  { type: 'tag', text: '业务一部 为 10 个指标 配置了标签', target: '标签: 重点监控', time: '5 小时前', Icon: Tag, iconColor: 'bg-dark-accent-primary', iconTextColor: 'text-white' },
];

const pendingAudits = [
  { type: '新增', dept: '业务一部', name: '5G用户渗透率', time: '刚刚', typeColor: 'bg-dark-accent-primary/10 text-dark-accent-primary' },
  { type: '变更', dept: '业务二部', name: '宽带故障修复时长', time: '30 分钟前', typeColor: 'bg-warning-500/10 text-warning-600' },
  { type: '新增', dept: '业务三部', name: 'FTTR安装成功率', time: '1 小时前', typeColor: 'bg-dark-accent-primary/10 text-dark-accent-primary' },
  { type: '变更', dept: '业务一部', name: '政企收入占比', time: '2 小时前', typeColor: 'bg-warning-500/10 text-warning-600' },
  { type: '新增', dept: '业务四部', name: '千兆端口利用率', time: '3 小时前', typeColor: 'bg-dark-accent-primary/10 text-dark-accent-primary' },
];

/*
 * 快捷入口：精简为 4 大核心菜单（PRD #57）
 * - 指标管理、血缘画布、报告管理、知识库管理
 */
const quickAccess = [
  { title: '指标管理', desc: '指标挂靠与关联配置', Icon: BarChart3, route: '/indicator-management', color: 'text-dark-accent-primary', borderHover: 'hover:border-dark-accent-primary', bgHover: 'hover:bg-dark-accent-primary/10' },
  { title: '血缘画布', desc: '配置指标间链接关系', Icon: Network, route: '/lineage', color: 'text-dark-accent-primary', borderHover: 'hover:border-dark-accent-primary', bgHover: 'hover:bg-dark-accent-primary/10' },
  { title: '报告管理', desc: '报告计划、模板与版本', Icon: FileText, route: '/reports', color: 'text-dark-accent-primary', borderHover: 'hover:border-dark-accent-primary', bgHover: 'hover:bg-dark-accent-primary/10' },
  { title: '知识库管理', desc: '文档录入与版本维护', Icon: BookOpen, route: '/knowledge-upload', color: 'text-dark-accent-primary', borderHover: 'hover:border-dark-accent-primary', bgHover: 'hover:bg-dark-accent-primary/10' },
];

/* ─── 统计卡片 ─── */
function StatCard({
  title,
  value,
  change,
  Icon,
  iconBg,
  iconColor,
}: {
  title: string;
  value: number;
  change: number;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
}) {
  const isPositive = change > 0;

  return (
    <motion.div
      variants={staggerItem}
      className="bg-dark-elevated rounded-lg border border-dark-border shadow-card p-5 hover:shadow-card-hover hover:-translate-y-[1px] transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-dark-text-secondary">{title}</span>
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center', iconBg)}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-semibold text-dark-text-primary leading-tight">
          {value.toLocaleString()}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[12px] font-medium',
            isPositive
              ? 'bg-success-500/10 text-success-600'
              : 'bg-error-500/10 text-error-600'
          )}
        >
          {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {isPositive ? '+' : ''}{change}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── DashboardPage ─── */
export default function DashboardPage() {
  const navigate = useNavigate();

  const today = new Date();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${weekdays[today.getDay()]}`;

  return (
    <div className="text-dark-text-primary">
      {/* Section 1: Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-display text-white">工作台</h1>
        <div className="flex items-center gap-1.5 text-[13px] text-dark-text-secondary">
          <Calendar size={14} />
          {dateStr}
        </div>
      </motion.div>

      {/* Section 2: Statistics Cards */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-4 gap-5 mb-6 max-xl:grid-cols-2 max-md:grid-cols-1"
      >
        {statsData.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            Icon={stat.icon}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
          />
        ))}
      </motion.div>

      {/* Section 3 + 4: Recent Activity + Pending Audits */}
      <div className="grid grid-cols-5 gap-6 mb-6 max-xl:grid-cols-1">
        {/* Recent Activity - 左侧 60% */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="col-span-3 max-xl:col-span-1"
        >
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-card">
            {/* 标题区 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <h2 className="text-h2">近期动态</h2>
                <button className="w-6 h-6 flex items-center justify-center rounded text-dark-text-tertiary hover:text-dark-accent-primary hover:bg-dark-accent-primary/10 transition-colors">
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>

            {/* 内容区 - 时间线 */}
            <motion.div
              variants={listStagger}
              initial="initial"
              animate="animate"
              className="p-5"
            >
              {activityData.map((item, index) => (
                <motion.div
                  key={index}
                  variants={listItem}
                  className="flex items-start gap-3 py-3 group"
                >
                  {/* 图标 */}
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', item.iconColor)}>
                    <item.Icon size={14} className={item.iconTextColor} />
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-dark-text-secondary leading-relaxed">
                      {item.text}
                    </p>
                    <p className="text-[12px] text-dark-accent-primary mt-0.5 truncate">
                      {item.target}
                    </p>
                  </div>

                  {/* 时间 */}
                  <span className="text-[12px] text-dark-text-tertiary shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Pending Audits - 右侧 40% */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="col-span-2 max-xl:col-span-1"
        >
          <div className="bg-dark-elevated rounded-lg border border-dark-border shadow-card">
            {/* 标题区 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <h2 className="text-h2">待办审核</h2>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[12px] font-medium bg-warning-500/10 text-warning-600">
                  {pendingAudits.length}
                </span>
              </div>
            </div>

            {/* 内容区 */}
            <motion.div
              variants={listStagger}
              initial="initial"
              animate="animate"
              className="p-5"
            >
              {pendingAudits.map((item, index) => (
                <motion.div
                  key={index}
                  variants={listItem}
                  className="flex items-center gap-3 py-3 hover:bg-dark-page rounded-md px-2 -mx-2 cursor-default transition-colors"
                >
                  {/* 类型 Badge */}
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium shrink-0',
                    item.typeColor
                  )}>
                    {item.type}
                  </span>

                  {/* 部门 + 指标名 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-dark-text-secondary truncate">{item.dept}</p>
                    <p className="text-[14px] font-medium text-dark-text-primary truncate">{item.name}</p>
                  </div>

                  {/* 时间 */}
                  <span className="text-[12px] text-dark-text-tertiary shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Section 5: Quick Access */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-dark-elevated rounded-lg border border-dark-border shadow-card"
      >
        {/* 标题 */}
        <div className="px-5 py-4 border-b border-dark-border">
          <h2 className="text-h2">快捷入口</h2>
        </div>

        {/* 入口卡片 */}
        <motion.div
          variants={listStagger}
          initial="initial"
          animate="animate"
          className="p-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
        >
          {quickAccess.map((item) => (
            <motion.div
              key={item.route}
              variants={listItem}
              onClick={() => navigate(item.route)}
              className={cn(
                'bg-dark-elevated rounded-lg border border-dark-border p-5 cursor-pointer',
                'transition-all duration-200 ease-out',
                'hover:-translate-y-0.5 hover:shadow-card-hover',
                item.borderHover
              )}
            >
              <item.Icon size={28} className={item.color} />
              <h3 className="text-h3 mt-3 text-dark-text-primary">{item.title}</h3>
              <p className="text-[12px] text-dark-text-secondary mt-1 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
