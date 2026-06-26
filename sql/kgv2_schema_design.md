# 数据指标知识图谱管理平台 v2 — MySQL 5.7.2.1 数据库设计说明

> 对应 DDL 文件：`sql/kgv2_schema.sql`  
> 目标：Vue3 重构版本  
> 设计日期：2026-06-16

---

## 一、设计目标

本数据库为 Vue3 重构版本提供持久化层。当前 React demo 使用 `localStorage` 存储数据，v2 需要迁移到 MySQL 5.7.2.1。

设计原则：
- 与后端框架解耦：只定义库表结构，后端技术栈（NestJS / Spring Boot / Go）待定
- 兼容 v1 运行时数据：保留 v1 指标数值表的字段风格，便于数据迁移
- 落地分权分域：通过 `dept_id` + `dept_id_path` 实现部门隔离和层级权限
- 用户/部门信息外置：通过大屏接口获取，缓存到 Redis，不建用户表/部门表
- 无物理外键：Java 程序要求通过程序控制关联关系
- 树节点与实体分离：指标树、标签分类、规则分类均独立成树表，实体表与之关联

---

## 二、关键决策解释

### 2.1 为什么用 MySQL 5.7.2.1？

目标部署环境已确定为 MySQL 5.7.2.1。这带来以下限制：
- 没有原生 `JSON` 类型（JSON 类型在 5.7.8+ 才引入），JSON 数据用 `TEXT` 存储，应用层解析
- `utf8mb4` 字符集下（`innodb_large_prefix` 默认 OFF），InnoDB 索引键最大 767 字节
- 没有完整的函数索引、CTE、窗口函数等现代特性

### 2.2 为什么不建用户表和部门表？

用户和部门信息通过对接大屏接口获取，缓存到 Redis。数据库中：
- 不创建 `users` 表
- 不创建 `departments` 表
- 业务表只存 `dept_id` 和 `dept_id_path`

### 2.3 为什么主键用 BIGINT 自增？

- 当前是 B 端后台，低并发，单体 MySQL 足够
- 自增 BIGINT 查询快、索引省空间、URL 短
- 未来若需分布式，可再加独立 UUID 字段或迁移，不阻塞当前设计

### 2.4 为什么无物理外键？

Java 后端程序要求 MySQL 表不创建物理外键，关联关系通过程序控制。DDL 中：
- 删除所有 `FOREIGN KEY` 约束
- 保留普通索引 `KEY idx_xxx`
- 在字段备注中说明关联对象

### 2.5 通用字段规范

每张主表都包含以下字段：

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
- `created_time` / `updated_time` 用 `datetime`，不用 `timestamp`
- `created_by` / `updated_by` 存**名称**，不是用户ID
- `status` 用 `tinyint(4)`，不用 `enum`，具体业务含义由程序定义
- 有软删除的表保留 `deleted_at`；日志类表不软删除
- 关联表按需使用通用字段，不强制全部添加

### 2.6 为什么所有主键都是单字段自增 ID？

Leader 要求不采用 `(indicator_id, tag_id)` 这类联合主键，所有表统一使用单字段自增主键 `id`。业务唯一性通过 `UNIQUE KEY` 保证。

例如：
```sql
indicator_tags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  indicator_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  UNIQUE KEY uk_indicator_tags (indicator_id, tag_id)
)
```

### 2.7 部门隔离怎么实现？

业务表加 `dept_id` 字段，需要层级权限的表再加 `dept_id_path`：
- `dept_id`：直接所属部门ID
- `dept_id_path`：部门层级路径，如 `1_5` 表示上级部门 1，当前部门 5

查询示例：
```sql
-- 查本部门数据
SELECT * FROM indicators
WHERE dept_id = :userDept AND deleted_at IS NULL;

-- 查本部门及子部门数据（利用 dept_id_path）
SELECT * FROM indicators
WHERE dept_id_path LIKE CONCAT(:userDeptPath, '%') AND deleted_at IS NULL;
```

哪些表需要 `dept_id`：
- `indicator_values`
- `indicator_tree_nodes`
- `indicators`
- `indicator_attributes`
- `tag_categories`
- `tags`
- `link_relations`（冗余 source_dept_id / target_dept_id）
- `ai_recommendations`
- `report_templates`
- `report_plans`
- `generated_reports`
- `operation_logs`

全局共享表不加 `dept_id`：
- `rules`
- `rule_categories`
- `link_relation_types`

### 2.8 为什么指标树和指标要分离？

原设计：`indicators` 表自引用 `tree_parent_id`，指标本身既是业务实体又是树节点。

