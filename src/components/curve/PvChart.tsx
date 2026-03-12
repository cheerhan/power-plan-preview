import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateMockPvData } from '@/lib/curve-utils';
import { MOCK_WEATHER, WEATHER_CONFIG, WeatherType } from '@/components/curve/DateSidebar';
import { cn } from '@/lib/utils';

interface Props {
  showActual?: boolean;
  chartHeight?: number;
  curveDate?: string;
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

const PvChart = ({ showActual = false, chartHeight = 400, curveDate }: Props) => {
  const data = useMemo(() => generateMockPvData(), []);

  const weather = curveDate ? MOCK_WEATHER[curveDate] : null;
  const weatherCfg = weather ? WEATHER_CONFIG[weather.type] : null;
  const WeatherIcon = weatherCfg?.icon;

  return (
    <div>
      {/* Weather badge */}
      {weather && weatherCfg && WeatherIcon && (
        <div className="flex items-center gap-1.5 mb-2">
          <WeatherIcon className={cn("h-4 w-4", weatherCfg.color)} />
          <span className="text-xs text-muted-foreground">
            {weatherCfg.label} {weather.tempLow}°~{weather.tempHigh}°
          </span>
          {weather.type === 'sunny' && (
            <span className="text-xs text-status-success ml-1">发电量预期较高</span>
          )}
          {(weather.type === 'rainy' || weather.type === 'thunderstorm' || weather.type === 'snow') && (
            <span className="text-xs text-destructive ml-1">发电量预期偏低</span>
          )}
          {(weather.type === 'cloudy' || weather.type === 'drizzle') && (
            <span className="text-xs text-status-pending ml-1">发电量预期一般</span>
          )}
        </div>
      )}
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
            <YAxis tick={{ fontSize: 10 }} label={{ value: '功率 (kW)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="plan" name="预测功率" stroke="hsl(145 60% 45%)" strokeWidth={2} dot={false} />
            {showActual && (
              <Line type="monotone" dataKey="actual" name="实际功率" stroke="hsl(145 50% 70%)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PvChart;
