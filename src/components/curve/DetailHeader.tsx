import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Props {
  projectName: string;
  curveDate: string;
  status: 'sent' | 'pending' | 'failed';
  lastSentAt: string | null;
  operator: string;
}

const STATUS_MAP = {
  sent: { label: '已下发', variant: 'default' as const, className: 'bg-status-success' },
  pending: { label: '待下发', variant: 'secondary' as const, className: 'bg-status-pending text-primary-foreground' },
  failed: { label: '下发失败', variant: 'destructive' as const, className: '' },
};

const DetailHeader = ({ projectName, curveDate, status, lastSentAt, operator }: Props) => {
  const navigate = useNavigate();
  const s = STATUS_MAP[status];

  return (
    <div className="flex items-center justify-between border-b border-panel-border px-6 py-4">
      <div className="flex items-center gap-6">
        <h1 className="text-lg font-semibold text-foreground">{projectName}</h1>
        <span className="text-sm text-muted-foreground">{curveDate}</span>
        <Badge className={s.className}>{s.label}</Badge>
        {lastSentAt && <span className="text-xs text-muted-foreground">最近下发：{lastSentAt}</span>}
        <span className="text-xs text-muted-foreground">操作人：{operator}</span>
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回
      </Button>
    </div>
  );
};

export default DetailHeader;
