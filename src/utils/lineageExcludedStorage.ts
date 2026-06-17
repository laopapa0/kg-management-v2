const LS_KEY = 'kgv2-excluded-relation-ids'
const ADDED_KEY = 'kgv2-added-relations'

export interface AddedRelation {
  sourceName: string
  targetName: string
  relationType: string
}

export function addExcludedRelation(relationId: string): void {
  const existing = getExcludedRelations()
  if (!existing.includes(relationId)) {
    existing.push(relationId)
    localStorage.setItem(LS_KEY, JSON.stringify(existing))
  }
}

export function removeExcludedRelation(relationId: string): void {
  const existing = getExcludedRelations()
  const next = existing.filter((id) => id !== relationId)
  localStorage.setItem(LS_KEY, JSON.stringify(next))
}

export function getExcludedRelations(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

export function addCreatedRelation(rel: AddedRelation): void {
  const existing = getCreatedRelations()
  const dup = existing.find(
    (r) => r.sourceName === rel.sourceName && r.targetName === rel.targetName && r.relationType === rel.relationType,
  )
  if (!dup) {
    existing.push(rel)
    localStorage.setItem(ADDED_KEY, JSON.stringify(existing))
  }
}

export function getCreatedRelations(): AddedRelation[] {
  try {
    return JSON.parse(localStorage.getItem(ADDED_KEY) || '[]')
  } catch {
    return []
  }
}
