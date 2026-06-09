import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import MyDocumentsList from './MyDocumentsList';
import { getKnowledgeDocuments, updateKnowledgeDocument } from '@/utils/knowledgeBaseStorage';

const mockDocs = [
  {
    id: 'doc-1',
    name: '5G业务发展规范.pdf',
    fileType: 'pdf',
    fileSize: 1024 * 1024,
    targetKnowledgeBaseId: 'default',
    uploader: '业务部门用户',
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
    uploader: '业务部门用户',
    uploadTime: '2026-06-03T08:00:00.000Z',
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
    uploader: '业务部门用户',
    uploadTime: '2026-06-05T12:00:00.000Z',
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
];

const mockBases: Record<string, { id: string; name: string }> = {
  default: { id: 'default', name: '默认业务知识库' },
  'kb-1': { id: 'kb-1', name: '5G业务知识库' },
};

const mockUpdateKnowledgeDocument = vi.fn((id, params) => ({ id, ...params, uploadTime: new Date().toISOString() }));

vi.mock('@/utils/knowledgeBaseStorage', () => ({
  getKnowledgeDocuments: vi.fn(() => mockDocs),
  getKnowledgeBaseById: vi.fn((id: string) => mockBases[id] || undefined),
  updateKnowledgeDocument: vi.fn((id: string, params: unknown) => mockUpdateKnowledgeDocument(id, params)),
}));

vi.mock('@/utils/documentChunker', () => ({
  documentChunker: vi.fn(() => [
    { id: 'chunk-0', content: '第一块内容'.repeat(10), charCount: 60 },
  ]),
}));

function renderList() {
  return render(<MyDocumentsList />);
}

describe('MyDocumentsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document names in the table', () => {
    renderList();
    expect(screen.getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(screen.getByText('网络优化指南.docx')).toBeInTheDocument();
    expect(screen.getByText('驳回的文档.txt')).toBeInTheDocument();
  });

  it('renders table columns: name, upload time, size, status, action', () => {
    renderList();
    expect(screen.getByText('文档名称')).toBeInTheDocument();
    expect(screen.getByText('上传时间')).toBeInTheDocument();
    expect(screen.getByText('文件大小')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('shows version number next to document name', () => {
    renderList();
    expect(screen.getAllByText('v1')).toHaveLength(3);
  });

  it('shows formatted file sizes', () => {
    renderList();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
    expect(screen.getByText('512.0 KB')).toBeInTheDocument();
    expect(screen.getByText('256.0 KB')).toBeInTheDocument();
  });

  it('shows empty message when no documents', () => {
    vi.mocked(getKnowledgeDocuments).mockReturnValueOnce([]);
    renderList();
    expect(screen.getByText('暂无文档，请先上传')).toBeInTheDocument();
  });

  it('renders status badges with correct colors', () => {
    renderList();
    const pendingBadges = screen.getAllByText('已上传');
    expect(pendingBadges.length).toBeGreaterThanOrEqual(1);
    expect(pendingBadges[0].closest('span')).toHaveClass('bg-blue-100', 'text-blue-700');
    const approvedBadge = screen.getByText('已通过').closest('span');

    expect(approvedBadge).toHaveClass('bg-green-100', 'text-green-700');
    expect(screen.queryByText('审核不通过')).not.toBeInTheDocument();
  });

  it('sorts documents by upload time descending', () => {
    renderList();
    const rows = screen.getAllByTestId(/doc-row-/);
    expect(rows).toHaveLength(3);
    // doc-3 (2026-06-05) first, doc-1 (2026-06-04) second, doc-2 (2026-06-03) last
    expect(rows[0]).toHaveAttribute('data-testid', 'doc-row-doc-3');
    expect(rows[1]).toHaveAttribute('data-testid', 'doc-row-doc-1');
    expect(rows[2]).toHaveAttribute('data-testid', 'doc-row-doc-2');
  });

  it('opens detail drawer when clicking 查看 button', () => {
    renderList();
    const viewBtn = screen.getAllByText('查看')[0];
    fireEvent.click(viewBtn);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('文档详情')).toBeInTheDocument();
    expect(within(drawer).getByText('驳回的文档.txt')).toBeInTheDocument();
  });

  it('drawer shows basic document info', () => {
    renderList();
    fireEvent.click(screen.getAllByText('查看')[1]);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('文档详情')).toBeInTheDocument();
    // doc-1: 5G业务发展规范.pdf, default base, 业务部门用户
    expect(within(drawer).getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(within(drawer).getByText('默认业务知识库')).toBeInTheDocument();
    expect(within(drawer).getByText('业务部门用户')).toBeInTheDocument();
  });

  it('drawer shows segment config summary', () => {
    renderList();
    fireEvent.click(screen.getAllByText('查看')[0]);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('分段参数')).toBeInTheDocument();
    expect(within(drawer).getByText('1024')).toBeInTheDocument();
    expect(within(drawer).getByText('50')).toBeInTheDocument();
  });

  it('drawer does not show audit history (removed in v2 - no audit)', () => {
    renderList();
    fireEvent.click(screen.getAllByText('查看')[1]);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).queryByText('审核历史')).not.toBeInTheDocument();
  });

  it('no documents show 重新编辑 (no rejected after removing audit)', () => {
    renderList();
    const rows = screen.getAllByTestId(/doc-row-/);
    for (const row of rows) {
      expect(row.textContent).not.toContain('重新编辑');
    }
  });

});