新设计：
- `indicator_tree_nodes`：指标树节点，自引用树
- `indicators`：纯业务指标
- `indicator_tree_node_indicators`：树节点与指标的多对多关联

好处：
- 指标和树节点是不同的概念
- 支持一个指标挂到多个树节点（程序限制最多 2 个：本部门 + NOC）
- NOC 可以维护独立的指标树

### 2.9 为什么标签分类和标签要分离？

原设计：`tags` 表自引用 `parent_id`，分类和标签混在一起。

新设计：
- `tag_categories`：标签分类树，自引用，无限层级
- `tags`：标签实体，必须归属一个分类
- `indicator_tags`：指标-标签多对多关联

好处：
- "标签分类不是标签"，职责清晰
- 分类支持无限层级维护
- 标签平铺，便于按分类展示和筛选

### 2.10 为什么规则分类和规则要分离？

- `rule_categories`：规则分类树，自引用，无限层级
- `rules`：规则实体，通过 `rule_category_id` 关联分类
- `rules.parent_rule_id`：规则继承树（技术继承关系）

好处：
- 分类、规则、继承三者职责清晰
- 分类改名/移动不影响规则表
- 和指标树/标签分类采用同一套设计模式

### 2.11 指标挂树的多选限制

数据库层面：`indicator_tree_node_indicators` 是多对多中间表。

程序层面限制：一个指标最多关联两个树节点（本部门的 + NOC 的）。

### 2.12 规则启用状态为什么放在 `indicator_rules`？

`rules` 表有全局状态，`indicator_rules` 表增加 `status` 字段表示某指标是否启用某规则。

- 全局规则禁用：所有指标都不生效
- 指标-规则关联禁用：只有该指标对该规则不生效
- `rule_parameters` 表不存状态，参数实例随关联状态生效/失效

### 2.13 为什么 `rule_parameters` 的 `indicator_id` 允许 NULL？

`indicator_id = NULL` 表示规则级默认参数，不属于任何具体指标。`indicator_id` 非空时表示指标级参数。

### 2.14 为什么 `link_relations` 冗余部门字段？

`link_relations` 冗余存储 `source_dept_id` / `source_dept_id_path` / `target_dept_id` / `target_dept_id_path`，表结构支持多种权限策略：
- 源和目标都是自己部门
- 源或目标有一个是自己部门
- 管理员看全部
- 按部门层级路径查询

### 2.15 为什么 `direction` 放在关系类型表？

方向是关系类型的固有属性（如"依赖"有向，"关联"无向），所以 `direction` 放在 `link_relation_types` 表。`link_relations` 实例表不再存 `direction`。

### 2.16 关系类型表为什么用 VARCHAR 主键？

`link_relation_types.id` 不使用自增 BIGINT，而是使用页面编码（如 `LKT-001`）作为 VARCHAR 主键。

字段对应：
- `id`：页面编码，如 `LKT-001`
- `code`：英文名，如 `AGGREGATES`
- `name`：中文名，如 `聚合关系`
- `description`：描述
- `direction`：方向（1-有向，2-无向）
- `source_object_types` / `target_object_types`：逗号分隔的源/目标对象类型列表

### 2.17 血缘关系变更日志为什么冗余名称字段？

变更日志需要支持按旧/新源指标、目标指标、关系类型筛选。为减少 JOIN 查询，冗余记录变更前后的 ID 和名称：
- `old_source_id` / `old_source_name`
- `old_target_id` / `old_target_name`
- `old_relation_type_id` / `old_relation_type_name`
- `new_source_id` / `new_source_name`
- `new_target_id` / `new_target_name`
- `new_relation_type_id` / `new_relation_type_name`

同时增加 `source_type` 字段：1-人类，2-AI，用于筛选 AI 来源的变更。

### 2.18 报告计划为什么用 Cron 表达式？

`report_plans.schedule` 已改为 `cron_expression VARCHAR(100)`。调度器基于 Cron 表达式直接调度。

`report_plans.status` 同时表示启用/禁用和是否自动执行：
- `status = 1`：启用，按 Cron 自动执行
- `status = 0`：禁用，不自动执行，但可以手动生成

### 2.19 报告筛选范围为什么拆字段？

`report_plans.filter_scope` JSON 拆成：
- `filter_indicator_tree_scope` TEXT：指标树范围 JSON
- `filter_tag_scope` TEXT：标签范围 JSON
- `filter_rule_scope` TEXT：规则范围 JSON
- `filter_exclude_relation_type_ids` VARCHAR(1000)：剔除关联关系类型ID列表，逗号分隔

不需要 `filter_department_ids`，因为部门通过指标树根节点体现。

