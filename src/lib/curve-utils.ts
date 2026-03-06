import { TimePeriod, ChartPoint, ActionType } from '@/types/curve';

export function validatePeriods(periods: TimePeriod[]): string | null {
  for (const p of periods) {
    if (p.startTime >= p.endTime) return `时段 ${p.startTime}-${p.endTime} 开始时间需早于结束时间`;
  }
  const sorted = [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) {
      return `时段 ${sorted[i - 1].startTime}-${sorted[i - 1].endTime} 与 ${sorted[i].startTime}-${sorted[i].endTime} 存在重叠`;
    }
  }
  return null;
}

export function periodsToChartData(periods: TimePeriod[]): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = 0; i < 96; i++) {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const period = periods.find(p => time >= p.startTime && time < p.endTime);
    let plan = 0;
    if (period) {
      if (period.actionType === 'charge') plan = period.powerLimit;
      else if (period.actionType === 'discharge') plan = -period.powerLimit;
    }
    points.push({ time, plan, actual: null });
  }
  return points;
}

export function getActionTypeAtTime(periods: TimePeriod[], time: string): ActionType {
  const p = periods.find(p => time >= p.startTime && time < p.endTime);
  return p?.actionType ?? 'idle';
}

// Generate mock actual data for demo
export function generateMockActual(planData: ChartPoint[]): ChartPoint[] {
  return planData.map(p => ({
    ...p,
    actual: p.plan !== null ? p.plan * (0.8 + Math.random() * 0.4) : null,
  }));
}

export function generateMockPvData(): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = 0; i < 96; i++) {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const hour = h + m / 60;
    // bell curve centered at noon
    const predict = hour >= 6 && hour <= 18 ? Math.max(0, 100 * Math.exp(-0.5 * ((hour - 12) / 3) ** 2)) : 0;
    const actual = predict > 0 ? predict * (0.7 + Math.random() * 0.5) : 0;
    points.push({ time, plan: Math.round(predict * 10) / 10, actual: Math.round(actual * 10) / 10 });
  }
  return points;
}
