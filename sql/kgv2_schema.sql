-- ========================================================
-- 数据指标知识图谱管理平台 v2 — MySQL 5.7.2.1 数据库结构
-- 目标：Vue3 重构版本
-- 字符集：utf8mb4
-- 注意：
--   1. MySQL 5.7.2.1 不支持 JSON 类型，JSON 数据使用 TEXT 存储
--   2. 本脚本不创建物理外键，表间关联通过程序控制
--   3. 用户/部门信息通过大屏接口获取，缓存到 Redis，不建用户表/部门表
--   4. 通用字段规范：
--      status tinyint(4) DEFAULT NULL COMMENT '状态'
--      created_time datetime DEFAULT NULL COMMENT '创建时间'
--      updated_time datetime DEFAULT NULL COMMENT '更新时间'
--      created_by varchar(50) NOT NULL COMMENT '创建人'
--      updated_by varchar(50) NOT NULL COMMENT '修改人'
--      remark varchar(200) DEFAULT NULL COMMENT '系统备注'
--      deleted_at datetime DEFAULT NULL COMMENT '软删除时间'（有软删除的表）
-- ========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. 运行时指标数值表
-- 合并 v1 的 index_day_data / index_month_data / index_week_data / index_minute_data / index_year_data
-- 保留 v1 业务字段，时间字段统一为 datetime 类型的 created_time / updated_time
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_values`;
CREATE TABLE `indicator_values` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `indicator_code` VARCHAR(100) NOT NULL COMMENT '指标编码',
  `indicator_name` VARCHAR(100) DEFAULT NULL COMMENT '指标名称',
  `data_model_col_type` VARCHAR(100) DEFAULT NULL COMMENT '数据模型列类型',
  `data_time` VARCHAR(100) NOT NULL COMMENT '数据时间',
  `indicator_value` VARCHAR(100) DEFAULT NULL COMMENT '指标项的值',
  `indicator_type` VARCHAR(100) DEFAULT NULL COMMENT '指标分类',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `sub_org_name` VARCHAR(100) DEFAULT NULL COMMENT '子组织名称',
  `sub_org_id` INT(11) DEFAULT NULL COMMENT '子组织ID',
  `substation` VARCHAR(200) DEFAULT NULL COMMENT '站点',
  `substation_id` INT(11) DEFAULT NULL COMMENT '站点ID',
  `index_sole` VARCHAR(300) DEFAULT NULL COMMENT '唯一性字段',
  `type` VARCHAR(200) DEFAULT NULL COMMENT '类型',
  `granularity` VARCHAR(20) NOT NULL COMMENT '粒度：minute/hour/day/week/month/year',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `status` TINYINT(4) DEFAULT 1 COMMENT '状态：1-启用（按Cron自动执行） 0-禁用（可手动生成）',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_indicator_values_code_gran_time` (`indicator_code`,`granularity`,`data_time`),
  KEY `idx_indicator_values_data_time` (`data_time`),
  KEY `idx_indicator_values_granularity` (`granularity`),
  KEY `idx_indicator_values_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运行时指标数值表';

-- --------------------------------------------------------
-- 2. 指标树节点表
-- 指标树与指标分离，树节点自引用
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_tree_nodes`;
CREATE TABLE `indicator_tree_nodes` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '树节点ID',
  `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父节点ID（自引用，关联 indicator_tree_nodes.id）',
  `name` VARCHAR(191) NOT NULL COMMENT '节点名称',
  `node_type` TINYINT(4) DEFAULT 1 COMMENT '节点类型：1-虚拟分组 2-部门根节点',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_indicator_tree_nodes_parent_id` (`parent_id`),
  KEY `idx_indicator_tree_nodes_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标树节点表';

-- --------------------------------------------------------
-- 3. 指标树节点与指标关联表
-- 一个指标可以挂到多个树节点，程序限制最多2个（本部门+NOC）
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_tree_node_indicators`;
CREATE TABLE `indicator_tree_node_indicators` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `tree_node_id` BIGINT(20) NOT NULL COMMENT '树节点ID（关联 indicator_tree_nodes.id）',
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_indicator_tree_node_indicators` (`tree_node_id`,`indicator_id`),
  KEY `idx_indicator_tree_node_indicators_tree_node_id` (`tree_node_id`),
  KEY `idx_indicator_tree_node_indicators_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标树节点与指标关联表';

