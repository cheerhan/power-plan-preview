import { Pencil, Send, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  editing: boolean;
  editable: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSend: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const ActionBar = ({ editing, editable, onEdit, onSave, onCancel, onSend, onDelete, onExport }: Props) => (
  <div className="flex items-center justify-end gap-3 border-t border-panel-border px-6 py-3">
    {editing ? (
      <>
        <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
        <Button size="sm" onClick={onSave}>保存</Button>
      </>
    ) : (
      <>
        {editable ? (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            编辑
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  编辑
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>历史曲线不可编辑</TooltipContent>
          </Tooltip>
        )}

        {editable ? (
          <Button variant="outline" size="sm" onClick={onSend}>
            <Send className="mr-1 h-3.5 w-3.5" />
            下发
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button variant="outline" size="sm" disabled>
                  <Send className="mr-1 h-3.5 w-3.5" />
                  下发
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>历史曲线不可重新下发</TooltipContent>
          </Tooltip>
        )}

        {editable ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                删除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>确定删除该条曲线记录？此操作不可撤销。</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}

        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-1 h-3.5 w-3.5" />
          导出曲线
        </Button>
      </>
    )}
  </div>
);

export default ActionBar;
