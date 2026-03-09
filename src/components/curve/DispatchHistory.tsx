import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DispatchRecord {
  id: string;
  dispatchTime: string;
  curveDate: string;
  operator: string;
  status: 'success' | 'failed';
  failReason?: string;
}

const MOCK_HISTORY: DispatchRecord[] = [
  { id: '1', dispatchTime: '2026-03-06 08:30:00', curveDate: '2026-03-07', operator: '张工', status: 'success' },
  { id: '2', dispatchTime: '2026-03-05 08:00:00', curveDate: '2026-03-06', operator: '系统', status: 'success' },
  { id: '3', dispatchTime: '2026-03-04 09:15:00', curveDate: '2026-03-05', operator: '李工', status: 'failed', failReason: '控制器通信超时，请检查网络连接' },
  { id: '4', dispatchTime: '2026-03-04 08:00:00', curveDate: '2026-03-05', operator: '系统', status: 'success' },
];

const DispatchHistory = () => {
  const [open, setOpen] = useState(false);
  const successCount = MOCK_HISTORY.filter(r => r.status === 'success').length;
  const failedCount = MOCK_HISTORY.filter(r => r.status === 'failed').length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-md border border-panel-border">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-4">
            <h4 className="text-sm font-semibold text-foreground">下发记录</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>共 <span className="font-medium text-foreground">{MOCK_HISTORY.length}</span> 次</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-status-success" />
                成功 <span className="font-medium text-foreground">{successCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
                失败 <span className="font-medium text-foreground">{failedCount}</span>
              </span>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">下发时间</TableHead>
                <TableHead className="text-xs">曲线日期</TableHead>
                <TableHead className="text-xs">操作人</TableHead>
                <TableHead className="text-xs">状态</TableHead>
                <TableHead className="text-xs">备注</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_HISTORY.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs text-muted-foreground">{r.dispatchTime}</TableCell>
                  <TableCell className="text-xs">{r.curveDate}</TableCell>
                  <TableCell className="text-xs">{r.operator}</TableCell>
                  <TableCell>
                    {r.status === 'success' ? (
                      <Badge variant="default" className="bg-status-success text-xs">成功</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">失败</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {r.failReason ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default DispatchHistory;
