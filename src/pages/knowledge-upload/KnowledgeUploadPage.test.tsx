import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeUploadPage from './KnowledgeUploadPage';

const mockBases = [
  {
    id: 'default',
    name: '默认业务知识库',
    type: 'default',
    description: '',
    createdAt: '2026-06-01T00:00:00.000Z',
    documentCount: 5,
  },
  {
    id: 'kb-1',
    name: '5G业务知识库',
    type: 'professional',
    description: '',
    createdAt: '2026-06-02T00:00:00.000Z',
    documentCount: 3,
  },
];

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
];

const mockCreateKnowledgeDocument = vi.fn((doc) => ({
  ...doc,
  id: 'doc-mock',
  uploadTime: new Date().toISOString(),
}));

vi.mock('@/utils/knowledgeBaseStorage', () => ({
  getKnowledgeBases: vi.fn(() => mockBases),
  getKnowledgeDocuments: vi.fn(() => mockDocs),
  createKnowledgeDocument: vi.fn((doc) => mockCreateKnowledgeDocument(doc)),
}));

const mockDocumentChunker = vi.fn(() => [
  { id: 'chunk-0', content: '第一块内容'.repeat(10), charCount: 60 },
  { id: 'chunk-1', content: '第二块内容'.repeat(10), charCount: 60 },
  { id: 'chunk-2', content: '第三块内容'.repeat(10), charCount: 60 },
  { id: 'chunk-3', content: '第四块内容'.repeat(10), charCount: 60 },
  { id: 'chunk-4', content: '第五块内容'.repeat(10), charCount: 60 },
]);

vi.mock('@/utils/documentChunker', () => ({
  documentChunker: vi.fn((text: string, config: unknown) =>
    mockDocumentChunker(text, config),
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <KnowledgeUploadPage />
    </MemoryRouter>,
  );
}

function uploadFile(name: string, size: number, type: string) {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  const input = screen.getByTestId('file-input');
  fireEvent.change(input, { target: { files: [file] } });
}

describe('KnowledgeUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ─── #44 基础表单测试 ─── */

  it('renders page title and two tabs', () => {
    renderPage();
    expect(screen.getByText('知识上传')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /上传新文档/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /我的文档/ })).toBeInTheDocument();
  });

  it('默认激活「上传新文档」Tab', () => {
    renderPage();
    const activeTab = screen.getByRole('tab', { name: /上传新文档/ });
    expect(activeTab).toHaveAttribute('data-state', 'active');
  });

  it('默认业务知识库已选中', () => {
    renderPage();
    const checkbox = screen.getByTestId('default-kb-checkbox');
    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });

  it('可选择额外专业知识库', () => {
    renderPage();
    const select = screen.getByLabelText(/额外知识库/);
    expect(select).toBeInTheDocument();
    fireEvent.change(select, { target: { value: 'kb-1' } });
    expect(select).toHaveValue('kb-1');
  });

  it('renders file upload area with format hint', () => {
    renderPage();
    expect(screen.getByText(/支持 PDF/)).toBeInTheDocument();
    expect(screen.getByText(/15MB/)).toBeInTheDocument();
  });

  it('renders segment config inputs with defaults', () => {
    renderPage();
    expect(screen.getByLabelText(/分段标识符/)).toHaveValue('\\n\\n');
    expect(screen.getByLabelText(/最大长度/)).toHaveValue(1024);
    expect(screen.getByLabelText(/重叠长度/)).toHaveValue(50);
  });

  it('reset button restores segment defaults', () => {
    renderPage();
    const maxLenInput = screen.getByLabelText(/最大长度/);
    fireEvent.change(maxLenInput, { target: { value: '500' } });
    expect(maxLenInput).toHaveValue(500);

    fireEvent.click(screen.getByRole('button', { name: /重置/ }));
    expect(screen.getByLabelText(/最大长度/)).toHaveValue(1024);
    expect(screen.getByLabelText(/重叠长度/)).toHaveValue(50);
  });

  it('shows error when file size exceeds 15MB', async () => {
    renderPage();
    uploadFile('large.pdf', 16 * 1024 * 1024, 'application/pdf');

    await waitFor(() => {
      expect(screen.getByText(/文件过大/)).toBeInTheDocument();
    });
  });

  it('shows error for unsupported file format', async () => {
    renderPage();
    uploadFile('test.exe', 1000, 'application/x-msdownload');

    await waitFor(() => {
      expect(screen.getByText(/不支持的文件格式/)).toBeInTheDocument();
    });
  });

  /* ─── #45 预览块 + 提交审核 ─── */

  it('clicking "预览块" generates and shows first 5 chunks', async () => {
    renderPage();
    uploadFile('test.txt', 1000, 'text/plain');

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /预览块/ }));

    await waitFor(() => {
      expect(screen.getByText(/分块预览/)).toBeInTheDocument();
      expect(screen.getByText(/#1/)).toBeInTheDocument();
      expect(screen.getByText(/#5/)).toBeInTheDocument();
      // 6th chunk should not appear
      expect(screen.queryByText(/#6/)).not.toBeInTheDocument();
    });

    expect(mockDocumentChunker).toHaveBeenCalled();
  });

  it('clicking "预览并发送审核" creates pending document', async () => {
    renderPage();
    uploadFile('test.pdf', 1000, 'application/pdf');

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /预览并发送审核/ }),
    );

    await waitFor(() => {
      expect(mockCreateKnowledgeDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test.pdf',
          fileType: 'pdf',
          status: 'pending',
          targetKnowledgeBaseId: 'default',
        }),
      );
    });
  });

  it('shows error when chunk count exceeds 100', async () => {
    mockDocumentChunker.mockReturnValueOnce(
      Array.from({ length: 101 }, (_, i) => ({
        id: `chunk-${i}`,
        content: `块${i}`,
        charCount: 10,
      })),
    );
    renderPage();
    uploadFile('test.txt', 1000, 'text/plain');

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /预览并发送审核/ }),
    );

    await waitFor(() => {
      expect(screen.getByText(/分块过细/)).toBeInTheDocument();
    });
    expect(mockCreateKnowledgeDocument).not.toHaveBeenCalled();
  });

  it('shows error when single chunk exceeds maxLength * 2', async () => {
    mockDocumentChunker.mockReturnValueOnce([
      {
        id: 'chunk-0',
        content: 'A'.repeat(2500),
        charCount: 2500,
      },
    ]);
    renderPage();
    uploadFile('test.txt', 1000, 'text/plain');

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', { name: /预览并发送审核/ }),
    );

    await waitFor(() => {
      expect(screen.getByText(/存在超长段落/)).toBeInTheDocument();
    });
    expect(mockCreateKnowledgeDocument).not.toHaveBeenCalled();
  });

});
