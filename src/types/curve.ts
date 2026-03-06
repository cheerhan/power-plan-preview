export type ActionType = 'charge' | 'discharge' | 'idle';

export interface TimePeriod {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  actionType: ActionType;
  powerLimit: number; // kW, 0 for idle
}

export interface CurveDetail {
  projectName: string;
  curveDate: string;
  status: 'sent' | 'pending' | 'failed';
  lastSentAt: string | null;
  operator: string;
  hasPv: boolean;
  hasLoad: boolean;
  periods: TimePeriod[];
}

export interface ChartPoint {
  time: string;
  plan: number | null;
  actual: number | null;
}

export const ACTION_LABELS: Record<ActionType, string> = {
  charge: '充电',
  discharge: '放电',
  idle: '禁止动作',
};

export const TIME_OPTIONS: string[] = [];
for (let h = 0; h <= 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 24 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}
