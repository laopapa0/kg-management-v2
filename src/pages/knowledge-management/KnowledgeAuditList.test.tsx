import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeAuditList, { filterDocuments } from './KnowledgeAuditList';

const mockDocs = [
  {
    id: 'doc-1',
    name: '5G业务发展规范.pdf',
    fileType: 'pdf',
    fileSize: 1024 * 1024,
    targetKnowledgeBaseId: 'default',
    uploader: '小张',
    uploadTime: '2026-06-04T10:00:00.000Z',
    status: 'pending' as const,
    segmentConfig: {
      delimiter: '\\n\\n',
      maxLength: 1024,
      overlapLength: 50,
      replaceWhitespace: true,
      removeUrls: false,
    },
    chunks: [],
  },
  {
    id: 'doc-2',
    name: '网络优化指南.docx',
    fileType: 'docx',
    fileSize: 512 * 1024,
    targetKnowledgeBaseId: 'kb-1',
    uploader: '小李',
    uploadTime: '2026-04-17T08:00:00.000Z',
    status: 'approved' as const,
    segmentConfig: {
      delimiter: '\\n\\n',
      maxLength: 1024,
      overlapLength: 50,
      replaceWhitespace: true,
      removeUrls: false,
    },
    chunks: [],
  },
  {
    id: 'doc-3',
    name: '驳回的文档.txt',
    fileType: 'txt',
    fileSize: 256 * 1024,
    targetKnowledgeBaseId: 'default',
    uploader: '小王',
    uploadTime: '2026-06-05T12:00:00.000Z',
    status: 'rejected' as const,
    segmentConfig: {
      delimiter: '\\n\\n',
      maxLength: 1024,
      overlapLength: 50,
      replaceWhitespace: true,
      removeUrls: false,
    },
    chunks: [],
  },
  {
    id: 'doc-4',
    name: '正在审核的文档.md',
    fileType: 'md',
    fileSize: 128 * 1024,
    targetKnowledgeBaseId: 'kb-1',
    uploader: '小陈',
    uploadTime: '2026-06-06T09:00:00.000Z',
    status: 'auditing' as const,
    segmentConfig: {
      delimiter: '\\n\\n',
      maxLength: 1024,
      overlapLength: 50,
      replaceWhitespace: true,
      removeUrls: false,
    },
    chunks: [],
  },
];

const mockBases = [
  { id: 'default', name: '默认业务知识库' },
  { id: 'kb-1', name: '5G业务知识库' },
];

vi.mock('@/utils/knowledgeBaseStorage', () => ({
  getKnowledgeDocuments: vi.fn(() => mockDocs),
  getKnowledgeBases: vi.fn(() => mockBases),
  getKnowledgeBaseById: vi.fn((id: string) => {
    const map: Record<string, { id: string; name: string }> = {
      default: { id: 'default', name: '默认业务知识库' },
      'kb-1': { id: 'kb-1', name: '5G业务知识库' },
    };
    return map[id];
  }),
}));

vi.mock('@/utils/similarityMock', () => ({
  generateSimilarityResults: vi.fn(() => [
    { docId: 'sim-1', docName: '相似文档1.pdf', knowledgeBaseName: '默认业务知识库', similarity: 85 },
  ]),
  SIMILARITY_THRESHOLD: 80,
}));

function renderList() {
  return render(<KnowledgeAuditList />);
}

