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
    auditRecords: [
      {
        status: 'approved' as const,
        auditor: 'NOC小李',
        auditTime: '2026-06-04T09:00:00.000Z',
        reason: '内容完整，格式规范',
      },
    ],
  },
  {
    id: 'doc-3',
    name: '驳回的文档.txt',
    fileType: 'txt',
    fileSize: 256 * 1024,
    targetKnowledgeBaseId: 'default',
    uploader: '业务部门用户',
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
    auditRecords: [
      {
        status: 'rejected' as const,
        auditor: 'NOC小李',
        auditTime: '2026-06-05T14:00:00.000Z',
        reason: '内容不完整',
      },
    ],
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
    const pendingBadge = screen.getByText('待审核').closest('span');
    const approvedBadge = screen.getByText('已通过').closest('span');
    const rejectedBadge = screen.getByText('审核不通过').closest('span');

    expect(pendingBadge).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(approvedBadge).toHaveClass('bg-green-100', 'text-green-700');
    expect(rejectedBadge).toHaveClass('bg-red-100', 'text-red-700');
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

  it('drawer shows audit history timeline for approved document', () => {
    renderList();
    // doc-2 is approved (index 2 in view buttons due to sorting)
    fireEvent.click(screen.getAllByText('查看')[2]);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).getByText('审核历史')).toBeInTheDocument();
    expect(within(drawer).getByText(/审核人：NOC小李/)).toBeInTheDocument();
    expect(within(drawer).getByText(/原因：内容完整，格式规范/)).toBeInTheDocument();
  });

  it('drawer does not show audit history for pending document', () => {
    renderList();
    fireEvent.click(screen.getAllByText('查看')[1]);

    const drawer = screen.getByRole('dialog');
    expect(within(drawer).queryByText('审核历史')).not.toBeInTheDocument();
  });

  it('shows 重新编辑 button only for rejected documents', () => {
    renderList();
    const rows = screen.getAllByTestId(/doc-row-/);

    // doc-3 is rejected
    const rejectedRow = rows.find((r) => r.getAttribute('data-testid') === 'doc-row-doc-3');
    expect(rejectedRow?.textContent).toContain('重新编辑');

    // doc-1 is pending
    const pendingRow = rows.find((r) => r.getAttribute('data-testid') === 'doc-row-doc-1');
    expect(pendingRow?.textContent).not.toContain('重新编辑');

    // doc-2 is approved
    const approvedRow = rows.find((r) => r.getAttribute('data-testid') === 'doc-row-doc-2');
    expect(approvedRow?.textContent).not.toContain('重新编辑');
  });

  it('opens re-edit dialog when clicking 重新编辑', () => {
    renderList();
    fireEvent.click(screen.getByText('重新编辑'));

    expect(screen.getByText('重新编辑审核不通过的文档')).toBeInTheDocument();
    expect(screen.getByText('驳回的文档.txt')).toBeInTheDocument();
  });

  it('re-edit dialog shows preserved segment config', () => {
    renderList();
    fireEvent.click(screen.getByText('重新编辑'));

    // Segment config from doc-3 should be pre-filled
    expect(screen.getByLabelText(/分段标识符/)).toHaveValue('\\n\\n');
    expect(screen.getByLabelText(/最大长度/)).toHaveValue(1024);
    expect(screen.getByLabelText(/重叠长度/)).toHaveValue(50);
  });

  it('submits re-edit and calls updateKnowledgeDocument with pending status', async () => {
    renderList();
    fireEvent.click(screen.getByText('重新编辑'));

    // Upload a file
    const fileInput = screen.getByTestId('reedit-file-input');
    const file = new File(['test content'], 'new-version.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'size', { value: 1000 });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for file to appear
    await new Promise((r) => setTimeout(r, 10));

    // Click submit
    fireEvent.click(screen.getByRole('button', { name: /重新提交/ }));

    await new Promise((r) => setTimeout(r, 50));

    expect(updateKnowledgeDocument).toHaveBeenCalledWith(
      'doc-3',
      expect.objectContaining({
        name: 'new-version.txt',
        status: 'pending',
        fileType: 'txt',
        fileSize: 1000,
      }),
    );
  });
});
