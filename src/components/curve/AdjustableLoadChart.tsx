import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimePeriod } from '@/types/curve';
import { generateMockAdjustableLoadData } from '@/lib/curve-utils';

interface Props {
  periods: TimePeriod[];
  showActual?: boolean;
  chartHeight?: number;
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

const AdjustableLoadChart = ({ periods, showActual = false, chartHeight = 400 }: Props) => {
  const data = useMemo(() => generateMockAdjustableLoadData(periods), [periods]);

  return (
    <div style={{ height: chartHeight }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
          <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="stepAfter" dataKey="plan" name="计划功率" stroke="hsl(35 90% 50%)" strokeWidth={2} dot={false} />
          {showActual && (
            <Line type="monotone" dataKey="actual" name="实际功率" stroke="hsl(35 70% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdjustableLoadChart;
