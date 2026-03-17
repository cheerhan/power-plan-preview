import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimePeriod } from '@/types/curve';
import { generateMockAdjustableLoadData, generateMockNonAdjustableLoadData } from '@/lib/curve-utils';
import { cn } from '@/lib/utils';

interface Props {
  hasAdjustableLoad: boolean;
  hasNonAdjustableLoad: boolean;
  adjustableLoadPeriods: TimePeriod[];
  showActual?: boolean;
  chartHeight?: number;
}

type LoadTab = 'adjustable' | 'nonAdjustable';

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

const LoadCombinedChart = ({
  hasAdjustableLoad, hasNonAdjustableLoad,
  adjustableLoadPeriods, showActual = false, chartHeight = 320,
}: Props) => {
  const tabs: { key: LoadTab; label: string }[] = [];
  if (hasAdjustableLoad) tabs.push({ key: 'adjustable', label: '可调负荷计划' });
  if (hasNonAdjustableLoad) tabs.push({ key: 'nonAdjustable', label: '不可调负荷预测' });

  const [activeTab, setActiveTab] = useState<LoadTab>(tabs[0]?.key ?? 'adjustable');

  const adjData = useMemo(
    () => hasAdjustableLoad ? generateMockAdjustableLoadData(adjustableLoadPeriods) : [],
    [hasAdjustableLoad, adjustableLoadPeriods],
  );
  const nonAdjData = useMemo(
    () => hasNonAdjustableLoad ? generateMockNonAdjustableLoadData() : [],
    [hasNonAdjustableLoad],
  );

  if (tabs.length === 0) return null;

  const isAdj = activeTab === 'adjustable';
  const data = isAdj ? adjData : nonAdjData;
  const planLabel = isAdj ? '计划功率' : '预测功率';
  const actualLabel = isAdj ? '实际功率' : '实际功率';
  const planColor = isAdj ? 'hsl(35 90% 50%)' : 'hsl(210 70% 50%)';
  const actualColor = isAdj ? 'hsl(35 70% 70%)' : 'hsl(210 50% 70%)';
  const showActualLine = isAdj ? showActual : true; // non-adj always shows both

  return (
    <div>
      {/* Tab toggle */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 mb-3">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-panel-border hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-muted-foreground mb-2">
        {isAdj
          ? '可调负荷功率的时段计划，属于可执行内容，与储能计划一起参与下发。'
          : '根据用电负荷特征生成的次日负荷预测曲线，仅作为参考数据展示。'}
      </p>

      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type={isAdj ? 'stepAfter' : 'monotone'}
              dataKey="plan"
              name={planLabel}
              stroke={planColor}
              strokeWidth={2}
              dot={false}
            />
            {showActualLine && (
              <Line
                type="monotone"
                dataKey="actual"
                name={actualLabel}
                stroke={actualColor}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoadCombinedChart;
