import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimePeriod, ChartPoint, ACTION_LABELS } from '@/types/curve';
import { periodsToChartData, generateMockPvData, generateMockLoadData, generateMockActual } from '@/lib/curve-utils';

interface Props {
  /** Which data set to show */
  type: 'storage' | 'pv' | 'load';
  periods?: TimePeriod[];
  showActual?: boolean;
}

function formatValue(v: number | null): string {
  if (v === null) return '—';
  return v.toFixed(1);
}

const CurveDataTable = ({ type, periods = [], showActual = false }: Props) => {
  const data = useMemo(() => {
    if (type === 'storage') {
      const plan = periodsToChartData(periods);
      return showActual ? generateMockActual(plan) : plan;
    }
    if (type === 'pv') return generateMockPvData();
    return generateMockLoadData();
  }, [type, periods, showActual]);

  const planLabel = type === 'storage' ? '计划限值 (kW)' : type === 'pv' ? '预测功率 (kW)' : '—';
  const actualLabel = type === 'storage' ? '实际功率 (kW)' : type === 'pv' ? '实际功率 (kW)' : '实际功率 (kW)';
  const showPlanCol = type !== 'load';
  const showActualCol = type === 'load' || showActual;

  // Find action type for each time point (storage only)
  const getAction = (time: string) => {
    if (type !== 'storage' || !periods.length) return null;
    const p = periods.find(p => time >= p.startTime && time < p.endTime);
    return p ? ACTION_LABELS[p.actionType] : null;
  };

  return (
    <div className="max-h-[400px] overflow-auto rounded-md border border-panel-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-[80px] sticky top-0 bg-background">时间</TableHead>
            {type === 'storage' && <TableHead className="text-xs w-[80px] sticky top-0 bg-background">动作</TableHead>}
            {showPlanCol && <TableHead className="text-xs sticky top-0 bg-background">{planLabel}</TableHead>}
            {showActualCol && <TableHead className="text-xs sticky top-0 bg-background">{actualLabel}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((point, i) => (
            <TableRow key={i} className="h-7">
              <TableCell className="text-xs py-1 text-muted-foreground">{point.time}</TableCell>
              {type === 'storage' && (
                <TableCell className="text-xs py-1">{getAction(point.time) ?? '—'}</TableCell>
              )}
              {showPlanCol && (
                <TableCell className="text-xs py-1 font-mono">{formatValue(point.plan)}</TableCell>
              )}
              {showActualCol && (
                <TableCell className="text-xs py-1 font-mono">{formatValue(point.actual)}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurveDataTable;
