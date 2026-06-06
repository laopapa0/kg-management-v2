You are a senior React/TypeScript developer. You need to modify the file `src/pages/rule-config/RuleConfigPage.tsx` with several precise changes.

## CRITICAL RULES
1. Use the `edit_file` tool for ALL changes. NEVER use write_file or shell commands to modify the file.
2. After EVERY change, verify with: `cd $HOME/app-fix-0601-v2 && npx tsc --noEmit 2>&1 | head -10`
3. Only modify the exact sections specified. Do not touch any other code.
4. The file is 1533 lines. Read sections carefully before editing.

## Step 1: Fix flex height chain (Problem 3 - scrolling)

First read lines 875-885 to find these exact patterns:

a) Change the outer container div from:
```
className="flex-1 min-w-0 overflow-hidden"
```
to:
```
className="flex-1 min-w-0 overflow-hidden flex flex-col"
```

b) Change the motion.div inside cascade/edit from:
```
className="h-full flex flex-col bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
```
to:
```
className="h-full min-h-0 flex flex-col bg-white rounded-lg border border-[#e8ecf1] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
```

c) Replace `<ScrollArea className="flex-1">` with `<div className="flex-1 min-h-0 overflow-y-auto">` and replace the matching `</ScrollArea>` with `</div>`.

## Step 2: Modify useRuleTree (Problem 4 - L3 as leaf)

Read lines 151-185. Replace the useRuleTree function so L3 template nodes no longer have children (rule instances). Instead, they show a ruleCount.

Replace the return statement inside useRuleTree (the `.map((tmpl) => {` block) from:
```tsx
            const matchedRules = rules.filter(
              (r) => r.categoryId === cat.id && r.subCategoryId === sub.id && r.templateId === tmpl.id
            );
            return {
              id: tmpl.id,
              name: tmpl.name,
              type: 'template' as const,
              children: matchedRules.map((r) => ({
                id: r.id,
                name: r.name,
                type: 'rule' as const,
                rule: r,
              })),
            };
```
to:
```tsx
            return {
              id: tmpl.id,
              name: tmpl.name,
              type: 'template' as const,
              ruleCount: rules.filter(
                (r) => r.categoryId === cat.id && r.subCategoryId === sub.id && r.templateId === tmpl.id
              ).length,
            };
```

## Step 3: Modify RuleTreeNode component

Read lines 192-270. Make these changes:

a) Replace the interface TreeNodeProps:
```tsx
interface TreeNodeProps {
  node: RuleTreeNode;
  selectedTemplateId: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelectTemplate: (templateId: string) => void;
}
```

b) Replace the function signature and body. The key changes:
- isSelected: `node.type === 'template' && node.id === selectedTemplateId`
- onClick: if template → onSelectTemplate, else if hasChildren → toggleExpand
- Chevron: only show for non-template nodes with children
- Indentation: subcategory pl-4, template pl-6
- Badge: show "X 条" for templates using (node as any).ruleCount
- Remove all rule-related rendering (rule status badge)

## Step 4: Add handleSelectTemplate callback

Read around line 430-445 (after handleToggleExpand). Add after handleToggleExpand:
```tsx
  const handleSelectTemplate = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    for (const cat of ruleCategories) {
      const subs = ruleSubCategories[cat.id] || [];
      for (const sub of subs) {
        const templates = ruleTemplatesDef[sub.id] || [];
        if (templates.find((t) => t.id === templateId)) {
          setSelectedCategoryId(cat.id);
          setSelectedSubCategoryId(sub.id);
          break;
        }
      }
    }
    setRightMode('cascade');
  }, []);
```

## Step 5: Update left panel tree rendering

Find the RuleTreeNode usage in the left panel (search for `selectedRuleId={editingRuleId}`). Change to:
```tsx
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleSelectTemplate}
```

## Step 6: Add templateRules computed

After the `currentTemplate` computed definition, add:
```tsx
  const templateRules = useMemo(() => {
    if (!selectedTemplateId) return [];
    return rules.filter((r) => r.templateId === selectedTemplateId);
  }, [rules, selectedTemplateId]);
```

## Step 7: Add formatParams helper

