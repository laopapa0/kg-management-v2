import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RuleFilterPanel from './RuleFilterPanel';
import IndicatorScopePanel from './IndicatorScopePanel';

export interface PlanFormData {
  name: string;
  triggerType: 'periodic' | 'rule-based' | 'manual';
  cronExpression: string;
  graphVersion: string;
  indicatorScope: {
    byObjectType: string[];
    byTags: string[];
  };
  excludedRuleIds: string[];
}

interface InspectionPlanFormProps {
  initialData?: PlanFormData;
  onCancel: () => void;
  onSave: (data: PlanFormData) => void;
}

const weeklyOptions = [
  { value: '0 9 * * 1', label: '每周一 09:00' },
  { value: '0 9 * * 2', label: '每周二 09:00' },
  { value: '0 9 * * 3', label: '每周三 09:00' },
  { value: '0 9 * * 4', label: '每周四 09:00' },
  { value: '0 9 * * 5', label: '每周五 09:00' },
  { value: '0 9 * * 6', label: '每周六 09:00' },
  { value: '0 9 * * 0', label: '每周日 09:00' },
];

const monthlyOptions = Array.from({ length: 31 }, (_, i) => ({
  value: `0 9 ${i + 1} * *`,
  label: `每月${i + 1}号 09:00`,
}));

const periodicOptions = [
  { label: '每周', options: weeklyOptions },
  { label: '每月', options: monthlyOptions },
];

const defaultFormData: PlanFormData = {
  name: '',
  triggerType: 'periodic',
  cronExpression: weeklyOptions[0].value,
  graphVersion: 'v2.3.1',
  indicatorScope: {
    byObjectType: [],
    byTags: [],
  },
  excludedRuleIds: [],
};

export default function InspectionPlanForm({ initialData, onCancel, onSave }: InspectionPlanFormProps) {
  const [formData, setFormData] = useState<PlanFormData>(initialData ?? defaultFormData);

  const [errors, setErrors] = useState<{ name?: string }>({});



  const updateField = <K extends keyof PlanFormData>(
    field: K,
    value: PlanFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleScopeChange = (categories: string[], tags: string[]) => {
    setFormData((prev) => ({
      ...prev,
      indicatorScope: { byObjectType: categories, byTags: tags },
    }));
  };

  return (
    <div className="space-y-5">
      {/* 基础信息 */}
      <div>
        <h3 className="text-[15px] font-semibold text-[#1a202c] mb-4">基础信息</h3>
        <div className="space-y-4">
          {/* 计划名称 */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-[13px] text-[#1a202c]">
              计划名称
            </Label>
            <Input
              id="plan-name"
              value={formData.name}
              onChange={(e) => {
                updateField('name', e.target.value);
                if (errors.name) setErrors({});
              }}
              placeholder="请输入巡检计划名称"
              className="h-9 text-[13px] border-[#e8ecf1] focus-visible:ring-[#3478f6]"
            />
            {errors.name && (
              <p className="text-[12px] text-[#dc2626]">{errors.name}</p>
            )}
          </div>

          {/* 触发周期类型 */}
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[#1a202c]">触发周期类型</Label>
            <RadioGroup
              value={formData.triggerType}
              onValueChange={(value) =>
                updateField('triggerType', value as PlanFormData['triggerType'])
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="periodic" id="trigger-periodic" />
                <Label
                  htmlFor="trigger-periodic"
                  className="text-[13px] text-[#1a202c] cursor-pointer font-normal"
                >
                  定期
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rule-based" id="trigger-rule-based" />
                <Label
                  htmlFor="trigger-rule-based"
                  className="text-[13px] text-[#1a202c] cursor-pointer font-normal"
                >
                  自动触发
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="trigger-manual" />
                <Label
                  htmlFor="trigger-manual"
                  className="text-[13px] text-[#1a202c] cursor-pointer font-normal"
                >
                  手动触发
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 周期类型对应的动态配置 */}
          {formData.triggerType === 'periodic' && (
            <div className="space-y-1.5">
              <Label htmlFor="cron-expression" className="text-[13px] text-[#1a202c]">
                执行周期
              </Label>
              <Select
                value={formData.cronExpression}
                onValueChange={(value) => updateField('cronExpression', value)}
              >
                <SelectTrigger id="cron-expression" className="h-9 text-[13px] border-[#e8ecf1] w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodicOptions.map((group) => (
                    <div key={group.label}>
                      <div className="px-2 py-1.5 text-xs text-[#6b7789] font-medium">
                        {group.label}
                      </div>
                      {group.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.triggerType === 'rule-based' && (
            <div className="rounded-md border border-dashed border-[#e8ecf1] bg-[#f8f9fb] p-4">
              <p className="text-[13px] text-[#6b7789]">
                选择要监听的异常规则，具体 UI 在后续 slice 实现
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 指标范围 */}
      <IndicatorScopePanel
        selectedCategories={formData.indicatorScope.byObjectType}
        selectedTags={formData.indicatorScope.byTags}
        onChange={handleScopeChange}
      />

      {/* 图谱版本 */}
      <div>
        <h3 className="text-[15px] font-semibold text-[#1a202c] mb-4">图谱版本</h3>
        <div className="space-y-1.5">
          <Label htmlFor="graph-version" className="text-[13px] text-[#1a202c]">
            版本
          </Label>
          <Select value={formData.graphVersion} disabled>
            <SelectTrigger
              id="graph-version"
              className="h-9 text-[13px] border-[#e8ecf1] w-[180px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="v2.3.1" className="text-[13px]">
                v2.3.1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 异常规则排除 */}
      <RuleFilterPanel
        selectedRuleIds={formData.excludedRuleIds}
        onChange={(ids) => updateField('excludedRuleIds', ids)}
      />

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-[13px] border-[#e8ecf1] text-[#6b7789] hover:text-[#1a202c]"
        >
          取消
        </Button>
        <Button
          onClick={() => {
            if (!formData.name.trim()) {
              setErrors({ name: '计划名称不能为空' });
              return;
            }
            setErrors({});
            onSave(formData);
          }}
          className="text-[13px] bg-[#3478f6] hover:bg-[#2563eb] text-white"
        >
          保存
        </Button>
      </div>
    </div>
  );
}
