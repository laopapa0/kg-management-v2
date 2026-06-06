import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  X,
  Plus,
  AlertTriangle,
  Check,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SearchInput from '@/components/SearchInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/* ─── Enhanced Mock Data ─── */

interface Indicator {
  id: string;
  name: string;
  code: string;
  existingTags: string[];
}

const availableIndicators: Indicator[] = [
  { id: 'IND-0056', name: '5G用户渗透率', code: 'IND-2024-0056', existingTags: ['核心指标', '集团考核', '月度跟踪', '5G业务'] },
  { id: 'IND-0057', name: '5G流量占比', code: 'IND-2024-0057', existingTags: ['常规监控', '5G业务'] },
  { id: 'IND-0102', name: '宽带用户数', code: 'IND-2024-0102', existingTags: ['考核指标', '家庭业务'] },
  { id: 'IND-0089', name: '客户满意度', code: 'IND-2024-0089', existingTags: ['核心指标', '上报指标', '服务品质'] },
  { id: 'IND-0201', name: '移动业务收入', code: 'IND-2024-0201', existingTags: ['核心指标', '收入分析'] },
  { id: 'IND-0034', name: '网络故障率', code: 'IND-2024-0034', existingTags: ['网络质量', '高优先级'] },
  { id: 'IND-0076', name: '全网约收入', code: 'IND-2024-0076', existingTags: ['核心指标', '集团考核'] },
  { id: 'IND-0151', name: '用户ARPU', code: 'IND-2024-0151', existingTags: ['用户价值', '月度跟踪'] },
];

// 增强的标签库，带颜色
interface TagItem {
  name: string;
  color: string;
  bgColor: string;
}

const tagLibrary: Record<string, TagItem[]> = {
  '管理属性': [
    { name: '核心指标', color: '#dc2626', bgColor: '#fef2f2' },
    { name: '集团考核', color: '#3478f6', bgColor: '#eef4ff' },
    { name: '月度跟踪', color: '#10b981', bgColor: '#ecfdf5' },
    { name: '高优先级', color: '#f59e0b', bgColor: '#fffbeb' },
    { name: '普通指标', color: '#6b7789', bgColor: '#f1f3f6' },
    { name: '试点指标', color: '#7c5cfc', bgColor: '#f3f0ff' },
  ],
  '业务分类': [
    { name: '5G业务', color: '#3478f6', bgColor: '#eef4ff' },
    { name: '家庭业务', color: '#10b981', bgColor: '#ecfdf5' },
    { name: '政企业务', color: '#7c5cfc', bgColor: '#f3f0ff' },
    { name: '收入分析', color: '#059669', bgColor: '#ecfdf5' },
    { name: '服务品质', color: '#f59e0b', bgColor: '#fffbeb' },
    { name: '网络质量', color: '#7c5cfc', bgColor: '#f3f0ff' },
    { name: '用户价值', color: '#3478f6', bgColor: '#eef4ff' },
  ],
  '监控类型': [
    { name: '重点监控', color: '#ef4444', bgColor: '#fef2f2' },
    { name: '常规监控', color: '#6b7789', bgColor: '#f1f3f6' },
    { name: '临时指标', color: '#9ba4b3', bgColor: '#f8f9fb' },
    { name: '考核指标', color: '#dc2626', bgColor: '#fef2f2' },
    { name: '上报指标', color: '#3478f6', bgColor: '#eef4ff' },
  ],
  '数据质量': [
    { name: '高置信度', color: '#10b981', bgColor: '#ecfdf5' },
    { name: '中置信度', color: '#f59e0b', bgColor: '#fffbeb' },
    { name: '待验证', color: '#6b7789', bgColor: '#f1f3f6' },
    { name: '口径明确', color: '#10b981', bgColor: '#ecfdf5' },
  ],
  '责任部门': [
    { name: '业务一部', color: '#0ea5e9', bgColor: '#f0f9ff' },
    { name: '业务二部', color: '#0ea5e9', bgColor: '#f0f9ff' },
    { name: '网络部', color: '#7c5cfc', bgColor: '#f3f0ff' },
    { name: '客服部', color: '#f59e0b', bgColor: '#fffbeb' },
    { name: '华东区局', color: '#10b981', bgColor: '#ecfdf5' },
  ],
};

