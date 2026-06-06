# ADR-001: 业务部门巡检待办复用 NOC 巡检报告数据模型

## 状态
已接受

## 上下文

NOC 巡检管理模块已建立完整的 `InspectionPlan` → `InspectionExecution` → `InspectionReport` 数据流。业务部门需要新增「巡检待办」功能，接收 NOC 推送的巡检报告并对异常项做评价。

关键问题：业务部门看到的报告是**复用** NOC 的 `InspectionReport`，还是创建**独立**的数据结构？

## 决策

复用 `InspectionReport` 接口，在其上扩展评价相关字段（`businessReview`）。不创建独立的业务视图实体。

## 备选方案

| 方案 | 描述 |  rejected 原因 |
|------|------|---------------|
| A — 复用 `InspectionReport` | 在同一接口上新增 `businessReview?: { status, evaluatedCount, totalCount }` | **已选** |
| B — 独立 `BusinessTodoReport` | 新建接口，通过 `reportId` 与 `InspectionReport` 关联 | 增加不必要的抽象层；当前业务评价是报告的自然属性，不是独立生命周期实体 |
| C — 只读引用 + 独立评价表 | `InspectionReport` 保持只读，评价数据存在独立 `Record<reportId, ReviewData>` | 引入间接层，对 demo 级别过度设计 |

## 理由

1. **业务本质一致**：业务部门看到的报告就是 NOC 生成的同一报告，只是增加了「评价」这一操作维度，不是独立业务对象。
2. **状态天然绑定**：报告的「待评价/已保存/已提交」状态与报告本身强绑定，分离后增加同步复杂度。
3. **误报率回流的便利**：评分公式 `calculateReportValueScore` 需要 `falsePositiveRate`，评价数据与报告绑定后回写更直接。
4. **演进预留**：若未来业务评价逻辑复杂化（如多轮评价、多级审批），可再拆分为独立实体，当前耦合点可控。

## 后果

- **正面**：减少数据冗余，状态变更无需跨实体同步，实现简单。
- **负面**：`InspectionReport` 同时承载「报告生成」和「业务评价」两个上下文的概念，长期可能变得臃肿。需在 CONTEXT.md 中明确标注两个上下文对该接口的使用边界。
