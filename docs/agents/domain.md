# Domain 文档配置

## 文档布局

```
项目根目录/
├── CONTEXT.md          # 领域语言、核心概念、术语定义
├── docs/
│   ├── adr/            # 架构决策记录 (Architecture Decision Records)
│   │   ├── 001-xxx.md
│   │   └── ...
│   └── agents/         # 本目录：skill 配置
```

## 读取规则

以下 skills 会读取这些文件来学习项目上下文：

- `improve-codebase-architecture` → 读取 `CONTEXT.md` 和 `docs/adr/*.md`
- `diagnose` → 读取 `CONTEXT.md` 了解领域术语
- `tdd` → 读取 `CONTEXT.md` 确保测试用例使用正确的领域语言

## CONTEXT.md 内容建议

`CONTEXT.md` 应包含：

1. **项目概述** — 一句话描述项目做什么
2. **核心领域术语表** — 项目中特有的名词及其定义
3. **架构概览** — 技术栈、主要模块、数据流
4. **约定** — 编码规范、命名规则、文件组织方式

## ADR 格式

每个 ADR 文件使用以下结构：

```markdown
# ADR-XXX: 标题

## 状态
提案 / 已接受 / 已废弃

## 上下文
描述需要做出决策的问题

## 决策
做出了什么决定

## 后果
正面和负面的影响
```
