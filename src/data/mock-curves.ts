import { CurveDetail } from '@/types/curve';

// Mock data covering all 3 project types + historical/current/future dates
export const MOCK_CURVE_DB: Record<string, CurveDetail> = {
  // A: 纯储能 - tomorrow (pending)
  '1': {
    id: '1', projectName: '纯储能测试站', projectType: 'A',
    curveDate: '2026-03-10', status: 'pending', lastSentAt: null, operator: null,
    hasPv: false, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '06:00', actionType: 'charge', powerLimit: 120 },
      { id: '2', startTime: '06:00', endTime: '08:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '08:00', endTime: '11:00', actionType: 'discharge', powerLimit: 90 },
      { id: '4', startTime: '11:00', endTime: '13:00', actionType: 'idle', powerLimit: 0 },
      { id: '5', startTime: '13:00', endTime: '17:00', actionType: 'discharge', powerLimit: 75 },
      { id: '6', startTime: '17:00', endTime: '21:00', actionType: 'charge', powerLimit: 60 },
      { id: '7', startTime: '21:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // A: 纯储能 - today (sent)
  '2': {
    id: '2', projectName: '纯储能测试站', projectType: 'A',
    curveDate: '2026-03-09', status: 'sent', lastSentAt: '2026-03-08 08:00:00', operator: '王工',
    hasPv: false, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '10:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '10:00', endTime: '12:00', actionType: 'discharge', powerLimit: 80 },
      { id: '4', startTime: '12:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '5', startTime: '14:00', endTime: '17:00', actionType: 'discharge', powerLimit: 80 },
      { id: '6', startTime: '17:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // A: 纯储能 - historical
  '3': {
    id: '3', projectName: '纯储能测试站', projectType: 'A',
    curveDate: '2026-03-07', status: 'sent', lastSentAt: '2026-03-06 08:00:00', operator: '系统',
    hasPv: false, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 60 },
      { id: '4', startTime: '18:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // B: 光储 - tomorrow
  '4': {
    id: '4', projectName: '示范储能电站一期', projectType: 'B',
    curveDate: '2026-03-10', status: 'pending', lastSentAt: null, operator: null,
    hasPv: true, hasLoad: false,
    periods: [{ id: '1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }],
  },
  // B: 光储 - today (sent)
  '5': {
    id: '5', projectName: '示范储能电站一期', projectType: 'B',
    curveDate: '2026-03-09', status: 'sent', lastSentAt: '2026-03-08 08:30:00', operator: '张工',
    hasPv: true, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'idle', powerLimit: 0 },
      { id: '2', startTime: '07:00', endTime: '11:00', actionType: 'charge', powerLimit: 80 },
      { id: '3', startTime: '11:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '4', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 60 },
      { id: '5', startTime: '18:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // B: 光储 - historical
  '6': {
    id: '6', projectName: '示范储能电站一期', projectType: 'B',
    curveDate: '2026-03-08', status: 'sent', lastSentAt: '2026-03-07 08:00:00', operator: '系统',
    hasPv: true, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '06:00', actionType: 'charge', powerLimit: 90 },
      { id: '2', startTime: '06:00', endTime: '10:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '10:00', endTime: '12:00', actionType: 'charge', powerLimit: 60 },
      { id: '4', startTime: '12:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '5', startTime: '14:00', endTime: '17:00', actionType: 'discharge', powerLimit: 80 },
      { id: '6', startTime: '17:00', endTime: '21:00', actionType: 'discharge', powerLimit: 50 },
      { id: '7', startTime: '21:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // B: 光储 - historical failed
  '7': {
    id: '7', projectName: '示范储能电站一期', projectType: 'B',
    curveDate: '2026-03-06', status: 'failed', lastSentAt: '2026-03-05 08:00:00', operator: '系统',
    hasPv: true, hasLoad: false,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '17:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '17:00', endTime: '24:00', actionType: 'discharge', powerLimit: 70 },
    ],
  },
  // C: 光储荷 - tomorrow
  '8': {
    id: '8', projectName: '朝6-605站', projectType: 'C',
    curveDate: '2026-03-10', status: 'pending', lastSentAt: null, operator: null,
    hasPv: true, hasLoad: true,
    periods: [
      { id: '1', startTime: '00:00', endTime: '06:00', actionType: 'charge', powerLimit: 110 },
      { id: '2', startTime: '06:00', endTime: '09:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '09:00', endTime: '12:00', actionType: 'discharge', powerLimit: 80 },
      { id: '4', startTime: '12:00', endTime: '14:00', actionType: 'charge', powerLimit: 40 },
      { id: '5', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 90 },
      { id: '6', startTime: '18:00', endTime: '22:00', actionType: 'charge', powerLimit: 55 },
      { id: '7', startTime: '22:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // C: 光储荷 - today (sent)
  '9': {
    id: '9', projectName: '朝6-605站', projectType: 'C',
    curveDate: '2026-03-09', status: 'sent', lastSentAt: '2026-03-08 09:15:00', operator: '李工',
    hasPv: true, hasLoad: true,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '10:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '10:00', endTime: '12:00', actionType: 'charge', powerLimit: 60 },
      { id: '4', startTime: '12:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '5', startTime: '14:00', endTime: '17:00', actionType: 'discharge', powerLimit: 80 },
      { id: '6', startTime: '17:00', endTime: '21:00', actionType: 'discharge', powerLimit: 50 },
      { id: '7', startTime: '21:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // C: 光储荷 - historical failed
  '10': {
    id: '10', projectName: '朝6-605站', projectType: 'C',
    curveDate: '2026-03-07', status: 'failed', lastSentAt: '2026-03-06 09:15:00', operator: '李工',
    hasPv: true, hasLoad: true,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 60 },
      { id: '4', startTime: '18:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
  // C: 光储荷 - historical
  '11': {
    id: '11', projectName: '朝6-605站', projectType: 'C',
    curveDate: '2026-03-05', status: 'sent', lastSentAt: '2026-03-04 08:00:00', operator: '系统',
    hasPv: true, hasLoad: true,
    periods: [
      { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'charge', powerLimit: 100 },
      { id: '2', startTime: '07:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
      { id: '3', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 60 },
      { id: '4', startTime: '18:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
    ],
  },
};
