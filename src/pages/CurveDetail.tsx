import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import LoadChart from '@/components/curve/LoadChart';
import ActionBar from '@/components/curve/ActionBar';
import DispatchHistory from '@/components/curve/DispatchHistory';
import { TimePeriod, CurveDetail as CurveDetailType, ProjectType, CurveStatus } from '@/types/curve';
import { validatePeriods, isCurveEditable, isCurveExecuted, getTomorrowDate } from '@/lib/curve-utils';

// Mock data covering all 3 project types + historical/current/future dates
const MOCK_DB: Record<string, CurveDetailType> = {
  // A: 纯储能 - tomorrow (pending)
  '1': {
    id: '1', projectName: '纯储能测试站', projectType: 'A',
    curveDate: '2026-03-10', status: 'pending', lastSentAt: null, operator: null,
    hasPv: false, hasLoad: false,
    periods: [{ id: '1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }],
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
    periods: [{ id: '1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }],
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

function buildNewCurve(projectName: string, projectType: ProjectType): CurveDetailType {
  return {
    id: 'new',
    projectName,
    projectType,
    curveDate: getTomorrowDate(),
    status: 'pending',
    lastSentAt: null,
    operator: null,
    hasPv: projectType === 'B' || projectType === 'C',
    hasLoad: projectType === 'C',
    periods: [{ id: '1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }],
  };
}

const CurveDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const isNew = searchParams.get('new') === '1';
  const shouldEdit = searchParams.get('edit') === '1';

  const initialData = useMemo(() => {
    if (isNew) {
      const projectName = searchParams.get('project') || '未知项目';
      const projectType = (searchParams.get('type') || 'A') as ProjectType;
      return buildNewCurve(projectName, projectType);
    }
    return id ? MOCK_DB[id] : Object.values(MOCK_DB)[0];
  }, [id, isNew, searchParams]);

  const [data] = useState(initialData!);
  const [periods, setPeriods] = useState<TimePeriod[]>(data.periods);
  const [savedPeriods, setSavedPeriods] = useState<TimePeriod[]>(data.periods);
  const [editing, setEditing] = useState(isNew || shouldEdit);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const editable = useMemo(() => isCurveEditable(data.curveDate), [data.curveDate]);
  const historical = useMemo(() => !isCurveEditable(data.curveDate), [data.curveDate]);
  const executed = useMemo(() => isCurveExecuted(data.curveDate), [data.curveDate]);

  // Determine whether to show actual lines in charts
  // Edit mode: only plan line; Readonly + executed: plan + actual
  const showActual = !editing && executed;

  const tabs = useMemo(() => {
    const t = [{ key: 'storage', label: '储能计划限值' }];
    if (data.hasPv) t.push({ key: 'pv', label: '光伏预测功率' });
    if (data.hasLoad) t.push({ key: 'load', label: '负荷曲线' });
    return t;
  }, [data.hasPv, data.hasLoad]);

  const handleSave = useCallback(() => {
    const err = validatePeriods(periods);
    if (err) {
      toast({ title: '时段校验失败', description: err, variant: 'destructive' });
      return;
    }
    setSavedPeriods(periods);
    setEditing(false);
    toast({ title: '保存成功', description: '时段配置已更新，保存 ≠ 下发，请在只读态点击「下发」将曲线发送至控制器。' });
  }, [periods]);

  const handleCancel = useCallback(() => {
    setPeriods(savedPeriods);
    setEditing(false);
  }, [savedPeriods]);

  const handleSend = useCallback(() => {
    toast({ title: '下发成功', description: '曲线已下发至控制器（演示）' });
  }, []);

  const handleDelete = useCallback(() => {
    toast({ title: '已删除', description: '曲线记录已删除（演示），将返回列表页' });
  }, []);

  const handleExport = useCallback(() => {
    toast({ title: '导出曲线', description: `${data.projectName}_调度曲线_${data.curveDate.replace(/-/g, '')}.xlsx（演示）` });
  }, [data.projectName, data.curveDate]);

  const activePeriods = editing ? periods : savedPeriods;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DetailHeader
        projectName={data.projectName}
        curveDate={data.curveDate}
        status={data.status}
        lastSentAt={data.lastSentAt}
        operator={data.operator}
        editing={editing}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: config area */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-panel-border p-5 space-y-6">
          {/* Storage period config (always shown) */}
          <PeriodConfigPanel periods={activePeriods} onChange={setPeriods} disabled={!editing} />

          {/* PV section (conditional: project B or C with PV) */}
          {data.hasPv && (
            <div className="space-y-2 rounded-md border border-panel-border bg-panel-bg p-3">
              <h3 className="text-sm font-semibold text-foreground">光伏预测功率曲线</h3>
              <p className="text-xs text-muted-foreground">
                已配置光伏预测算法，预测数据由系统自动生成。
              </p>
              <p className="text-xs text-muted-foreground">
                光伏预测曲线供运营人员参考，用于决策储能充放电时段配置。
              </p>
              {editing && (
                <p className="text-xs text-primary">
                  提示：可在右侧「光伏预测功率」Tab 查看预测曲线，结合预测结果配置储能时段。
                </p>
              )}
            </div>
          )}

          {/* Load section (conditional: project C with load) */}
          {data.hasLoad && (
            <div className="space-y-2 rounded-md border border-panel-border bg-panel-bg p-3">
              <h3 className="text-sm font-semibold text-foreground">负荷功率曲线</h3>
              <p className="text-xs text-muted-foreground">
                本项目已配置负荷控制能力。当前版本仅展示负荷实际功率曲线，负荷计划配置功能后续迭代实现。
              </p>
            </div>
          )}

          {/* Scenario info banner */}
          <div className="rounded-md border border-panel-border bg-panel-bg p-3 space-y-1">
            <h4 className="text-xs font-semibold text-muted-foreground">当前场景</h4>
            <p className="text-xs text-muted-foreground">
              项目类型：{data.projectType === 'A' ? '纯储能' : data.projectType === 'B' ? '光储' : '光储荷'}
              {' · '}
              曲线日期：{data.curveDate}
              {' · '}
              {historical ? '历史曲线（只读）' : editing ? '编辑态' : '只读态'}
              {!editing && executed && ' · 已执行（显示计划线+实际线）'}
              {!editing && !executed && !historical && ' · 未执行（仅显示计划线）'}
            </p>
          </div>
        </div>

        {/* Right chart area */}
        <div className="flex-1 overflow-y-auto p-5">
          <Tabs defaultValue="storage">
            <TabsList>
              {tabs.map(t => (
                <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="storage">
              <EnergyStorageChart periods={activePeriods} showActual={showActual} />
            </TabsContent>

            {data.hasPv && (
              <TabsContent value="pv">
                <PvChart showActual={showActual} />
              </TabsContent>
            )}

            {data.hasLoad && (
              <TabsContent value="load">
                <LoadChart />
              </TabsContent>
            )}
          </Tabs>

          {/* Dispatch history shown below charts when toggled */}
          {showHistory && (
            <div className="mt-4">
              <DispatchHistory />
            </div>
          )}
        </div>
      </div>

      <ActionBar
        editing={editing}
        editable={editable}
        isHistorical={historical}
        autoDispatch={autoDispatch}
        onAutoDispatchChange={setAutoDispatch}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onEdit={() => setEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        onSend={handleSend}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </div>
  );
};

export default CurveDetail;
