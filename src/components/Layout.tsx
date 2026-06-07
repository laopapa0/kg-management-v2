import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fb]">
      {/* 侧边栏 */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 顶部栏 */}
      <Header sidebarCollapsed={sidebarCollapsed} />

      {/* 主内容区 */}
      <motion.main
        className="pt-12 min-h-[100dvh] transition-[margin] duration-250"
        style={{
          marginLeft: sidebarCollapsed ? 64 : 240,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDuration: '250ms',
        }}
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>

      <Toaster />
    </div>
  );
}
