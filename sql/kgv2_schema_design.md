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
- 落地分权分域：通过 `dept_id` 实现部门隔离，通过 `dept_id_path` 支持部门层级权限
- 用户/部门信息外置：通过大屏接口获取，缓存到 Redis，不建用户表/部门表
- 无物理外键：Java 程序要求通过程序控制关联关系

---

## 二、关键决策解释

### 2.1 为什么用 MySQL 5.7.2.1？

目标部署环境已确定为 MySQL 5.7.2.1。这带来以下限制：
- 没有原生 `JSON` 类型，JSON 数据用 `TEXT` 存储，应用层解析
- 没有函数索引、CTE、窗口函数等 8.0 特性
- `utf8mb4` 字符集下单个索引最大 767 字节，因此 UNIQUE 字段长度需 ≤ 191（191 × 4 = 764）

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

### 2.6 部门隔离怎么实现？

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
- `indicators`
- `indicator_attributes`
- `tags`
- `link_relations`（冗余 source_dept_id / target_dept_id）
- `ai_recommendations`
- `report_templates`
- `report_plans`
- `generated_reports`
- `operation_logs`

全局共享表不加 `dept_id`：
- `rules`
- `link_relation_types`

### 2.7 为什么指标表要拆成 `indicators` + `indicator_attributes`？

CONTEXT.md 中指标是"平表实体"，Excel 有多个业务属性列。直接做成宽表扩展性差，所以：
- `indicators` 只存核心字段（id, code, name, tree_parent_id, dept_id, indicator_type 等）
- `indicator_attributes` 用键值对存业务属性（level1, level2, granularity 等）

好处：
- 新增属性不改表结构
- 不同指标可有不同属性集合
- 可按属性键值建索引查询

### 2.8 为什么树形结构用邻接表？

指标树、标签树、规则树都使用 `parent_id` 自引用：
- 层级不深（通常 3-5 层）
- 前端树组件一次性加载后自己构建树
- 移动节点只需改 `parent_id`

### 2.9 血缘关系表如何支持多种权限策略？

`link_relations` 冗余存储了源/目标指标的部门信息：
- `source_dept_id` / `source_dept_id_path`
- `target_dept_id` / `target_dept_id_path`

这样程序可以灵活选择策略：

```sql
-- 策略 A：源和目标都是自己部门
WHERE source_dept_id = :dept AND target_dept_id = :dept;

-- 策略 B：源或目标有一个是自己部门
WHERE source_dept_id = :dept OR target_dept_id = :dept;

-- 策略 C：管理员看全部
-- 不加部门过滤

-- 策略 D：查本部门及子部门
WHERE source_dept_id_path LIKE CONCAT(:userDeptPath, '%')
   OR target_dept_id_path LIKE CONCAT(:userDeptPath, '%');
```

表结构不强制任何策略，由后端程序根据业务需求实现。

### 2.10 报告为什么要拆成 `generated_reports` + `report_versions`？

业务上：
- `generated_reports` 是**报告实例/档案**，代表一个持续存在的报告。`created_time` 即 v1 生成时间
- `report_versions` 是每次"重新跑"生成的结果，v1、v2、v3...

这样：
- 报告实例的标题、所属计划等元信息不变
- 每次执行只新增一条版本记录
- `generated_reports.latest_version` 冗余存储当前最新版本号，方便列表查询

### 2.11 报告文件为什么不存数据库？

报告正文是 HTML 文件，数据库只存相对路径：
- 文件内容可能很大，不适合放数据库字段
- 相对路径与域名解耦，本地/测试/生产环境用不同基础 URL
- 便于 CDN / 对象存储迁移

### 2.12 为什么运行时指标数据合并为单表？

v1 有 5 张分表：`index_day_data`、`index_month_data`、`index_week_data`、`index_minute_data`、`index_year_data`。

合并为 `indicator_values`：
- 结构重复，合并后维护简单
- 通过 `granularity` 字段区分粒度
- 查询跨粒度时不需要 UNION

保留 v1 业务字段原样，但时间字段统一为 `created_time` / `updated_time` datetime。

### 2.13 为什么放弃分区？

数据量不大，单表 + 复合索引足够。避免分区的维护复杂度。

### 2.14 为什么移除知识库和评论模块？

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
| `indicators` | 指标核心表 | `code`, `tree_parent_id`, `dept_id`, `dept_id_path`, `indicator_type` |
| `indicator_attributes` | 指标业务属性 | `indicator_id`, `attr_key`, `attr_value` |
| `tags` | 标签树 | `parent_id`, `dept_id`, `dept_id_path` |
| `rules` | 规则树 | `parent_rule_id`, `param_summary` |
| `indicator_tags` | 指标-标签关联 | `(indicator_id, tag_id)` |
| `indicator_rules` | 指标-规则关联 | `(indicator_id, rule_id)` |
| `rule_parameters` | 规则参数实例 | `(rule_id, indicator_id)`, `param_values` |

### 3.3 血缘关系

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `link_relation_types` | 关系类型 | `code`, `name`, `color`, `icon` |
| `link_relations` | 关系实例 | `source_id`, `target_id`, `source_dept_id`, `target_dept_id`, `relation_type_id`, `direction` |
| `link_change_logs` | 变更日志 | `relation_id`, `action`, `changes` |

### 3.4 AI 推荐

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `ai_recommendations` | AI 推荐关系 | `source_id`, `target_id`, `confidence`, `applied`, `dept_id` |

### 3.5 报告管理

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `report_templates` | 报告模板 | `dept_id`, `dept_id_path` |
| `report_template_sections` | 模板章节 | `template_id`, `sort_order`, `type` |
| `report_plans` | 报告计划 | `dept_id`, `dept_id_path`, `template_id`, `filter_scope` |
| `generated_reports` | 报告档案 | `plan_id`, `latest_version`, `dept_id`, `dept_id_path` |
| `report_versions` | 报告版本 | `report_id`, `version`, `file_path` |

### 3.6 运行时数据

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| `indicator_values` | 指标数值 | `indicator_code`, `granularity`, `data_time`, `indicator_value` |

---

## 四、重要约束

### 4.1 索引长度限制

MySQL 5.7.2.1 + utf8mb4 下（`innodb_large_prefix` 默认 OFF），InnoDB 索引键最大 767 字节。因此：
- UNIQUE 索引字段长度 ≤ 191
- 普通索引字段长度 ≤ 255

例如 `code` 字段如果加 UNIQUE，长度设为 191 而不是 255。

### 4.2 JSON 字段

以下字段用 `TEXT` 存 JSON 字符串：
- `rules.param_summary`
- `rule_parameters.param_values`
- `report_plans.filter_scope`
- `report_versions.filter_scope`
- `link_change_logs.changes`
- `operation_logs.operation_detail`

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
- 指标 → `indicators` + `indicator_attributes`
- 标签 → `tags`
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
  index_sole, type, granularity, status, created_by, updated_by
)
SELECT
  index_data_code, index_data_name, data_model_col_type, data_time,
  index_value, index_type, NOW(), NOW(),
  sub_org_name, sub_org_id, substation, substation_id,
  index_sole, type, 'day', 1, 'system', 'system'
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

部门数据不初始化，直接从大屏接口获取。

### 6.3 验证兼容性

由于本地无 MySQL 5.6 环境，建议在目标数据库执行后检查：
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
