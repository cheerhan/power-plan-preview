import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimePeriod, ChartPoint } from '@/types/curve';
import { generateMockAdjustableLoadData, generateMockNonAdjustableLoadData } from '@/lib/curve-utils';
import { cn } from '@/lib/utils';

interface Props {
  hasAdjustableLoad: boolean;
  hasNonAdjustableLoad: boolean;
  adjustableLoadPeriods: TimePeriod[];
  showActual?: boolean;
  chartHeight?: number;
}

type LoadTab = 'combined' | 'adjustable' | 'nonAdjustable';

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

const TAB_DESCRIPTIONS: Record<LoadTab, string> = {
  combined: '同时展示可调负荷计划和不可调负荷预测的叠加视图，便于整体评估负荷状况。',
  adjustable: '可调负荷功率的时段计划，属于可执行内容，与储能计划一起参与下发。',
  nonAdjustable: '根据用电负荷特征生成的次日负荷预测曲线，仅作为参考数据展示，不参与下发。',
};

const LoadCombinedChart = ({
  hasAdjustableLoad, hasNonAdjustableLoad,
  adjustableLoadPeriods, showActual = false, chartHeight = 260,
}: Props) => {
  const tabs: { key: LoadTab; label: string }[] = [];
  // Only show combined when both exist
  if (hasAdjustableLoad && hasNonAdjustableLoad) tabs.push({ key: 'combined', label: '汇总' });
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

  // Combined data: merge both datasets by time index
  const combinedData = useMemo(() => {
    if (!hasAdjustableLoad || !hasNonAdjustableLoad) return [];
    return adjData.map((p, i) => ({
      time: p.time,
      adjPlan: p.plan,
      adjActual: p.actual,
      nonAdjPlan: nonAdjData[i]?.plan ?? null,
      nonAdjActual: nonAdjData[i]?.actual ?? null,
    }));
  }, [adjData, nonAdjData, hasAdjustableLoad, hasNonAdjustableLoad]);

  if (tabs.length === 0) return null;

  return (
    <div>
      {/* Tab toggle */}
      {tabs.length > 1 && (
        <div className="flex items-center gap-1 mb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
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
      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
        {TAB_DESCRIPTIONS[activeTab]}
      </p>

      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer>
          {activeTab === 'combined' ? (
            <LineChart data={combinedData} margin={{ top: 8, right: 16, bottom: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="stepAfter" dataKey="adjPlan" name="可调计划" stroke="hsl(35 90% 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="adjActual" name="可调实际" stroke="hsl(35 70% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="nonAdjPlan" name="不可调预测" stroke="hsl(210 70% 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="nonAdjActual" name="不可调实际" stroke="hsl(210 50% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          ) : activeTab === 'adjustable' ? (
            <LineChart data={adjData} margin={{ top: 8, right: 16, bottom: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="stepAfter" dataKey="plan" name="计划功率" stroke="hsl(35 90% 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" name="实际功率" stroke="hsl(35 70% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          ) : (
            <LineChart data={nonAdjData} margin={{ top: 8, right: 16, bottom: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="plan" name="预测功率" stroke="hsl(210 70% 50%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="actual" name="实际功率" stroke="hsl(210 50% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LoadCombinedChart;
