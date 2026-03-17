export type ActionType = 'charge' | 'discharge' | 'idle';
export type CurveStatus = 'sent' | 'pending' | 'failed';
export type PredictionStatus = 'generated' | 'generation_failed' | 'none';
export type ProjectType = 'A' | 'B' | 'C'; // A=纯储能, B=光储, C=光储荷

export interface TimePeriod {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  actionType: ActionType;
  powerLimit: number; // kW, 0 for idle
}

export interface ProjectParams {
  projectType: ProjectType;
  region: string;
  stationCode: string;
  storageRatedPower: number;   // kW
  storageRatedCapacity: number; // kWh
  pvInstalledCapacity?: number; // kWp
  adjustableLoadCapacity?: number; // kW
  nonAdjustableLoadScale?: number; // kW
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
  hasAdjustableLoad: boolean;
  hasNonAdjustableLoad: boolean;
  pvPredictionStatus?: PredictionStatus;
  nonAdjLoadPredictionStatus?: PredictionStatus;
  periods: TimePeriod[];
  adjustableLoadPeriods?: TimePeriod[];
  projectParams: ProjectParams;
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
  sent: '成功',
  pending: '待下发',
  failed: '失败',
};

export const PREDICTION_STATUS_LABELS: Record<PredictionStatus, string> = {
  generated: '已生成',
  generation_failed: '生成失败',
  none: '—',
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
