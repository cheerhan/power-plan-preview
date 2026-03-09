import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CurveStatus, STATUS_LABELS } from '@/types/curve';

interface Props {
  projectName: string;
  curveDate: string;
  status: CurveStatus;
  lastSentAt: string | null;
  operator: string | null;
  editing?: boolean;
}

const STATUS_MAP: Record<CurveStatus, { className: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  sent: { variant: 'default', className: 'bg-status-success' },
  pending: { variant: 'secondary', className: 'bg-status-pending text-primary-foreground' },
  failed: { variant: 'destructive', className: '' },
};

const DetailHeader = ({ projectName, curveDate, status, lastSentAt, operator, editing }: Props) => {
  const navigate = useNavigate();
  const s = STATUS_MAP[status];

  return (
    <div className="flex items-center justify-between border-b border-panel-border px-6 py-4">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">{projectName}</h1>
        <span className="text-sm text-muted-foreground">{curveDate}</span>
        <Badge className={s.className} variant={s.variant}>{STATUS_LABELS[status]}</Badge>
        {editing && <Badge variant="secondary" className="bg-status-warning text-primary-foreground">编辑中</Badge>}
        {lastSentAt && <span className="text-xs text-muted-foreground">最近下发：{lastSentAt}</span>}
        {operator && <span className="text-xs text-muted-foreground">操作人：{operator}</span>}
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回列表
      </Button>
    </div>
  );
};

export default DetailHeader;
