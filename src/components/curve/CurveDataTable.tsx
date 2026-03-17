import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TimePeriod, ChartPoint, ACTION_LABELS } from '@/types/curve';
import { periodsToChartData, generateMockPvData, generateMockNonAdjustableLoadData, generateMockAdjustableLoadData, generateMockActual } from '@/lib/curve-utils';

interface Props {
  periods: TimePeriod[];
  showActual?: boolean;
  hasPv?: boolean;
  hasAdjustableLoad?: boolean;
  hasNonAdjustableLoad?: boolean;
  adjustableLoadPeriods?: TimePeriod[];
}

function fmt(v: number | null): string {
  if (v === null) return '—';
  return v.toFixed(1);
}

const CurveDataTable = ({
  periods, showActual = false, hasPv = false,
  hasAdjustableLoad = false, hasNonAdjustableLoad = false,
  adjustableLoadPeriods = [],
}: Props) => {
  const storageData = useMemo(() => {
    const plan = periodsToChartData(periods);
    return showActual ? generateMockActual(plan) : plan;
  }, [periods, showActual]);

  const pvData = useMemo(() => hasPv ? generateMockPvData() : null, [hasPv]);
  const adjLoadData = useMemo(() => hasAdjustableLoad && adjustableLoadPeriods.length > 0
    ? generateMockAdjustableLoadData(adjustableLoadPeriods) : null, [hasAdjustableLoad, adjustableLoadPeriods]);
  const nonAdjLoadData = useMemo(() => hasNonAdjustableLoad ? generateMockNonAdjustableLoadData() : null, [hasNonAdjustableLoad]);

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
            {hasAdjustableLoad && <TableHead className="text-xs sticky top-0 bg-background z-10">可调负荷计划 (kW)</TableHead>}
            {hasAdjustableLoad && showActual && <TableHead className="text-xs sticky top-0 bg-background z-10">可调负荷实际 (kW)</TableHead>}
            {hasNonAdjustableLoad && <TableHead className="text-xs sticky top-0 bg-background z-10">不可调负荷预测 (kW)</TableHead>}
            {hasNonAdjustableLoad && <TableHead className="text-xs sticky top-0 bg-background z-10">不可调负荷实际 (kW)</TableHead>}
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
              {hasAdjustableLoad && adjLoadData && <TableCell className="text-xs py-1 font-mono">{fmt(adjLoadData[i]?.plan)}</TableCell>}
              {hasAdjustableLoad && showActual && adjLoadData && <TableCell className="text-xs py-1 font-mono">{fmt(adjLoadData[i]?.actual)}</TableCell>}
              {hasNonAdjustableLoad && nonAdjLoadData && <TableCell className="text-xs py-1 font-mono">{fmt(nonAdjLoadData[i]?.plan)}</TableCell>}
              {hasNonAdjustableLoad && nonAdjLoadData && <TableCell className="text-xs py-1 font-mono">{fmt(nonAdjLoadData[i]?.actual)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurveDataTable;