### 2.20 发散分析怎么设计？

发散分析配置放在 `report_plans` 表：
- `enable_divergence_analysis` TINYINT(1)：是否启用发散分析
- `divergence_analysis_prompt` TEXT：发散分析提示词

发散分析结果不单独存文件路径，而是合并到主报告 HTML 文件末尾。`report_versions` 表只有 `file_path` 一个文件路径字段。

### 2.21 报告档案为什么要快照筛选范围和发散分析配置？

`generated_reports` 增加以下快照字段：
- `filter_indicator_tree_scope`
- `filter_tag_scope`
- `filter_rule_scope`
- `filter_exclude_relation_type_ids`
- `enable_divergence_analysis`
- `divergence_analysis_prompt`

原因：报告计划后续可能修改筛选范围或发散分析配置，但历史生成的报告档案应该保留生成时的上下文，以便"重新跑"时基于原范围生成新版本。

### 2.22 报告为什么要拆成 `generated_reports` + `report_versions`？

业务上：
- `generated_reports` 是**报告实例/档案**，代表一个持续存在的报告。`created_time` 即 v1 生成时间
- `report_versions` 是每次"重新跑"生成的版本，v1、v2、v3...

这样：
- 报告实例的标题、所属计划等元信息不变
- 每次执行只新增一条版本记录
- `generated_reports.latest_version` 冗余存储当前最新版本号，方便列表查询

### 2.23 报告文件为什么不存数据库？

报告正文是 HTML 文件，数据库只存相对路径：
- 文件内容可能很大，不适合放数据库字段
- 相对路径与域名解耦，本地/测试/生产环境用不同基础 URL
- 便于 CDN / 对象存储迁移

### 2.24 为什么运行时指标数据合并为单表？

v1 有 5 张分表：`index_day_data`、`index_month_data`、`index_week_data`、`index_minute_data`、`index_year_data`。

合并为 `indicator_values`：
- 结构重复，合并后维护简单
- 通过 `granularity` 字段区分粒度
- 查询跨粒度时不需要 UNION

保留 v1 业务字段原样，但时间字段统一为 `created_time` / `updated_time` datetime。

### 2.25 为什么放弃分区？

数据量不大，单表 + 复合索引足够。避免分区的维护复杂度。

### 2.26 为什么移除知识库和评论模块？

根据本期范围约定，知识库和评论模块从首期设计中移除，未来需要时再补充表结构。

---

## 三、表结构速查

### 3.1 基础管理

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `operation_logs` | 操作日志 | `operation_type`, `target_type`, `target_id`, `dept_id` |

> 说明：不创建 `users` 和 `departments` 表。

### 3.2 指标管理

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `indicator_values` | 运行时指标数值 | `indicator_code`, `granularity`, `data_time`, `indicator_value`, `dept_id` |
| `indicator_tree_nodes` | 指标树节点 | `parent_id`, `dept_id`, `dept_id_path`, `node_type` |
| `indicator_tree_node_indicators` | 树节点-指标关联 | `tree_node_id`, `indicator_id`（多对多） |
| `indicators` | 指标核心表 | `code`, `dept_id`, `dept_id_path`, `indicator_type` |
| `indicator_attributes` | 指标业务属性 | `indicator_id`, `attr_key`, `attr_value` |
| `tag_categories` | 标签分类树 | `parent_id`, `dept_id`, `dept_id_path` |
| `tags` | 标签实体 | `category_id`, `color`, `dept_id` |
| `rule_categories` | 规则分类树 | `parent_id`, `name`, `sort_order` |
| `rules` | 规则实体 | `code`, `name`, `rule_category_id`, `parent_rule_id`, `type`, `param_summary` |
| `indicator_tags` | 指标-标签关联 | `indicator_id`, `tag_id` |
| `indicator_rules` | 指标-规则关联 | `indicator_id`, `rule_id`, `status` |
| `rule_parameters` | 规则参数实例 | `rule_id`, `indicator_id`（NULL=默认）, `param_values` |

### 3.3 血缘关系

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `link_relation_types` | 关系类型 | `id`（编码）, `code`（英文名）, `name`（中文名）, `description`, `color`, `direction`, `source_object_types`, `target_object_types` |
| `link_relations` | 关系实例 | `source_id`, `target_id`, `source_dept_id`, `target_dept_id`, `relation_type_id`, `correlation`, `confidence`, `description` |
| `link_change_logs` | 变更日志 | `relation_id`, `old/new source/target/relation_type`, `source_type` |