-- --------------------------------------------------------
-- 4. 指标表
-- 纯业务指标，不再包含树结构
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicators`;
CREATE TABLE `indicators` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '指标ID',
  `code` VARCHAR(191) NOT NULL COMMENT '指标编码',
  `name` VARCHAR(191) NOT NULL COMMENT '指标名称',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `indicator_type` TINYINT(4) DEFAULT 1 COMMENT '指标类型：1-普通指标 2-虚拟分组',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_indicators_code` (`code`),
  KEY `idx_indicators_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标表';

-- --------------------------------------------------------
-- 5. 指标业务属性表
-- 存储 Excel 中的业务属性（一级、二级、颗粒度等）
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_attributes`;
CREATE TABLE `indicator_attributes` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '属性ID',
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `attr_key` VARCHAR(100) NOT NULL COMMENT '属性编码：level1/level2/granularity/...',
  `attr_value` VARCHAR(500) DEFAULT NULL COMMENT '属性值',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_indicator_attributes_indicator_key` (`indicator_id`,`attr_key`),
  KEY `idx_indicator_attributes_key_value` (`attr_key`,`attr_value`),
  KEY `idx_indicator_attributes_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标业务属性表';

-- --------------------------------------------------------
-- 6. 标签分类树表
-- 标签分类树，自引用，支持无限层级，按部门隔离
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tag_categories`;
CREATE TABLE `tag_categories` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父分类ID（自引用，关联 tag_categories.id），支持无限层级',
  `name` VARCHAR(191) NOT NULL COMMENT '分类名称',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_tag_categories_dept_id` (`dept_id`),
  KEY `idx_tag_categories_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签分类树表';

-- --------------------------------------------------------
-- 7. 标签表
-- 标签实体，必须归属一个分类
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(191) NOT NULL COMMENT '标签名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '标签颜色hex',
  `category_id` BIGINT(20) NOT NULL COMMENT '标签分类树ID（关联 tag_categories.id）',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_tags_category_id` (`category_id`),
  KEY `idx_tags_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- --------------------------------------------------------
-- 7. 规则分类树表
-- 全局共享，自引用规则继承树
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rule_categories`;
CREATE TABLE `rule_categories` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父分类ID（自引用，关联 rule_categories.id），支持无限层级',
  `name` VARCHAR(191) NOT NULL COMMENT '分类名称',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_rule_categories_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则分类树表';

-- --------------------------------------------------------
-- 8. 规则实体表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rules`;
CREATE TABLE `rules` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `code` VARCHAR(191) NOT NULL COMMENT '规则编码',
  `name` VARCHAR(191) NOT NULL COMMENT '规则名称',
  `rule_category_id` BIGINT(20) DEFAULT NULL COMMENT '规则分类ID（绑定规则树父节点）',
  `param_summary` TEXT COMMENT '参数JSON Schema字符串',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rules_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则实体表';

-- --------------------------------------------------------
-- 8. 指标-标签关联表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_tags`;
CREATE TABLE `indicator_tags` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `tag_id` BIGINT(20) NOT NULL COMMENT '标签ID（关联 tags.id）',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_indicator_tags` (`indicator_id`,`tag_id`),
  KEY `idx_indicator_tags_tag_id` (`tag_id`),
  KEY `idx_indicator_tags_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标-标签关联表';

-- --------------------------------------------------------
-- 9. 指标-规则关联表
-- 状态放在这里，表示某指标是否启用某规则
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_rules`;
CREATE TABLE `indicator_rules` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `rule_id` BIGINT(20) NOT NULL COMMENT '规则ID（关联 rules.id）',
  `status` TINYINT(4) DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_indicator_rules` (`indicator_id`,`rule_id`),
  KEY `idx_indicator_rules_rule_id` (`rule_id`),
  KEY `idx_indicator_rules_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标-规则关联表';

-- --------------------------------------------------------
-- 10. 规则参数实例表
-- 同一规则被不同指标挂靠后，参数值独立
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rule_parameters`;
CREATE TABLE `rule_parameters` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '参数ID',
  `rule_id` BIGINT(20) NOT NULL COMMENT '规则ID（关联 rules.id）',
  `indicator_id` BIGINT(20) DEFAULT NULL COMMENT '指标ID（关联 indicators.id），NULL 表示默认参数',
  `param_values` TEXT NOT NULL COMMENT '参数值JSON字符串',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rule_parameters_rule_indicator` (`rule_id`,`indicator_id`),
  KEY `idx_rule_parameters_rule_id` (`rule_id`),
  KEY `idx_rule_parameters_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则参数实例表';

