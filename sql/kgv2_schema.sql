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
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  KEY `idx_indicator_values_code_gran_time` (`indicator_code`,`granularity`,`data_time`),
  KEY `idx_indicator_values_data_time` (`data_time`),
  KEY `idx_indicator_values_granularity` (`granularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='运行时指标数值表';

-- --------------------------------------------------------
-- 2. 指标表
-- 核心字段；业务属性放 indicator_attributes 键值对表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicators`;
CREATE TABLE `indicators` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '指标ID',
  `code` VARCHAR(191) NOT NULL COMMENT '指标编码',
  `name` VARCHAR(191) NOT NULL COMMENT '指标名称',
  `tree_parent_id` BIGINT(20) DEFAULT NULL COMMENT '指标树父节点ID（自引用，关联 indicators.id）',
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
  KEY `idx_indicators_dept_id` (`dept_id`),
  KEY `idx_indicators_tree_parent_id` (`tree_parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标表';

-- --------------------------------------------------------
-- 3. 指标业务属性表
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
-- 4. 标签表
-- 邻接表自引用树，按部门隔离
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(191) NOT NULL COMMENT '标签名称',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '标签颜色hex',
  `parent_id` BIGINT(20) DEFAULT NULL COMMENT '父标签ID（自引用，关联 tags.id）',
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
  KEY `idx_tags_dept_id` (`dept_id`),
  KEY `idx_tags_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- --------------------------------------------------------
-- 5. 规则表
-- 全局共享，自引用规则继承树
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rules`;
CREATE TABLE `rules` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `code` VARCHAR(191) NOT NULL COMMENT '规则编码',
  `name` VARCHAR(191) NOT NULL COMMENT '规则名称',
  `category` VARCHAR(500) DEFAULT NULL COMMENT '分类路径：异常规则 > 指标预警 > 阈值上下限',
  `type` VARCHAR(50) DEFAULT NULL COMMENT '规则类型：阈值/波动/TOPN/异常检测/复合',
  `param_summary` TEXT COMMENT '参数JSON Schema字符串',
  `parent_rule_id` BIGINT(20) DEFAULT NULL COMMENT '父规则ID（规则继承树，关联 rules.id）',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rules_code` (`code`),
  KEY `idx_rules_parent_rule_id` (`parent_rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规则表';

-- --------------------------------------------------------
-- 6. 指标-标签关联表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_tags`;
CREATE TABLE `indicator_tags` (
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `tag_id` BIGINT(20) NOT NULL COMMENT '标签ID（关联 tags.id）',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`indicator_id`,`tag_id`),
  KEY `idx_indicator_tags_tag_id` (`tag_id`),
  KEY `idx_indicator_tags_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标-标签关联表';

-- --------------------------------------------------------
-- 7. 指标-规则关联表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `indicator_rules`;
CREATE TABLE `indicator_rules` (
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `rule_id` BIGINT(20) NOT NULL COMMENT '规则ID（关联 rules.id）',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`indicator_id`,`rule_id`),
  KEY `idx_indicator_rules_rule_id` (`rule_id`),
  KEY `idx_indicator_rules_indicator_id` (`indicator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='指标-规则关联表';

-- --------------------------------------------------------
-- 8. 规则参数实例表
-- 同一规则被不同指标挂靠后，参数值独立
-- --------------------------------------------------------
DROP TABLE IF EXISTS `rule_parameters`;
CREATE TABLE `rule_parameters` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '参数ID',
  `rule_id` BIGINT(20) NOT NULL COMMENT '规则ID（关联 rules.id）',
  `indicator_id` BIGINT(20) NOT NULL COMMENT '指标ID（关联 indicators.id）',
  `param_values` TEXT NOT NULL COMMENT '参数值JSON字符串',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
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
-- 9. 血缘关系类型表
-- 全局共享的元数据
-- --------------------------------------------------------
DROP TABLE IF EXISTS `link_relation_types`;
CREATE TABLE `link_relation_types` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '关系类型ID',
  `code` VARCHAR(191) NOT NULL COMMENT '关系类型编码',
  `name` VARCHAR(191) NOT NULL COMMENT '关系类型名称：依赖/因果/聚合',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '连线颜色',
  `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标名称',
  `source_object_type` VARCHAR(50) DEFAULT NULL COMMENT '源对象类型限制',
  `target_object_type` VARCHAR(50) DEFAULT NULL COMMENT '目标对象类型限制',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
  `created_time` DATETIME DEFAULT NULL COMMENT '创建时间',
  `updated_time` DATETIME DEFAULT NULL COMMENT '更新时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  `updated_by` VARCHAR(50) NOT NULL COMMENT '修改人',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '系统备注',
  `deleted_at` DATETIME DEFAULT NULL COMMENT '软删除时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_link_relation_types_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血缘关系类型表';

-- --------------------------------------------------------
-- 10. 血缘关系实例表
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
  `relation_type_id` BIGINT(20) NOT NULL COMMENT '关联关系类型ID（关联 link_relation_types.id）',
  `direction` TINYINT(4) DEFAULT 1 COMMENT '方向：1-有向 2-无向',
  `source_type` VARCHAR(50) DEFAULT NULL COMMENT '源对象类型：指标/虚拟分组/外部因素',
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
-- 11. 血缘关系变更日志表
-- 物理保留，不软删除
-- --------------------------------------------------------
DROP TABLE IF EXISTS `link_change_logs`;
CREATE TABLE `link_change_logs` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `relation_id` BIGINT(20) NOT NULL COMMENT '关联关系ID（关联 link_relations.id）',
  `action` TINYINT(4) NOT NULL COMMENT '操作类型：1-创建 2-更新 3-删除',
  `operator` VARCHAR(100) NOT NULL COMMENT '操作人',
  `changes` TEXT COMMENT '变更内容JSON：{ field: { old, new } }',
  `created_time` DATETIME DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_link_change_logs_relation_id` (`relation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='血缘关系变更日志表';

-- --------------------------------------------------------
-- 12. AI 推荐关系表
-- 按部门隔离，管理员可看全部
-- --------------------------------------------------------
DROP TABLE IF EXISTS `ai_recommendations`;
CREATE TABLE `ai_recommendations` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '推荐ID',
  `source_id` BIGINT(20) NOT NULL COMMENT '源指标ID（关联 indicators.id）',
  `target_id` BIGINT(20) NOT NULL COMMENT '目标指标ID（关联 indicators.id）',
  `relation_type_id` BIGINT(20) NOT NULL COMMENT '关联关系类型ID（关联 link_relation_types.id）',
  `dept_id` BIGINT(20) NOT NULL COMMENT '推荐接收部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '推荐接收部门ID层级路径，如 1_5',
  `source_dept_id` BIGINT(20) NOT NULL COMMENT '来源指标部门ID（冗余）',
  `source_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '来源指标部门ID层级路径（冗余）',
  `target_dept_id` BIGINT(20) NOT NULL COMMENT '目标指标部门ID（冗余）',
  `target_dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '目标指标部门ID层级路径（冗余）',
  `confidence` DECIMAL(5,4) NOT NULL COMMENT '置信度 0.0000-1.0000',
  `reason` TEXT COMMENT '推荐理由',
  `applied` TINYINT(1) DEFAULT '0' COMMENT '是否已应用：0-否 1-是',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
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
-- 13. 报告模板表
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
  `enabled` TINYINT(1) DEFAULT '1' COMMENT '是否启用：0-否 1-是',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
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
-- 14. 报告模板章节表
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_template_sections`;
CREATE TABLE `report_template_sections` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '章节ID',
  `template_id` BIGINT(20) NOT NULL COMMENT '模板ID（关联 report_templates.id）',
  `title` VARCHAR(191) NOT NULL COMMENT '章节标题',
  `content` TEXT COMMENT '章节内容/提示词',
  `sort_order` INT(11) DEFAULT '0' COMMENT '排序序号',
  `type` VARCHAR(50) DEFAULT 'text' COMMENT 'text/chart/table/ai',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
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
-- 15. 报告计划表
-- 部门隔离
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_plans`;
CREATE TABLE `report_plans` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '计划ID',
  `name` VARCHAR(191) NOT NULL COMMENT '计划名称',
  `schedule` VARCHAR(50) DEFAULT NULL COMMENT '调度周期：daily/weekly/monthly',
  `auto_schedule` TINYINT(1) DEFAULT '0' COMMENT '是否自动调度：0-否 1-是',
  `description` TEXT COMMENT '描述',
  `filter_scope` TEXT COMMENT '筛选范围JSON：{ indicatorIds, departmentIds, ruleIds }',
  `template_id` BIGINT(20) DEFAULT NULL COMMENT '关联模板ID（关联 report_templates.id）',
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
-- 16. 生成的报告档案表
-- 报告实例（档案），created_time 即 v1 生成时间
-- --------------------------------------------------------
DROP TABLE IF EXISTS `generated_reports`;
CREATE TABLE `generated_reports` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '报告ID',
  `plan_id` BIGINT(20) NOT NULL COMMENT '关联报告计划ID（关联 report_plans.id）',
  `template_id` BIGINT(20) DEFAULT NULL COMMENT '生成时使用的模板ID（关联 report_templates.id）',
  `title` VARCHAR(191) NOT NULL COMMENT '报告标题',
  `latest_version` INT(11) DEFAULT '0' COMMENT '当前最新版本号',
  `dept_id` BIGINT(20) NOT NULL COMMENT '部门ID',
  `dept_id_path` VARCHAR(50) DEFAULT NULL COMMENT '部门ID层级路径，如 1_5',
  `status` TINYINT(4) DEFAULT NULL COMMENT '状态',
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
-- 17. 报告版本表
-- 每次"重新跑"生成一条版本记录
-- --------------------------------------------------------
DROP TABLE IF EXISTS `report_versions`;
CREATE TABLE `report_versions` (
  `id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '版本ID',
  `report_id` BIGINT(20) NOT NULL COMMENT '关联报告档案ID（关联 generated_reports.id）',
  `version` INT(11) NOT NULL COMMENT '版本号：1,2,3...',
  `trigger_type` TINYINT(4) DEFAULT 1 COMMENT '触发方式：1-手动 2-自动',
  `file_path` VARCHAR(500) NOT NULL COMMENT 'HTML文件相对路径',
  `file_size` BIGINT(20) DEFAULT NULL COMMENT '文件大小字节',
  `filter_scope` TEXT COMMENT '本次生成时的筛选范围JSON',
  `divergence_analysis_path` VARCHAR(500) DEFAULT NULL COMMENT '发散分析HTML文件路径',
  `created_time` DATETIME DEFAULT NULL COMMENT '生成时间',
  `created_by` VARCHAR(50) NOT NULL COMMENT '创建人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_report_versions_report_version` (`report_id`,`version`),
  KEY `idx_report_versions_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报告版本表';

-- --------------------------------------------------------
-- 18. 操作日志表
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
