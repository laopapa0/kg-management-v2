import { useState, useCallback, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Tag,
  Shield,
  Box,
  Link,
  ClipboardCheck,
  FolderTree,
  Share2,
  Database,
  ChevronLeft,
  ChevronRight,
  Network,
  ChevronDown,
  ClipboardList,
  BookOpen,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── 类型 ─── */
interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface NavGroup {
  title: string;
  module: 'business' | 'noc' | 'platform';
  items: NavItem[];
}

/* ─── 导航配置 ─── */
const navGroups: NavGroup[] = [
  {
    title: '业务部门',
    module: 'business',
    items: [
      { label: '指标管理', path: '/indicator-management', icon: <BarChart3 size={18} /> },
      { label: '血缘画布', path: '/lineage', icon: <Network size={18} /> },
      { label: '配置标签', path: '/tag-config', icon: <Tag size={18} /> },
      { label: '配置规则', path: '/rule-config', icon: <Shield size={18} /> },
      { label: '巡检待办', path: '/inspection-todo', icon: <ClipboardCheck size={18} /> },
      { label: '知识上传', path: '/knowledge-upload', icon: <Upload size={18} /> },
    ],
  },
  {
    title: 'NOC 管理',
    module: 'noc',
    items: [
      { label: '对象类型', path: '/noc/object-type', icon: <Box size={18} /> },
      { label: '链接关系', path: '/noc/link-relation', icon: <Link size={18} /> },
      { label: '属性管理', path: '/noc/property', icon: <Tag size={18} /> },
      { label: '标签管理', path: '/noc/tag', icon: <Tag size={18} /> },
      { label: '规则管理', path: '/noc/rule', icon: <Shield size={18} /> },
      { label: '审核待办', path: '/noc/audit', icon: <ClipboardCheck size={18} /> },
      { label: '巡检管理', path: '/noc/inspection', icon: <ClipboardList size={18} /> },
      { label: '知识管理', path: '/knowledge-management', icon: <BookOpen size={18} /> },
    ],
  },
  {
    title: '平台维护',
    module: 'platform',
    items: [
      { label: '对象类型', path: '/platform/object-type', icon: <FolderTree size={18} /> },
      { label: '链接类型', path: '/platform/link-type', icon: <Link size={18} /> },
      { label: '属性管理', path: '/platform/property', icon: <Tag size={18} /> },
      { label: '图谱管理', path: '/platform/graph', icon: <Share2 size={18} /> },
    ],
  },
];

/* ─── 模块样式映射 ─── */
const moduleStyles = {
  business: {
    activeBg: 'bg-dark-accent-primary/10',
    activeText: 'text-dark-accent-primary',
    indicator: 'bg-dark-accent-primary',
  },
  noc: {
    activeBg: 'bg-[var(--accent-noc)]/10',
    activeText: 'text-[var(--accent-noc)]',
    indicator: 'bg-[var(--accent-noc)]',
  },
  platform: {
    activeBg: 'bg-[var(--accent-platform)]/10',
    activeText: 'text-[var(--accent-platform)]',
    indicator: 'bg-[var(--accent-platform)]',
  },
};

/* ─── Sidebar 组件 ─── */
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '业务部门': true,
    'NOC 管理': true,
    '平台维护': true,
  });

  const toggleGroup = useCallback((title: string) => {
    if (collapsed) return;
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  }, [collapsed]);

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-dark-card-l2 border-r border-dark-border flex flex-col z-50',
        'transition-[width] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo 区域 */}
      <div className="h-14 flex items-center px-4 border-b border-dark-border shrink-0">
        <Database size={24} className="text-dark-accent-primary shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 text-[15px] font-semibold text-dark-text-primary whitespace-nowrap overflow-hidden"
            >
              图谱管理平台
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 导航区域 */}
      <nav className="flex-1 overflow-y-auto py-2">
        {/* 首页 - 特殊项 */}
        <div className="px-2 mb-2">
          <NavLink
            to="/"
            className={cn(
              'flex items-center h-10 rounded-md transition-colors duration-100 relative',
              collapsed ? 'justify-center px-0 mx-1' : 'px-3 mx-2',
              location.pathname === '/'
                ? 'bg-dark-accent-primary/10 text-dark-accent-primary'
                : 'text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary'
            )}
          >
            {location.pathname === '/' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark-accent-primary rounded-r-full" />
            )}
            <Home size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ml-3 text-[14px] whitespace-nowrap overflow-hidden"
                >
                  首页
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </div>

        {/* 分组导航 */}
        {navGroups.map((group) => {
          const styles = moduleStyles[group.module];
          const isExpanded = expandedGroups[group.title];

          return (
            <div key={group.title} className="mb-1">
              {/* 分组标题 */}
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'w-full flex items-center px-4 py-2 text-[11px] font-medium text-dark-text-tertiary uppercase tracking-[0.05em] transition-colors',
                  collapsed ? 'justify-center' : 'justify-between',
                  !collapsed && 'hover:text-dark-text-secondary'
                )}
              >
                {!collapsed && <span className="truncate">{group.title}</span>}
                {!collapsed && (
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform duration-200',
                      !isExpanded && '-rotate-90'
                    )}
                  />
                )}
                {collapsed && (
                  <div className={cn('w-1 h-1 rounded-full', styles.indicator)} />
                )}
              </button>

              {/* 导航项 */}
              <AnimatePresence initial={false}>
                {(isExpanded || collapsed) && (
                  <motion.div
                    initial={collapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const active = isActivePath(item.path);
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          className={cn(
                            'flex items-center h-10 rounded-md transition-colors duration-100 relative mx-2',
                            collapsed ? 'justify-center px-0' : 'px-3',
                            active
                              ? `${styles.activeBg} ${styles.activeText}`
                              : 'text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary'
                          )}
                        >
                          {active && (
                            <div className={cn(
                              'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full',
                              styles.indicator
                            )} />
                          )}
                          <span className="shrink-0 text-dark-text-tertiary [&>svg]:text-current">
                            {item.icon}
                          </span>
                          <AnimatePresence>
                            {!collapsed && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="ml-3 text-[14px] whitespace-nowrap overflow-hidden"
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* 底部用户区域 */}
      <div className="shrink-0 border-t border-dark-border h-12 flex items-center px-3">
        <div className="w-7 h-7 rounded-full bg-dark-accent-primary flex items-center justify-center text-white text-[12px] font-medium shrink-0">
          管
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-2 overflow-hidden"
            >
              <div className="text-[13px] text-dark-text-primary font-medium truncate">管理员</div>
              <div className="text-[11px] text-dark-text-tertiary truncate">系统管理员</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 收起/展开按钮 */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 bg-dark-elevated border border-dark-border rounded-full flex items-center justify-center shadow-xs hover:shadow-md transition-shadow z-50"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
