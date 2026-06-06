import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AuditDetailModal from './AuditDetailModal';
import type { KnowledgeDocument } from '@/models/knowledgeBaseModel';

const mockDoc: KnowledgeDocument = {
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
  chunks: [
    { id: 'c1', content: '这是第一个分块的内容，包含一些业务规范说明。'.repeat(5), charCount: 150 },
    { id: 'c2', content: '这是第二个分块，讨论网络优化的具体指标。'.repeat(4), charCount: 128 },
    { id: 'c3', content: '第三个分块关于数据安全规范。', charCount: 50 },
  ],
};

vi.mock('@/utils/similarityMock', () => ({
  generateSimilarityResults: vi.fn(() => [
    { docId: 'sim-1', docName: '5G网络建设规范v2.pdf', knowledgeBaseName: '默认业务知识库', similarity: 85 },
    { docId: 'sim-2', docName: '移动通信技术白皮书.docx', knowledgeBaseName: '5G业务知识库', similarity: 75 },
    { docId: 'sim-3', docName: '无线网络优化指南.pdf', knowledgeBaseName: '默认业务知识库', similarity: 62 },
  ]),
  SIMILARITY_THRESHOLD: 80,
}));

vi.mock('@/utils/knowledgeBaseStorage', () => ({
  getKnowledgeBaseById: vi.fn((id: string) => {
    if (id === 'default') return { id: 'default', name: '默认业务知识库' };
    return undefined;
  }),
}));

function renderModal(
  doc: KnowledgeDocument | null = mockDoc,
  open = true,
  onAudit?: (docId: string, action: 'APPROVE' | 'REJECT', reason?: string) => void,
) {
  return render(
    <AuditDetailModal
      doc={doc}
      open={open}
      onOpenChange={vi.fn()}
      onAudit={onAudit}
    />,
  );
}

