# ADR-005: Vue3 重构版本 MySQL 5.7.2.1 数据库设计

## 状态

已接受

## 上下文

项目当前 React demo 使用 `localStorage` 持久化，handoff-20260616 明确下一步为 MySQL 数据库设计，且同期正在准备 Vue3 重构。需要为 Vue3 版本设计一套与框架无关、后端技术栈待定（可能是 NestJS / Spring Boot / Go）的 MySQL 5.7.2.1 库表结构。

关键约束：
- 目标数据库版本为 **MySQL 5.7.2.1**，JSON 类型在 5.7.8+ 才引入，因此 5.7.2.1 不支持 JSON 类型
- Java 后端程序要求表**不创建物理外键**，关联关系通过程序控制
- 用户和部门信息通过**大屏接口获取**，缓存到 Redis，不建 `users` / `departments` 表
- 需要兼容现有 v1 运行时指标数据表（`index_day_data` 等）的字段风格
- 需要支持部门分权分域（分权分域是 v2 核心概念）
- 需要区分管理员与普通业务部门用户

## 决策

### 1. 设计范围

只设计 MySQL 库表结构（ER + DDL + 初始化脚本），后端技术栈待定。数据库作为 Vue3 重构的数据契约层。

### 2. 基础配置

- MySQL 5.7.2.1
- 字符集 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`
- 表名统一小写 + 下划线
- 主键统一使用 `BIGINT AUTO_INCREMENT`
- 不创建物理外键，关联通过程序控制

### 3. 用户与部门

不创建 `users` 和 `departments` 表。用户/部门信息从大屏接口获取，Redis 缓存。业务表只存 `dept_id` 和 `dept_id_path`。

### 4. 通用字段规范

每张主表包含：

```sql
`status` tinyint(4) DEFAULT NULL COMMENT '状态',
`created_time` datetime DEFAULT NULL COMMENT '创建时间',
`updated_time` datetime DEFAULT NULL COMMENT '更新时间',
`created_by` varchar(50) NOT NULL COMMENT '创建人',
`updated_by` varchar(50) NOT NULL COMMENT '修改人',
`remark` varchar(200) DEFAULT NULL COMMENT '系统备注',
`deleted_at` datetime DEFAULT NULL COMMENT '软删除时间',
```

说明：
- `created_by` / `updated_by` 存**名称**，不是用户ID
- 时间字段用 `datetime`，不用 `timestamp`
- `status` 用 `tinyint(4)`，不用 `enum`
- 日志类表不遵循此规范，保持自身设计

### 5. 单字段自增主键

Leader 要求不采用联合主键。所有表统一使用单字段自增主键 `id`。业务唯一性通过 `UNIQUE KEY` 保证。

### 6. 部门隔离策略

采用**行级隔离**：业务表通过 `dept_id` 字段隔离；需要层级权限的表再加 `dept_id_path`（如 `1_5`）。

全局共享表不加 `dept_id`：
- `rules`（规则全局可见）
- `rule_categories`（规则分类全局共享）
- `link_relation_types`（关系类型全局共享）

管理员通过大屏接口返回的角色信息判断，不依赖数据库中的用户表。

### 7. 删除策略

全局软删除：每张业务表包含 `deleted_at datetime NULL`，删除时更新该字段；查询默认过滤 `deleted_at IS NULL`。

中间表（如 `indicator_tags`）和日志表不软删除，直接物理操作。

### 8. 树节点与实体分离

#### 8.1 指标树
- `indicator_tree_nodes`：指标树节点，自引用树，带 `dept_id`
- `indicators`：纯业务指标，无树结构字段
- `indicator_tree_node_indicators`：树节点与指标的多对多关联

程序限制：一个指标最多关联两个树节点（本部门一个 + NOC 一个）。

#### 8.2 标签分类
- `tag_categories`：标签分类树，自引用树，无限层级，带 `dept_id`
- `tags`：标签实体，必须归属一个分类
- `indicator_tags`：指标-标签多对多关联

#### 8.3 规则分类
- `rule_categories`：规则分类树，自引用树，无限层级
- `rules`：规则实体，通过 `rule_category_id` 关联分类
- `rules.parent_rule_id`：规则继承树（技术继承关系）

### 9. 运行时指标数据表

将 v1 的 5 张分表（`index_day_data` / `index_month_data` / `index_week_data` / `index_minute_data` / `index_year_data`）合并为单表 `indicator_values`，通过 `granularity` 字段区分粒度。

- 保留 v1 业务字段原样
- `created_time` / `updated_time` 统一为 `datetime`
- 数据量不大，不使用分区
- 指标值保持 `VARCHAR(100)` 继承现状
- 加复合索引 `(indicator_code, granularity, data_time)`

### 10. 指标元数据表

`indicators` 采用核心表 + 扩展属性表模式：
- `indicators` 只存核心字段（id, code, name, dept_id, dept_id_path, indicator_type 等）
- `indicator_attributes` 以键值对形式存储业务属性（`attr_key`, `attr_value`），便于扩展

### 11. 多对多关系

`indicator_tags`、`indicator_rules`、`indicator_tree_node_indicators` 为中间表，使用单字段自增主键 + `UNIQUE KEY` 保证业务唯一性。

`indicator_rules` 增加 `status` 字段，表示某指标是否启用某规则。`rule_parameters` 独立成表，联合唯一索引 `(rule_id, indicator_id)`，`param_values` 用 `TEXT` 存 JSON 字符串，不再包含 `status`。`indicator_id` 允许 NULL，表示规则级默认参数。

### 12. 血缘关系

`link_relations` 冗余存储 `source_dept_id` / `source_dept_id_path` / `target_dept_id` / `target_dept_id_path`，表结构支持多种权限策略：
- 源和目标都是自己部门
- 源或目标有一个是自己部门
- 管理员看全部
- 按部门层级路径查询

`link_relations` 增加 `correlation`（正/负相关）和 `confidence`（置信度）字段，以及 `description` 字段。

`link_relation_types` 增加 `direction` 字段（有向/无向），`link_relations` 实例表不再存 `direction`。`link_relation_types.id` 使用 VARCHAR 页面编码（如 `LKT-001`）作为主键。

### 13. 血缘关系变更日志

`link_change_logs` 冗余记录变更前后的 ID 和名称：
- `old_source_id` / `old_source_name`
- `old_target_id` / `old_target_name`
- `old_relation_type_id` / `old_relation_type_name`
- `new_source_id` / `new_source_name`
- `new_target_id` / `new_target_name`
- `new_relation_type_id` / `new_relation_type_name`

增加 `source_type` 字段：1-人类，2-AI。

### 14. AI 推荐

`ai_recommendations` 按部门隔离，冗余 `source_dept_id` / `source_dept_id_path` / `target_dept_id` / `target_dept_id_path`，`confidence` 用 `DECIMAL(5,4)`，`reason` 用 `TEXT`。

### 15. 报告管理

- `report_templates` 部门隔离；NOC 部门的 `dept_id` 对应的模板对所有部门可见（作为全局模板）
- `report_templates` 增加 `usage_count` 字段记录使用次数
- `report_plans` 部门隔离
- `report_plans` 的调度字段使用 `cron_expression VARCHAR(100)`，删除原 `schedule` 和 `auto_schedule` 字段
- `report_plans.status` 同时表示启用/禁用和是否自动执行：1=启用（按 Cron 自动执行），0=禁用（可手动生成）
- `report_plans` 的 `filter_scope` JSON 拆分为：
  - `filter_indicator_tree_scope` TEXT
  - `filter_tag_scope` TEXT
  - `filter_rule_scope` TEXT
  - `filter_exclude_relation_type_ids` VARCHAR(1000)
- `report_plans` 增加发散分析配置：`enable_divergence_analysis` 和 `divergence_analysis_prompt`
- `generated_reports` 为报告实例（档案），只存元信息，`created_time` 即 v1 生成时间
- `generated_reports` 增加筛选范围和发散分析配置快照字段
- `report_versions` 为每次"重新跑"生成的版本，只存 `file_path`；发散分析结果合并到主报告 HTML 文件中
- 报告正文以 HTML 文件形式存储，数据库只存相对路径

### 16. 5.7.2.1 索引长度限制

utf8mb4 下（`innodb_large_prefix` 默认 OFF）InnoDB 单索引最大 767 字节。所有需要加 UNIQUE 索引的 VARCHAR 字段长度不超过 191（191 * 4 = 764 < 767）。

### 17. 操作日志

增加 `operation_logs` 表记录关键操作（删除血缘、生成报告、应用 AI 推荐等），带 `dept_id` / `dept_id_path` 支持按部门查询，物理保留。不遵循通用字段规范。

### 18. 本期移除

- 知识库模块（`knowledge_documents` 等）
- 评论模块（`comments` 等）
- 用户表 / 部门表
- 规则版本 / 变更记录（由 `operation_logs` 覆盖）

## 备选方案

| 方案 | 描述 | rejected 原因 |
|------|------|--------------|
| MySQL 8.0 | 使用 JSON 类型、函数索引等现代特性 | 目标环境已确定为 5.7.2.1 |
| 创建 users/departments 表 | 数据库自建用户部门体系 | 大屏接口已提供用户部门信息，避免重复维护 |
| UUID 主键 | 所有表主键使用 UUID | 低并发单体 MySQL，自增 BIGINT 更简单高效 |
| 物理外键 | DDL 中创建 FOREIGN KEY | Java 后端要求通过程序控制关联 |
| 联合主键 | 中间表使用 `(a, b)` 做主键 | Leader 要求统一单字段自增主键 |
| 指标表自引用树 | `indicators` 含 `tree_parent_id` | 指标和树节点概念混淆，不支持多选挂载 |
| 标签表自引用树 | `tags` 含 `parent_id` | 标签分类和标签概念混淆 |
| 规则表自引用分类 | `rules` 含 `node_type` 表达分类 | 分类和规则职责不清 |
| 物理删除 | 业务表直接 DELETE | 指标树、血缘关系、报告误删恢复成本高 |
| 运行时数据分区 | `indicator_values` 按时间分区 | 数据量不大，分区收益有限 |
| 宽表指标 | `indicators` 包含全部业务字段 | 扩展性差，键值对更灵活 |
| 报告单表 | `generated_reports` 同时存版本历史 | 报告实例与版本概念混淆，拆为两张表更清晰 |
| `report_plans` 保留 schedule/auto_schedule | 用 daily/weekly/monthly + 自动开关 | 改为 Cron 表达式更灵活，且 leader 要求 |

## 理由

1. **目标环境约束优先**：MySQL 5.7.2.1 已确定，所有设计必须兼容，不能用 8.0 特性假设。
2. **与后端约定一致**：无物理外键、用户/部门走大屏接口，减少数据库层耦合。
3. **与现有领域模型一致**：沿用 CONTEXT.md 中指标、标签、规则、血缘、报告等术语定义。
4. **分权分域落地**：通过 `dept_id` + `dept_id_path` 实现部门隔离和层级权限。
5. **树节点与实体分离**：指标树、标签分类、规则分类统一采用"树表 + 实体表"模式，职责清晰。
6. **可扩展性**：指标属性键值对、运行时数据单表 + granularity、报告档案与版本分离，都为未来变更预留空间。
7. **最小可行**：首期移除知识库、评论、用户表、部门表，聚焦核心数据表。

## 后果

### 正面

- 与 Vue3 重构解耦，数据库契约先稳定
- 兼容 v1 运行时数据字段，迁移成本低
- 部门隔离清晰，`dept_id_path` 支持层级权限
- 报告实例与版本分离，支持"重新跑"业务概念
- 无物理外键，避免 Java 后端与数据库 schema 的强耦合
- 树节点与实体分离，支持 NOC 全量树、指标多选挂载、标签分类维护

### 负面

- MySQL 5.7.2.1 没有 JSON 类型，JSON 字段用 TEXT 存字符串，查询和索引需要应用层处理
- utf8mb4 索引长度限制导致部分 code/name 字段需缩短至 191
- 知识库和评论模块本期不做，未来需要重新设计并补表
- 运行时数据表保留大量 VARCHAR 字段，时间范围查询需要应用层做类型转换
- 不建用户/部门表，权限查询需要结合 Redis 缓存
- 树节点与实体分离引入更多表，查询时需要更多 JOIN

## 相关术语

- `dept_id`：部门ID，所有业务表的统一字段名
- `dept_id_path`：部门ID层级路径，如 `1_5`，用于层级权限查询
- NOC：运营中心，在大屏接口返回的部门数据中作为特殊部门，管理员归属该部门
- 指标树节点：`indicator_tree_nodes`，与指标实体分离的树结构节点
- 标签分类：`tag_categories`，标签的组织维度，支持无限层级
- 规则分类：`rule_categories`，规则的组织维度，支持无限层级
- 报告实例：`generated_reports`，报告档案，以第一次生成时间为创建时间
- 报告版本：`report_versions`，每次"重新跑"生成的结果
- 全局模板：NOC 部门创建的 `report_templates`，对所有部门可见
