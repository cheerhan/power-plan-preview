import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

const DispatchHistory = () => (
  <div className="space-y-2">
    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">下发记录</h4>
    <div className="space-y-1.5">
      {MOCK_HISTORY.map(r => (
        <div key={r.id} className="flex items-center gap-2 rounded-md border border-panel-border bg-panel-bg px-3 py-2 text-xs">
          <span className="text-muted-foreground w-[130px] shrink-0">{r.dispatchTime}</span>
          <span className="text-muted-foreground">{r.curveDate}</span>
          <span className="flex-1">{r.operator}</span>
          {r.status === 'success' ? (
            <Badge variant="default" className="bg-status-success text-xs">成功</Badge>
          ) : (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="destructive" className="text-xs cursor-help">失败</Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">{r.failReason}</TooltipContent>
            </Tooltip>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default DispatchHistory;
