import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeManagementPage from './KnowledgeManagementPage';

// mock storage to avoid localStorage side effects
vi.mock('@/utils/knowledgeBaseStorage', () => ({
  getKnowledgeBases: vi.fn(() => [
    {
      id: 'default',
      name: '默认业务知识库',
      type: 'default',
      description: '系统预设',
      createdAt: '2026-06-01T00:00:00.000Z',
      documentCount: 5,
    },
    {
      id: 'kb-1',
      name: '5G业务知识库',
      type: 'professional',
      description: '5G相关',
      createdAt: '2026-06-02T00:00:00.000Z',
      documentCount: 3,
    },
  ]),
  getKnowledgeDocuments: vi.fn(() => [
    {
      id: 'doc-1',
      name: '5G业务发展规范.pdf',
      fileType: 'pdf',
      fileSize: 1024 * 1024,
      targetKnowledgeBaseId: 'default',
      uploader: '小张',
      uploadTime: '2026-06-04T10:00:00.000Z',
      status: 'pending',
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
      uploadTime: '2026-06-03T08:00:00.000Z',
      status: 'approved',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 1024,
        overlapLength: 50,
        replaceWhitespace: true,
        removeUrls: false,
      },
      chunks: [],
      versionRecords: [
        {
          version: 1,
          changeType: 'upload' as const,
          fileName: '网络优化指南.docx',
          fileSize: 512 * 1024,
          operator: 'NOC小李',
          changeTime: '2026-06-04T09:00:00.000Z',
        },
      ],
    },
    {
      id: 'doc-3',
      name: '驳回的文档.txt',
      fileType: 'txt',
      fileSize: 256 * 1024,
      targetKnowledgeBaseId: 'default',
      uploader: '小王',
      uploadTime: '2026-06-05T12:00:00.000Z',
      status: 'rejected',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 1024,
        overlapLength: 50,
        replaceWhitespace: true,
        removeUrls: false,
      },
      chunks: [],
      versionRecords: [
        {
          version: 1,
          changeType: 'upload' as const,
          fileName: '驳回的文档.txt',
          fileSize: 256 * 1024,
          operator: 'NOC小李',
          changeTime: '2026-06-05T14:00:00.000Z',
        },
      ],
    },
    {
      id: 'doc-4',
      name: '正在审核的文档.md',
      fileType: 'md',
      fileSize: 128 * 1024,
      targetKnowledgeBaseId: 'kb-1',
      uploader: '小陈',
      uploadTime: '2026-06-06T09:00:00.000Z',
      status: 'auditing',
      segmentConfig: {
        delimiter: '\\n\\n',
        maxLength: 1024,
        overlapLength: 50,
        replaceWhitespace: true,
        removeUrls: false,
      },
      chunks: [],
    },
  ]),
  getKnowledgeBaseById: vi.fn((id: string) => {
    const map: Record<string, { id: string; name: string }> = {
      default: { id: 'default', name: '默认业务知识库' },
      'kb-1': { id: 'kb-1', name: '5G业务知识库' },
    };
    return map[id];
  }),
  createKnowledgeBase: vi.fn((params: { name: string; description: string }) => ({
    id: 'kb-new',
    name: params.name,
    type: 'professional',
    description: params.description,
    createdAt: new Date().toISOString(),
    documentCount: 0,
  })),
  deleteKnowledgeBase: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <KnowledgeManagementPage />
    </MemoryRouter>,
  );
}

describe('KnowledgeManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and two tabs', () => {
    renderPage();
    expect(screen.getByText('知识管理')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /知识库管理/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /知识审核/ })).toBeInTheDocument();
  });

  it('默认激活「知识库管理」Tab', () => {
    renderPage();
    const activeTab = screen.getByRole('tab', { name: /知识库管理/ });
    expect(activeTab).toHaveAttribute('data-state', 'active');
  });

  it('renders knowledge base cards with name/type/documentCount', () => {
    renderPage();
    expect(screen.getByText('默认业务知识库')).toBeInTheDocument();
    expect(screen.getByText('5G业务知识库')).toBeInTheDocument();
    expect(screen.getByText('系统预设')).toBeInTheDocument();
    expect(screen.getByText('5G相关')).toBeInTheDocument();
  });

  it('default knowledge base does not show delete button', () => {
    renderPage();
    const cards = screen.getAllByTestId('kb-card');
    expect(cards).toHaveLength(2);
    // default card: no delete button
    const defaultCard = cards[0];
    expect(defaultCard.textContent).toContain('默认业务知识库');
    expect(
      defaultCard.querySelector('[data-testid="delete-btn"]'),
    ).not.toBeInTheDocument();
    // professional card: has delete button
    const profCard = cards[1];
    expect(profCard.querySelector('[data-testid="delete-btn"]')).toBeInTheDocument();
  });

  it('clicking "创建空知识库" opens create dialog', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /创建空知识库/ }));
    expect(screen.getByText('创建知识库')).toBeInTheDocument();
    expect(screen.getByLabelText(/知识库名称/)).toBeInTheDocument();
  });

  it('create dialog validates name is required', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /创建空知识库/ }));
    fireEvent.click(screen.getByRole('button', { name: /^创建$/ }));
    await waitFor(() => {
      expect(screen.getByText(/知识库名称必填/)).toBeInTheDocument();
    });
  });

  it('clicking "查看详情" opens detail drawer', () => {
    renderPage();
    const detailBtns = screen.getAllByRole('button', { name: /查看详情/ });
    fireEvent.click(detailBtns[0]);
    expect(screen.getByText('知识库详情')).toBeInTheDocument();
  });

});
