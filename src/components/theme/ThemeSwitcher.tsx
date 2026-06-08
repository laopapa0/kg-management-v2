import { useState, useCallback, useEffect, useRef } from 'react';
import { Palette, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'kgv2-theme';

export const THEME_OPTIONS = [
  { key: 'light', label: '浅色', bg: '#ffffff', accent: '#3478f6', icon: Sun },
  { key: 'dark', label: '蓝灰', bg: '#0F141F', accent: '#5B8DEF' },
  { key: 'github-dark', label: 'GitHub', bg: '#0D1117', accent: '#58A6FF' },
  { key: 'vercel-dark', label: 'Vercel', bg: '#0A0A0A', accent: '#8888FF' },
  { key: 'linear-dark', label: 'Linear', bg: '#0D0D0D', accent: '#5E6AD2' },
  { key: 'tailwind-dark', label: 'Tailwind', bg: '#0B1121', accent: '#38BDF8' },
  { key: 'vscode-dark', label: 'VS Code', bg: '#1E1E1E', accent: '#569CD6' },
  { key: 'notion-dark', label: 'Notion', bg: '#191919', accent: '#2383E2' },
  { key: 'stripe-dark', label: 'Stripe', bg: '#0C1222', accent: '#7B8CDE' },
] as const;

export type ThemeKey = (typeof THEME_OPTIONS)[number]['key'];

export function getStoredTheme(): ThemeKey {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && THEME_OPTIONS.some((t) => t.key === stored)) {
      return stored as ThemeKey;
    }
  } catch {
    // localStorage unavailable
  }
  return 'dark';
}

export function applyTheme(themeKey: ThemeKey) {
  document.documentElement.setAttribute('data-theme', themeKey);
  try {
    localStorage.setItem(STORAGE_KEY, themeKey);
  } catch {
    // ignore
  }
}

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>(getStoredTheme);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((key: ThemeKey) => {
    applyTheme(key);
    setCurrentTheme(key);
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const currentOption = THEME_OPTIONS.find((t) => t.key === currentTheme) ?? THEME_OPTIONS[1];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="切换主题"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
          'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-tree-hover-bg'
        )}
      >
        <Palette size={17} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-10 w-60 bg-dark-elevated rounded-lg shadow-lg border border-dark-border py-3 px-3 z-50"
              role="listbox"
              aria-label="主题选择"
            >
              <div className="text-[11px] font-medium text-dark-text-tertiary uppercase tracking-wider mb-2 px-1">
                主题
              </div>
              <div className="grid grid-cols-4 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.key}
                      onClick={() => handleSelect(theme.key)}
                      role="option"
                      aria-selected={theme.key === currentTheme}
                      className={cn(
                        'group relative flex flex-col items-center gap-1 p-1.5 rounded-md transition-colors',
                        'hover:bg-dark-tree-hover-bg',
                        theme.key === currentTheme && 'ring-1 ring-dark-accent-primary'
                      )}
                      title={theme.label}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-md border border-dark-border shadow-sm flex items-center justify-center',
                          'transition-transform duration-150 group-hover:scale-105'
                        )}
                        style={{ backgroundColor: theme.bg }}
                      >
                        {Icon ? (
                          <Icon size={14} style={{ color: theme.accent }} />
                        ) : (
                          <div
                            className="w-full h-full rounded-md"
                            style={{
                              background: `linear-gradient(135deg, ${theme.accent}40 0%, transparent 60%)`,
                            }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-dark-text-tertiary group-hover:text-dark-text-secondary truncate max-w-full">
                        {theme.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-dark-border px-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm border border-dark-border"
                    style={{ backgroundColor: currentOption.bg }}
                  />
                  <span className="text-[12px] text-dark-text-secondary">
                    当前：{currentOption.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
