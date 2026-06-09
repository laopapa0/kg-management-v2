import { describe, it, expect, beforeEach } from 'vitest';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBaseById,
  getKnowledgeDocuments,
  createKnowledgeDocument,
  updateKnowledgeDocument,
  addVersionRecord,
} from './knowledgeBaseStorage';
import type { KnowledgeBase, KnowledgeDocument, SegmentConfig } from '@/models/knowledgeBaseModel';

const KB_KEY = 'kg-knowledge-bases';
const DOC_KEY = 'kg-knowledge-documents';

describe('knowledgeBaseStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /* ─── 初始化 ─── */

  it('首次读取时自动创建默认业务知识库', () => {
    const bases = getKnowledgeBases();
    expect(bases).toHaveLength(1);
    expect(bases[0].id).toBe('default');
    expect(bases[0].name).toBe('默认业务知识库');
    expect(bases[0].type).toBe('default');
    expect(bases[0].documentCount).toBe(0);
    expect(bases[0].createdAt).toBeTruthy();
  });

  it('重复读取不创建多个默认知识库', () => {
    getKnowledgeBases();
    getKnowledgeBases();
    const bases = getKnowledgeBases();
    expect(bases).toHaveLength(1);
  });

  it('localStorage 已存在数据时直接读取', () => {
    const existing: KnowledgeBase[] = [
      {
        id: 'default',
        name: '默认业务知识库',
        type: 'default',
        description: '',
        createdAt: '2026-06-01T00:00:00.000Z',
        documentCount: 3,
      },
    ];
    localStorage.setItem(KB_KEY, JSON.stringify(existing));
    const bases = getKnowledgeBases();
    expect(bases).toHaveLength(1);
    expect(bases[0].documentCount).toBe(3);
  });

  it('localStorage 数据损坏时回退到空数组并重新初始化', () => {
    localStorage.setItem(KB_KEY, 'not-json');
    const bases = getKnowledgeBases();
    expect(bases).toHaveLength(1);
    expect(bases[0].id).toBe('default');
  });

  /* ─── 创建 ─── */

  it('创建专业知识库成功', () => {
    getKnowledgeBases(); // 初始化默认
    const newBase = createKnowledgeBase({
      name: '5G业务知识库',
      description: '5G相关规范文档',
    });
    expect(newBase.id).toBeTruthy();
    expect(newBase.name).toBe('5G业务知识库');
    expect(newBase.type).toBe('professional');
    expect(newBase.documentCount).toBe(0);

    const bases = getKnowledgeBases();
    expect(bases).toHaveLength(2);
  });

  it('创建知识库时名称必填', () => {
    getKnowledgeBases();
    expect(() =>
      createKnowledgeBase({ name: '', description: '' }),
    ).toThrow('知识库名称必填');
  });

  it('创建知识库时名称全局唯一', () => {
    getKnowledgeBases();
    createKnowledgeBase({ name: '唯一名称', description: '' });
    expect(() =>
      createKnowledgeBase({ name: '唯一名称', description: '' }),
    ).toThrow('知识库名称已存在');
  });

  it('创建知识库时忽略首尾空格', () => {
    getKnowledgeBases();
    createKnowledgeBase({ name: '  专业库  ', description: '' });
    const bases = getKnowledgeBases();
    const found = bases.find((b) => b.name === '专业库');
    expect(found).toBeTruthy();
  });

  /* ─── 读取 ─── */

  it('通过 ID 读取知识库', () => {
    getKnowledgeBases();
    const created = createKnowledgeBase({ name: '测试库', description: '' });
    const found = getKnowledgeBaseById(created.id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe('测试库');
  });

  it('读取不存在的 ID 返回 undefined', () => {
    getKnowledgeBases();
    expect(getKnowledgeBaseById('not-exist')).toBeUndefined();
  });

  /* ─── 更新 ─── */

  it('更新知识库名称和描述', () => {
    getKnowledgeBases();
    const created = createKnowledgeBase({ name: '旧名', description: '旧描述' });
    const updated = updateKnowledgeBase(created.id, {
      name: '新名',
      description: '新描述',
    });
    expect(updated.name).toBe('新名');
    expect(updated.description).toBe('新描述');
    expect(updated.id).toBe(created.id);

    const bases = getKnowledgeBases();
    expect(bases.find((b) => b.id === created.id)?.name).toBe('新名');
  });

  it('更新时名称不能与已有知识库冲突', () => {
    getKnowledgeBases();
    createKnowledgeBase({ name: '库A', description: '' });
    const baseB = createKnowledgeBase({ name: '库B', description: '' });
    expect(() =>
      updateKnowledgeBase(baseB.id, { name: '库A', description: '' }),
    ).toThrow('知识库名称已存在');
  });

  it('更新时允许保持原名称不变', () => {
    getKnowledgeBases();
    const created = createKnowledgeBase({ name: '库A', description: '' });
    const updated = updateKnowledgeBase(created.id, {
      name: '库A',
      description: '新描述',
    });
    expect(updated.description).toBe('新描述');
  });

  it('更新不存在的知识库抛出错误', () => {
    getKnowledgeBases();
    expect(() =>
      updateKnowledgeBase('not-exist', { name: '新名', description: '' }),
    ).toThrow('知识库不存在');
  });

  /* ─── 删除 ─── */

  it('删除专业知识库成功', () => {
    getKnowledgeBases();
    const created = createKnowledgeBase({ name: '待删除', description: '' });
    deleteKnowledgeBase(created.id);
    const bases = getKnowledgeBases();
    expect(bases.find((b) => b.id === created.id)).toBeUndefined();
    expect(bases).toHaveLength(1); // 只剩默认
  });

  it('删除默认业务知识库抛出错误', () => {
    getKnowledgeBases();
    expect(() => deleteKnowledgeBase('default')).toThrow('默认业务知识库不可删除');
  });

  it('删除不存在的知识库抛出错误', () => {
    getKnowledgeBases();
    expect(() => deleteKnowledgeBase('not-exist')).toThrow('知识库不存在');
  });

  /* ─── 文档 ─── */

  it('首次读取文档列表返回空数组', () => {
    const docs = getKnowledgeDocuments();
    expect(docs).toEqual([]);
  });

  it('创建知识文档并自动分配 ID 和 uploadTime', () => {
    getKnowledgeBases();
    const config: SegmentConfig = {
      delimiter: '\\n\\n',
      maxLength: 1024,
      overlapLength: 50,
      replaceWhitespace: true,
      removeUrls: false,
    };
    const doc = createKnowledgeDocument({
      name: '测试文档.pdf',
      fileType: 'pdf',
      fileSize: 1024,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'pending',
      segmentConfig: config,
      chunks: [],
    });

    expect(doc.id).toBeTruthy();
    expect(doc.uploadTime).toBeTruthy();
    expect(doc.status).toBe('pending');
    expect(doc.name).toBe('测试文档.pdf');

    const docs = getKnowledgeDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe(doc.id);
  });

  it('创建的文档元数据存 localStorage，chunks 不序列化', () => {
    getKnowledgeBases();
    createKnowledgeDocument({
      name: '带 chunks 的文档.txt',
      fileType: 'txt',
      fileSize: 100,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'pending',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 100,
        overlapLength: 10,
        replaceWhitespace: false,
        removeUrls: false,
      },
      chunks: [{ id: 'chunk-0', content: 'hello', charCount: 5 }],
    });

    const raw = localStorage.getItem(DOC_KEY);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('chunk-0'); // chunks 不存 localStorage
    expect(raw).toContain('带 chunks 的文档.txt');
  });

  it('创建文档后对应知识库 documentCount 增加', () => {
    getKnowledgeBases();
    createKnowledgeDocument({
      name: '测试.pdf',
      fileType: 'pdf',
      fileSize: 100,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'pending',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 100,
        overlapLength: 10,
        replaceWhitespace: false,
        removeUrls: false,
      },
      chunks: [],
    });

    const base = getKnowledgeBaseById('default');
    expect(base?.documentCount).toBe(1);
  });

  /* ─── 序列化一致性 ─── */

  it('写入后读取数据一致', () => {
    getKnowledgeBases();
    const created = createKnowledgeBase({
      name: '一致性测试',
      description: '测试描述',
    });
    // 模拟刷新：重新从 localStorage 读取
    const bases = getKnowledgeBases();
    const found = bases.find((b) => b.id === created.id);
    expect(found).toEqual(created);
  });

  /* ─── updateKnowledgeDocument ─── */

  it('updates existing document and preserves id', () => {
    getKnowledgeBases();
    const doc = createKnowledgeDocument({
      name: 'test.txt',
      fileType: 'txt',
      fileSize: 100,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'rejected',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 100,
        overlapLength: 10,
        replaceWhitespace: false,
        removeUrls: false,
      },
      chunks: [],
      versionRecords: [
        {
          version: 1,
          changeType: 'upload' as const,
          fileName: 'old.txt',
          fileSize: 100,
          operator: 'NOC小李',
          changeTime: '2026-06-01T00:00:00.000Z',
        },
      ],
    });

    const updated = updateKnowledgeDocument(doc.id, {
      name: 'test-v2.txt',
      fileSize: 200,
      status: 'pending',
      segmentConfig: doc.segmentConfig,
    });

    expect(updated.id).toBe(doc.id);
    expect(updated.name).toBe('test-v2.txt');
    expect(updated.fileSize).toBe(200);
    expect(updated.status).toBe('pending');
    expect(updated.versionRecords).toEqual(doc.versionRecords); // preserved

    const docs = getKnowledgeDocuments();
    const found = docs.find((d) => d.id === doc.id);
    expect(found?.status).toBe('pending');
  });

  it('throws when updating non-existent document', () => {
    getKnowledgeBases();
    expect(() =>
      updateKnowledgeDocument('doc-nonexistent', {
        name: 'x.txt',
        fileSize: 1,
        status: 'pending',
        segmentConfig: {
          delimiter: '\\n\\n',
          maxLength: 100,
          overlapLength: 10,
          replaceWhitespace: false,
          removeUrls: false,
        },
      }),
    ).toThrow('文档不存在');
  });

  /* ─── addVersionRecord ─── */

  it('appends version record', () => {
    getKnowledgeBases();
    const doc = createKnowledgeDocument({
      name: 'test.txt',
      fileType: 'txt',
      fileSize: 100,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'auditing',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 100,
        overlapLength: 10,
        replaceWhitespace: false,
        removeUrls: false,
      },
      chunks: [],
    });

    const record = {
      version: 1,
      changeType: 'upload' as const,
      fileName: 'test.txt',
      fileSize: 100,
      similarityScore: undefined,
      operator: '小李',
      changeTime: '2026-06-06T10:00:00.000Z',
    };

    const updated = addVersionRecord(doc.id, {
      versionRecord: record,
    });

    expect(updated.versionRecords).toHaveLength(1);
    expect(updated.versionRecords?.[0]).toEqual(record);

    const docs = getKnowledgeDocuments();
    const found = docs.find((d) => d.id === doc.id);
    expect(found?.versionRecords).toHaveLength(1);
  });

  it('preserves existing audit records when appending new one', () => {
    getKnowledgeBases();
    const doc = createKnowledgeDocument({
      name: 'test.txt',
      fileType: 'txt',
      fileSize: 100,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      status: 'auditing',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 100,
        overlapLength: 10,
        replaceWhitespace: false,
        removeUrls: false,
      },
      chunks: [],
      versionRecords: [
        {
          version: 1,
          changeType: 'upload' as const,
          fileName: '旧版.txt',
          fileSize: 100,
          similarityScore: undefined,
          operator: '小王',
          changeTime: '2026-06-05T10:00:00.000Z',
        },
      ],
    });

    const newRecord = {
      version: 2,
      changeType: 'replace' as const,
      fileName: '新版.txt',
      fileSize: 200,
      similarityScore: 85,
      operator: '小李',
      changeTime: '2026-06-06T10:00:00.000Z',
    };

    const updated = addVersionRecord(doc.id, {
      versionRecord: newRecord,
    });

    expect(updated.versionRecords).toHaveLength(2);
    expect(updated.versionRecords?.[0].operator).toBe('小王');
    expect(updated.versionRecords?.[1].operator).toBe('小李');
  });

  it('throws when adding version to non-existent document', () => {
    getKnowledgeBases();
    expect(() =>
      addVersionRecord('doc-nonexistent', {
        versionRecord: {
          version: 1,
          changeType: 'upload',
          fileName: 'test.txt',
          fileSize: 100,
          operator: 'NOC',
          changeTime: new Date().toISOString(),
        },
      }),
    ).toThrow('文档不存在');
  });
});
