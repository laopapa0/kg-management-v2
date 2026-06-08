import { useState, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  HelpCircle,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DepartmentSwitcher } from './department/DepartmentSwitcher';
import ThemeSwitcher from './theme/ThemeSwitcher';

/* ─── 面包屑映射 ─── */
const routeNameMap: Record<string, string> = {
  '/': '工作台',
  '/indicator-management': '指标管理',
  '/lineage': '血缘画布',
  '/reports': '报告管理',
  '/reports/templates': '报告模板',
  '/reports/generate': '生成报告',
  '/knowledge-upload': '知识库管理',
};

function getBreadcrumbItems(pathname: string) {
  if (pathname === '/') {
    return [{ label: '工作台', path: '/' }];
  }

  const segments = pathname.split('/').filter(Boolean);
  const items: { label: string; path: string }[] = [{ label: '首页', path: '/' }];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const name = routeNameMap[currentPath];
    if (name) {
      items.push({ label: name, path: currentPath });
    } else if (i === segments.length - 1) {
      const parentPath = segments.slice(0, -1).join('/');
      const mapped = routeNameMap[`/${parentPath}`] || segments[i];
      items.push({ label: mapped, path: currentPath });
    }
  }

  return items;
}

/* ─── Header 组件 ─── */
interface HeaderProps {
  sidebarCollapsed: boolean;
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3);

  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <header
      className="fixed top-0 right-0 h-12 bg-dark-elevated border-b border-dark-border flex items-center justify-between px-4 z-40 transition-[left] duration-250"
      style={{ left: sidebarCollapsed ? 64 : 240 }}
    >
      {/* 左侧面包屑 */}
      <nav className="flex items-center h-9">
        <ol className="flex items-center">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <li key={item.path} className="flex items-center">
                {index > 0 && (
                  <ChevronRight size={14} className="mx-1.5 text-dark-text-tertiary" />
                )}
                {isLast ? (
                  <span className="text-[13px] font-medium text-dark-text-primary">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="text-[13px] text-dark-text-secondary hover:text-dark-accent-primary hover:underline transition-colors"
                  >
                    {index === 0 ? (
                      <span className="flex items-center gap-1">
                        <Home size={13} />
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-3">
        {/* 主题切换器 */}
        <ThemeSwitcher />

        {/* 部门切换器 */}
        <DepartmentSwitcher />

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-text-tertiary" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索指标、对象类型、规则..."
            className={cn(
              'h-8 pl-8 pr-3 rounded-md border border-dark-border-hover bg-dark-page text-[13px] text-dark-text-secondary',
              'placeholder:text-dark-text-tertiary',
              'focus:outline-none focus:border-dark-accent-primary focus:ring-2 focus:ring-dark-accent-primary/20',
              'transition-all duration-150',
              'w-60'
            )}
          />
        </form>

        {/* 通知铃铛 */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-md text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary transition-colors">
          <Bell size={17} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
              {notificationCount}
            </span>
          )}
        </button>

        {/* 帮助图标 */}
        <button className="w-8 h-8 flex items-center justify-center rounded-md text-dark-text-secondary hover:bg-dark-tree-hover-bg hover:text-dark-text-primary transition-colors">
          <HelpCircle size={17} />
        </button>

        {/* 用户头像下拉 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-8 h-8 rounded-full bg-dark-accent-primary flex items-center justify-center text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            管
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-10 w-48 bg-dark-elevated rounded-lg shadow-lg border border-dark-border py-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-dark-border">
                    <div className="text-[13px] font-medium text-dark-text-primary">管理员</div>
                    <div className="text-[11px] text-dark-text-tertiary">admin@example.com</div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-dark-text-secondary hover:bg-dark-page transition-colors">
                    <User size={14} />
                    个人中心
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-dark-text-secondary hover:bg-dark-page transition-colors">
                    <Settings size={14} />
                    系统设置
                  </button>
                  <div className="border-t border-dark-border mt-1 pt-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error-500 hover:bg-error-50/10 transition-colors">
                      <LogOut size={14} />
                      退出登录
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
