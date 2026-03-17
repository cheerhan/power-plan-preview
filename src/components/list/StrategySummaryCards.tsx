import { cn } from '@/lib/utils';
import { Battery, Sun, Zap, Activity } from 'lucide-react';

export type CurveTypeKey = 'storage' | 'pv' | 'adjustableLoad' | 'nonAdjustableLoad';

export interface StrategyStats {
  type: CurveTypeKey;
  label: string;
  icon: React.ReactNode;
  projectCount: number;
  success: number;
  failed: number;
  pending: number;
  isPrediction?: boolean;
}

interface Props {
  stats: StrategyStats[];
  activeType: CurveTypeKey | null;
  onToggle: (type: CurveTypeKey) => void;
}

const ICONS: Record<CurveTypeKey, React.ReactNode> = {
  storage: <Battery className="h-5 w-5" />,
  pv: <Sun className="h-5 w-5" />,
  adjustableLoad: <Zap className="h-5 w-5" />,
  nonAdjustableLoad: <Activity className="h-5 w-5" />,
};

const DESCRIPTIONS: Record<CurveTypeKey, string> = {
  storage: '储能系统每日各时段的充电、放电或禁止动作计划，下发到现场控制器后作为次日实际运行依据。',
  pv: '基于气象与历史数据生成的光伏发电功率预测曲线，为调度决策和电网申报提供参考。',
  adjustableLoad: '可调负荷功率的计划曲线，与储能计划一起参与下发，由控制器执行调节。',
  nonAdjustableLoad: '根据用电负荷特征生成的次日负荷预测曲线，仅作为参考数据展示，不参与控制下发。',
};

const ICON_STYLES: Record<CurveTypeKey, string> = {
  storage: 'bg-status-pending/15 text-status-pending',
  pv: 'bg-chart-pv/15 text-chart-pv',
  adjustableLoad: 'bg-status-warning/15 text-status-warning',
  nonAdjustableLoad: 'bg-muted text-muted-foreground',
};

export function StrategySummaryCards({ stats, activeType, onToggle }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => {
        const isActive = activeType === s.type;
        const total = s.success + s.failed + s.pending;
        const isPred = s.isPrediction;
        return (
          <button
            key={s.type}
            onClick={() => onToggle(s.type)}
            className={cn(
              'rounded-lg border border-panel-border bg-card p-5 text-left transition-all hover:shadow-md',
              isActive && 'ring-2 ring-primary shadow-md'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-md',
                ICON_STYLES[s.type],
              )}>
                {ICONS[s.type]}
              </div>
              <div>
                <span className="font-semibold text-sm text-foreground">{s.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">{s.projectCount} 个项目</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {DESCRIPTIONS[s.type]}
            </p>

            {/* Stats bar */}
            {total > 0 && (
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex mb-2">
                {s.success > 0 && (
                  <div className="h-full bg-status-success" style={{ width: `${(s.success / total) * 100}%` }} />
                )}
                {s.failed > 0 && (
                  <div className="h-full bg-destructive" style={{ width: `${(s.failed / total) * 100}%` }} />
                )}
                {s.pending > 0 && (
                  <div className="h-full bg-status-pending" style={{ width: `${(s.pending / total) * 100}%` }} />
                )}
              </div>
            )}

            {/* Stats numbers - different labels for prediction vs dispatch */}
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-status-success" />
                {isPred ? '已生成' : '成功'} <span className="font-medium text-foreground">{s.success}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
                {isPred ? '生成失败' : '失败'} <span className="font-medium text-foreground">{s.failed}</span>
              </span>
              {!isPred && (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-status-pending" />
                  待下发 <span className="font-medium text-foreground">{s.pending}</span>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
