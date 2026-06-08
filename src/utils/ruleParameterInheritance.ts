import type { Rule, RuleParameter } from '@/models/indicatorAttachmentModel'

export function getParentRuleId(ruleId: string, rules: Rule[]): string | undefined {
  return rules.find((r) => r.id === ruleId)?.parentId
}

export function getEffectiveParameter(
  ruleId: string,
  rules: Rule[],
  ruleParameters: RuleParameter[],
): RuleParameter | undefined {
  const explicit = ruleParameters.find((p) => p.ruleId === ruleId && p.indicatorId === '')
  const parentId = getParentRuleId(ruleId, rules)

  if (!parentId) {
    return explicit
  }

  const parentParam = getEffectiveParameter(parentId, rules, ruleParameters)
  if (!parentParam) {
    return explicit
  }

  if (!explicit) {
    return {
      ...parentParam,
      ruleId,
      indicatorId: '',
      isInherited: true,
    }
  }

  return buildParameterWithOverrides(parentParam, explicit)
}

export function getDescendantRuleIds(ruleId: string, rules: Rule[]): string[] {
  const result: string[] = []
  const queue: string[] = [ruleId]
  let head = 0

  while (head < queue.length) {
    const current = queue[head++]
    for (const rule of rules) {
      if (rule.parentId === current) {
        result.push(rule.id)
        queue.push(rule.id)
      }
    }
  }

  return result
}

export function buildParameterWithOverrides(
  inherited: RuleParameter,
  explicit?: RuleParameter,
): RuleParameter {
  if (!explicit) {
    return inherited
  }

  const merged: RuleParameter = {
    ...inherited,
    ruleId: explicit.ruleId,
    indicatorId: explicit.indicatorId,
  }

  const overriddenFields = explicit.overriddenFields ?? []

  for (const field of overriddenFields) {
    const value = explicit[field as keyof RuleParameter]
    if (value !== undefined) {
      ;(merged as Record<string, unknown>)[field] = value
    }
  }

  // If a field is in overriddenFields but its value equals inherited, remove it
  const cleanedOverrides = overriddenFields.filter((field) => {
    const explicitValue = explicit[field as keyof RuleParameter]
    const inheritedValue = inherited[field as keyof RuleParameter]
    return explicitValue !== inheritedValue
  })

  if (cleanedOverrides.length > 0) {
    merged.overriddenFields = cleanedOverrides
    merged.isInherited = true
  } else {
    merged.overriddenFields = undefined
    merged.isInherited = true
  }

  return merged
}

export function cascadeParentChange(
  parentRuleId: string,
  rules: Rule[],
  ruleParameters: RuleParameter[],
  newParentParam: RuleParameter,
): { nextParams: RuleParameter[]; affectedCount: number } {
  const descendants = getDescendantRuleIds(parentRuleId, rules)
  let affectedCount = 0
  const nextParams = [...ruleParameters]

  for (const descId of descendants) {
    const idx = nextParams.findIndex(
      (p) => p.ruleId === descId && p.indicatorId === '',
    )
    if (idx >= 0) {
      const childParam = nextParams[idx]
      if (childParam.isInherited) {
        const overriddenFields = childParam.overriddenFields ?? []
        const updatedParam: RuleParameter = { ...childParam }
        for (const key of Object.keys(newParentParam)) {
          if (
            key !== 'ruleId' &&
            key !== 'indicatorId' &&
            !overriddenFields.includes(key)
          ) {
            ;(updatedParam as Record<string, unknown>)[key] = (
              newParentParam as Record<string, unknown>
            )[key]
          }
        }
        nextParams[idx] = updatedParam
        affectedCount++
      }
    }
  }

  return { nextParams, affectedCount }
}
