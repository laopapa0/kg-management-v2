import type { KnowledgeBase, KnowledgeDocument, VersionRecord } from '@/models/knowledgeBaseModel';

const KB_KEY = 'kg-knowledge-bases';
const DOC_KEY = 'kg-knowledge-documents';

/** 读取知识库列表（首次访问自动初始化默认知识库） */
export function getKnowledgeBases(): KnowledgeBase[] {
  try {
    const raw = localStorage.getItem(KB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // JSON parse 失败，回退到重新初始化
  }

  // 首次访问或数据损坏：创建默认知识库
  const defaultBase: KnowledgeBase = {
    id: 'default',
    name: '默认业务知识库',
    type: 'default',
    description: '系统预设的默认业务知识库，所有业务部门上传的默认目标',
    createdAt: new Date().toISOString(),
    documentCount: 0,
  };
  localStorage.setItem(KB_KEY, JSON.stringify([defaultBase]));
  return [defaultBase];
}

/** 通过 ID 查找知识库 */
export function getKnowledgeBaseById(id: string): KnowledgeBase | undefined {
  return getKnowledgeBases().find((b) => b.id === id);
}

function saveBases(bases: KnowledgeBase[]): void {
  localStorage.setItem(KB_KEY, JSON.stringify(bases));
}

function isNameDuplicate(
  name: string,
  excludeId?: string,
): boolean {
  const trimmed = name.trim();
  return getKnowledgeBases().some(
    (b) => b.name === trimmed && b.id !== excludeId,
  );
}

/** 创建专业知识库 */
export function createKnowledgeBase(params: {
  name: string;
  description: string;
}): KnowledgeBase {
  const trimmedName = params.name.trim();
  if (!trimmedName) {
    throw new Error('知识库名称必填');
  }
  if (isNameDuplicate(trimmedName)) {
    throw new Error('知识库名称已存在');
  }

  const newBase: KnowledgeBase = {
    id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    type: 'professional',
    description: params.description.trim(),
    createdAt: new Date().toISOString(),
    documentCount: 0,
  };

  const bases = getKnowledgeBases();
  bases.push(newBase);
  saveBases(bases);
  return newBase;
}

/** 更新知识库 */
export function updateKnowledgeBase(
  id: string,
  params: { name: string; description: string },
): KnowledgeBase {
  const bases = getKnowledgeBases();
  const index = bases.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('知识库不存在');
  }

  const trimmedName = params.name.trim();
  if (!trimmedName) {
    throw new Error('知识库名称必填');
  }
  if (isNameDuplicate(trimmedName, id)) {
    throw new Error('知识库名称已存在');
  }

  bases[index] = {
    ...bases[index],
    name: trimmedName,
    description: params.description.trim(),
  };
  saveBases(bases);
  return bases[index];
}

/** 删除知识库 */
export function deleteKnowledgeBase(id: string): void {
  if (id === 'default') {
    throw new Error('默认业务知识库不可删除');
  }

  const bases = getKnowledgeBases();
  const index = bases.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error('知识库不存在');
  }

  bases.splice(index, 1);
  saveBases(bases);
}

/* ─── 知识文档 ─── */

function saveDocuments(docs: KnowledgeDocument[]): void {
  // 只存元数据，chunks 不序列化
  const serialized = docs.map(({ chunks: _, ...meta }) => meta);
  localStorage.setItem(DOC_KEY, JSON.stringify(serialized));
}

/** 读取知识文档列表 */
export function getKnowledgeDocuments(): KnowledgeDocument[] {
  try {
    const raw = localStorage.getItem(DOC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // chunks 在 localStorage 中不保存，读取时补充空数组
        return parsed.map((doc) => ({ ...doc, chunks: [] }));
      }
    }
  } catch {
    // JSON parse 失败，回退到空数组
  }
  return [];
}

/** 创建知识文档 */
export function createKnowledgeDocument(
  params: Omit<KnowledgeDocument, 'id' | 'uploadTime'>,
): KnowledgeDocument {
  const newDoc: KnowledgeDocument = {
    ...params,
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uploadTime: new Date().toISOString(),
  };

  const docs = getKnowledgeDocuments();
  docs.push(newDoc);
  saveDocuments(docs);

  // 更新对应知识库文档计数
  const bases = getKnowledgeBases();
  const baseIndex = bases.findIndex((b) => b.id === params.targetKnowledgeBaseId);
  if (baseIndex !== -1) {
    bases[baseIndex] = {
      ...bases[baseIndex],
      documentCount: bases[baseIndex].documentCount + 1,
    };
    saveBases(bases);
  }

  return newDoc;
}

/** 更新知识文档（用于重新编辑等场景） */
export function updateKnowledgeDocument(
  id: string,
  params: {
    name: string;
    fileSize: number;
    status: KnowledgeDocument['status'];
    segmentConfig: KnowledgeDocument['segmentConfig'];
    fileType?: string;
    targetKnowledgeBaseId?: string;
  },
): KnowledgeDocument {
  const docs = getKnowledgeDocuments();
  const index = docs.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('文档不存在');
  }

  docs[index] = {
    ...docs[index],
    ...params,
    uploadTime: new Date().toISOString(),
  };
  saveDocuments(docs);
  return docs[index];
}

/** 审核知识文档（追加审核记录到历史数组） */
export function addVersionRecord(
  id: string,
  updates: {
    versionRecord: VersionRecord;
  },
): KnowledgeDocument {
  const docs = getKnowledgeDocuments();
  const index = docs.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('文档不存在');
  }

  const existing = docs[index];
  const versionRecords: VersionRecord[] = existing.versionRecords
    ? [...existing.versionRecords]
    : [];
  versionRecords.push(updates.versionRecord);

  docs[index] = {
    ...existing,
    versionRecords,
  };
  saveDocuments(docs);
  return docs[index];
}