-- --------------------------------------------------------
-- 11. 血缘关系类型表
-- 全局共享的元数据，direction 字段表示该关系类型是有向还是无向
-- --------------------------------------------------------
DROP TABLE IF EXISTS `link_relation_types`;
CREATE TABLE `link_relation_types` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT '关系类型编码，如 LKT-001',
  `code` VARCHAR(191) NOT NULL COMMENT '英文名，如 AGGREGATES',
  `name` VARCHAR(191) NOT NULL COMMENT '中文名，如 聚合关系',
  `description` TEXT COMMENT '描述',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '连线颜色',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标名称',
  `direction` TINYINT(4) DEFAULT 1 COMMENT '方向：1-有向 2-无向',
  `source_object_types` VARCHAR(500) DEFAULT NULL COMMENT '源对象类型列表，逗号分隔：指标,虚拟分组,外部因素',
  `target_object_types` VARCHAR(500) DEFAULT NULL COMMENT '目标对象类型列表，逗号分隔',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  UNIQUE KEY `uk_link_relation_types_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血缘关系类型表';

-- --------------------------------------------------------
-- 12. 血缘关系实例表
-- 表结构支持多种权限策略：
--   1. 源和目标都是自己部门：source_dept_id = :dept AND target_dept_id = :dept
--   2. 源或目标有一个是自己部门：source_dept_id = :dept OR target_dept_id = :dept
--   3. 管理员看全部：不加部门过滤
-- 表间关联通过程序控制
-- --------------------------------------------------------
DROP TABLE IF EXISTS `link_relations`;
CREATE TABLE `link_relations` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关系ID',
  `source_id` BIGINT(20) NOT NULL COMMENT '源指标ID（关联 indicators.id）',
  `target_id` BIGINT(20) NOT NULL COMMENT '目标指标ID（关联 indicators.id）',
  `source_dept_id` BIGINT(20) NOT NULL COMMENT '源指标所属部门ID（冗余）',
  `source_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '源指标部门ID层级路径（冗余），如 1_5',
  `target_dept_id` BIGINT(20) NOT NULL COMMENT '目标指标所属部门ID（冗余）',
  `target_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '目标指标部门ID层级路径（冗余），如 1_5',
  `relation_type_id` VARCHAR(50) NOT NULL COMMENT '关联关系类型ID（关联 link_relation_types.id）',
  `correlation` TINYINT(4) DEFAULT NULL COMMENT '正/负相关：1-正相关 2-负相关 3-无',
  `confidence` DECIMAL(5,4) DEFAULT NULL COMMENT '置信度 0.0000-1.0000',
  -- `source_type` VARCHAR(50) DEFAULT NULL COMMENT '源对象类型：指标/虚拟分组/外部因素',
  `description` TEXT COMMENT '关系描述',
  `last_modified_by` VARCHAR(100) DEFAULT NULL COMMENT '最后改动者：AI或人类姓名',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_link_relations_source_id` (`source_id`),
  KEY `idx_link_relations_target_id` (`target_id`),
  KEY `idx_link_relations_type_id` (`relation_type_id`),
  KEY `idx_link_relations_source_dept` (`source_dept_id`),
  KEY `idx_link_relations_target_dept` (`target_dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血缘关系实例表';

-- --------------------------------------------------------
-- 13. 血缘关系变更日志表
-- 物理保留，不软删除
-- 冗余变更前后字段及名称，支持按旧/新源/目标指标筛选
-- --------------------------------------------------------
DROP TABLE IF EXISTS `link_change_logs`;
CREATE TABLE `link_change_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `relation_id` BIGINT(20) NOT NULL COMMENT '关联关系ID（关联 link_relations.id）',
  `action` TINYINT(4) NOT NULL COMMENT '操作类型：1-创建 2-更新 3-删除',
  `old_source_id` BIGINT(20) DEFAULT NULL COMMENT '变更前源指标ID（冗余）',
  `old_source_name` VARCHAR(191) DEFAULT NULL COMMENT '变更前源指标名称（冗余）',
  `old_target_id` BIGINT(20) DEFAULT NULL COMMENT '变更前目标指标ID（冗余）',
  `old_target_name` VARCHAR(191) DEFAULT NULL COMMENT '变更前目标指标名称（冗余）',
  `old_relation_type_id` VARCHAR(50) DEFAULT NULL COMMENT '变更前关系类型ID（冗余）',
  `old_relation_type_name` VARCHAR(191) DEFAULT NULL COMMENT '变更前关系类型名称（冗余）',
  `new_source_id` BIGINT(20) DEFAULT NULL COMMENT '变更后源指标ID（冗余）',
  `new_source_name` VARCHAR(191) DEFAULT NULL COMMENT '变更后源指标名称（冗余）',
  `new_target_id` BIGINT(20) DEFAULT NULL COMMENT '变更后目标指标ID（冗余）',
  `new_target_name` VARCHAR(191) DEFAULT NULL COMMENT '变更后目标指标名称（冗余）',
  `new_relation_type_id` VARCHAR(50) DEFAULT NULL COMMENT '变更后关系类型ID（冗余）',
  `new_relation_type_name` VARCHAR(191) DEFAULT NULL COMMENT '变更后关系类型名称（冗余）',
  `source_type` TINYINT(4) DEFAULT 1 COMMENT '变更来源：1-人类 2-AI',
  `operator` VARCHAR(100) NOT NULL COMMENT '操作人',
  `created_time` DATETIME DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_link_change_logs_relation_id` (`relation_id`),
  KEY `idx_link_change_logs_old_source_id` (`old_source_id`),
  KEY `idx_link_change_logs_new_source_id` (`new_source_id`),
  KEY `idx_link_change_logs_old_target_id` (`old_target_id`),
  KEY `idx_link_change_logs_new_target_id` (`new_target_id`),
  KEY `idx_link_change_logs_old_relation_type_id` (`old_relation_type_id`),
  KEY `idx_link_change_logs_new_relation_type_id` (`new_relation_type_id`),
  KEY `idx_link_change_logs_source_type` (`source_type`),
  KEY `idx_link_change_logs_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血缘关系变更日志表';

-- --------------------------------------------------------
-- 14. AI 推荐关系表
-- 按部门隔离，管理员可看全部
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ai_recommendations`;
CREATE TABLE `ai_recommendations` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `source_id` BIGINT(20) NOT NULL COMMENT '源指标ID（关联 indicators.id）',
  `target_id` BIGINT(20) NOT NULL COMMENT '目标指标ID（关联 indicators.id）',
  `relation_type_id` VARCHAR(50) NOT NULL COMMENT '关联关系类型ID（关联 link_relation_types.id）',
  `dept_id` BIGINT(20) NOT NULL COMMENT '推荐接收部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '推荐接收部门ID层级路径，如 1_5',
  `source_dept_id` BIGINT(20) NOT NULL COMMENT '来源指标部门ID（冗余）',
  `source_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '来源指标部门ID层级路径（冗余）',
  `target_dept_id` BIGINT(20) NOT NULL COMMENT '目标指标部门ID（冗余）',
  `target_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '目标指标部门ID层级路径（冗余）',
  `confidence` DECIMAL(5,4) NOT NULL COMMENT '置信度 0.0000-1.0000',
  `reason` TEXT COMMENT '推荐理由',
  `applied` TINYINT(1) DEFAULT '0' COMMENT '是否已应用：0-否 1-是',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_ai_recommendations_dept_id` (`dept_id`),
  KEY `idx_ai_recommendations_source_id` (`source_id`),
  KEY `idx_ai_recommendations_target_id` (`target_id`),
  KEY `idx_ai_recommendations_relation_type_id` (`relation_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI推荐关系表';

-- --------------------------------------------------------
-- 15. 报告模板表
-- 部门隔离；NOC部门的模板对所有部门可见（作为全局模板）
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_templates`;
CREATE TABLE `report_templates` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `name` VARCHAR(191) NOT NULL COMMENT '模板名称',
  `description` TEXT COMMENT '描述',
  `style_guide` TEXT COMMENT '排版风格描述',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID，NOC部门=全局模板',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `usage_count` INT(11) DEFAULT '0' COMMENT '使用次数',
  `enabled` TINYINT(1) DEFAULT '1' COMMENT '是否启用：0-否 1-是',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_report_templates_dept_id` (`dept_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告模板表';

-- --------------------------------------------------------
-- 16. 报告模板章节表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_template_sections`;
CREATE TABLE `report_template_sections` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '章节ID',
  `template_id` BIGINT(20) NOT NULL COMMENT '模板ID（关联 report_templates.id）',
  `title` VARCHAR(191) NOT NULL COMMENT '章节标题',
  `content` TEXT COMMENT '章节内容/提示词',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序序号',
  `type` VARCHAR(50) DEFAULT 'text' COMMENT 'text/chart/table/ai',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_report_template_sections_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告模板章节表';

-- --------------------------------------------------------
-- 17. 报告计划表
-- 部门隔离
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_plans`;
CREATE TABLE `report_plans` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '计划ID',
  `name` VARCHAR(191) NOT NULL COMMENT '计划名称',
  `cron_expression` VARCHAR(100) DEFAULT NULL COMMENT 'Cron 表达式，如 0 0 1 * * ?',
  `description` TEXT COMMENT '描述',
  `filter_indicator_tree_scope` TEXT COMMENT '指标树范围JSON',
  `filter_tag_scope` TEXT COMMENT '标签范围JSON',
  `filter_rule_scope` TEXT COMMENT '规则范围JSON',
  `filter_exclude_relation_type_ids` VARCHAR(1000) COMMENT '剔除关联关系类型ID列表，逗号分隔',
  `template_id` BIGINT(20) DEFAULT NULL COMMENT '关联模板ID（关联 report_templates.id）',
  `enable_divergence_analysis` TINYINT(1) DEFAULT '0' COMMENT '是否启用发散分析：0-否 1-是',
  `divergence_analysis_prompt` TEXT COMMENT '发散分析提示词',
  `latest_version` INT(11) DEFAULT '0' COMMENT '最新版本号',
  `last_generated_at` DATETIME DEFAULT NULL COMMENT '最后生成时间',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_report_plans_dept_id` (`dept_id`),
  KEY `idx_report_plans_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告计划表';

-- --------------------------------------------------------
-- 18. 生成的报告档案表
-- 报告实例（档案），created_time 即 v1 生成时间
-- --------------------------------------------------------
DROP TABLE IF EXISTS `generated_reports`;
CREATE TABLE `generated_reports` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '报告ID',
  `plan_id` BIGINT(20) NOT NULL COMMENT '关联报告计划ID（关联 report_plans.id）',
  `template_id` BIGINT(20) DEFAULT NULL COMMENT '生成时使用的模板ID（关联 report_templates.id）',
  `title` VARCHAR(191) NOT NULL COMMENT '报告标题',
  `latest_version` INT(11) DEFAULT '0' COMMENT '当前最新版本号',
  `filter_indicator_tree_scope` TEXT COMMENT '指标树范围JSON快照',
  `filter_tag_scope` TEXT COMMENT '标签范围JSON快照',
  `filter_rule_scope` TEXT COMMENT '规则范围JSON快照',
  `filter_exclude_relation_type_ids` VARCHAR(1000) COMMENT '剔除关联关系类型ID列表快照，逗号分隔',
  `enable_divergence_analysis` TINYINT(1) DEFAULT '0' COMMENT '是否启用发散分析快照',
  `divergence_analysis_prompt` TEXT COMMENT '发散分析提示词快照',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  -- `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间（即v1生成时间）',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_generated_reports_plan_id` (`plan_id`),
  KEY `idx_generated_reports_dept_id` (`dept_id`),
  KEY `idx_generated_reports_template_id` (`template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生成的报告档案表';

-- --------------------------------------------------------
-- 19. 报告版本表
-- 每次"重新跑"生成一条版本记录
-- 发散分析结果合并到主报告 HTML 文件中，不单独存储
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_versions`;
CREATE TABLE `report_versions` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '版本ID',
  `report_id` BIGINT(20) NOT NULL COMMENT '关联报告档案ID（关联 generated_reports.id）',
  `version` INT(11) NOT NULL COMMENT '版本号：1,2,3...',
  `trigger_type` TINYINT(4) DEFAULT 1 COMMENT '触发方式：1-手动 2-自动',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'HTML文件相对路径（包含发散分析结果）',
  `file_size` BIGINT(20) DEFAULT NULL COMMENT '文件大小字节',
  `created_time` DATETIME DEFAULT NULL COMMENT '生成时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_report_versions_report_version` (`report_id`,`version`),
  KEY `idx_report_versions_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告版本表';

-- --------------------------------------------------------
-- 20. 操作日志表
-- 记录关键操作，按部门隔离查询，物理保留
-- 不遵循通用字段规范，保持自身字段设计
-- --------------------------------------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `operation_type` VARCHAR(100) NOT NULL COMMENT '操作类型：CREATE_INDICATOR/DELETE_LINK/APPLY_AI_RECOMMEND/GENERATE_REPORT/...',
  `target_type` VARCHAR(100) DEFAULT NULL COMMENT '操作对象类型：indicator/rule/link_relation/report/...',
  `target_id` BIGINT(20) DEFAULT NULL COMMENT '操作对象ID',
  `operator_id` BIGINT(20) DEFAULT NULL COMMENT '操作人ID',
  `operator_name` VARCHAR(100) DEFAULT NULL COMMENT '操作人姓名',
  `dept_id` BIGINT(20) DEFAULT NULL COMMENT '操作人所属部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '操作人部门ID层级路径，如 1_5',
  `operation_detail` TEXT COMMENT '操作详情JSON',
  `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `created_time` DATETIME DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_operation_logs_operation_type` (`operation_type`),
  KEY `idx_operation_logs_target` (`target_type`,`target_id`),
  KEY `idx_operation_logs_dept_id` (`dept_id`),
  KEY `idx_operation_logs_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

SET FOREIGN_KEY_CHECKS = 1;
