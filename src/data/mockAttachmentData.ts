// Auto-generated from Excel: 指标定义（原始）（去除无用指标编码）.xlsx
// 11 departments with real 一级→二级→indicator tree hierarchy
export const MOCK_DATA_VERSION = 2
import type { Department, AttachmentUiState } from '@/utils/attachmentStorage'
import type { IndicatorAttachment, TagNode, Rule, RuleParameter } from '@/models/indicatorAttachmentModel'

export const mockDepartments: Department[] = [
  { id: 'dept-P2', name: 'P2' },
  { id: 'dept-业财中心', name: '业财中心' },
  { id: 'dept-云网运', name: '云网运' },
  { id: 'dept-客户服务部', name: '客户服务部' },
  { id: 'dept-客服部', name: '客服部' },
  { id: 'dept-市场部', name: '市场部' },
  { id: 'dept-政企群', name: '政企群' },
  { id: 'dept-财务部', name: '财务部' },
  { id: 'dept-资本中心', name: '资本中心' },
  { id: 'dept-运营NOC', name: '运营NOC' },
  { id: 'dept-采供中心', name: '采供中心' },
]

export function generateMockIndicators(departmentId: string): IndicatorAttachment[] {
  const deptName = mockDepartments.find(d => d.id === departmentId)?.name ?? ''
  const result: IndicatorAttachment[] = []
  switch (departmentId) {
    case 'dept-P2': {
      // ── 战略执行 ──
      result.push({
        id: 'dept-P2-l1-0', name: '战略执行', code: 'GROUP-dept-P2-l1-0',
        indicatorCode: '', indicatorDisplayName: '战略执行',
        indicatorShowName: '战略执行', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── L2 默认 ──
      const pendingNodeId = `${departmentId}-pending`
      result.push({
        id: pendingNodeId, name: '默认', code: `GROUP-${pendingNodeId}`,
        indicatorCode: '', indicatorDisplayName: '默认',
        indicatorShowName: '默认', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-l2-1', name: '队伍领先', code: 'GROUP-dept-P2-l2-1',
        indicatorCode: '', indicatorDisplayName: '队伍领先',
        indicatorShowName: '队伍领先', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-2', name: '月_人力_低效人员占比-BU客户代表', code: 'M_DXT_00003823',
        indicatorCode: 'M_DXT_00003823', indicatorDisplayName: '月_人力_低效人员占比-BU客户代表',
        indicatorShowName: '月_人力_低效人员占比-BU客户代表',
        indicatorType: '原子指标',
        level1: '战略执行', level2: '队伍领先',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: pendingNodeId, tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-3', name: '月_人力_费效相关性-客户经理', code: 'M_DXT_00003828',
        indicatorCode: 'M_DXT_00003828', indicatorDisplayName: '月_人力_费效相关性-客户经理',
        indicatorShowName: '月_人力_费效相关性-客户经理',
        indicatorType: '原子指标',
        level1: '战略执行', level2: '队伍领先',
        granularity: '全局/区局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: pendingNodeId, tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-4', name: '月_人力_费效相关性-社区装维', code: 'M_DXT_00003826',
        indicatorCode: 'M_DXT_00003826', indicatorDisplayName: '月_人力_费效相关性-社区装维',
        indicatorShowName: '月_人力_费效相关性-社区装维',
        indicatorType: '原子指标',
        level1: '战略执行', level2: '队伍领先',
        granularity: '全局/区局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-5', name: '月_人力_低效人员占比-BD客户代表', code: 'M_DXT_00003824',
        indicatorCode: 'M_DXT_00003824', indicatorDisplayName: '月_人力_低效人员占比-BD客户代表',
        indicatorShowName: '月_人力_低效人员占比-BD客户代表',
        indicatorType: '原子指标',
        level1: '战略执行', level2: '队伍领先',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 经营 ──
      result.push({
        id: 'dept-P2-l1-6', name: '经营', code: 'GROUP-dept-P2-l1-6',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-l2-7', name: '经营', code: 'GROUP-dept-P2-l2-7',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l1-6',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-8', name: '日_业务_固网终端整新库存数-IPTV机顶盒-区局', code: 'D_DXT_00004177',
        indicatorCode: 'D_DXT_00004177', indicatorDisplayName: '日_业务_固网终端整新库存数-IPTV机顶盒-区局',
        indicatorShowName: '日_业务_固网终端整新库存数-IPTV机顶盒-区局',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-9', name: '经营收入同比', code: 'M_DXT_00003829',
        indicatorCode: 'M_DXT_00003829', indicatorDisplayName: '经营收入同比',
        indicatorShowName: '经营收入同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-10', name: '月_营销_社区沙盘商机数', code: 'M_DXT_00003904',
        indicatorCode: 'M_DXT_00003904', indicatorDisplayName: '月_营销_社区沙盘商机数',
        indicatorShowName: '月_营销_社区沙盘商机数',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-11', name: '年_人力_云算工程师人数-区局', code: 'M_DXT_00003871',
        indicatorCode: 'M_DXT_00003871', indicatorDisplayName: '年_人力_云算工程师人数-区局',
        indicatorShowName: '年_人力_云算工程师人数-区局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '年',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-12', name: '年_人力_一线自交维团队人数-区局', code: 'M_DXT_00003868',
        indicatorCode: 'M_DXT_00003868', indicatorDisplayName: '年_人力_一线自交维团队人数-区局',
        indicatorShowName: '年_人力_一线自交维团队人数-区局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '年',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-13', name: '台阶收入（季度）环比', code: 'S_DXT_00003833',
        indicatorCode: 'S_DXT_00003833', indicatorDisplayName: '台阶收入（季度）环比',
        indicatorShowName: '台阶收入（季度）环比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-14', name: '月_营销沙盘_公客高套渗透率-区局合计环比', code: 'M_DXT_00004087',
        indicatorCode: 'M_DXT_00004087', indicatorDisplayName: '月_营销沙盘_公客高套渗透率-区局合计环比',
        indicatorShowName: '月_营销沙盘_公客高套渗透率-区局合计环比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-15', name: '月_业管报表_99+提值环比', code: 'M_DXT_00004180',
        indicatorCode: 'M_DXT_00004180', indicatorDisplayName: '月_业管报表_99+提值环比',
        indicatorShowName: '月_业管报表_99+提值环比',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-16', name: '公客极致融合渗透率环比', code: 'M_DXT_00003998',
        indicatorCode: 'M_DXT_00003998', indicatorDisplayName: '公客极致融合渗透率环比',
        indicatorShowName: '公客极致融合渗透率环比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-17', name: '日_业务_固网终端整新库存数-FTTR全光设备-区局', code: 'D_DXT_00004173',
        indicatorCode: 'D_DXT_00004173', indicatorDisplayName: '日_业务_固网终端整新库存数-FTTR全光设备-区局',
        indicatorShowName: '日_业务_固网终端整新库存数-FTTR全光设备-区局',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-18', name: '月_业务_天翼智屏新增-环比', code: 'M_DXT_00004168',
        indicatorCode: 'M_DXT_00004168', indicatorDisplayName: '月_业务_天翼智屏新增-环比',
        indicatorShowName: '月_业务_天翼智屏新增-环比',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-19', name: '月_抢盘体量相关性-区局', code: 'M_DXT_00003862',
        indicatorCode: 'M_DXT_00003862', indicatorDisplayName: '月_抢盘体量相关性-区局',
        indicatorShowName: '月_抢盘体量相关性-区局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-20', name: '年_人力_智企工程师人数-区局', code: 'Y_DXT_00003869',
        indicatorCode: 'Y_DXT_00003869', indicatorDisplayName: '年_人力_智企工程师人数-区局',
        indicatorShowName: '年_人力_智企工程师人数-区局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '年',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-21', name: '月_业务_区局维度核销旧终端比例-家庭网关', code: 'M_DXT_00004152',
        indicatorCode: 'M_DXT_00004152', indicatorDisplayName: '月_业务_区局维度核销旧终端比例-家庭网关',
        indicatorShowName: '月_业务_区局维度核销旧终端比例-家庭网关',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-22', name: '月_业管报表_高套新增环比', code: 'M_DXT_00004189',
        indicatorCode: 'M_DXT_00004189', indicatorDisplayName: '月_业管报表_高套新增环比',
        indicatorShowName: '月_业管报表_高套新增环比',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-23', name: '月_客服_36小时满意率-区局环比', code: 'M_DXT_00003841',
        indicatorCode: 'M_DXT_00003841', indicatorDisplayName: '月_客服_36小时满意率-区局环比',
        indicatorShowName: '月_客服_36小时满意率-区局环比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-24', name: '月_营销沙盘_公客家宽渗透率-区局环比', code: 'M_DXT_00004081',
        indicatorCode: 'M_DXT_00004081', indicatorDisplayName: '月_营销沙盘_公客家宽渗透率-区局环比',
        indicatorShowName: '月_营销沙盘_公客家宽渗透率-区局环比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-25', name: '日_业务_固网终端整新库存数-AI家产品终端-区局', code: 'D_DXT_00004179',
        indicatorCode: 'D_DXT_00004179', indicatorDisplayName: '日_业务_固网终端整新库存数-AI家产品终端-区局',
        indicatorShowName: '日_业务_固网终端整新库存数-AI家产品终端-区局',
        indicatorType: '派生指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-26', name: '月_客服_投诉总量', code: 'M_DXT_00004163',
        indicatorCode: 'M_DXT_00004163', indicatorDisplayName: '月_客服_投诉总量',
        indicatorShowName: '月_客服_投诉总量',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-27', name: '月_营销_社区沙盘商机转化率', code: 'M_DXT_00003906',
        indicatorCode: 'M_DXT_00003906', indicatorDisplayName: '月_营销_社区沙盘商机转化率',
        indicatorShowName: '月_营销_社区沙盘商机转化率',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-P2-ind-28', name: '月_光wifi新增量', code: 'M_DXT_00004165',
        indicatorCode: 'M_DXT_00004165', indicatorDisplayName: '月_光wifi新增量',
        indicatorShowName: '月_光wifi新增量',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局/区局', frequency: '月',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-P2-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-业财中心': {
      // ── 收入效能 ──
      result.push({
        id: 'dept-业财中心-l1-0', name: '收入效能', code: 'GROUP-dept-业财中心-l1-0',
        indicatorCode: '', indicatorDisplayName: '收入效能',
        indicatorShowName: '收入效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-l2-1', name: '效能', code: 'GROUP-dept-业财中心-l2-1',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-2', name: '小微ICT项目毛利率', code: 'M_DXT_00003887',
        indicatorCode: 'M_DXT_00003887', indicatorDisplayName: '小微ICT项目毛利率',
        indicatorShowName: '小微ICT项目毛利率',
        indicatorType: '原子指标',
        level1: '收入效能', level2: '效能',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 效能 ──
      result.push({
        id: 'dept-业财中心-l1-3', name: '效能', code: 'GROUP-dept-业财中心-l1-3',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-l2-4', name: '效能', code: 'GROUP-dept-业财中心-l2-4',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l1-3',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-5', name: '结算项目二工单分布', code: 'M_DXT_00004058',
        indicatorCode: 'M_DXT_00004058', indicatorDisplayName: '结算项目二工单分布',
        indicatorShowName: '结算项目二工单分布',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-6', name: '本年度累计料费同比', code: 'M_DXT_00004068',
        indicatorCode: 'M_DXT_00004068', indicatorDisplayName: '本年度累计料费同比',
        indicatorShowName: '本年度累计料费同比',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-7', name: '宽带平均单价-全局', code: 'M_DXT_00004052',
        indicatorCode: 'M_DXT_00004052', indicatorDisplayName: '宽带平均单价-全局',
        indicatorShowName: '宽带平均单价-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-8', name: '资金集中度考核指标', code: 'M_DXT_00004193',
        indicatorCode: 'M_DXT_00004193', indicatorDisplayName: '资金集中度考核指标',
        indicatorShowName: '资金集中度考核指标',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-9', name: '月_全局_项目状态未清账总额', code: 'M_DXT_00002536',
        indicatorCode: 'M_DXT_00002536', indicatorDisplayName: '月_全局_项目状态未清账总额',
        indicatorShowName: '月_全局_项目状态未清账总额',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '情况', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-10', name: '月_全局_项目已关闭未清账总额', code: 'M_DXT_00002535',
        indicatorCode: 'M_DXT_00002535', indicatorDisplayName: '月_全局_项目已关闭未清账总额',
        indicatorShowName: '月_全局_项目已关闭未清账总额',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-11', name: '退单率-区局', code: 'M_DXT_00004105',
        indicatorCode: 'M_DXT_00004105', indicatorDisplayName: '退单率-区局',
        indicatorShowName: '退单率-区局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-12', name: '本年度累计工料费同比', code: 'M_DXT_00004066',
        indicatorCode: 'M_DXT_00004066', indicatorDisplayName: '本年度累计工料费同比',
        indicatorShowName: '本年度累计工料费同比',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-13', name: '月_全局_项目收支进度差', code: 'M_DXT_00003853',
        indicatorCode: 'M_DXT_00003853', indicatorDisplayName: '月_全局_项目收支进度差',
        indicatorShowName: '月_全局_项目收支进度差',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-14', name: '实际与指导工价比-全局', code: 'M_DXT_00004043',
        indicatorCode: 'M_DXT_00004043', indicatorDisplayName: '实际与指导工价比-全局',
        indicatorShowName: '实际与指导工价比-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-15', name: '月_全局_月报账单数量', code: 'M_DXT_00003851',
        indicatorCode: 'M_DXT_00003851', indicatorDisplayName: '月_全局_月报账单数量',
        indicatorShowName: '月_全局_月报账单数量',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '条', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-4', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-l2-16', name: '基础业务', code: 'GROUP-dept-业财中心-l2-16',
        indicatorCode: '', indicatorDisplayName: '基础业务',
        indicatorShowName: '基础业务', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l1-3',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-17', name: '月_全局_旧终端单价（元/台）', code: 'M_DXT_00001877',
        indicatorCode: 'M_DXT_00001877', indicatorDisplayName: '月_全局_旧终端单价（元/台）',
        indicatorShowName: '月_全局_旧终端单价（元/台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-18', name: '月_区局_新终端单价（元/台）', code: 'M_DXT_00002570',
        indicatorCode: 'M_DXT_00002570', indicatorDisplayName: '月_区局_新终端单价（元/台）',
        indicatorShowName: '月_区局_新终端单价（元/台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '区局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-19', name: '月_支局_近三个月不活跃宽带用户数（户）', code: 'M_DXT_00002596',
        indicatorCode: 'M_DXT_00002596', indicatorDisplayName: '月_支局_近三个月不活跃宽带用户数（户）',
        indicatorShowName: '月_支局_近三个月不活跃宽带用户数（户）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '支局', frequency: '月',
        unit: '户', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-20', name: '月_全局_各套餐家庭网关核销数量（台）', code: 'M_DXT_00002584',
        indicatorCode: 'M_DXT_00002584', indicatorDisplayName: '月_全局_各套餐家庭网关核销数量（台）',
        indicatorShowName: '月_全局_各套餐家庭网关核销数量（台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '台', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-21', name: '月_支局_300M以下套餐使用新终端造成成本浪费（万元）', code: 'M_DXT_00002575',
        indicatorCode: 'M_DXT_00002575', indicatorDisplayName: '月_支局_300M以下套餐使用新终端造成成本浪费（万元）',
        indicatorShowName: '月_支局_300M以下套餐使用新终端造成成本浪费（万元）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '支局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-22', name: '月_全局_分终端大类核销旧终端比例', code: 'M_DXT_00001844',
        indicatorCode: 'M_DXT_00001844', indicatorDisplayName: '月_全局_分终端大类核销旧终端比例',
        indicatorShowName: '月_全局_分终端大类核销旧终端比例',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-23', name: '月_全局_分终端大类新终端单价（元/台）', code: 'M_DXT_00001845',
        indicatorCode: 'M_DXT_00001845', indicatorDisplayName: '月_全局_分终端大类新终端单价（元/台）',
        indicatorShowName: '月_全局_分终端大类新终端单价（元/台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-24', name: '月_支局_老旧小区客户高价值套餐比例（%）', code: 'M_DXT_00002625',
        indicatorCode: 'M_DXT_00002625', indicatorDisplayName: '月_支局_老旧小区客户高价值套餐比例（%）',
        indicatorShowName: '月_支局_老旧小区客户高价值套餐比例（%）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '支局/BU', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-25', name: '月_全局_分终端大类旧终端单价（元/台）', code: 'M_DXT_00001846',
        indicatorCode: 'M_DXT_00001846', indicatorDisplayName: '月_全局_分终端大类旧终端单价（元/台）',
        indicatorShowName: '月_全局_分终端大类旧终端单价（元/台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-26', name: '月_区局_老旧小区高价值终端和高价值套餐的供需差', code: 'M_DXT_00002631',
        indicatorCode: 'M_DXT_00002631', indicatorDisplayName: '月_区局_老旧小区高价值终端和高价值套餐的供需差',
        indicatorShowName: '月_区局_老旧小区高价值终端和高价值套餐的供需差',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-27', name: '月_支局_近三个月不活跃用户占比（%）', code: 'M_DXT_00002597',
        indicatorCode: 'M_DXT_00002597', indicatorDisplayName: '月_支局_近三个月不活跃用户占比（%）',
        indicatorShowName: '月_支局_近三个月不活跃用户占比（%）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '支局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-28', name: '月_支局_千兆终端精准匹配率（%）', code: 'M_DXT_00002582',
        indicatorCode: 'M_DXT_00002582', indicatorDisplayName: '月_支局_千兆终端精准匹配率（%）',
        indicatorShowName: '月_支局_千兆终端精准匹配率（%）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '支局/BU', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-业财中心-ind-29', name: '月_全局_新终端核销数量（台）', code: 'M_DXT_00001872',
        indicatorCode: 'M_DXT_00001872', indicatorDisplayName: '月_全局_新终端核销数量（台）',
        indicatorShowName: '月_全局_新终端核销数量（台）',
        indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '台', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-业财中心-l2-16', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-云网运': {
      // ── 交付 ──
      result.push({
        id: 'dept-云网运-l1-0', name: '交付', code: 'GROUP-dept-云网运-l1-0',
        indicatorCode: '', indicatorDisplayName: '交付',
        indicatorShowName: '交付', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-l2-1', name: '交付', code: 'GROUP-dept-云网运-l2-1',
        indicatorCode: '', indicatorDisplayName: '交付',
        indicatorShowName: '交付', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-2', name: '日_接入型客保系统_预约当日工单数', code: 'D_DXT_00002148',
        indicatorCode: 'D_DXT_00002148', indicatorDisplayName: '日_接入型客保系统_预约当日工单数',
        indicatorShowName: '日_接入型客保系统_预约当日工单数',
        indicatorType: '原子指标',
        level1: '交付', level2: '',
        granularity: '全局/区局/支局', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-l2-3', name: '基础业务交付情况', code: 'GROUP-dept-云网运-l2-3',
        indicatorCode: '', indicatorDisplayName: '基础业务交付情况',
        indicatorShowName: '基础业务交付情况', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-4', name: '战新当日完工平均交付时长', code: 'D_DXT_00001968',
        indicatorCode: 'D_DXT_00001968', indicatorDisplayName: '战新当日完工平均交付时长',
        indicatorShowName: '战新当日完工平均交付时长',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '区局', frequency: '日',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-5', name: '三线当日完工平均交付时长', code: 'D_DXT_00001953',
        indicatorCode: 'D_DXT_00001953', indicatorDisplayName: '三线当日完工平均交付时长',
        indicatorShowName: '三线当日完工平均交付时长',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-6', name: '三线当日完工', code: 'D_DXT_00001948',
        indicatorCode: 'D_DXT_00001948', indicatorDisplayName: '三线当日完工',
        indicatorShowName: '三线当日完工',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '区局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-7', name: '三线当日完工', code: 'D_DXT_00001947',
        indicatorCode: 'D_DXT_00001947', indicatorDisplayName: '三线当日完工',
        indicatorShowName: '三线当日完工',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-8', name: '战新当日新增', code: 'D_DXT_00001959',
        indicatorCode: 'D_DXT_00001959', indicatorDisplayName: '战新当日新增',
        indicatorShowName: '战新当日新增',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: 'BD', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-9', name: '三线当日新增', code: 'D_DXT_00001942',
        indicatorCode: 'D_DXT_00001942', indicatorDisplayName: '三线当日新增',
        indicatorShowName: '三线当日新增',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '区局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-10', name: '三线当日新增', code: 'D_DXT_00001941',
        indicatorCode: 'D_DXT_00001941', indicatorDisplayName: '三线当日新增',
        indicatorShowName: '三线当日新增',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-11', name: '实时_接入型客保系统_宽带在途超时', code: '15m_DXT_00001375',
        indicatorCode: '15m_DXT_00001375', indicatorDisplayName: '实时_接入型客保系统_宽带在途超时',
        indicatorShowName: '实时_接入型客保系统_宽带在途超时',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局/区局/支局', frequency: '实时',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-12', name: '战新当日完工平均交付时长', code: 'D_DXT_00001969',
        indicatorCode: 'D_DXT_00001969', indicatorDisplayName: '战新当日完工平均交付时长',
        indicatorShowName: '战新当日完工平均交付时长',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: 'BD', frequency: '日',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-13', name: '战新当日完工', code: 'D_DXT_00001960',
        indicatorCode: 'D_DXT_00001960', indicatorDisplayName: '战新当日完工',
        indicatorShowName: '战新当日完工',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-14', name: '战新当日新增', code: 'D_DXT_00001958',
        indicatorCode: 'D_DXT_00001958', indicatorDisplayName: '战新当日新增',
        indicatorShowName: '战新当日新增',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-15', name: '三线在途超时', code: 'D_DXT_00001952',
        indicatorCode: 'D_DXT_00001952', indicatorDisplayName: '三线在途超时',
        indicatorShowName: '三线在途超时',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: 'BD', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-16', name: '日_接入型客保系统_宽带当日完工平均交付时长', code: 'D_DXT_00001351',
        indicatorCode: 'D_DXT_00001351', indicatorDisplayName: '日_接入型客保系统_宽带当日完工平均交付时长',
        indicatorShowName: '日_接入型客保系统_宽带当日完工平均交付时长',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局/区局', frequency: '日',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-17', name: '战新在途超时_区局', code: 'D_DXT_00001965',
        indicatorCode: 'D_DXT_00001965', indicatorDisplayName: '战新在途超时_区局',
        indicatorShowName: '战新在途超时_区局',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '区局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-18', name: '战新当日新增', code: 'D_DXT_00001957',
        indicatorCode: 'D_DXT_00001957', indicatorDisplayName: '战新当日新增',
        indicatorShowName: '战新当日新增',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-19', name: '战新当日完工平均交付时长', code: 'D_DXT_00001967',
        indicatorCode: 'D_DXT_00001967', indicatorDisplayName: '战新当日完工平均交付时长',
        indicatorShowName: '战新当日完工平均交付时长',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: '全局', frequency: '日',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-20', name: '战新在途超时', code: 'D_DXT_00001966',
        indicatorCode: 'D_DXT_00001966', indicatorDisplayName: '战新在途超时',
        indicatorShowName: '战新在途超时',
        indicatorType: '原子指标',
        level1: '交付', level2: '基础业务交付情况',
        granularity: 'BD', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-3', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 运维 ──
      result.push({
        id: 'dept-云网运-l1-21', name: '运维', code: 'GROUP-dept-云网运-l1-21',
        indicatorCode: '', indicatorDisplayName: '运维',
        indicatorShowName: '运维', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-l2-22', name: '基础指标', code: 'GROUP-dept-云网运-l2-22',
        indicatorCode: '', indicatorDisplayName: '基础指标',
        indicatorShowName: '基础指标', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l1-21',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-23', name: '5G在网用户数', code: 'CGXT0001275264',
        indicatorCode: 'CGXT0001275264', indicatorDisplayName: '5G在网用户数',
        indicatorShowName: '5G在网用户数',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '实时',
        unit: '人', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-24', name: '平均业务恢复时间（10分钟处置）', code: 'S_CGXT0001278848',
        indicatorCode: 'S_CGXT0001278848', indicatorDisplayName: '平均业务恢复时间（10分钟处置）',
        indicatorShowName: '平均业务恢复时间（10分钟处置）',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '月',
        unit: '分钟', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-25', name: '4G基站总数', code: '15mDXT00007602',
        indicatorCode: '15mDXT00007602', indicatorDisplayName: '4G基站总数',
        indicatorShowName: '4G基站总数',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '实时',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-26', name: '5G基站总数', code: '15mDXT00007600',
        indicatorCode: '15mDXT00007600', indicatorDisplayName: '5G基站总数',
        indicatorShowName: '5G基站总数',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '实时',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-27', name: '4G在网用户数', code: 'CGXT0004683392',
        indicatorCode: 'CGXT0004683392', indicatorDisplayName: '4G在网用户数',
        indicatorShowName: '4G在网用户数',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '实时',
        unit: '人', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-28', name: '宽带在线用户数', code: 'CGXT0002795648',
        indicatorCode: 'CGXT0002795648', indicatorDisplayName: '宽带在线用户数',
        indicatorShowName: '宽带在线用户数',
        indicatorType: '原子指标',
        level1: '运维', level2: '基础指标',
        granularity: '全局', frequency: '实时',
        unit: '人', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-l2-29', name: '故障指标', code: 'GROUP-dept-云网运-l2-29',
        indicatorCode: '', indicatorDisplayName: '故障指标',
        indicatorShowName: '故障指标', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l1-21',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-云网运-ind-30', name: '日_接入型客保系统_宽带故障率', code: 'D_DXT_00001381',
        indicatorCode: 'D_DXT_00001381', indicatorDisplayName: '日_接入型客保系统_宽带故障率',
        indicatorShowName: '日_接入型客保系统_宽带故障率',
        indicatorType: '原子指标',
        level1: '运维', level2: '故障指标',
        granularity: '全局/区局/支局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-云网运-l2-29', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-客户服务部': {
      // ── 服务-客户 ──
      result.push({
        id: 'dept-客户服务部-l1-0', name: '服务-客户', code: 'GROUP-dept-客户服务部-l1-0',
        indicatorCode: '', indicatorDisplayName: '服务-客户',
        indicatorShowName: '服务-客户', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-l2-1', name: '满意度', code: 'GROUP-dept-客户服务部-l2-1',
        indicatorCode: '', indicatorDisplayName: '满意度',
        indicatorShowName: '满意度', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-ind-2', name: '政企考核满意度', code: 'S_DXT_00001834',
        indicatorCode: 'S_DXT_00001834', indicatorDisplayName: '政企考核满意度',
        indicatorShowName: '政企考核满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '市级、全产品、线上线下', frequency: '季',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-ind-3', name: '公客考核满意度', code: 'S_DXT_00001833',
        indicatorCode: 'S_DXT_00001833', indicatorDisplayName: '公客考核满意度',
        indicatorShowName: '公客考核满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '市级、全产品、线上线下', frequency: '季',
        unit: '分', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-ind-4', name: '政企考核满意度_同城', code: 'M_DXT_00002132',
        indicatorCode: 'M_DXT_00002132', indicatorDisplayName: '政企考核满意度_同城',
        indicatorShowName: '政企考核满意度_同城',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '市级、全产品、线上线下', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-ind-5', name: '考核满意度', code: 'S_DXT_00001835',
        indicatorCode: 'S_DXT_00001835', indicatorDisplayName: '考核满意度',
        indicatorShowName: '考核满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '市级、全产品、线上线下', frequency: '季',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客户服务部-ind-6', name: '公客考核满意度_同城', code: 'M_DXT_00002131',
        indicatorCode: 'M_DXT_00002131', indicatorDisplayName: '公客考核满意度_同城',
        indicatorShowName: '公客考核满意度_同城',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '市级、全产品、线上线下', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客户服务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-客服部': {
      // ── 服务-客户 ──
      result.push({
        id: 'dept-客服部-l1-0', name: '服务-客户', code: 'GROUP-dept-客服部-l1-0',
        indicatorCode: '', indicatorDisplayName: '服务-客户',
        indicatorShowName: '服务-客户', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-l2-1', name: '投诉', code: 'GROUP-dept-客服部-l2-1',
        indicatorCode: '', indicatorDisplayName: '投诉',
        indicatorShowName: '投诉', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-2', name: '投诉单总量', code: 'CGXT0009922560',
        indicatorCode: 'CGXT0009922560', indicatorDisplayName: '投诉单总量',
        indicatorShowName: '投诉单总量',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '投诉',
        granularity: '全局', frequency: '实时',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-3', name: '重要来源投诉-催单', code: 'CGXT0006610048',
        indicatorCode: 'CGXT0006610048', indicatorDisplayName: '重要来源投诉-催单',
        indicatorShowName: '重要来源投诉-催单',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '投诉',
        granularity: '全局', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-4', name: '重要来源投诉-媒体', code: 'CGXT0009926912',
        indicatorCode: 'CGXT0009926912', indicatorDisplayName: '重要来源投诉-媒体',
        indicatorShowName: '重要来源投诉-媒体',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '投诉',
        granularity: '全局', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-5', name: '重要来源投诉-升级', code: 'CGXT0004120960',
        indicatorCode: 'CGXT0004120960', indicatorDisplayName: '重要来源投诉-升级',
        indicatorShowName: '重要来源投诉-升级',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '投诉',
        granularity: '全局', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-6', name: '投诉量_分单位', code: 'D_DXT_00002085',
        indicatorCode: 'D_DXT_00002085', indicatorDisplayName: '投诉量_分单位',
        indicatorShowName: '投诉量_分单位',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '投诉',
        granularity: '单位', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-l2-7', name: '满意度', code: 'GROUP-dept-客服部-l2-7',
        indicatorCode: '', indicatorDisplayName: '满意度',
        indicatorShowName: '满意度', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-8', name: '热线即时评价满意度环比_区局', code: 'D_DXT_00001599',
        indicatorCode: 'D_DXT_00001599', indicatorDisplayName: '热线即时评价满意度环比_区局',
        indicatorShowName: '热线即时评价满意度环比_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-9', name: '热线即时评价满意度_区局', code: 'D_DXT_00001640',
        indicatorCode: 'D_DXT_00001640', indicatorDisplayName: '热线即时评价满意度_区局',
        indicatorShowName: '热线即时评价满意度_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-10', name: '月_大数据平台_营业厅即时评价满意度（区局维度）', code: 'M_DXT_00001815',
        indicatorCode: 'M_DXT_00001815', indicatorDisplayName: '月_大数据平台_营业厅即时评价满意度（区局维度）',
        indicatorShowName: '月_大数据平台_营业厅即时评价满意度（区局维度）',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-11', name: '装维即时评价满意度环比', code: 'D_DXT_00000197',
        indicatorCode: 'D_DXT_00000197', indicatorDisplayName: '装维即时评价满意度环比',
        indicatorShowName: '装维即时评价满意度环比',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-12', name: '热线即时评价满意度（区局维度）环比', code: 'M_DXT_00001811',
        indicatorCode: 'M_DXT_00001811', indicatorDisplayName: '热线即时评价满意度（区局维度）环比',
        indicatorShowName: '热线即时评价满意度（区局维度）环比',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-13', name: '月_大数据平台_热线即时评价满意度（区局维度）', code: 'M_DXT_00001816',
        indicatorCode: 'M_DXT_00001816', indicatorDisplayName: '月_大数据平台_热线即时评价满意度（区局维度）',
        indicatorShowName: '月_大数据平台_热线即时评价满意度（区局维度）',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-14', name: '装维即时评价满意度', code: 'D_DXT_00000192',
        indicatorCode: 'D_DXT_00000192', indicatorDisplayName: '装维即时评价满意度',
        indicatorShowName: '装维即时评价满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-15', name: '考核满意度_同城', code: 'M_DXT_00002133',
        indicatorCode: 'M_DXT_00002133', indicatorDisplayName: '考核满意度_同城',
        indicatorShowName: '考核满意度_同城',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-16', name: '营业厅即时评价满意度', code: 'D_DXT_00000190',
        indicatorCode: 'D_DXT_00000190', indicatorDisplayName: '营业厅即时评价满意度',
        indicatorShowName: '营业厅即时评价满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-17', name: '营业厅即时评价满意度环比_区局', code: 'D_DXT_00001616',
        indicatorCode: 'D_DXT_00001616', indicatorDisplayName: '营业厅即时评价满意度环比_区局',
        indicatorShowName: '营业厅即时评价满意度环比_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-18', name: '装维即时评价满意度环比_区局', code: 'D_DXT_00001613',
        indicatorCode: 'D_DXT_00001613', indicatorDisplayName: '装维即时评价满意度环比_区局',
        indicatorShowName: '装维即时评价满意度环比_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-19', name: '装维即时评价满意度_区局', code: 'D_DXT_00001614',
        indicatorCode: 'D_DXT_00001614', indicatorDisplayName: '装维即时评价满意度_区局',
        indicatorShowName: '装维即时评价满意度_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-20', name: '营业厅即时评价满意度_区局', code: 'D_DXT_00001615',
        indicatorCode: 'D_DXT_00001615', indicatorDisplayName: '营业厅即时评价满意度_区局',
        indicatorShowName: '营业厅即时评价满意度_区局',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '区局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-21', name: '月_大数据平台_装维即时评价满意度（区局维度）', code: 'M_DXT_00001818',
        indicatorCode: 'M_DXT_00001818', indicatorDisplayName: '月_大数据平台_装维即时评价满意度（区局维度）',
        indicatorShowName: '月_大数据平台_装维即时评价满意度（区局维度）',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局/区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-22', name: '热线即时评价满意度', code: 'D_DXT_00001641',
        indicatorCode: 'D_DXT_00001641', indicatorDisplayName: '热线即时评价满意度',
        indicatorShowName: '热线即时评价满意度',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-23', name: '热线即时评价满意度环比', code: 'D_DXT_00001603',
        indicatorCode: 'D_DXT_00001603', indicatorDisplayName: '热线即时评价满意度环比',
        indicatorShowName: '热线即时评价满意度环比',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '满意度',
        granularity: '全局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-7', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-l2-24', name: '用户触达', code: 'GROUP-dept-客服部-l2-24',
        indicatorCode: '', indicatorDisplayName: '用户触达',
        indicatorShowName: '用户触达', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-25', name: '分渠道线上登录量（线上触达）', code: 'D_DXT_00002528',
        indicatorCode: 'D_DXT_00002528', indicatorDisplayName: '分渠道线上登录量（线上触达）',
        indicatorShowName: '分渠道线上登录量（线上触达）',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '用户触达',
        granularity: '渠道', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-26', name: '日_大数据平台_10000号呼入量', code: '15m_DXT_00000469',
        indicatorCode: '15m_DXT_00000469', indicatorDisplayName: '日_大数据平台_10000号呼入量',
        indicatorShowName: '日_大数据平台_10000号呼入量',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '用户触达',
        granularity: '全局', frequency: '实时',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-27', name: '日_大数据平台_线上触达（日）', code: 'D_DXT_00001372',
        indicatorCode: 'D_DXT_00001372', indicatorDisplayName: '日_大数据平台_线上触达（日）',
        indicatorShowName: '日_大数据平台_线上触达（日）',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '用户触达',
        granularity: '全局', frequency: '日',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 运维 ──
      result.push({
        id: 'dept-客服部-l1-28', name: '运维', code: 'GROUP-dept-客服部-l1-28',
        indicatorCode: '', indicatorDisplayName: '运维',
        indicatorShowName: '运维', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-l2-29', name: '故障指标', code: 'GROUP-dept-客服部-l2-29',
        indicatorCode: '', indicatorDisplayName: '故障指标',
        indicatorShowName: '故障指标', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l1-28',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-客服部-ind-30', name: '申告量', code: 'D_DXT_00002084',
        indicatorCode: 'D_DXT_00002084', indicatorDisplayName: '申告量',
        indicatorShowName: '申告量',
        indicatorType: '原子指标',
        level1: '运维', level2: '故障指标',
        granularity: '全局', frequency: '实时',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-客服部-l2-29', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-市场部': {
      // ── 发展 ──
      result.push({
        id: 'dept-市场部-l1-0', name: '发展', code: 'GROUP-dept-市场部-l1-0',
        indicatorCode: '', indicatorDisplayName: '发展',
        indicatorShowName: '发展', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-l2-1', name: '业务量', code: 'GROUP-dept-市场部-l2-1',
        indicatorCode: '', indicatorDisplayName: '业务量',
        indicatorShowName: '业务量', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-2', name: '日_营销沙盘_光WIFI当日新增数', code: 'D_SHH_00003950',
        indicatorCode: 'D_SHH_00003950', indicatorDisplayName: '日_营销沙盘_光WIFI当日新增数',
        indicatorShowName: '日_营销沙盘_光WIFI当日新增数',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '全局', frequency: '实时',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-3', name: '日_营销沙盘_光WIFI当日新增完成率', code: 'D_SHH_00003956',
        indicatorCode: 'D_SHH_00003956', indicatorDisplayName: '日_营销沙盘_光WIFI当日新增完成率',
        indicatorShowName: '日_营销沙盘_光WIFI当日新增完成率',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '全局', frequency: '实时',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-4', name: '日_营销沙盘_分区局AI中屏当日新增数', code: 'D_SHH_00003942',
        indicatorCode: 'D_SHH_00003942', indicatorDisplayName: '日_营销沙盘_分区局AI中屏当日新增数',
        indicatorShowName: '日_营销沙盘_分区局AI中屏当日新增数',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '区局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 经营 ──
      result.push({
        id: 'dept-市场部-l1-5', name: '经营', code: 'GROUP-dept-市场部-l1-5',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-l2-6', name: '经营', code: 'GROUP-dept-市场部-l2-6',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l1-5',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-7', name: '收入-BD落地台阶-累计增幅-行业BD合计', code: 'M_DXT_00003372',
        indicatorCode: 'M_DXT_00003372', indicatorDisplayName: '收入-BD落地台阶-累计增幅-行业BD合计',
        indicatorShowName: '收入-BD落地台阶-累计增幅-行业BD合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '支局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-8', name: '重点市场触点-出厅行销-区局-高套新增数', code: 'M_DXT_00002762',
        indicatorCode: 'M_DXT_00002762', indicatorDisplayName: '重点市场触点-出厅行销-区局-高套新增数',
        indicatorShowName: '重点市场触点-出厅行销-区局-高套新增数',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-9', name: '客经-重点价值经营-高值融合-净增-公司合计', code: 'M_DXT_00002690',
        indicatorCode: 'M_DXT_00002690', indicatorDisplayName: '客经-重点价值经营-高值融合-净增-公司合计',
        indicatorShowName: '客经-重点价值经营-高值融合-净增-公司合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-10', name: '区局公客台阶收入-当月到达-区局合计', code: 'M_DXT_00003363',
        indicatorCode: 'M_DXT_00003363', indicatorDisplayName: '区局公客台阶收入-当月到达-区局合计',
        indicatorShowName: '区局公客台阶收入-当月到达-区局合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '支局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-11', name: '客经-存量挽留-二道防线-派单量-分区局', code: 'M_DXT_00002721',
        indicatorCode: 'M_DXT_00002721', indicatorDisplayName: '客经-存量挽留-二道防线-派单量-分区局',
        indicatorShowName: '客经-存量挽留-二道防线-派单量-分区局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-12', name: '行业竞争-携转-区局-其中拆宽占比', code: 'M_DXT_00002786',
        indicatorCode: 'M_DXT_00002786', indicatorDisplayName: '行业竞争-携转-区局-其中拆宽占比',
        indicatorShowName: '行业竞争-携转-区局-其中拆宽占比',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-13', name: '规模-宽带新增-区局-完成率', code: 'M_DXT_00003156',
        indicatorCode: 'M_DXT_00003156', indicatorDisplayName: '规模-宽带新增-区局-完成率',
        indicatorShowName: '规模-宽带新增-区局-完成率',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-14', name: '行业竞争-携转-运营商-累计携出', code: 'M_DXT_00002778',
        indicatorCode: 'M_DXT_00002778', indicatorDisplayName: '行业竞争-携转-运营商-累计携出',
        indicatorShowName: '行业竞争-携转-运营商-累计携出',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '运营商', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-15', name: '利润-成本-固网终端', code: 'M_DXT_00002810',
        indicatorCode: 'M_DXT_00002810', indicatorDisplayName: '利润-成本-固网终端',
        indicatorShowName: '利润-成本-固网终端',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-16', name: '渠道-人效-商客触点-人均积分', code: 'M_DXT_00003141',
        indicatorCode: 'M_DXT_00003141', indicatorDisplayName: '渠道-人效-商客触点-人均积分',
        indicatorShowName: '渠道-人效-商客触点-人均积分',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-17', name: '产品-智慧社区-规模到达', code: 'M_DXT_00002849',
        indicatorCode: 'M_DXT_00002849', indicatorDisplayName: '产品-智慧社区-规模到达',
        indicatorShowName: '产品-智慧社区-规模到达',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-18', name: '规模-宽带新增-套餐档次-到达数', code: 'M_DXT_00002752',
        indicatorCode: 'M_DXT_00002752', indicatorDisplayName: '规模-宽带新增-套餐档次-到达数',
        indicatorShowName: '规模-宽带新增-套餐档次-到达数',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '套餐档次', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-19', name: '绿皮书-台阶收入-全年目标进度', code: 'M_DXT_00003097',
        indicatorCode: 'M_DXT_00003097', indicatorDisplayName: '绿皮书-台阶收入-全年目标进度',
        indicatorShowName: '绿皮书-台阶收入-全年目标进度',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-20', name: '客经-专项提值-派单-转化率-公司合计', code: 'M_DXT_00002706',
        indicatorCode: 'M_DXT_00002706', indicatorDisplayName: '客经-专项提值-派单-转化率-公司合计',
        indicatorShowName: '客经-专项提值-派单-转化率-公司合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-21', name: '绿皮书-台阶收入-实际增幅', code: 'M_DXT_00003096',
        indicatorCode: 'M_DXT_00003096', indicatorDisplayName: '绿皮书-台阶收入-实际增幅',
        indicatorShowName: '绿皮书-台阶收入-实际增幅',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-22', name: '客经-线上运营-线上触点-绑定套餐数-公司合计', code: 'M_DXT_00002693',
        indicatorCode: 'M_DXT_00002693', indicatorDisplayName: '客经-线上运营-线上触点-绑定套餐数-公司合计',
        indicatorShowName: '客经-线上运营-线上触点-绑定套餐数-公司合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-23', name: '客经-重点价值经营-收保率（考核口径）-保有率-公司合计', code: 'M_DXT_00002673',
        indicatorCode: 'M_DXT_00002673', indicatorDisplayName: '客经-重点价值经营-收保率（考核口径）-保有率-公司合计',
        indicatorShowName: '客经-重点价值经营-收保率（考核口径）-保有率-公司合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-24', name: '收入-其他单位收入-完成率-行业BD合计', code: 'M_DXT_00002925',
        indicatorCode: 'M_DXT_00002925', indicatorDisplayName: '收入-其他单位收入-完成率-行业BD合计',
        indicatorShowName: '收入-其他单位收入-完成率-行业BD合计',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: 'BD', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-25', name: '行业竞争-携转-运营商-当月携出', code: 'M_DXT_00002781',
        indicatorCode: 'M_DXT_00002781', indicatorDisplayName: '行业竞争-携转-运营商-当月携出',
        indicatorShowName: '行业竞争-携转-运营商-当月携出',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '运营商', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-26', name: '重点市场触点-GB2C-区局-移动新增数', code: 'M_DXT_00002976',
        indicatorCode: 'M_DXT_00002976', indicatorDisplayName: '重点市场触点-GB2C-区局-移动新增数',
        indicatorShowName: '重点市场触点-GB2C-区局-移动新增数',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-27', name: '重点市场触点-进厅场景-区局-高套新增数', code: 'M_DXT_00002760',
        indicatorCode: 'M_DXT_00002760', indicatorDisplayName: '重点市场触点-进厅场景-区局-高套新增数',
        indicatorShowName: '重点市场触点-进厅场景-区局-高套新增数',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-市场部-ind-28', name: '行业趋势-宽带-行业宽带份额-区局当年变化值', code: 'M_DXT_00003033',
        indicatorCode: 'M_DXT_00003033', indicatorDisplayName: '行业趋势-宽带-行业宽带份额-区局当年变化值',
        indicatorShowName: '行业趋势-宽带-行业宽带份额-区局当年变化值',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '待定', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-市场部-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-政企群': {
      // ── 发展 ──
      result.push({
        id: 'dept-政企群-l1-0', name: '发展', code: 'GROUP-dept-政企群-l1-0',
        indicatorCode: '', indicatorDisplayName: '发展',
        indicatorShowName: '发展', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-l2-1', name: '业务量', code: 'GROUP-dept-政企群-l2-1',
        indicatorCode: '', indicatorDisplayName: '业务量',
        indicatorShowName: '业务量', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-2', name: '日_政企营销部_分BD_上网专线新增', code: 'D_SHH_00002371',
        indicatorCode: 'D_SHH_00002371', indicatorDisplayName: '日_政企营销部_分BD_上网专线新增',
        indicatorShowName: '日_政企营销部_分BD_上网专线新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: 'BD', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-3', name: '日_政企营销部_分BD_上网专线新增完成率', code: 'D_SHH_00002372',
        indicatorCode: 'D_SHH_00002372', indicatorDisplayName: '日_政企营销部_分BD_上网专线新增完成率',
        indicatorShowName: '日_政企营销部_分BD_上网专线新增完成率',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: 'BD', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-4', name: '日_政企营销部_分区局_组网专线新增', code: 'D_SHH_00002279',
        indicatorCode: 'D_SHH_00002279', indicatorDisplayName: '日_政企营销部_分区局_组网专线新增',
        indicatorShowName: '日_政企营销部_分区局_组网专线新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '区局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-5', name: '日_政企营销部_分BD_组网专线新增', code: 'D_SHH_00002373',
        indicatorCode: 'D_SHH_00002373', indicatorDisplayName: '日_政企营销部_分BD_组网专线新增',
        indicatorShowName: '日_政企营销部_分BD_组网专线新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: 'BD', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-6', name: '日_政企营销部_分支局/BU_上网专线新增', code: 'D_SHH_00002273',
        indicatorCode: 'D_SHH_00002273', indicatorDisplayName: '日_政企营销部_分支局/BU_上网专线新增',
        indicatorShowName: '日_政企营销部_分支局/BU_上网专线新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '支局/BU', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-7', name: '日_政企营销部_分区局_商务宽带新增', code: 'D_SHH_00002287',
        indicatorCode: 'D_SHH_00002287', indicatorDisplayName: '日_政企营销部_分区局_商务宽带新增',
        indicatorShowName: '日_政企营销部_分区局_商务宽带新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '区局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-8', name: '日_政企营销部_分支局/BU_商务宽带新增', code: 'D_SHH_00002288',
        indicatorCode: 'D_SHH_00002288', indicatorDisplayName: '日_政企营销部_分支局/BU_商务宽带新增',
        indicatorShowName: '日_政企营销部_分支局/BU_商务宽带新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '支局/BU', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-9', name: '日_政企营销部_组网专线新增', code: 'D_SHH_00002278',
        indicatorCode: 'D_SHH_00002278', indicatorDisplayName: '日_政企营销部_组网专线新增',
        indicatorShowName: '日_政企营销部_组网专线新增',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '全局', frequency: '日',
        unit: '线', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-10', name: '日_政企营销部_分支局/BU_商务宽带新增完成率', code: 'D_SHH_00002291',
        indicatorCode: 'D_SHH_00002291', indicatorDisplayName: '日_政企营销部_分支局/BU_商务宽带新增完成率',
        indicatorShowName: '日_政企营销部_分支局/BU_商务宽带新增完成率',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '支局/BU', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-11', name: '日_政企营销部_分区局_组网专线新增完成率', code: 'D_SHH_00002283',
        indicatorCode: 'D_SHH_00002283', indicatorDisplayName: '日_政企营销部_分区局_组网专线新增完成率',
        indicatorShowName: '日_政企营销部_分区局_组网专线新增完成率',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '区局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-12', name: '日_政企营销部_上网专线新增完成率', code: 'D_SHH_00002274',
        indicatorCode: 'D_SHH_00002274', indicatorDisplayName: '日_政企营销部_上网专线新增完成率',
        indicatorShowName: '日_政企营销部_上网专线新增完成率',
        indicatorType: '原子指标',
        level1: '发展', level2: '业务量',
        granularity: '全局', frequency: '日',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-l2-13', name: '空间', code: 'GROUP-dept-政企群-l2-13',
        indicatorCode: '', indicatorDisplayName: '空间',
        indicatorShowName: '空间', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-14', name: '月_商客部_区局_商客商宽渗透率', code: 'M_DXT_00002435',
        indicatorCode: 'M_DXT_00002435', indicatorDisplayName: '月_商客部_区局_商客商宽渗透率',
        indicatorShowName: '月_商客部_区局_商客商宽渗透率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-15', name: '月_商客部_全局_商客标化产数【存量】渗透率', code: 'M_DXT_00002434',
        indicatorCode: 'M_DXT_00002434', indicatorDisplayName: '月_商客部_全局_商客标化产数【存量】渗透率',
        indicatorShowName: '月_商客部_全局_商客标化产数【存量】渗透率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-16', name: '月_政企产数中心_全局_名单制客户ICT签约覆盖率', code: 'B_SHH_00002457',
        indicatorCode: 'B_SHH_00002457', indicatorDisplayName: '月_政企产数中心_全局_名单制客户ICT签约覆盖率',
        indicatorShowName: '月_政企产数中心_全局_名单制客户ICT签约覆盖率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-17', name: '月_洞察中心_全局_名单制客户三线渗透率', code: 'M_DXT_00002339',
        indicatorCode: 'M_DXT_00002339', indicatorDisplayName: '月_洞察中心_全局_名单制客户三线渗透率',
        indicatorShowName: '月_洞察中心_全局_名单制客户三线渗透率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-18', name: '月_洞察中心_BD_名单制客户三线渗透率', code: 'M_DXT_00002317',
        indicatorCode: 'M_DXT_00002317', indicatorDisplayName: '月_洞察中心_BD_名单制客户三线渗透率',
        indicatorShowName: '月_洞察中心_BD_名单制客户三线渗透率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: 'BD', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-19', name: '月_商客部_区局_商客标化产数【存量】渗透率', code: 'M_DXT_00002433',
        indicatorCode: 'M_DXT_00002433', indicatorDisplayName: '月_商客部_区局_商客标化产数【存量】渗透率',
        indicatorShowName: '月_商客部_区局_商客标化产数【存量】渗透率',
        indicatorType: '原子指标',
        level1: '发展', level2: '空间',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-13', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 收入效能 ──
      result.push({
        id: 'dept-政企群-l1-20', name: '收入效能', code: 'GROUP-dept-政企群-l1-20',
        indicatorCode: '', indicatorDisplayName: '收入效能',
        indicatorShowName: '收入效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-l2-21', name: '效能', code: 'GROUP-dept-政企群-l2-21',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l1-20',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-22', name: '执行中毛利率', code: 'M_DXT_00003880',
        indicatorCode: 'M_DXT_00003880', indicatorDisplayName: '执行中毛利率',
        indicatorShowName: '执行中毛利率',
        indicatorType: '原子指标',
        level1: '收入效能', level2: '效能',
        granularity: '区局/BD', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-21', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 服务-客户 ──
      result.push({
        id: 'dept-政企群-l1-23', name: '服务-客户', code: 'GROUP-dept-政企群-l1-23',
        indicatorCode: '', indicatorDisplayName: '服务-客户',
        indicatorShowName: '服务-客户', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-l2-24', name: '服务承诺', code: 'GROUP-dept-政企群-l2-24',
        indicatorCode: '', indicatorDisplayName: '服务承诺',
        indicatorShowName: '服务承诺', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l1-23',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-25', name: '月_政企服务稽核部_全局_政企服务派单及时响应率', code: 'M_DXT_00002431',
        indicatorCode: 'M_DXT_00002431', indicatorDisplayName: '月_政企服务稽核部_全局_政企服务派单及时响应率',
        indicatorShowName: '月_政企服务稽核部_全局_政企服务派单及时响应率',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '服务承诺',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-26', name: '月_政企服务稽核部_区局_政企服务派单及时响应率', code: 'M_DXT_00002427',
        indicatorCode: 'M_DXT_00002427', indicatorDisplayName: '月_政企服务稽核部_区局_政企服务派单及时响应率',
        indicatorShowName: '月_政企服务稽核部_区局_政企服务派单及时响应率',
        indicatorType: '原子指标',
        level1: '服务-客户', level2: '服务承诺',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 经营 ──
      result.push({
        id: 'dept-政企群-l1-27', name: '经营', code: 'GROUP-dept-政企群-l1-27',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-l2-28', name: '收入', code: 'GROUP-dept-政企群-l2-28',
        indicatorCode: '', indicatorDisplayName: '收入',
        indicatorShowName: '收入', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l1-27',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-29', name: '月_政企经管部_区局_产数收入累计完成值', code: 'M_DXT_00002415',
        indicatorCode: 'M_DXT_00002415', indicatorDisplayName: '月_政企经管部_区局_产数收入累计完成值',
        indicatorShowName: '月_政企经管部_区局_产数收入累计完成值',
        indicatorType: '原子指标',
        level1: '经营', level2: '收入',
        granularity: '区局', frequency: '月',
        unit: '亿', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-28', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-30', name: '月_政企经管部_全局_产数收入累计完成值', code: 'M_DXT_00002416',
        indicatorCode: 'M_DXT_00002416', indicatorDisplayName: '月_政企经管部_全局_产数收入累计完成值',
        indicatorShowName: '月_政企经管部_全局_产数收入累计完成值',
        indicatorType: '原子指标',
        level1: '经营', level2: '收入',
        granularity: '全局', frequency: '月',
        unit: '亿', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-28', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-31', name: '月_政企经管部_全局_产数收入同比', code: 'M_DXT_00002426',
        indicatorCode: 'M_DXT_00002426', indicatorDisplayName: '月_政企经管部_全局_产数收入同比',
        indicatorShowName: '月_政企经管部_全局_产数收入同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '收入',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-28', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-32', name: '月_政企经管部_BD_直管客户收入完成率', code: 'M_DXT_00003472',
        indicatorCode: 'M_DXT_00003472', indicatorDisplayName: '月_政企经管部_BD_直管客户收入完成率',
        indicatorShowName: '月_政企经管部_BD_直管客户收入完成率',
        indicatorType: '原子指标',
        level1: '经营', level2: '收入',
        granularity: 'BD', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-28', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-政企群-ind-33', name: '月_政企经管部_BD_直管客户收入同比', code: 'M_SHH_00003471',
        indicatorCode: 'M_SHH_00003471', indicatorDisplayName: '月_政企经管部_BD_直管客户收入同比',
        indicatorShowName: '月_政企经管部_BD_直管客户收入同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '收入',
        granularity: 'BD', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-政企群-l2-28', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-财务部': {
      // ── 效能 ──
      result.push({
        id: 'dept-财务部-l1-0', name: '效能', code: 'GROUP-dept-财务部-l1-0',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-1', name: '效能', code: 'GROUP-dept-财务部-l2-1',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-2', name: '预算执行进度-折旧摊销-全局', code: 'M_DXT_00004235',
        indicatorCode: 'M_DXT_00004235', indicatorDisplayName: '预算执行进度-折旧摊销-全局',
        indicatorShowName: '预算执行进度-折旧摊销-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-3', name: '月-财务-上海派单项目金额', code: 'M_DXT_00004534',
        indicatorCode: 'M_DXT_00004534', indicatorDisplayName: '月-财务-上海派单项目金额',
        indicatorShowName: '月-财务-上海派单项目金额',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '各单位', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-4', name: '月-财务-IDC利用率-分数据中心', code: 'M_DXT_00003911',
        indicatorCode: 'M_DXT_00003911', indicatorDisplayName: '月-财务-IDC利用率-分数据中心',
        indicatorShowName: '月-财务-IDC利用率-分数据中心',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '数据中心级', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-5', name: '预算执行进度-铁塔电费-全局', code: 'M_DXT_00004261',
        indicatorCode: 'M_DXT_00004261', indicatorDisplayName: '预算执行进度-铁塔电费-全局',
        indicatorShowName: '预算执行进度-铁塔电费-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-6', name: '月-财务-IDC利用率-自有机房', code: 'M_DXT_00003912',
        indicatorCode: 'M_DXT_00003912', indicatorDisplayName: '月-财务-IDC利用率-自有机房',
        indicatorShowName: '月-财务-IDC利用率-自有机房',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-7', name: '资金流出数-全局', code: 'M_DXT_00004270',
        indicatorCode: 'M_DXT_00004270', indicatorDisplayName: '资金流出数-全局',
        indicatorShowName: '资金流出数-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-8', name: '预算执行进度-坏账-全局', code: 'M_DXT_00004255',
        indicatorCode: 'M_DXT_00004255', indicatorDisplayName: '预算执行进度-坏账-全局',
        indicatorShowName: '预算执行进度-坏账-全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-9', name: '租入低效清单-机房', code: 'S_DXT_00004312',
        indicatorCode: 'S_DXT_00004312', indicatorDisplayName: '租入低效清单-机房',
        indicatorShowName: '租入低效清单-机房',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '单位', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-10', name: '分区局-外包员工-一线客触率', code: 'M_DXT_00004184',
        indicatorCode: 'M_DXT_00004184', indicatorDisplayName: '分区局-外包员工-一线客触率',
        indicatorShowName: '分区局-外包员工-一线客触率',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-11', name: '租入低效清单-营业厅', code: 'S_DXT_00004306',
        indicatorCode: 'S_DXT_00004306', indicatorDisplayName: '租入低效清单-营业厅',
        indicatorShowName: '租入低效清单-营业厅',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '单位', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-12', name: 'IDC预占机架量-分数据中心-分机楼-分机房-合作B类', code: 'M_DXT_00003921',
        indicatorCode: 'M_DXT_00003921', indicatorDisplayName: 'IDC预占机架量-分数据中心-分机楼-分机房-合作B类',
        indicatorShowName: 'IDC预占机架量-分数据中心-分机楼-分机房-合作B类',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '/', frequency: '月',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-13', name: 'IDC占用机架量-分数据中心-分机楼-分机房-合作A类', code: 'M_DXT_00003918',
        indicatorCode: 'M_DXT_00003918', indicatorDisplayName: 'IDC占用机架量-分数据中心-分机楼-分机房-合作A类',
        indicatorShowName: 'IDC占用机架量-分数据中心-分机楼-分机房-合作A类',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: '/', frequency: '月',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-14', name: '分BD-外包员工-一线客触率', code: 'M_DXT_00004185',
        indicatorCode: 'M_DXT_00004185', indicatorDisplayName: '分BD-外包员工-一线客触率',
        indicatorShowName: '分BD-外包员工-一线客触率',
        indicatorType: '原子指标',
        level1: '效能', level2: '',
        granularity: 'BD', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-15', name: '业务外包', code: 'GROUP-dept-财务部-l2-15',
        indicatorCode: '', indicatorDisplayName: '业务外包',
        indicatorShowName: '业务外包', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-16', name: '后端外包费压降', code: 'M_DXT_00002089',
        indicatorCode: 'M_DXT_00002089', indicatorDisplayName: '后端外包费压降',
        indicatorShowName: '后端外包费压降',
        indicatorType: '原子指标',
        level1: '效能', level2: '业务外包',
        granularity: '全局', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-15', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-17', name: '每百元强基成本拉动台阶收入', code: 'M_DXT_00002121',
        indicatorCode: 'M_DXT_00002121', indicatorDisplayName: '每百元强基成本拉动台阶收入',
        indicatorShowName: '每百元强基成本拉动台阶收入',
        indicatorType: '原子指标',
        level1: '效能', level2: '业务外包',
        granularity: '区局', frequency: '月',
        unit: '元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-15', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-18', name: '目标-智能客服占比', code: 'M_DXT_00002652',
        indicatorCode: 'M_DXT_00002652', indicatorDisplayName: '目标-智能客服占比',
        indicatorShowName: '目标-智能客服占比',
        indicatorType: '原子指标',
        level1: '效能', level2: '业务外包',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-15', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-19', name: '非核心网络业务实时监控与工单处理单价', code: 'M_DXT_00002635',
        indicatorCode: 'M_DXT_00002635', indicatorDisplayName: '非核心网络业务实时监控与工单处理单价',
        indicatorShowName: '非核心网络业务实时监控与工单处理单价',
        indicatorType: '原子指标',
        level1: '效能', level2: '业务外包',
        granularity: '全局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-15', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-20', name: '应收', code: 'GROUP-dept-财务部-l2-20',
        indicatorCode: '', indicatorDisplayName: '应收',
        indicatorShowName: '应收', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-21', name: '坏账同比增幅', code: 'M_DXT_00002341',
        indicatorCode: 'M_DXT_00002341', indicatorDisplayName: '坏账同比增幅',
        indicatorShowName: '坏账同比增幅',
        indicatorType: '原子指标',
        level1: '效能', level2: '应收',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-20', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-22', name: '房产', code: 'GROUP-dept-财务部-l2-22',
        indicatorCode: '', indicatorDisplayName: '房产',
        indicatorShowName: '房产', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-23', name: '房屋土地租赁收支差改善额目标值', code: 'M_DXT_00002079',
        indicatorCode: 'M_DXT_00002079', indicatorDisplayName: '房屋土地租赁收支差改善额目标值',
        indicatorShowName: '房屋土地租赁收支差改善额目标值',
        indicatorType: '原子指标',
        level1: '效能', level2: '房产',
        granularity: '全局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-22', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-24', name: '收入', code: 'GROUP-dept-财务部-l2-24',
        indicatorCode: '', indicatorDisplayName: '收入',
        indicatorShowName: '收入', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-25', name: '分单位经营收入（月经营收入）-其他', code: 'M_DXT_00003933',
        indicatorCode: 'M_DXT_00003933', indicatorDisplayName: '分单位经营收入（月经营收入）-其他',
        indicatorShowName: '分单位经营收入（月经营收入）-其他',
        indicatorType: '原子指标',
        level1: '效能', level2: '收入',
        granularity: '单位', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-24', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-26', name: '铁塔专区', code: 'GROUP-dept-财务部-l2-26',
        indicatorCode: '', indicatorDisplayName: '铁塔专区',
        indicatorShowName: '铁塔专区', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-27', name: '各区局电费总值', code: 'M_DXT_00002449',
        indicatorCode: 'M_DXT_00002449', indicatorDisplayName: '各区局电费总值',
        indicatorShowName: '各区局电费总值',
        indicatorType: '原子指标',
        level1: '效能', level2: '铁塔专区',
        granularity: '区局', frequency: '月',
        unit: '-', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-26', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-28', name: '各区局铁塔数量', code: 'M_DXT_00002563',
        indicatorCode: 'M_DXT_00002563', indicatorDisplayName: '各区局铁塔数量',
        indicatorShowName: '各区局铁塔数量',
        indicatorType: '原子指标',
        level1: '效能', level2: '铁塔专区',
        granularity: '区局', frequency: '月',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-26', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-29', name: '铁塔计数-转供电单价高于0.9', code: 'M_DXT_00003892',
        indicatorCode: 'M_DXT_00003892', indicatorDisplayName: '铁塔计数-转供电单价高于0.9',
        indicatorShowName: '铁塔计数-转供电单价高于0.9',
        indicatorType: '原子指标',
        level1: '效能', level2: '铁塔专区',
        granularity: '全局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-26', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 经营 ──
      result.push({
        id: 'dept-财务部-l1-30', name: '经营', code: 'GROUP-dept-财务部-l1-30',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-31', name: '经营', code: 'GROUP-dept-财务部-l2-31',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-30',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-32', name: '月-财务-资金流入数-全局', code: 'M_DXT_00004662',
        indicatorCode: 'M_DXT_00004662', indicatorDisplayName: '月-财务-资金流入数-全局',
        indicatorShowName: '月-财务-资金流入数-全局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '亿', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-31', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-l2-33', name: '应收', code: 'GROUP-dept-财务部-l2-33',
        indicatorCode: '', indicatorDisplayName: '应收',
        indicatorShowName: '应收', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l1-30',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-34', name: '应收占收比', code: 'M_DXT_00001977',
        indicatorCode: 'M_DXT_00001977', indicatorDisplayName: '应收占收比',
        indicatorShowName: '应收占收比',
        indicatorType: '原子指标',
        level1: '经营', level2: '应收',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-财务部-l2-33', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // 待挂靠指标（未挂入指标树）
      result.push({
        id: 'dept-财务部-ind-new-1', name: '分单位可量化比例', code: 'M_DXT_00002117',
        indicatorCode: 'M_DXT_00002117', indicatorDisplayName: '外包人员可量化评价占比',
        indicatorShowName: '外包人员可量化评价占比', indicatorType: '原子指标',
        level1: '效能', level2: '业务外包',
        granularity: '单位', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-2', name: '利润完成率', code: 'M_DXT_00002562',
        indicatorCode: 'M_DXT_00002562', indicatorDisplayName: '利润完成率',
        indicatorShowName: '利润完成率', indicatorType: '原子指标',
        level1: '经营', level2: '/',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-3', name: '（铁塔租费+铁塔电费）占移动收入比', code: 'M_DXT_00002094',
        indicatorCode: 'M_DXT_00002094', indicatorDisplayName: '（铁塔租费+铁塔电费）占移动收入比',
        indicatorShowName: '（铁塔租费+铁塔电费）占移动收入比', indicatorType: '原子指标',
        level1: '效能', level2: '后端',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-4', name: '一年以上应收账款增幅', code: 'M_DXT_00001987',
        indicatorCode: 'M_DXT_00001987', indicatorDisplayName: '一年以上应收账款增幅',
        indicatorShowName: '一年以上应收账款增幅', indicatorType: '原子指标',
        level1: '效能', level2: '应收',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-5', name: '月-综合-车辆使用费进度', code: 'M_DXT_00004441',
        indicatorCode: 'M_DXT_00004441', indicatorDisplayName: '月-综合-车辆使用费进度',
        indicatorShowName: '月-综合-车辆使用费进度', indicatorType: '原子指标',
        level1: '/', level2: '/',
        granularity: '单位', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-6', name: 'AI-AI稽核订单率-全局', code: 'M_DXT_00004290',
        indicatorCode: 'M_DXT_00004290', indicatorDisplayName: 'AI-AI稽核订单率-全局',
        indicatorShowName: 'AI-AI稽核订单率-全局', indicatorType: '原子指标',
        level1: '效能', level2: '/',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-7', name: '分单位空置面积汇总', code: 'M_DXT_00003935',
        indicatorCode: 'M_DXT_00003935', indicatorDisplayName: '分单位空置面积汇总',
        indicatorShowName: '分单位空置面积汇总', indicatorType: '原子指标',
        level1: '效能', level2: '房产',
        granularity: '区局', frequency: '月',
        unit: '平方米', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-8', name: '资产负债率', code: 'M_DXT_00002062',
        indicatorCode: 'M_DXT_00002062', indicatorDisplayName: '资产负债率',
        indicatorShowName: '资产负债率', indicatorType: '原子指标',
        level1: '效能', level2: '一利五率',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-9', name: '分单位经营收入（月经营收入）-BD', code: 'M_DXT_00003932',
        indicatorCode: 'M_DXT_00003932', indicatorDisplayName: '分单位经营收入（月经营收入）-BD',
        indicatorShowName: '分单位经营收入（月经营收入）-BD', indicatorType: '原子指标',
        level1: '效能', level2: '收入',
        granularity: 'BD', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-10', name: '强基费用占台阶收入比', code: 'M_DXT_00002135',
        indicatorCode: 'M_DXT_00002135', indicatorDisplayName: '强基费用占台阶收入比',
        indicatorShowName: '强基费用占台阶收入比', indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-11', name: '产数资源型毛利率', code: 'M_DXT_00002068',
        indicatorCode: 'M_DXT_00002068', indicatorDisplayName: '产数资源型毛利率',
        indicatorShowName: '产数资源型毛利率', indicatorType: '原子指标',
        level1: '效能', level2: '产数业务',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-12', name: '全口径人员人均创利', code: 'M_DXT_00002124',
        indicatorCode: 'M_DXT_00002124', indicatorDisplayName: '全口径人员人均创利',
        indicatorShowName: '全口径人员人均创利', indicatorType: '原子指标',
        level1: '效能', level2: '人效',
        granularity: '区局', frequency: '月',
        unit: '万元/人', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-13', name: '一年以上长账龄应收余额', code: 'M_DXT_00001985',
        indicatorCode: 'M_DXT_00001985', indicatorDisplayName: '一年以上长账龄应收余额',
        indicatorShowName: '一年以上长账龄应收余额', indicatorType: '原子指标',
        level1: '经营', level2: '应收',
        granularity: '区局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-14', name: '基础资源型业务毛利额同比', code: 'M_DXT_00002344',
        indicatorCode: 'M_DXT_00002344', indicatorDisplayName: '同比',
        indicatorShowName: '同比', indicatorType: '原子指标',
        level1: '经营', level2: '利润',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-15', name: '铁塔分析-转供电单价超0.9等', code: 'M_DXT_00003124',
        indicatorCode: 'M_DXT_00003124', indicatorDisplayName: '铁塔分析-转供电单价超0.9等',
        indicatorShowName: '铁塔分析-转供电单价超0.9等', indicatorType: '原子指标',
        level1: '效能', level2: '铁塔专区',
        granularity: '全局', frequency: '月',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-16', name: '分单位经营收入（月经营收入）-区局', code: 'M_DXT_00003930',
        indicatorCode: 'M_DXT_00003930', indicatorDisplayName: '分单位经营收入（月经营收入）-区局',
        indicatorShowName: '分单位经营收入（月经营收入）-区局', indicatorType: '原子指标',
        level1: '效能', level2: '收入',
        granularity: '区局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-17', name: '强基费用占台阶收入比', code: 'M_DXT_00002067',
        indicatorCode: 'M_DXT_00002067', indicatorDisplayName: '强基费用占台阶收入比',
        indicatorShowName: '强基费用占台阶收入比', indicatorType: '原子指标',
        level1: '效能', level2: '基础业务',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-18', name: '月_强基-收入与成本进度差-△收入-△成本-分单位', code: 'M_DXT_00004469',
        indicatorCode: 'M_DXT_00004469', indicatorDisplayName: '强基-收入与成本进度差-△收入-△成本-分单位',
        indicatorShowName: '强基-收入与成本进度差-△收入-△成本-分单位', indicatorType: '原子指标',
        level1: '/', level2: '/',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-19', name: '铁塔低业务量塔占比', code: 'M_DXT_00002633',
        indicatorCode: 'M_DXT_00002633', indicatorDisplayName: '铁塔低业务量塔占比',
        indicatorShowName: '铁塔低业务量塔占比', indicatorType: '原子指标',
        level1: '效能', level2: '铁塔专区',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-20', name: '产数资源型业务毛利额同比', code: 'M_DXT_00002342',
        indicatorCode: 'M_DXT_00002342', indicatorDisplayName: '同比',
        indicatorShowName: '同比', indicatorType: '原子指标',
        level1: '经营', level2: '利润',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-21', name: '应收占收比', code: 'M_DXT_00001978',
        indicatorCode: 'M_DXT_00001978', indicatorDisplayName: '应收占收比',
        indicatorShowName: '应收占收比', indicatorType: '原子指标',
        level1: '经营', level2: '应收',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-22', name: '分省（铁塔租费+铁塔电费）占移动收入比', code: 'M_DXT_00002093',
        indicatorCode: 'M_DXT_00002093', indicatorDisplayName: '（铁塔租费+铁塔电费）占移动收入比',
        indicatorShowName: '（铁塔租费+铁塔电费）占移动收入比', indicatorType: '原子指标',
        level1: '效能', level2: '后端',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-23', name: 'AI-AI智办订单率-分单位', code: 'M_DXT_00004295',
        indicatorCode: 'M_DXT_00004295', indicatorDisplayName: 'AI-AI智办订单率-分单位',
        indicatorShowName: 'AI-AI智办订单率-分单位', indicatorType: '原子指标',
        level1: '效能', level2: '/',
        granularity: '单位', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-24', name: '房屋土地租赁收支差改善额', code: 'M_DXT_00002087',
        indicatorCode: 'M_DXT_00002087', indicatorDisplayName: '房屋土地租赁收支差改善额',
        indicatorShowName: '房屋土地租赁收支差改善额', indicatorType: '原子指标',
        level1: '效能', level2: '房产',
        granularity: '区局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-财务部-ind-new-25', name: '研发投入强度', code: 'M_DXT_00002066',
        indicatorCode: 'M_DXT_00002066', indicatorDisplayName: '研发投入强度',
        indicatorShowName: '研发投入强度', indicatorType: '原子指标',
        level1: '效能', level2: '一利五率',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-资本中心': {
      // ── 经营 ──
      result.push({
        id: 'dept-资本中心-l1-0', name: '经营', code: 'GROUP-dept-资本中心-l1-0',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-l2-1', name: '云舟发展', code: 'GROUP-dept-资本中心-l2-1',
        indicatorCode: '', indicatorDisplayName: '云舟发展',
        indicatorShowName: '云舟发展', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-2', name: '净利润值同比', code: 'M_DXT_00002391',
        indicatorCode: 'M_DXT_00002391', indicatorDisplayName: '净利润值同比',
        indicatorShowName: '净利润值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-3', name: '经营收入值', code: 'M_DXT_00002248',
        indicatorCode: 'M_DXT_00002248', indicatorDisplayName: '经营收入值',
        indicatorShowName: '经营收入值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-4', name: '净利润值', code: 'M_DXT_00002258',
        indicatorCode: 'M_DXT_00002258', indicatorDisplayName: '净利润值',
        indicatorShowName: '净利润值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-5', name: '经营收入值进度', code: 'M_DXT_00002266',
        indicatorCode: 'M_DXT_00002266', indicatorDisplayName: '经营收入值进度',
        indicatorShowName: '经营收入值进度',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-6', name: '营业收现率', code: 'M_DXT_00002264',
        indicatorCode: 'M_DXT_00002264', indicatorDisplayName: '营业收现率',
        indicatorShowName: '营业收现率',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-7', name: '应收账款绝对值同比', code: 'M_DXT_00002393',
        indicatorCode: 'M_DXT_00002393', indicatorDisplayName: '应收账款绝对值同比',
        indicatorShowName: '应收账款绝对值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-8', name: '应收账款占收比与目标的偏离值', code: 'M_DXT_00002394',
        indicatorCode: 'M_DXT_00002394', indicatorDisplayName: '应收账款占收比与目标的偏离值',
        indicatorShowName: '应收账款占收比与目标的偏离值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-9', name: '净利润值进度', code: 'M_DXT_00002390',
        indicatorCode: 'M_DXT_00002390', indicatorDisplayName: '净利润值进度',
        indicatorShowName: '净利润值进度',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-10', name: '营业收现率', code: 'M_DXT_00002395',
        indicatorCode: 'M_DXT_00002395', indicatorDisplayName: '营业收现率',
        indicatorShowName: '营业收现率',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-11', name: '经营收入值进度', code: 'M_DXT_00002256',
        indicatorCode: 'M_DXT_00002256', indicatorDisplayName: '经营收入值进度',
        indicatorShowName: '经营收入值进度',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-12', name: '经营收入值', code: 'M_DXT_00002265',
        indicatorCode: 'M_DXT_00002265', indicatorDisplayName: '经营收入值',
        indicatorShowName: '经营收入值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-13', name: '应收账款绝对值同比', code: 'M_DXT_00002262',
        indicatorCode: 'M_DXT_00002262', indicatorDisplayName: '应收账款绝对值同比',
        indicatorShowName: '应收账款绝对值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-14', name: '应收账款绝对值', code: 'M_DXT_00002392',
        indicatorCode: 'M_DXT_00002392', indicatorDisplayName: '应收账款绝对值',
        indicatorShowName: '应收账款绝对值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-15', name: '应收账款绝对值', code: 'M_DXT_00002261',
        indicatorCode: 'M_DXT_00002261', indicatorDisplayName: '应收账款绝对值',
        indicatorShowName: '应收账款绝对值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '亿元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-16', name: '净利润值进度', code: 'M_DXT_00002259',
        indicatorCode: 'M_DXT_00002259', indicatorDisplayName: '净利润值进度',
        indicatorShowName: '净利润值进度',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-17', name: '应收账款占收比与目标的偏离值', code: 'M_DXT_00002263',
        indicatorCode: 'M_DXT_00002263', indicatorDisplayName: '应收账款占收比与目标的偏离值',
        indicatorShowName: '应收账款占收比与目标的偏离值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-18', name: '净利润值同比', code: 'M_DXT_00002260',
        indicatorCode: 'M_DXT_00002260', indicatorDisplayName: '净利润值同比',
        indicatorShowName: '净利润值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-19', name: '经营收入值同比', code: 'M_DXT_00002257',
        indicatorCode: 'M_DXT_00002257', indicatorDisplayName: '经营收入值同比',
        indicatorShowName: '经营收入值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-20', name: '经营收入值同比', code: 'M_DXT_00002388',
        indicatorCode: 'M_DXT_00002388', indicatorDisplayName: '经营收入值同比',
        indicatorShowName: '经营收入值同比',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-资本中心-ind-21', name: '净利润值', code: 'M_DXT_00002389',
        indicatorCode: 'M_DXT_00002389', indicatorDisplayName: '净利润值',
        indicatorShowName: '净利润值',
        indicatorType: '原子指标',
        level1: '经营', level2: '云舟发展',
        granularity: '子公司', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-资本中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-运营NOC': {
      // ── 服务-员工 ──
      result.push({
        id: 'dept-运营NOC-l1-0', name: '服务-员工', code: 'GROUP-dept-运营NOC-l1-0',
        indicatorCode: '', indicatorDisplayName: '服务-员工',
        indicatorShowName: '服务-员工', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-l2-1', name: '易问工单运营监控', code: 'GROUP-dept-运营NOC-l2-1',
        indicatorCode: '', indicatorDisplayName: '易问工单运营监控',
        indicatorShowName: '易问工单运营监控', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-2', name: '日_运营NOC_易问运营观察指标_政企工单流转时长', code: 'D_ZBZ_00003182',
        indicatorCode: 'D_ZBZ_00003182', indicatorDisplayName: '日_运营NOC_易问运营观察指标_政企工单流转时长',
        indicatorShowName: '日_运营NOC_易问运营观察指标_政企工单流转时长',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问工单运营监控',
        granularity: '全局', frequency: '日',
        unit: '小时', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-3', name: '日_运营NOC_易问运营观察指标_公客平均处理时长', code: 'D_ZBZ_00003188',
        indicatorCode: 'D_ZBZ_00003188', indicatorDisplayName: '日_运营NOC_易问运营观察指标_公客平均处理时长',
        indicatorShowName: '日_运营NOC_易问运营观察指标_公客平均处理时长',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问工单运营监控',
        granularity: '全局', frequency: '日',
        unit: '小时', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-4', name: '日_运营NOC_易问运营观察指标_政企平均处理时长', code: 'D_ZBZ_00003187',
        indicatorCode: 'D_ZBZ_00003187', indicatorDisplayName: '日_运营NOC_易问运营观察指标_政企平均处理时长',
        indicatorShowName: '日_运营NOC_易问运营观察指标_政企平均处理时长',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问工单运营监控',
        granularity: '全局', frequency: '日',
        unit: '小时', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-5', name: '日_运营NOC_易问运营观察指标_公客工单流转时长', code: 'D_ZBZ_00003174',
        indicatorCode: 'D_ZBZ_00003174', indicatorDisplayName: '日_运营NOC_易问运营观察指标_公客工单流转时长',
        indicatorShowName: '日_运营NOC_易问运营观察指标_公客工单流转时长',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问工单运营监控',
        granularity: '全局', frequency: '日',
        unit: '小时', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-l2-6', name: '易问异常工单监控', code: 'GROUP-dept-运营NOC-l2-6',
        indicatorCode: '', indicatorDisplayName: '易问异常工单监控',
        indicatorShowName: '易问异常工单监控', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-7', name: '15分钟_易问平台_当日异常工单占比实时统计', code: '15m_DXT_00002245',
        indicatorCode: '15m_DXT_00002245', indicatorDisplayName: '15分钟_易问平台_当日异常工单占比实时统计',
        indicatorShowName: '15分钟_易问平台_当日异常工单占比实时统计',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问异常工单监控',
        granularity: '异常工单分类', frequency: '实时',
        unit: '/', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-8', name: '15分钟_易问平台_当日工单数实时统计', code: '15m_DXT_00002243',
        indicatorCode: '15m_DXT_00002243', indicatorDisplayName: '15分钟_易问平台_当日工单数实时统计',
        indicatorShowName: '15分钟_易问平台_当日工单数实时统计',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问异常工单监控',
        granularity: '全局/业务分类', frequency: '实时',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-9', name: '15分钟_易问平台_当日异常工单数实时统计', code: '15m_DXT_00002244',
        indicatorCode: '15m_DXT_00002244', indicatorDisplayName: '15分钟_易问平台_当日异常工单数实时统计',
        indicatorShowName: '15分钟_易问平台_当日异常工单数实时统计',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问异常工单监控',
        granularity: '异常工单分类', frequency: '实时',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-运营NOC-ind-10', name: '日_运营NOC_易问平台双周异常工单数', code: 'D_ZBZ_00003173',
        indicatorCode: 'D_ZBZ_00003173', indicatorDisplayName: '日_运营NOC_易问平台双周异常工单数',
        indicatorShowName: '日_运营NOC_易问平台双周异常工单数',
        indicatorType: '原子指标',
        level1: '服务-员工', level2: '易问异常工单监控',
        granularity: '异常工单分类', frequency: '日',
        unit: '单', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-运营NOC-l2-6', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
    case 'dept-采供中心': {
      // ── 效能 ──
      result.push({
        id: 'dept-采供中心-l1-0', name: '效能', code: 'GROUP-dept-采供中心-l1-0',
        indicatorCode: '', indicatorDisplayName: '效能',
        indicatorShowName: '效能', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-l2-1', name: '采供中屏', code: 'GROUP-dept-采供中心-l2-1',
        indicatorCode: '', indicatorDisplayName: '采供中屏',
        indicatorShowName: '采供中屏', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l1-0',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-2', name: '日_运营NOC_区局固网终端二级分类统计缺货日期', code: 'D_ZBZ_00002610',
        indicatorCode: 'D_ZBZ_00002610', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计缺货日期',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计缺货日期',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '天', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-3', name: '日_运营NOC_区局固网终端二级分类统计新料待收货', code: 'D_ZBZ_00002609',
        indicatorCode: 'D_ZBZ_00002609', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计新料待收货',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计新料待收货',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-4', name: '日_运营NOC_区局固网终端二级分类统计预计缺口数', code: 'D_ZBZ_00002612',
        indicatorCode: 'D_ZBZ_00002612', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计预计缺口数',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计预计缺口数',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-5', name: '月_自研产品内部转化率_全局', code: 'M_DXT_00002592',
        indicatorCode: 'M_DXT_00002592', indicatorDisplayName: '月_自研产品内部转化率_全局',
        indicatorShowName: '月_自研产品内部转化率_全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-6', name: '月_呆滞库存占出库比_分部门', code: 'M_DXT_00002594',
        indicatorCode: 'M_DXT_00002594', indicatorDisplayName: '月_呆滞库存占出库比_分部门',
        indicatorShowName: '月_呆滞库存占出库比_分部门',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-7', name: '月_产数集采率_全局', code: 'M_DXT_00002590',
        indicatorCode: 'M_DXT_00002590', indicatorDisplayName: '月_产数集采率_全局',
        indicatorShowName: '月_产数集采率_全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-8', name: '日_运营NOC_区局固网终端二级分类统计整新库存数', code: 'D_ZBZ_00002577',
        indicatorCode: 'D_ZBZ_00002577', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计整新库存数',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计整新库存数',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-9', name: '日_运营NOC_区局固网终端二级分类统计缺货7日缺口数', code: 'D_ZBZ_00002607',
        indicatorCode: 'D_ZBZ_00002607', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计缺货7日缺口数',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计缺货7日缺口数',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-10', name: '日_运营NOC_区局固网终端二级分类统计新料库存数', code: 'D_ZBZ_00002606',
        indicatorCode: 'D_ZBZ_00002606', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计新料库存数',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计新料库存数',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-11', name: '日_运营NOC_区局固网终端二级分类统计整新待收货', code: 'D_ZBZ_00002611',
        indicatorCode: 'D_ZBZ_00002611', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计整新待收货',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计整新待收货',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-12', name: '月_产数集采率_分部门', code: 'M_DXT_00002591',
        indicatorCode: 'M_DXT_00002591', indicatorDisplayName: '月_产数集采率_分部门',
        indicatorShowName: '月_产数集采率_分部门',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-13', name: '日_运营NOC_区局固网终端二级分类统计工单数', code: 'D_ZBZ_00002608',
        indicatorCode: 'D_ZBZ_00002608', indicatorDisplayName: '日_运营NOC_区局固网终端二级分类统计工单数',
        indicatorShowName: '日_运营NOC_区局固网终端二级分类统计工单数',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '日',
        unit: '个', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-14', name: '月_采购压降金额_分部门', code: 'M_DXT_00002589',
        indicatorCode: 'M_DXT_00002589', indicatorDisplayName: '月_采购压降金额_分部门',
        indicatorShowName: '月_采购压降金额_分部门',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '区局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-15', name: '月_呆滞库存占出库比_全局', code: 'M_DXT_00002593',
        indicatorCode: 'M_DXT_00002593', indicatorDisplayName: '月_呆滞库存占出库比_全局',
        indicatorShowName: '月_呆滞库存占出库比_全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-16', name: '月_采购压降金额_全局', code: 'M_DXT_00002588',
        indicatorCode: 'M_DXT_00002588', indicatorDisplayName: '月_采购压降金额_全局',
        indicatorShowName: '月_采购压降金额_全局',
        indicatorType: '原子指标',
        level1: '效能', level2: '采供中屏',
        granularity: '全局', frequency: '月',
        unit: '万元', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-1', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      // ── 经营 ──
      result.push({
        id: 'dept-采供中心-l1-17', name: '经营', code: 'GROUP-dept-采供中心-l1-17',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: undefined,
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-l2-18', name: '经营', code: 'GROUP-dept-采供中心-l2-18',
        indicatorCode: '', indicatorDisplayName: '经营',
        indicatorShowName: '经营', indicatorType: '虚拟分组',
        level1: '', level2: '', granularity: '', frequency: '', unit: '',
        isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l1-17',
        tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-19', name: '集中采购率_全局', code: 'M_DXT_00003807',
        indicatorCode: 'M_DXT_00003807', indicatorDisplayName: '集中采购率_全局',
        indicatorShowName: '集中采购率_全局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-20', name: '公开采购率_全局', code: 'M_DXT_00003805',
        indicatorCode: 'M_DXT_00003805', indicatorDisplayName: '公开采购率_全局',
        indicatorShowName: '公开采购率_全局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-21', name: '集中采购率_分部门', code: 'M_DXT_00003808',
        indicatorCode: 'M_DXT_00003808', indicatorDisplayName: '集中采购率_分部门',
        indicatorShowName: '集中采购率_分部门',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-22', name: '公开采购率_分部门', code: 'M_DXT_00003806',
        indicatorCode: 'M_DXT_00003806', indicatorDisplayName: '公开采购率_分部门',
        indicatorShowName: '公开采购率_分部门',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-23', name: '公开招标率_全局', code: 'M_DXT_00003803',
        indicatorCode: 'M_DXT_00003803', indicatorDisplayName: '公开招标率_全局',
        indicatorShowName: '公开招标率_全局',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '全局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      result.push({
        id: 'dept-采供中心-ind-24', name: '公开招标率_分部门', code: 'M_DXT_00003804',
        indicatorCode: 'M_DXT_00003804', indicatorDisplayName: '公开招标率_分部门',
        indicatorShowName: '公开招标率_分部门',
        indicatorType: '原子指标',
        level1: '经营', level2: '',
        granularity: '区局', frequency: '月',
        unit: '%', isBigScreen: false, department: deptName,
        businessCaliber: '', techCaliber: '', tags: [],
        treeParentId: 'dept-采供中心-l2-18', tagIds: [], ruleIds: [],
      } as IndicatorAttachment)
      break
    }
  }
  return result
}

export function generateMockTagNodes(_departmentId: string): TagNode[] {
  return [
    { id: 'tag-root-biz', name: '业务分类', color: '#3B82F6' },
    { id: 'tag-key-monitor', name: '重点监控', parentId: 'tag-root-biz', color: '#EF4444' },
    { id: 'tag-normal-monitor', name: '常规监控', parentId: 'tag-root-biz', color: '#10B981' },
    { id: 'tag-temp-monitor', name: '临时监控', parentId: 'tag-root-biz', color: '#F59E0B' },
    { id: 'tag-kpi', name: '考核指标', parentId: 'tag-root-biz', color: '#EF4444' },
    { id: 'tag-report', name: '上报指标', parentId: 'tag-root-biz', color: '#3B82F6' },
    { id: 'tag-ref', name: '参考指标', parentId: 'tag-root-biz', color: '#8B5CF6' },
    { id: 'tag-root-quality', name: '数据质量', color: '#10B981' },
    { id: 'tag-high-conf', name: '高置信度', parentId: 'tag-root-quality', color: '#10B981' },
    { id: 'tag-mid-conf', name: '中置信度', parentId: 'tag-root-quality', color: '#F59E0B' },
    { id: 'tag-low-conf', name: '低置信度', parentId: 'tag-root-quality', color: '#EF4444' },
    { id: 'tag-caliber-clear', name: '口径明确', parentId: 'tag-root-quality', color: '#10B981' },
    { id: 'tag-caliber-pending', name: '口径待确认', parentId: 'tag-root-quality', color: '#F59E0B' },
    { id: 'tag-root-mgmt', name: '管理属性', color: '#8B5CF6' },
    { id: 'tag-core', name: '核心指标', parentId: 'tag-root-mgmt', color: '#8B5CF6' },
    { id: 'tag-normal', name: '普通指标', parentId: 'tag-root-mgmt', color: '#3B82F6' },
    { id: 'tag-pilot', name: '试点指标', parentId: 'tag-root-mgmt', color: '#F59E0B' },
    { id: 'tag-deprecated', name: '下线指标', parentId: 'tag-root-mgmt', color: '#6B7280' },
    { id: 'tag-focus-high', name: '重点关注区', parentId: 'tag-root-mgmt', color: '#EF4444' },
    { id: 'tag-focus-normal', name: '一般关注区', parentId: 'tag-root-mgmt', color: '#3B82F6' },
  ]
}

export function generateMockRules(): Rule[] {
  return [
    { id: 'rule-abnormal', name: '异常规则', type: 'threshold' as const, enabled: true },
    { id: 'rule-threshold', name: '阈值上下限', type: 'threshold' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-threshold-p1', name: 'P1 级阈值告警', type: 'threshold' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-threshold-p2', name: 'P2 级阈值告警', type: 'threshold' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-topn', name: 'TOPN 监控', type: 'topn' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-topn-10', name: 'TOP-10 降序监控', type: 'topn' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-anomaly-algo', name: '异常算法', type: 'fluctuation' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-fluctuation', name: '波动算法', type: 'fluctuation' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-fluctuation-yoy', name: '同比波动检测', type: 'fluctuation' as const, parentId: 'rule-abnormal', enabled: false },
    { id: 'rule-fluctuation-mom', name: '环比波动检测', type: 'fluctuation' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-pearson', name: '皮尔逊算法', type: 'fluctuation' as const, parentId: 'rule-abnormal', enabled: true },
    { id: 'rule-quality', name: '质量规则', type: 'threshold' as const, enabled: true },
    { id: 'rule-compliance', name: '合规规则', type: 'threshold' as const, enabled: true },
  ]
}

export function generateMockRuleParameters(): RuleParameter[] {
  return [
    { ruleId: 'rule-threshold-p1', indicatorId: '', upperLimit: 120, lowerLimit: 80, unit: '%', level: 'P1' },
    { ruleId: 'rule-threshold-p2', indicatorId: '', upperLimit: 110, lowerLimit: 90, unit: '%', level: 'P2' },
    { ruleId: 'rule-fluctuation-yoy', indicatorId: '', algorithm: '同比', window: '1M' },
    { ruleId: 'rule-fluctuation-mom', indicatorId: '', algorithm: '环比', window: '1M' },
    { ruleId: 'rule-topn-10', indicatorId: '', n: 10, dimension: 'QPS' },
  ]
}

export function generateMockUiState(): AttachmentUiState {
  return { selectedDepartmentId: 'dept-财务部', expandedTreeNodeIds: [], expandedTagNodeIds: [], selectedIndicatorIds: [] }
}