describe('AuditDetailModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when doc is null', () => {
    const { container } = renderModal(null);
    expect(container.firstChild).toBeNull();
  });

  it('renders dialog title with document name', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/审核详情 — 5G业务发展规范.pdf/)).toBeInTheDocument();
  });

  it('renders left panel with document info', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('文档信息')).toBeInTheDocument();
    expect(within(dialog).getByText('5G业务发展规范.pdf')).toBeInTheDocument();
    expect(within(dialog).getByText('小张')).toBeInTheDocument();
    expect(within(dialog).getAllByText('默认业务知识库').length).toBeGreaterThanOrEqual(1);
    expect(within(dialog).getByText('PDF')).toBeInTheDocument();
  });

  it('renders left panel with segment config', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('分段参数')).toBeInTheDocument();
    expect(within(dialog).getByText('\\n\\n')).toBeInTheDocument();
    expect(within(dialog).getByText('1024')).toBeInTheDocument();
    expect(within(dialog).getByText('50')).toBeInTheDocument();
    expect(within(dialog).getByText('替换连续空白')).toBeInTheDocument();
  });

  it('renders center panel with chunk previews', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('预览块')).toBeInTheDocument();
    expect(within(dialog).getByText('分块 #1')).toBeInTheDocument();
    expect(within(dialog).getByText('分块 #2')).toBeInTheDocument();
    expect(within(dialog).getByText('分块 #3')).toBeInTheDocument();
  });

  it('shows collapsed chunk content by default (truncated with ellipsis)', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    // First chunk is > 100 chars and should be truncated
    const firstChunk = within(dialog).getByText(/分块 #1/).closest('div[class*="border"]') as HTMLElement;
    expect(firstChunk).toBeTruthy();
    expect(firstChunk.textContent).toContain('...');
    expect(within(firstChunk).getByText('展开')).toBeInTheDocument();
  });

  it('expands chunk when clicking expand button', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const firstChunk = within(dialog).getByText(/分块 #1/).closest('div[class*="border"]') as HTMLElement;

    fireEvent.click(within(firstChunk).getByText('展开'));
    expect(within(firstChunk).getByText('收起')).toBeInTheDocument();
    expect(within(firstChunk).queryByText('...')).not.toBeInTheDocument();
  });

  it('collapses chunk when clicking collapse button', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const firstChunk = within(dialog).getByText(/分块 #1/).closest('div[class*="border"]') as HTMLElement;

    fireEvent.click(within(firstChunk).getByText('展开'));
    fireEvent.click(within(firstChunk).getByText('收起'));
    expect(within(firstChunk).getByText('展开')).toBeInTheDocument();
  });

  it('renders right panel with similarity results', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('相似度检测')).toBeInTheDocument();
    expect(within(dialog).getByText('5G网络建设规范v2.pdf')).toBeInTheDocument();
    expect(within(dialog).getByText('移动通信技术白皮书.docx')).toBeInTheDocument();
    expect(within(dialog).getByText('无线网络优化指南.pdf')).toBeInTheDocument();
  });

  it('shows similarity percentage badges', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('85%')).toBeInTheDocument();
    expect(within(dialog).getByText('75%')).toBeInTheDocument();
    expect(within(dialog).getByText('62%')).toBeInTheDocument();
  });

  it('shows warning alert for similarity >= 80%', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('检测到高相似文档')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/与《5G网络建设规范v2.pdf》相似度 85%，建议合并或去重/),
    ).toBeInTheDocument();
  });

  it('shows compare button for each similarity result', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const compareButtons = within(dialog).getAllByText('查看对比');
    expect(compareButtons.length).toBe(3);
  });

  it('shows inline comparison when clicking compare button', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getAllByText('查看对比')[0]);

    expect(within(dialog).getByText('文档对比')).toBeInTheDocument();
    expect(within(dialog).getByText(/当前文档：5G业务发展规范.pdf/)).toBeInTheDocument();
    expect(
      within(dialog).getByText('Demo 级别：文本对比功能将在后续版本实现'),
    ).toBeInTheDocument();

    // Close comparison
    fireEvent.click(within(dialog).getByText('关闭'));
    expect(within(dialog).queryByText('文档对比')).not.toBeInTheDocument();
  });

  it('renders active audit action buttons', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('通过并嵌入')).toBeInTheDocument();
    expect(within(dialog).getByText('审核不通过')).toBeInTheDocument();
  });

  it('shows approve confirmation when clicking 通过并嵌入', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('通过并嵌入'));
    expect(within(dialog).getByText(/确认通过并嵌入/)).toBeInTheDocument();
    expect(within(dialog).getByText('确认')).toBeInTheDocument();
    expect(within(dialog).getByText('取消')).toBeInTheDocument();
  });

  it('shows reject form when clicking 审核不通过', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('审核不通过'));
    expect(within(dialog).getByText('审核不通过原因')).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText('请填写至少 5 个字的审核意见')).toBeInTheDocument();
  });

  it('validates reject reason minimum 5 characters', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('审核不通过'));
    fireEvent.click(within(dialog).getByText('确认'));
    expect(within(dialog).getByText('请填写至少 5 个字的审核意见')).toBeInTheDocument();
  });

  it('calls onAudit with APPROVE when confirming approval', () => {
    const onAudit = vi.fn();
    renderModal(mockDoc, true, onAudit);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('通过并嵌入'));
    fireEvent.click(within(dialog).getByText('确认'));
    expect(onAudit).toHaveBeenCalledWith('doc-1', 'APPROVE');
  });

  it('calls onAudit with REJECT and reason when submitting reject form', () => {
    const onAudit = vi.fn();
    renderModal(mockDoc, true, onAudit);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('审核不通过'));
    fireEvent.change(within(dialog).getByPlaceholderText('请填写至少 5 个字的审核意见'), {
      target: { value: '内容不够完整' },
    });
    fireEvent.click(within(dialog).getByText('确认'));
    expect(onAudit).toHaveBeenCalledWith('doc-1', 'REJECT', '内容不够完整');
  });

  it('cancels approve confirmation and returns to idle', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByText('通过并嵌入'));
    fireEvent.click(within(dialog).getByText('取消'));
    expect(within(dialog).queryByText(/确认通过并嵌入/)).not.toBeInTheDocument();
    expect(within(dialog).getByText('通过并嵌入')).toBeInTheDocument();
  });

  it('shows chunk count summary', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/共 3 个分块/)).toBeInTheDocument();
  });

  it('limits display to 20 chunks and shows message for overflow', () => {
    const manyChunksDoc: KnowledgeDocument = {
      ...mockDoc,
      chunks: Array.from({ length: 25 }, (_, i) => ({
        id: `c-${i}`,
        content: `Chunk ${i} content`,
        charCount: 20,
      })),
    };
    renderModal(manyChunksDoc);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/展示前 20 个/)).toBeInTheDocument();
    expect(within(dialog).getByText(/还有 5 个分块未展示/)).toBeInTheDocument();
  });

  it('shows empty message when no chunks', () => {
    const noChunksDoc: KnowledgeDocument = {
      ...mockDoc,
      chunks: [],
    };
    renderModal(noChunksDoc);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('暂无预览块数据')).toBeInTheDocument();
  });
});
