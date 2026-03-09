import { cn } from '@/lib/utils';
import { Battery, Sun, Zap } from 'lucide-react';

export type CurveTypeKey = 'storage' | 'pv' | 'load';

export interface StrategyStats {
  type: CurveTypeKey;
  label: string;
  icon: React.ReactNode;
  projectCount: number;
  success: number;
  failed: number;
  pending: number;
}

interface Props {
  stats: StrategyStats[];
  activeType: CurveTypeKey | null;
  onToggle: (type: CurveTypeKey) => void;
}

const ICONS: Record<CurveTypeKey, React.ReactNode> = {
  storage: <Battery className="h-5 w-5" />,
  pv: <Sun className="h-5 w-5" />,
  load: <Zap className="h-5 w-5" />,
};

export function StrategySummaryCards({ stats, activeType, onToggle }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map(s => {
        const isActive = activeType === s.type;
        return (
          <button
            key={s.type}
            onClick={() => onToggle(s.type)}
            className={cn(
              'rounded-lg border border-panel-border bg-card p-4 text-left transition-all hover:shadow-md',
              isActive && 'ring-2 ring-primary shadow-md'
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-muted-foreground">{ICONS[s.type]}</span>
              <span className="font-semibold text-foreground">{s.label}</span>
            </div>
            <div className="text-xs text-muted-foreground mb-1">
              适用项目：<span className="text-foreground font-medium">{s.projectCount}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-status-success mr-1" />
                成功 <span className="font-medium text-foreground">{s.success}</span>
              </span>
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-destructive mr-1" />
                失败 <span className="font-medium text-foreground">{s.failed}</span>
              </span>
              <span>
                <span className="inline-block w-2 h-2 rounded-full bg-status-pending mr-1" />
                待下发 <span className="font-medium text-foreground">{s.pending}</span>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