/* ─── Helper: get tag color ─── */
function getTagStyle(tagName: string): { color: string; bgColor: string } {
  for (const tags of Object.values(tagLibrary)) {
    const found = tags.find((t) => t.name === tagName);
    if (found) return { color: found.color, bgColor: found.bgColor };
  }
  return { color: '#6b7789', bgColor: '#f1f3f6' };
}

/* ─── Main Component ─── */
export default function TagConfigPage() {
  const navigate = useNavigate();

  // Indicator selection - preselect first indicator
  const [indicatorSearch, setIndicatorSearch] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(
    availableIndicators[0]
  );
  const [showIndicatorDropdown, setShowIndicatorDropdown] = useState(false);

  // Indicator-level tags - preselect some tags
  const [tagSearch, setTagSearch] = useState('');
  const [selectedIndicatorTags, setSelectedIndicatorTags] = useState<string[]>([
    '核心指标', '集团考核', '月度跟踪', '5G业务'
  ]);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState('');
  const [newTagNamingExp, setNewTagNamingExp] = useState('');
  const [newTagReason, setNewTagReason] = useState('');

  // Confirm publish dialog
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Filter indicators
  const filteredIndicators = availableIndicators.filter(
    (ind) =>
      ind.name.includes(indicatorSearch) ||
      ind.code.toLowerCase().includes(indicatorSearch.toLowerCase())
  );

  // All flat tags
  const allTags = Object.values(tagLibrary).flat().map((t) => t.name);

  // Filtered tags for search
  const filteredTagCategories = Object.entries(tagLibrary).reduce(
    (acc, [category, tags]) => {
      const matched = tags.filter((t) => t.name.includes(tagSearch));
      if (matched.length > 0) acc[category] = matched;
      return acc;
    },
    {} as Record<string, TagItem[]>
  );

  // Toggle indicator tag
  const toggleIndicatorTag = (tag: string) => {
    setSelectedIndicatorTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle new tag submit
  const handleNewTagSubmit = () => {
    if (newTagName.trim() && newTagCategory) {
      setShowNewTagDialog(false);
      setNewTagName('');
      setNewTagCategory('');
      setNewTagNamingExp('');
      setNewTagReason('');
    }
  };

  // Handle publish
  const handlePublish = () => {
    setShowPublishDialog(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[960px] mx-auto pb-28"
    >
      {/* ─── Page Header ─── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center h-7 px-3 rounded-md border border-[#dde1e8] bg-white text-[13px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors mb-3"
          >
            <ArrowLeft size={14} className="mr-1" />
            返回
          </button>
          <h1 className="text-[22px] font-semibold text-[#1a202c] leading-tight tracking-tight">
            配置标签（标签选择器）
          </h1>
          <p className="text-[13px] text-[#6b7789] mt-1">
            为指标对象配置分类标签，支持指标级标签的选择与新建申请
          </p>
        </div>
      </div>

      {/* ─── Section 2: Indicator Selector ─── */}
      <div className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
        <div className="px-5 py-4 border-b border-[#e8ecf1]">
          <h3 className="text-[16px] font-medium text-[#2d3748]">选择指标</h3>
        </div>
        <div className="p-5">
          <div className="relative">
            <SearchInput
              placeholder="搜索已发布指标名称或编码"
              value={indicatorSearch}
              onChange={(val) => {
                setIndicatorSearch(val);
                setShowIndicatorDropdown(true);
              }}
              className="w-full"
              width="w-full"
            />
            <AnimatePresence>
              {showIndicatorDropdown && indicatorSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-[#e8ecf1] shadow-lg max-h-60 overflow-auto"
                >
                  {filteredIndicators.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => {
                        setSelectedIndicator(ind);
                        setIndicatorSearch('');
                        setShowIndicatorDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#f8f9fb] transition-colors border-b border-[#e8ecf1] last:border-0"
                    >
                      <div className="text-[14px] text-[#2d3748] font-medium">{ind.name}</div>
                      <div className="text-[12px] text-[#9ba4b3]">{ind.code}</div>
                    </button>
                  ))}
                  {filteredIndicators.length === 0 && (
                    <div className="px-4 py-6 text-center text-[13px] text-[#9ba4b3]">
                      未找到匹配的指标
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Indicator Card */}
          <AnimatePresence>
            {selectedIndicator && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="mt-4 p-4 rounded-lg bg-[#eef4ff] border border-[#bcd3ff] relative"
              >
                <button
                  onClick={() => setSelectedIndicator(null)}
                  className="absolute top-2 right-2 text-[#9ba4b3] hover:text-[#4a5568] transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-[#1a202c]">
                    {selectedIndicator.name}
                  </span>
                  <span className="text-[12px] text-[#6b7789]">{selectedIndicator.code}</span>
                </div>
                {selectedIndicator.existingTags.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[12px] text-[#6b7789]">已有标签:</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedIndicator.existingTags.map((t) => {
                        const style = getTagStyle(t);
                        return (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[11px] font-medium"
                            style={{ backgroundColor: style.bgColor, color: style.color }}
                          >
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Section 3: Indicator-level Tags ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      >
        <div className="px-5 py-4 border-b border-[#e8ecf1]">
          <h3 className="text-[16px] font-medium text-[#2d3748]">指标级标签</h3>
          <p className="text-[13px] text-[#6b7789] mt-0.5">
            作为标签打在对象类型上，用于指标分类和快速检索
          </p>
        </div>

        <div className="p-5">
          {/* Tag Search */}
          <div className="relative mb-4">
            <SearchInput
              placeholder="搜索标签或输入新建"
              value={tagSearch}
              onChange={(val) => setTagSearch(val)}
              className="w-full"
              width="w-full"
            />
            {tagSearch && !allTags.includes(tagSearch) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-[#e8ecf1] shadow-lg"
              >
                <button
                  onClick={() => {
                    setNewTagName(tagSearch);
                    setShowNewTagDialog(true);
                    setTagSearch('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#f8f9fb] transition-colors flex items-center text-[14px] text-[#3478f6]"
                >
                  <Plus size={16} className="mr-2" />
                  新建标签 &quot;{tagSearch}&quot;
                </button>
              </motion.div>
            )}
          </div>

          {/* Tag Groups */}
          {Object.entries(tagSearch ? filteredTagCategories : tagLibrary).map(
            ([category, tags]) => (
              <div key={category} className="mb-4">
                <h4 className="text-[12px] font-medium text-[#9ba4b3] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={12} />
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedIndicatorTags.includes(tag.name);
                    return (
                      <motion.button
                        key={tag.name}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleIndicatorTag(tag.name)}
                        className={cn(
                          'px-3 py-1.5 rounded text-[13px] font-medium transition-all duration-150 select-none flex items-center gap-1',
                          isSelected
                            ? 'text-white shadow-sm'
                            : 'hover:shadow-sm'
                        )}
                        style={
                          isSelected
                            ? { backgroundColor: tag.color, color: 'white' }
                            : { backgroundColor: tag.bgColor, color: tag.color }
                        }
                      >
                        {isSelected && <Check size={12} />}
                        {tag.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Selected Tags Display */}
          <div className="mt-5 p-4 bg-[#f8f9fb] rounded-md">
            <h4 className="text-[13px] font-medium text-[#4a5568] mb-2">
              已选标签 ({selectedIndicatorTags.length})
            </h4>
            {selectedIndicatorTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedIndicatorTags.map((tag) => {
                  const style = getTagStyle(tag);
                  return (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[12px] font-medium text-white"
                      style={{ backgroundColor: style.color }}
                    >
                      {tag}
                      <button
                        onClick={() => toggleIndicatorTag(tag)}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[#9ba4b3]">
                暂未选择标签，请从上方选择
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Bottom Action Bar ─── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8ecf1] px-6 py-4 flex justify-between items-center z-40"
        style={{ marginLeft: 240 }}
      >
        <button
          onClick={() => {
            setSelectedIndicatorTags([]);
          }}
          className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
        >
          重置
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
          >
            取消
          </button>
          <button
            onClick={() => setShowPublishDialog(true)}
            className="h-11 px-6 rounded-md bg-[#3478f6] text-white text-[14px] font-medium hover:bg-[#1d5ee0] transition-colors shadow-sm"
          >
            确认发布到图谱
          </button>
        </div>
      </motion.div>

      {/* ─── New Tag Dialog ─── */}
      <Dialog open={showNewTagDialog} onOpenChange={setShowNewTagDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#1a202c]">
              申请新建标签
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-[14px] font-medium text-[#2d3748] mb-1.5">
                标签名称
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="输入标签名称"
                className="h-9 w-full px-3 rounded-md border border-[#dde1e8] text-[14px] text-[#4a5568] placeholder:text-[#9ba4b3] focus:outline-none focus:border-[#5a96ff] focus:ring-2 focus:ring-[#d9e6ff] transition-all"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#2d3748] mb-1.5">
                标签分类
              </label>
              <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                <SelectTrigger className="h-9 w-full border-[#dde1e8] focus:ring-[#d9e6ff] focus:border-[#5a96ff]">
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="管理属性">管理属性</SelectItem>
                  <SelectItem value="业务分类">业务分类</SelectItem>
                  <SelectItem value="监控类型">监控类型</SelectItem>
                  <SelectItem value="数据质量">数据质量</SelectItem>
                  <SelectItem value="责任部门">责任部门</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#2d3748] mb-1.5">
                命名规范说明
              </label>
              <Textarea
                placeholder="说明标签命名理由..."
                value={newTagNamingExp}
                onChange={(e) => setNewTagNamingExp(e.target.value)}
                className="min-h-[80px] border-[#dde1e8] focus:ring-[#d9e6ff] focus:border-[#5a96ff]"
              />
            </div>
            <div>
              <label className="block text-[14px] font-medium text-[#2d3748] mb-1.5">
                申请理由
              </label>
              <Textarea
                placeholder="说明为什么需要这个新标签..."
                value={newTagReason}
                onChange={(e) => setNewTagReason(e.target.value)}
                className="min-h-[80px] border-[#dde1e8] focus:ring-[#d9e6ff] focus:border-[#5a96ff]"
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-md bg-[#fffbeb]">
              <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#d97706]">
                新建标签需 NOC 审核通过后方可使用
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowNewTagDialog(false)}
              className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleNewTagSubmit}
              className="h-9 px-4 rounded-md bg-[#3478f6] text-white text-[14px] font-medium hover:bg-[#1d5ee0] transition-colors"
            >
              提交申请
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Publish Confirm Dialog ─── */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[18px] font-semibold text-[#1a202c]">
              确认发布标签配置？
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-lg bg-[#f8f9fb] space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">选中指标</span>
                <span className="font-medium text-[#2d3748]">
                  {selectedIndicator?.name ?? '-'}
                </span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#6b7789]">指标级标签数</span>
                <span className="font-medium text-[#2d3748]">
                  {selectedIndicatorTags.length} 个
                </span>
              </div>
            </div>
            <p className="text-[13px] text-[#6b7789] mt-3">
              发布后将更新图谱中的标签信息
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowPublishDialog(false)}
              className="h-9 px-4 rounded-md border border-[#dde1e8] bg-white text-[14px] text-[#4a5568] hover:bg-[#f8f9fb] transition-colors"
            >
              取消
            </button>
            <button
              onClick={handlePublish}
              className="h-9 px-4 rounded-md bg-[#3478f6] text-white text-[14px] font-medium hover:bg-[#1d5ee0] transition-colors"
            >
              确认发布
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
