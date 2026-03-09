import { TimePeriod, ChartPoint, ActionType } from '@/types/curve';

export function validatePeriods(periods: TimePeriod[]): string | null {
  if (periods.length === 0) return '至少需要一个时段';
  
  for (const p of periods) {
    if (p.startTime >= p.endTime) return `时段 ${p.startTime}-${p.endTime} 开始时间需早于结束时间`;
    if (p.powerLimit < 0) return `时段 ${p.startTime}-${p.endTime} 功率限值不能为负数`;
  }
  
  const sorted = [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime < sorted[i - 1].endTime) {
      return `时段 ${sorted[i - 1].startTime}-${sorted[i - 1].endTime} 与 ${sorted[i].startTime}-${sorted[i].endTime} 存在重叠`;
    }
  }
  
  if (sorted[0].startTime !== '00:00') {
    return `时段未覆盖 00:00-${sorted[0].startTime}，需覆盖完整 24 小时`;
  }
  if (sorted[sorted.length - 1].endTime !== '24:00') {
    return `时段未覆盖 ${sorted[sorted.length - 1].endTime}-24:00，需覆盖完整 24 小时`;
  }
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startTime !== sorted[i - 1].endTime) {
      return `时段 ${sorted[i - 1].endTime}-${sorted[i].startTime} 存在空隙，需覆盖完整 24 小时`;
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
    const predict = hour >= 6 && hour <= 18 ? Math.max(0, 100 * Math.exp(-0.5 * ((hour - 12) / 3) ** 2)) : 0;
    const actual = predict > 0 ? predict * (0.7 + Math.random() * 0.5) : 0;
    points.push({ time, plan: Math.round(predict * 10) / 10, actual: Math.round(actual * 10) / 10 });
  }
  return points;
}

export function generateMockLoadData(): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = 0; i < 96; i++) {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const hour = h + m / 60;
    // Simulate industrial load pattern with peaks at 9-11 and 14-16
    const base = 40;
    const morning = 60 * Math.exp(-0.5 * ((hour - 10) / 1.5) ** 2);
    const afternoon = 50 * Math.exp(-0.5 * ((hour - 15) / 1.5) ** 2);
    const night = -20 * Math.exp(-0.5 * ((hour - 3) / 2) ** 2);
    const actual = Math.max(0, base + morning + afternoon + night + (Math.random() - 0.5) * 10);
    points.push({ time, plan: null, actual: Math.round(actual * 10) / 10 });
  }
  return points;
}

export function isCurveEditable(curveDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(curveDate);
  d.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime() && d.getTime() <= tomorrow.getTime();
}

export function isCurveExecuted(curveDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(curveDate);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

export function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
