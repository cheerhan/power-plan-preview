import { TimePeriod, ACTION_LABELS } from '@/types/curve';

/**
 * Generate a short summary of storage period configuration.
 * e.g. "谷段充电 100kW；峰段放电 80kW" or "3 时段：00–07 充电 / 10–12 充电 / 14–17 放电"
 */
export function generateStrategySummary(periods: TimePeriod[]): string {
  const nonIdle = periods.filter(p => p.actionType !== 'idle');
  if (nonIdle.length === 0) return '全天禁止动作';
  
  if (nonIdle.length <= 2) {
    return nonIdle
      .map(p => `${p.startTime}–${p.endTime} ${ACTION_LABELS[p.actionType]} ${p.powerLimit}kW`)
      .join('；');
  }

  const parts = nonIdle.map(p => `${p.startTime}–${p.endTime} ${ACTION_LABELS[p.actionType]}`);
  return `${nonIdle.length} 时段：${parts.join(' / ')}`;
}
