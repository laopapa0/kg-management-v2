# ADR-002: 评价草稿的客户端持久化方案

## 状态
已接受

## 上下文

业务部门「巡检待办」要求「保存 ≠ 提交」：
- 弹窗内点击【保存】→ 保存评价草稿，关闭弹窗，报告状态变为「已保存」
- 列表中点击【提交】→ 正式反馈给 NOC，报告状态变为「已提交」

关键问题：评价草稿（异常项的误报判断 + 备注）在客户端如何持久化？

## 决策

使用 `localStorage` 持久化评价草稿。提交后更新内存中的 `InspectionReport` 对象，误报标记参与评分公式计算。

## 备选方案

| 方案 | 描述 | rejected 原因 |
|------|------|--------------|
| A — `localStorage` | 评价草稿序列化后存入 `localStorage`，key 为 `inspection-reviews-${reportId}` | **已选** |
| B — React state only | 评价仅存于组件 state，关闭页面即丢失 | 无法满足「草稿」语义，用户刷新后需要重新评价 |
| C — 模拟后端 API | 创建 `mockReviewApi.ts`，评价数据存在内存 Map 中，通过异步 API 存取 | 增加异步复杂度，但对 demo 无真实价值；localStorage 已足够表达持久化意图 |
| D — IndexedDB | 使用 IndexedDB 存储结构化评价数据 | API 更复杂，localStorage 在数据量小（<5MB）时完全够用 |

## 理由

1. **跨会话保留**：「保存」按钮的核心语义是「我不想现在提交，但别让我重新填」，必须跨页面刷新保留。
2. **足够简单**：评价数据量极小（每个报告最多几十个异常项，每项一个 boolean + 短字符串），localStorage 的 5MB 上限完全够用。
3. **同步 API 简化交互**：localStorage 是同步的，【保存】操作无需 loading 状态，交互更流畅。
4. **无后端依赖**：项目当前为纯前端 demo，localStorage 不需要模拟任何后端接口。

## 后果

- **正面**：实现简单，用户体验流畅（保存即时反馈），无外部依赖。
- **负面**：
  - 数据仅在当前浏览器会话中可用，换设备/清缓存即丢失（对 demo 可接受）。
  - `localStorage` 存的是 JSON 字符串，没有类型安全，需做好序列化/反序列化的校验。
  - 提交后评价数据从 localStorage 清理还是保留？当前决策：**提交后清理草稿**，已提交状态由 `InspectionReport.businessReview` 承载。

## 相关决策

- ADR-001：评价数据绑定在 `InspectionReport` 上，提交后通过更新报告对象的 `score.falsePositiveRate` 实现误报率回流。
