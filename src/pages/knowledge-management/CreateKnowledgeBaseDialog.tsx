import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateKnowledgeBaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, description: string) => void;
}

export default function CreateKnowledgeBaseDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateKnowledgeBaseDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('知识库名称必填');
      return;
    }
    setError('');
    onCreate(trimmed, description.trim());
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建知识库</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="kb-name">
              知识库名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="kb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入知识库名称"
              className="mt-1"
            />
            {error && (
              <p className="text-[12px] text-red-500 mt-1">{error}</p>
            )}
          </div>
          <div>
            <Label htmlFor="kb-desc">描述</Label>
            <Textarea
              id="kb-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选，描述知识库的用途"
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="text-[12px] text-[#9ba4b3]">
            类型: 专业知识库
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>创建</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
