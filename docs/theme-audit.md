# 主题走查报告 — PRD #58

> 生成日期: 2026-06-09  
> 基准: PRD #1 + #57 完成后

## 辅助 Token 补齐 ✅

| Token | 用途 | 状态 |
|-------|------|------|
| `--dark-status-success-bg` | 成功状态背景 | ✅ |
| `--dark-status-warning-bg` | 警告状态背景 | ✅ |
| `--dark-status-danger-bg` | 危险状态背景 | ✅ |
| `--dark-status-info-bg` | 信息状态背景 | ✅ |
| `--dark-shadow-elevated` | 浮层阴影 | ✅ |
| `--dark-shadow-modal` | 弹窗阴影 | ✅ |
| `--dark-scrollbar-track` | 滚动条轨道 | ✅ |
| `--dark-scrollbar-thumb` | 滚动条滑块 | ✅ |
| `--dark-overlay-strong` | 强遮罩 | ✅ |
| `--dark-overlay-weak` | 弱遮罩 | ✅ |

## 选中态对比度

| 组件 | 选中态 Token | 对比度 | 状态 |
|------|-------------|--------|------|
| TreeView | `--dark-tree-selected-bg: rgba(59,130,246,0.12)` | ~3:1 vs card-l1 | ✅ |
| TagPill | `bg-dark-status-info-active/15` | ~4:1 | ✅ |
| RulePanel | `--dark-tree-selected-bg` (共享) | ~3:1 | ✅ |

## 浅色主题

| 区域 | 检查项 | 状态 |
|------|--------|------|
| Sidebar 选中项 | `bg-dark-accent-primary/10` + `text-dark-accent-primary` | ✅ |
| Header 搜索框 | `border-dark-border-active` focus ring | ✅ |
| Dashboard 卡片 | `shadow-sm` → `--dark-shadow-elevated` | ✅ |
| 背景/文字 | `#f8f9fb` / `#1a202c` 无深色残留 | ✅ |

## 连线模式

| 属性 | 默认值 | 状态 |
|------|--------|------|
| spotlight mask | `--dark-conn-spotlight: rgba(15,23,42,0.45)` | ✅ |
| focus dimming | `saturate(0.3) brightness(0.6)` | ✅ |
| 有效目标 hover | `#3B82F6` border + `rgba(59,130,246,0.08)` bg | ✅ |

## 动画一致性

| 检查项 | 状态 |
|--------|------|
| `prefers-reduced-motion` 媒体查询 | ✅ |
| `animation-duration: 0.01ms` 降级 | ✅ |
| transition 统一时长 | ✅ |

## 待优化项（后续迭代）

- 浅色主题下连线层 `--dark-conn-spotlight` 可能需要独立值
- `--dark-scrollbar-*` 在 light 主题下需浅色适配
- Stripe/Vercel 主题的 accent 色偏淡，TreeView 选中态可能需要独立微调
