import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { KnowledgeBase } from '@/models/knowledgeBaseModel';
import {
  getKnowledgeBases,
  createKnowledgeBase,
  deleteKnowledgeBase,
} from '@/utils/knowledgeBaseStorage';
import KnowledgeBaseList from './KnowledgeBaseList';
import KnowledgeBaseDetailDrawer from './KnowledgeBaseDetailDrawer';
import CreateKnowledgeBaseDialog from './CreateKnowledgeBaseDialog';
import KnowledgeAuditList from './KnowledgeAuditList';

export default function KnowledgeManagementPage() {
  const [bases, setBases] = useState<KnowledgeBase[]>(getKnowledgeBases);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailBase, setDetailBase] = useState<KnowledgeBase | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(() => {
    setBases(getKnowledgeBases());
  }, []);

  const handleCreate = useCallback(
    (name: string, description: string) => {
      createKnowledgeBase({ name, description });
      refresh();
      setCreateOpen(false);
    },
    [refresh],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteKnowledgeBase(id);
      refresh();
    },
    [refresh],
  );

  const handleViewDetail = useCallback((base: KnowledgeBase) => {
    setDetailBase(base);
    setDrawerOpen(true);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold text-dark-text-primary">知识管理</h1>
        <p className="text-[13px] text-dark-text-secondary mt-1">
          管理知识库与审核业务部门上传的文档
        </p>
      </div>

      <Tabs defaultValue="bases" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bases">知识库管理</TabsTrigger>
          <TabsTrigger value="audit">知识审核</TabsTrigger>
        </TabsList>

        <TabsContent value="bases">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={16} className="mr-1" />
              创建空知识库
            </Button>
          </div>
          <KnowledgeBaseList
            bases={bases}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
          />
        </TabsContent>

        <TabsContent value="audit">
          <KnowledgeAuditList />
        </TabsContent>
      </Tabs>

      <CreateKnowledgeBaseDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreate}
      />

      <KnowledgeBaseDetailDrawer
        base={detailBase}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
