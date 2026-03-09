import { Pencil, Send, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  editing: boolean;
  editable: boolean;
  isHistorical: boolean;
  autoDispatch: boolean;
  onAutoDispatchChange: (v: boolean) => void;
  showHistory: boolean;
  onToggleHistory: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSend: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const ActionBar = ({
  editing, editable, isHistorical, autoDispatch, onAutoDispatchChange,
  showHistory, onToggleHistory,
  onEdit, onSave, onCancel, onSend, onDelete, onExport,
}: Props) => (
  <div className="flex items-center justify-between border-t border-panel-border px-6 py-3">
    {/* Left: auto dispatch + history */}
    <div className="flex items-center gap-4">
      {!isHistorical && !editing && (
        <>
          <div className="flex items-center gap-2">
            <Switch checked={autoDispatch} onCheckedChange={onAutoDispatchChange} id="auto-dispatch" />
            <Label htmlFor="auto-dispatch" className="text-sm cursor-pointer">自动下发</Label>
          </div>
          <button onClick={onToggleHistory} className="text-sm text-primary hover:underline">
            {showHistory ? '收起下发记录' : '下发记录'}
          </button>
        </>
      )}
    </div>

    {/* Right: action buttons */}
    <div className="flex items-center gap-3">
      {editing ? (
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
          <Button size="sm" onClick={onSave}>保存</Button>
        </>
      ) : (
        <>
          {/* Edit button */}
          {isHistorical ? (
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
          ) : editable ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="mr-1 h-3.5 w-3.5" />
              编辑
            </Button>
          ) : null}

          {/* Send button */}
          {isHistorical ? (
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
          ) : editable ? (
            <Button variant="outline" size="sm" onClick={onSend}>
              <Send className="mr-1 h-3.5 w-3.5" />
              下发
            </Button>
          ) : null}

          {/* Delete button - only for today/tomorrow, hidden for historical */}
          {!isHistorical && editable && (
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
                  <AlertDialogDescription>确定删除该条曲线记录？删除后不可恢复。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* Export always available */}
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-1 h-3.5 w-3.5" />
            导出曲线
          </Button>
        </>
      )}
    </div>
  </div>
);

export default ActionBar;