describe('KnowledgeAuditList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document names in the table', () => {
    renderList();
    expect(screen.getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(screen.getByText('网络优化指南.docx')).toBeInTheDocument();
    expect(screen.getByText('驳回的文档.txt')).toBeInTheDocument();
    expect(screen.getByText('正在审核的文档.md')).toBeInTheDocument();
  });

  it('renders filter bar with knowledge base, status and time range selectors', () => {
    renderList();
    expect(screen.getByLabelText(/知识库/)).toBeInTheDocument();
    expect(screen.getByLabelText(/状态/)).toBeInTheDocument();
    expect(screen.getByLabelText(/时间范围/)).toBeInTheDocument();
  });

  it('filters by knowledge base', () => {
    renderList();
    const kbSelect = screen.getByLabelText(/知识库/);
    fireEvent.change(kbSelect, { target: { value: 'default' } });

    expect(screen.getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(screen.getByText('驳回的文档.txt')).toBeInTheDocument();
    expect(screen.queryByText('网络优化指南.docx')).not.toBeInTheDocument();
    expect(screen.queryByText('正在审核的文档.md')).not.toBeInTheDocument();
  });

  it('filters by status', () => {
    renderList();
    const statusSelect = screen.getByLabelText(/状态/);
    fireEvent.change(statusSelect, { target: { value: 'approved' } });

    expect(screen.getByText('网络优化指南.docx')).toBeInTheDocument();
    expect(screen.queryByText('5G业务发展规范.pdf')).not.toBeInTheDocument();
    expect(screen.queryByText('驳回的文档.txt')).not.toBeInTheDocument();
    expect(screen.queryByText('正在审核的文档.md')).not.toBeInTheDocument();
  });

  it('filters by time range', () => {
    renderList();
    const timeSelect = screen.getByLabelText(/时间范围/);
    fireEvent.change(timeSelect, { target: { value: '7d' } });

    // All mock docs are within 7 days of 2026-06-06, so all should show
    expect(screen.getByText('正在审核的文档.md')).toBeInTheDocument();
    expect(screen.getByText('驳回的文档.txt')).toBeInTheDocument();
    expect(screen.getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(screen.queryByText('网络优化指南.docx')).not.toBeInTheDocument();
  });

  it('shows 审核 button for pending and auditing status', () => {
    renderList();
    const rows = screen.getAllByRole('row').slice(1); // skip header

    // Find pending row
    const pendingRow = rows.find((r) => r.textContent?.includes('5G业务发展规范.pdf'));
    expect(pendingRow?.textContent).toContain('审核');

    // Find auditing row
    const auditingRow = rows.find((r) => r.textContent?.includes('正在审核的文档.md'));
    expect(auditingRow?.textContent).toContain('审核');
  });

  it('shows 查看 button for approved and rejected status', () => {
    renderList();
    const rows = screen.getAllByRole('row').slice(1); // skip header

    // Find approved row
    const approvedRow = rows.find((r) => r.textContent?.includes('网络优化指南.docx'));
    expect(approvedRow?.textContent).toContain('查看');

    // Find rejected row
    const rejectedRow = rows.find((r) => r.textContent?.includes('驳回的文档.txt'));
    expect(rejectedRow?.textContent).toContain('查看');
  });

  it('sorts documents by upload time descending by default', () => {
    renderList();
    const rows = screen.getAllByRole('row').slice(1); // skip header
    const names = rows.map((r) => {
      const match = r.textContent?.match(/^(.*?)(?:\.pdf|\.docx|\.txt|\.md)/);
      return match ? match[0] : '';
    });

    // doc-4 (06-06), doc-3 (06-05), doc-1 (06-04), doc-2 (04-17)
    expect(names[0]).toContain('正在审核的文档');
    expect(names[1]).toContain('驳回的文档');
    expect(names[2]).toContain('5G业务发展规范');
    expect(names[3]).toContain('网络优化指南');
  });

  it('opens audit detail modal when clicking 审核 button', () => {
    renderList();
    const rows = screen.getAllByRole('row').slice(1);
    const pendingRow = rows.find((r) => r.textContent?.includes('5G业务发展规范.pdf'));
    const auditButton = pendingRow?.querySelector('button');
    expect(auditButton?.textContent).toBe('审核');

    fireEvent.click(auditButton!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/审核详情 — 5G业务发展规范.pdf/)).toBeInTheDocument();
  });

  it('opens audit detail modal when clicking 查看 button', () => {
    renderList();
    const rows = screen.getAllByRole('row').slice(1);
    const approvedRow = rows.find((r) => r.textContent?.includes('网络优化指南.docx'));
    const viewButton = approvedRow?.querySelector('button');
    expect(viewButton?.textContent).toBe('查看');

    fireEvent.click(viewButton!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/审核详情 — 网络优化指南.docx/)).toBeInTheDocument();
  });
});

describe('filterDocuments', () => {
  const docs = [
    { id: 'd1', targetKnowledgeBaseId: 'default', status: 'pending' as const, uploadTime: '2026-06-04T10:00:00.000Z' },
    { id: 'd2', targetKnowledgeBaseId: 'kb-1', status: 'approved' as const, uploadTime: '2026-04-17T08:00:00.000Z' },
    { id: 'd3', targetKnowledgeBaseId: 'default', status: 'rejected' as const, uploadTime: '2026-06-05T12:00:00.000Z' },
  ];

  it('returns all docs sorted by time when no filters applied', () => {
    const result = filterDocuments(docs as any, {
      kbFilter: 'all',
      statusFilter: 'all',
      timeFilter: 'all',
    });
    expect(result.map((d) => d.id)).toEqual(['d3', 'd1', 'd2']);
  });

  it('filters by knowledge base', () => {
    const result = filterDocuments(docs as any, {
      kbFilter: 'default',
      statusFilter: 'all',
      timeFilter: 'all',
    });
    expect(result.map((d) => d.id)).toEqual(['d3', 'd1']);
  });

  it('filters by status', () => {
    const result = filterDocuments(docs as any, {
      kbFilter: 'all',
      statusFilter: 'approved',
      timeFilter: 'all',
    });
    expect(result.map((d) => d.id)).toEqual(['d2']);
  });

  it('filters by time range', () => {
    const result = filterDocuments(docs as any, {
      kbFilter: 'all',
      statusFilter: 'all',
      timeFilter: '7d',
    });
    // d2 (04-17) is older than 7 days from now (2026-05-27)
    expect(result.map((d) => d.id)).toEqual(['d3', 'd1']);
  });
});
