import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimePeriod, ChartPoint, ACTION_LABELS } from '@/types/curve';
import { periodsToChartData, generateMockPvData, generateMockLoadData, generateMockActual } from '@/lib/curve-utils';

interface Props {
  periods: TimePeriod[];
  showActual?: boolean;
  hasPv?: boolean;
  hasLoad?: boolean;
}

function fmt(v: number | null): string {
  if (v === null) return '—';
  return v.toFixed(1);
}

const CurveDataTable = ({ periods, showActual = false, hasPv = false, hasLoad = false }: Props) => {
  const storageData = useMemo(() => {
    const plan = periodsToChartData(periods);
    return showActual ? generateMockActual(plan) : plan;
  }, [periods, showActual]);

  const pvData = useMemo(() => hasPv ? generateMockPvData() : null, [hasPv]);
  const loadData = useMemo(() => hasLoad ? generateMockLoadData() : null, [hasLoad]);

  const getAction = (time: string) => {
    const p = periods.find(p => time >= p.startTime && time < p.endTime);
    return p ? ACTION_LABELS[p.actionType] : '—';
  };

  return (
    <div className="max-h-[600px] overflow-auto rounded-md border border-panel-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs w-[60px] sticky top-0 bg-background z-10">时间</TableHead>
            <TableHead className="text-xs w-[70px] sticky top-0 bg-background z-10">动作</TableHead>
            <TableHead className="text-xs sticky top-0 bg-background z-10">储能计划 (kW)</TableHead>
            {showActual && <TableHead className="text-xs sticky top-0 bg-background z-10">储能实际 (kW)</TableHead>}
            {hasPv && <TableHead className="text-xs sticky top-0 bg-background z-10">光伏预测 (kW)</TableHead>}
            {hasPv && showActual && <TableHead className="text-xs sticky top-0 bg-background z-10">光伏实际 (kW)</TableHead>}
            {hasLoad && <TableHead className="text-xs sticky top-0 bg-background z-10">负荷实际 (kW)</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {storageData.map((point, i) => (
            <TableRow key={i} className="h-7">
              <TableCell className="text-xs py-1 text-muted-foreground">{point.time}</TableCell>
              <TableCell className="text-xs py-1">{getAction(point.time)}</TableCell>
              <TableCell className="text-xs py-1 font-mono">{fmt(point.plan)}</TableCell>
              {showActual && <TableCell className="text-xs py-1 font-mono">{fmt(point.actual)}</TableCell>}
              {hasPv && pvData && <TableCell className="text-xs py-1 font-mono">{fmt(pvData[i]?.plan)}</TableCell>}
              {hasPv && showActual && pvData && <TableCell className="text-xs py-1 font-mono">{fmt(pvData[i]?.actual)}</TableCell>}
              {hasLoad && loadData && <TableCell className="text-xs py-1 font-mono">{fmt(loadData[i]?.actual)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurveDataTable;
