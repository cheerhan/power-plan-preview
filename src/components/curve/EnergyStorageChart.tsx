import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { TimePeriod, ChartPoint } from '@/types/curve';
import { periodsToChartData, generateMockActual } from '@/lib/curve-utils';
import { ACTION_LABELS } from '@/types/curve';

interface Props {
  periods: TimePeriod[];
  showActual?: boolean; // true = show actual line (readonly + executed), false = edit preview
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-panel-border bg-background p-2 shadow-md text-xs">
      <p className="font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value?.toFixed(1)} kW
        </p>
      ))}
    </div>
  );
};

const EnergyStorageChart = ({ periods, showActual = false }: Props) => {
  const data = useMemo(() => {
    const plan = periodsToChartData(periods);
    return showActual ? generateMockActual(plan) : plan;
  }, [periods, showActual]);

  const refAreas = useMemo(() => {
    return periods.map((p, i) => {
      const fill = p.actionType === 'charge'
        ? 'hsl(210 80% 92%)'
        : p.actionType === 'discharge'
          ? 'hsl(30 80% 92%)'
          : 'transparent';
      return (
        <ReferenceArea
          key={i}
          x1={p.startTime}
          x2={p.endTime}
          fill={fill}
          fillOpacity={0.5}
          label={{ value: ACTION_LABELS[p.actionType], position: 'insideTop', fontSize: 10, fill: '#999' }}
        />
      );
    });
  }, [periods]);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
          {refAreas}
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
          <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="stepAfter" dataKey="plan" name="计划限值" stroke="hsl(30 90% 55%)" strokeWidth={2} dot={false} />
          {showActual && (
            <Line type="stepAfter" dataKey="actual" name="实际功率" stroke="hsl(30 80% 75%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyStorageChart;
