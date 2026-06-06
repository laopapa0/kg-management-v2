# Triage 标签映射

## Canonical Roles → Labels

| Canonical Role | Label 名称 | 含义 |
|----------------|-----------|------|
| `needs-triage` | `needs-triage` | 需要 maintainer 评估 |
| `needs-info` | `needs-info` | 等待 reporter 补充信息 |
| `ready-for-agent` | `ready-for-agent` | 已完整说明，AFK agent 可接手 |
| `ready-for-human` | `ready-for-human` | 需要人工实现 |
| `wontfix` | `wontfix` | 不会处理 |

## AFK-ready 判定参考

一个 issue 被标记为 `ready-for-agent` 之前，应满足以下参考标准（非强制门禁，由 maintainer 判断）：

- [ ] 包含明确的期望行为（或 user story）
- [ ] 包含可验证的验收标准（acceptance criteria）
- [ ] 对于 bug：包含复现步骤，或已确认无法复现的说明
- [ ] 没有未解决的开放问题或待确认的外部依赖

## 状态流转

```
needs-triage → [needs-info →] → ready-for-agent / ready-for-human / wontfix
```
