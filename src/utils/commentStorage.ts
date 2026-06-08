import type { Comment } from '@/models/commentModel'
import { readFromStorage, writeToStorage, __resetMemoryCache } from '@/utils/storageHelper'

const KEY = 'kgv2-comments'

export function getComments(): Comment[] {
  return readFromStorage<Comment[]>(KEY, [])
}

export function saveComments(data: Comment[]): void {
  writeToStorage(KEY, data)
}

export function addComment(comment: Comment): void {
  const existing = getComments()
  saveComments([...existing, comment])
}

export function getCommentsByTarget(targetId: string, targetType: string): Comment[] {
  return getComments().filter((c) => c.targetId === targetId && c.targetType === targetType)
}

export function __resetCommentStorageCache(): void {
  __resetMemoryCache()
}
