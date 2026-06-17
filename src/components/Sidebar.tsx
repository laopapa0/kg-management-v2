import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  BarChart3,
  Network,
  FileText,
  Database,
  Link,
  Scale,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  items: NavItem[];
}

/* ─── 导航配置 ─── */
const homeItem: NavItem = { label: '首页', path: '/', icon: <Home size={18} /> };

const navGroups: NavGroup[] = [
  {
    title: '指标图谱',
    items: [
      { label: '指标管理', path: '/indicator-management', icon: <BarChart3 size={18} /> },
      { label: '血缘画布', path: '/lineage', icon: <Network size={18} /> },
    ],
  },
  {
    title: '报告管理',
    items: [
      { label: '报告管理', path: '/reports', icon: <FileText size={18} /> },
    ],
  },
  {
    title: '基础维护',
    items: [
      { label: '规则管理', path: '/noc/rule', icon: <Scale size={18} /> },
      { label: '关联关系管理', path: '/link-relation', icon: <Link size={18} /> },
    ],
  },
];

/* ─── Sidebar 组件 ─── */
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(navGroups.map((g) => g.title))
  );

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
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
        {/* 首页 */}
        {renderNavItem(homeItem, isActivePath, collapsed)}

        {/* 分组 */}
        {navGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.title);
          return (
            <div key={group.title} className="mb-0.5">
              {/* 分组标题 */}
              <button
                onClick={() => toggleGroup(group.title)}
                data-testid={`sidebar-group-title-${group.title}`}
                className={cn(
                  'flex items-center w-full h-10 rounded-md transition-colors duration-100',
                  'text-dark-text-tertiary hover:text-dark-text-primary',
                  collapsed ? 'justify-center px-0' : 'justify-between px-3'
                )}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: isExpanded ? 0 : -90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[12px] font-medium whitespace-nowrap overflow-hidden"
                      >
                        {group.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </button>

              {/* 子项 */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) =>
                      renderNavItem(item, isActivePath, collapsed)
                    )}
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
        className="absolute -right-3 top-16 w-6 h-6 bg-dark-card-l1 border border-dark-border rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:border-dark-accent-primary/30 transition-all z-50 text-dark-text-secondary hover:text-dark-text-primary"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}

/* ─── 渲染单个导航项 ─── */
function renderNavItem(
  item: NavItem,
  isActivePath: (path: string) => boolean,
  collapsed: boolean
) {
  const active = isActivePath(item.path);
  return (
    <NavLink
      key={item.path}
      to={item.path}
      className={cn(
        'flex items-center h-10 rounded-md transition-colors duration-100 relative mb-1',
        collapsed ? 'justify-center px-0 mx-2' : 'px-3 mx-2',
        active
          ? 'bg-dark-accent-primary/10 text-dark-accent-primary'
          : 'text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary'
      )}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-dark-accent-primary rounded-r-full" />
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
}
