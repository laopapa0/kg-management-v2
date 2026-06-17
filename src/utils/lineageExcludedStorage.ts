const LS_KEY = 'kgv2-excluded-relation-ids'
const ADDED_KEY = 'kgv2-added-relations'
const MODIFIED_KEY = 'kgv2-modified-relations'

export interface AddedRelation {
  sourceName: string
  targetName: string
  relationType: string
}

export interface ModifiedRelation {
  sourceName: string
  targetName: string
  oldType: string
  newType: string
}

// --- excluded ---
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
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

// --- added ---
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
  try { return JSON.parse(localStorage.getItem(ADDED_KEY) || '[]') } catch { return [] }
}

// --- modified ---
export function addModifiedRelation(rel: ModifiedRelation): void {
  const existing = getModifiedRelations()
  existing.push(rel)
  localStorage.setItem(MODIFIED_KEY, JSON.stringify(existing))
}

export function getModifiedRelations(): ModifiedRelation[] {
  try { return JSON.parse(localStorage.getItem(MODIFIED_KEY) || '[]') } catch { return [] }
}