### 3.4 AI 推荐

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `ai_recommendations` | AI 推荐关系 | `source_id`, `target_id`, `confidence`, `applied`, `dept_id` |

### 3.5 报告管理

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `report_templates` | 报告模板 | `dept_id`, `usage_count`, `enabled`（NOC = 全局模板） |
| `report_template_sections` | 模板章节 | `template_id`, `sort_order`, `type`, `content` |
| `report_plans` | 报告计划 | `cron_expression`, `dept_id`, `template_id`, `filter_*`, `enable_divergence_analysis`, `divergence_analysis_prompt` |
| `generated_reports` | 报告档案 | `plan_id`, `latest_version`, `dept_id`, `filter_*_snapshot`, `enable_divergence_analysis_snapshot` |
| `report_versions` | 报告版本 | `report_id`, `version`, `file_path` |

---

## 四、重要约束

### 4.1 索引长度限制

MySQL 5.7.2.1 + utf8mb4 下（`innodb_large_prefix` 默认 OFF），InnoDB 索引键最大 767 字节。因此：
- UNIQUE 索引字段长度 ≤ 191
- 普通索引字段长度 ≤ 255

### 4.2 JSON 字段

以下字段用 `TEXT` 存 JSON 字符串：
- `rules.param_summary`
- `rule_parameters.param_values`
- `report_plans.filter_indicator_tree_scope`
- `report_plans.filter_tag_scope`
- `report_plans.filter_rule_scope`
- `operation_logs.operation_detail`

以下字段用逗号分隔字符串存数组：
- `link_relation_types.source_object_types`
- `link_relation_types.target_object_types`
- `report_plans.filter_exclude_relation_type_ids`

应用层负责 JSON 序列化/反序列化和校验。

### 4.3 无外键

DDL 中不创建物理外键约束。表间关联通过字段命名和程序逻辑保证。

### 4.4 软删除过滤

有软删除的业务表查询默认需要加：
```sql
WHERE deleted_at IS NULL
```

`operation_logs` 和 `link_change_logs` 不软删除，不需要该过滤。

### 4.5 部门字段统一

- 所有业务表中的部门字段统一命名为 `dept_id`
- 需要层级权限的表加 `dept_id_path`，长度 `varchar(50)`

---

## 五、与现有代码的映射

### 5.1 从 localStorage 迁移

React demo 中的 localStorage key 前缀为 `kgv2-`，迁移到 MySQL 时：
- 指标树节点 → `indicator_tree_nodes`
- 指标-树节点关系 → `indicator_tree_node_indicators`
- 指标 → `indicators`
- 指标属性 → `indicator_attributes`
- 标签分类 → `tag_categories`
- 标签 → `tags`
- 标签分类树 → `tag_categories`（自引用 `parent_id`）
- 规则分类 → `rule_categories`
- 规则 → `rules`
- 指标-标签关系 → `indicator_tags`
- 指标-规则关系 → `indicator_rules` + `rule_parameters`
- 血缘关系 → `link_relations`

### 5.2 从 v1 运行时数据迁移

v1 的 5 张分表迁移到 `indicator_values`：
```sql
INSERT INTO indicator_values (
  indicator_code, indicator_name, data_model_col_type, data_time,
  indicator_value, indicator_type, created_time, updated_time,
  sub_org_name, sub_org_id, substation, substation_id,
  index_sole, type, granularity, dept_id, dept_id_path,
  status, created_by, updated_by
)
SELECT
  index_data_code, index_data_name, data_model_col_type, data_time,
  index_value, index_type, NOW(), NOW(),
  sub_org_name, sub_org_id, substation, substation_id,
  index_sole, type, 'day', :deptId, :deptIdPath,
  1, 'system', 'system'
FROM index_day_data;
```

对其他粒度表类似，只需修改 `granularity` 值。

---

## 六、使用说明

### 6.1 执行建表脚本

```bash
mysql -u your_user -p your_database < sql/kgv2_schema.sql
```

### 6.2 初始化基础数据

首次部署时至少需要初始化：
- 基础的血缘关系类型（依赖、因果、聚合）
- 基础的规则分类
- 基础的标签分类

部门数据不初始化，直接从大屏接口获取。

### 6.3 验证兼容性

由于本地无 MySQL 5.7.2.1 环境，建议在目标数据库执行后检查：
- 所有表是否成功创建
- 索引长度是否超过 767 字节限制
- `utf8mb4` 字符集是否正确
- 无外键约束

---

## 七、待后续补充

- 知识库模块表（`knowledge_documents` 等）
- 评论模块表（`comments` 等）
- 初始化数据脚本
- 从 localStorage / v1 到 v2 的迁移脚本
