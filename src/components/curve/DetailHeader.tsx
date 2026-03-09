import { ArrowLeft, Pencil, Send, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { CurveStatus, STATUS_LABELS } from '@/types/curve';

interface Props {
  projectName: string;
  curveDate: string;
  status: CurveStatus;
  lastSentAt: string | null;
  operator: string | null;
  editing: boolean;
  editable: boolean;
  isHistorical: boolean;
  autoDispatch: boolean;
  onAutoDispatchChange: (v: boolean) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onSend: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const STATUS_MAP: Record<CurveStatus, { className: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  sent: { variant: 'default', className: 'bg-status-success' },
  pending: { variant: 'secondary', className: 'bg-status-pending text-primary-foreground' },
  failed: { variant: 'destructive', className: '' },
};

const DetailHeader = ({
  projectName, curveDate, status, lastSentAt, operator,
  editing, editable, isHistorical, autoDispatch, onAutoDispatchChange,
  onEdit, onSave, onCancel, onSend, onDelete, onExport,
}: Props) => {
  const navigate = useNavigate();
  const s = STATUS_MAP[status];

  return (
    <div className="flex items-center justify-between border-b border-panel-border px-6 py-3 gap-3 flex-wrap">
      {/* Left: project info */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-lg font-semibold text-foreground">{projectName}</h1>
        <span className="text-sm text-muted-foreground">{curveDate}</span>
        <Badge className={s.className} variant={s.variant}>{STATUS_LABELS[status]}</Badge>
        {editing && <Badge variant="secondary" className="bg-status-warning text-primary-foreground">编辑中</Badge>}
        {lastSentAt && <span className="text-xs text-muted-foreground">下发：{lastSentAt}</span>}
        {operator && <span className="text-xs text-muted-foreground">操作人：{operator}</span>}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {!editing && (
          <div className="flex items-center gap-2 mr-2">
            <Switch checked={autoDispatch} onCheckedChange={onAutoDispatchChange} id="auto-dispatch" />
            <Label htmlFor="auto-dispatch" className="text-xs cursor-pointer">自动下发</Label>
          </div>
        )}

        {editing ? (
          <>
            <Button variant="outline" size="sm" onClick={onCancel}>取消</Button>
            <Button size="sm" onClick={onSave}>保存</Button>
          </>
        ) : (
          <>
            {isHistorical ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Button variant="outline" size="sm" disabled><Pencil className="mr-1 h-3.5 w-3.5" />编辑</Button></span>
                </TooltipTrigger>
                <TooltipContent>历史曲线不可编辑</TooltipContent>
              </Tooltip>
            ) : editable ? (
              <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="mr-1 h-3.5 w-3.5" />编辑</Button>
            ) : null}

            {isHistorical ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Button variant="outline" size="sm" disabled><Send className="mr-1 h-3.5 w-3.5" />下发</Button></span>
                </TooltipTrigger>
                <TooltipContent>历史曲线不可重新下发</TooltipContent>
              </Tooltip>
            ) : editable ? (
              <Button variant="outline" size="sm" onClick={onSend}><Send className="mr-1 h-3.5 w-3.5" />下发</Button>
            ) : null}

            {!isHistorical && editable ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="mr-1 h-3.5 w-3.5" />删除</Button>
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
            ) : isHistorical ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span><Button variant="outline" size="sm" disabled className="text-muted-foreground"><Trash2 className="mr-1 h-3.5 w-3.5" />删除</Button></span>
                </TooltipTrigger>
                <TooltipContent>历史曲线不可删除</TooltipContent>
              </Tooltip>
            ) : null}

            <Button variant="outline" size="sm" onClick={onExport}><Download className="mr-1 h-3.5 w-3.5" />导出</Button>
          </>
        )}

        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Button>
      </div>
    </div>
  );
};

export default DetailHeader;
