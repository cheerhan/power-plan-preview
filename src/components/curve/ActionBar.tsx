import { Pencil, Send, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSend: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const ActionBar = ({ editing, onEdit, onSave, onCancel, onSend, onDelete, onExport }: Props) => (
  <div className="flex items-center justify-end gap-3 border-t border-panel-border px-6 py-3">
    {editing ? (
      <>
        <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={onSave}>保存</Button>
      </>
    ) : (
      <>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" />
          编辑
        </Button>
        <Button variant="outline" size="sm" onClick={onSend}>
          <Send className="mr-1 h-3.5 w-3.5" />
          下发
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          删除
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1 h-3.5 w-3.5" />
          导出曲线
        </Button>
      </>
    )}
  </div>
);

export default ActionBar;