Before `const knowledgeDocs`, add:
```tsx
function formatParams(params: Record<string, unknown>): string {
  return Object.entries(params)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}
```

## Step 8: Replace cascade content with template detail

Read lines 900-1040 (inside ScrollArea/div content). Find and replace the content inside `<div className="p-5 space-y-6">`...`</div>` (just before the footer). 

Replace everything from the first `<div>` after `<div className="p-5 space-y-6">` up to the closing `</div>` before `<DialogFooter` with:
```tsx
                    {/* Template breadcrumb */}
                    <div>
                      <div className="flex items-center gap-2 text-[12px] text-[#9ba4b3] mb-2">
                        <span>{currentCategory?.name}</span>
                        <ChevronRight size={12} />
                        <span>{currentSubCategory?.name}</span>
                        <ChevronRight size={12} />
                        <span className="text-[#3478f6] font-medium">{currentTemplate?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold text-[#2d3748]">
                          已配置规则 ({templateRules.length})
                        </h2>
                        <button
                          onClick={() => { resetForm(); setRuleName(generateRuleName(selectedCategoryId, selectedSubCategoryId, selectedTemplateId)); setSelectedIndicators([INDICATOR_NAME]); setShowRuleDialog(true); }}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#3478f6] text-white text-[13px] font-medium hover:bg-[#1d5ee0] transition-colors"
                        >
                          <Plus size={14} />
                          添加新规则
                        </button>
                      </div>
                    </div>

                    {/* Rules Table */}
                    {templateRules.length === 0 ? (
                      <div className="text-center py-16 text-[13px] text-[#9ba4b3]">
                        <div className="w-12 h-12 rounded-full bg-[#f1f3f6] flex items-center justify-center mx-auto mb-3">
                          <MousePointerClick size={20} className="text-[#c4cad4]" />
                        </div>
                        <p>该模板下暂无配置规则</p>
                        <p className="mt-1">点击上方"添加新规则"开始配置</p>
                      </div>
                    ) : (
                      <div className="border border-[#e8ecf1] rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-[#f1f3f6]">
                            <tr className="border-b border-[#e8ecf1]">
                              <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">指标名称</th>
                              <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">指标编码</th>
                              <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568]">规则参数</th>
                              <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568] w-[80px]">状态</th>
                              <th className="h-10 px-4 text-left text-[12px] font-medium text-[#4a5568] w-[100px]">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {templateRules.map((rule) =>
                              rule.indicators.map((indName) => {
                                const indInfo = availableIndicators.find((i) => i.name === indName);
                                return (
                                  <tr key={`${rule.id}-${indName}`} className="border-b border-[#e8ecf1] last:border-0 hover:bg-[#f8f9fb]">
                                    <td className="h-11 px-4 text-[13px] text-[#2d3748] font-medium">{indName}</td>
                                    <td className="h-11 px-4 text-[12px] text-[#9ba4b3] font-mono">{indInfo?.code ?? '-'}</td>
                                    <td className="h-11 px-4 text-[12px] text-[#6b7789]">{formatParams(rule.params)}</td>
                                    <td className="h-11 px-4">
                                      <span className={cn('text-[11px] px-2 py-0.5 rounded', rule.status === 'active' ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#f1f3f6] text-[#9ba4b3]')}>{rule.status === 'active' ? '启用' : '草稿'}</span>
                                    </td>
                                    <td className="h-11 px-4">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => openEditDialog(rule)} className="text-[12px] text-[#3478f6] hover:underline">编辑</button>
                                        <button onClick={() => confirmDelete(rule.id)} className="text-[12px] text-[#ef4444] hover:underline">删除</button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
```

## Step 9: Add state and callbacks

Add to state section (after businessCalendar):
```tsx
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingDialogRule, setEditingDialogRule] = useState<ConfiguredRule | null>(null);
```

Add after handleCancel:
```tsx
  const openEditDialog = (rule: ConfiguredRule) => {
    setEditingDialogRule(rule);
    setRuleName(rule.name);
    setSelectedIndicators(rule.indicators);
    setParams(rule.params);
    setDescription(rule.description);
    setBusinessCalendar(rule.businessCalendar);
    setShowRuleDialog(true);
  };
  const closeEditDialog = () => {
    setShowRuleDialog(false);
    setEditingDialogRule(null);
    setRuleName('');
    setSelectedIndicators([]);
    setParams({});
    setDescription('');
  };
  const confirmDelete = (ruleId: string) => {
    setDeleteTargetId(ruleId);
    setShowDeleteDialog(true);
  };
```

