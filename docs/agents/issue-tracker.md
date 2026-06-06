# Issue Tracker 配置

本仓库使用 **GitHub Issues** 作为 issue tracker。

## 工作模式

- **代码和 issues 同仓库**：代码与 issues、PRDs 存放在同一个 GitHub 仓库中
- 使用 GitHub MCP 工具进行读写（`create_issue`、`update_issue`、`list_issues` 等）
- 创建 issue 时默认应用 `needs-triage` 标签

## Issue 规范

- 标题应简明描述问题或需求
- 描述中应包含上下文、期望行为和验收标准
- Bug 类 issue 应包含复现步骤
- 使用 labels 标记类型（`bug`、`feature`、`docs` 等）和状态（`needs-triage`、`ready-for-agent` 等）

## PRD 存放

产品需求文档（PRD）通过 `to-prd` skill 生成，以 issue 形式存放到 GitHub Issues 中，标题前缀为 `[PRD]`。
