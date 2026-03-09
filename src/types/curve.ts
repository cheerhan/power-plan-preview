export type ActionType = 'charge' | 'discharge' | 'idle';
export type CurveStatus = 'sent' | 'pending' | 'failed';
export type ProjectType = 'A' | 'B' | 'C'; // A=纯储能, B=光储, C=光储荷

export interface TimePeriod {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  actionType: ActionType;
  powerLimit: number; // kW, 0 for idle
}

export interface CurveDetail {
  id: string;
  projectName: string;
  projectType: ProjectType;
  curveDate: string;
  status: CurveStatus;
  lastSentAt: string | null;
  operator: string | null;
  hasPv: boolean;
  hasLoad: boolean;
  periods: TimePeriod[];
}

export interface ChartPoint {
  time: string;
  plan: number | null;
  actual: number | null;
}

export interface DispatchRecord {
  id: string;
  dispatchTime: string;
  curveDate: string;
  operator: string;
  status: 'success' | 'failed';
  failReason?: string;
}

export const ACTION_LABELS: Record<ActionType, string> = {
  charge: '充电',
  discharge: '放电',
  idle: '禁止动作',
};

export const STATUS_LABELS: Record<CurveStatus, string> = {
  sent: '已下发',
  pending: '待下发',
  failed: '下发失败',
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  A: '纯储能',
  B: '光储',
  C: '光储荷',
};

export const TIME_OPTIONS: string[] = [];
for (let h = 0; h <= 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 24 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}