## Step 10: Add Dialog at the end

Before the final `</motion.div>`, add the rule edit Dialog (after the Publish Confirm Dialog, before `</motion.div>`):

```tsx
      {/* ─── Rule Edit Dialog ─── */}
      <Dialog open={showRuleDialog} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[18px]">{editingDialogRule ? '编辑规则' : '添加新规则'}</DialogTitle>
          </DialogHeader>
          <div className="p-3 bg-[#f8f9fb] rounded-md mb-4">
            <div className="flex items-center gap-2 text-[12px] text-[#6b7789]">
              <span>{currentCategory?.name}</span><ChevronRight size={12} />
              <span>{currentSubCategory?.name}</span><ChevronRight size={12} />
              <span className="text-[#3478f6] font-medium">{currentTemplate?.name}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-[14px] font-medium">规则名称</Label>
              <Input value={ruleName} onChange={(e) => setRuleName(e.target.value)} placeholder="输入规则名称" className="mt-1.5 h-9" />
            </div>
            <div>
              <Label className="text-[14px] font-medium">关联指标 <span className="text-[#ef4444]">*</span></Label>
              <Select value={selectedIndicators[0] || ''} onValueChange={(v) => setSelectedIndicators(v ? [v] : [])}>
                <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="选择指标" /></SelectTrigger>
                <SelectContent>
                  {availableIndicators.map((ind) => (
                    <SelectItem key={ind.id} value={ind.name}>{ind.name} ({ind.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-t border-[#e8ecf1] pt-4">
              <h4 className="text-[14px] font-medium text-[#2d3748] mb-3">规则参数</h4>
              <div className="space-y-3">
                {currentTemplate?.params.map((param) => (
                  <div key={param.name}>
                    <Label className="text-[13px] text-[#4a5568]">{param.name}</Label>
                    {param.type === 'select' ? (
                      <Select value={String(params[param.name] ?? param.default)} onValueChange={(v) => setParams((prev) => ({ ...prev, [param.name]: v }))}>
                        <SelectTrigger className="mt-1 h-8 text-[13px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(param.name === 'severity' ? severityOptions : param.name === 'sortOrder' ? sortOrderOptions : param.name === 'period' ? periodOptions : param.name === 'baseline' ? baselineOptions : []).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input type={param.type === 'number' ? 'number' : 'text'} value={String(params[param.name] ?? param.default)} onChange={(e) => setParams((prev) => ({ ...prev, [param.name]: e.target.value }))} className="mt-1 h-8 text-[13px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[14px] font-medium">规则描述</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="说明规则逻辑、适用条件..." className="mt-1.5 min-h-[80px]" />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={closeEditDialog}>取消</Button>
            <Button className="bg-[#3478f6] hover:bg-[#1d5ee0] text-white" onClick={() => {
              if (editingDialogRule) {
                setRules((prev) => prev.map((r) => r.id === editingDialogRule.id ? { ...r, name: ruleName, indicators: selectedIndicators, params, description, businessCalendar } : r));
                toast.success('规则已更新');
              } else {
                const newRule = { id: `R${String(rules.length + 1).padStart(3, '0')}`, name: ruleName || generateRuleName(selectedCategoryId, selectedSubCategoryId, selectedTemplateId), type: currentTemplate?.name || '', categoryId: selectedCategoryId, subCategoryId: selectedSubCategoryId, templateId: selectedTemplateId, indicators: selectedIndicators.length > 0 ? selectedIndicators : [INDICATOR_NAME], params, status: 'active' as const, description, docs: selectedDocs, businessCalendar };
                setRules((prev) => [...prev, newRule]);
                toast.success('规则已添加');
              }
              closeEditDialog();
            }}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
```

After all changes, verify with `npx tsc --noEmit` and `git add -A && git commit -m "adjust: rule-config right panel refactor"`
