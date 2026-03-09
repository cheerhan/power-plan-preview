import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { toast } from '@/hooks/use-toast';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import LoadChart from '@/components/curve/LoadChart';
import ActionBar from '@/components/curve/ActionBar';
import DispatchHistory from '@/components/curve/DispatchHistory';
import { TimePeriod, CurveDetail as CurveDetailType, ProjectType } from '@/types/curve';
import { validatePeriods, isCurveEditable, isCurveExecuted, getTomorrowDate } from '@/lib/curve-utils';
import { MOCK_CURVE_DB } from '@/data/mock-curves';

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
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const isNew = searchParams.get('new') === '1';
  const shouldEdit = searchParams.get('edit') === '1';

  const initialData = useMemo(() => {
    if (isNew) {
      const projectName = searchParams.get('project') || '未知项目';
      const projectType = (searchParams.get('type') || 'A') as ProjectType;
      return buildNewCurve(projectName, projectType);
    }
    return id ? MOCK_CURVE_DB[id] : Object.values(MOCK_CURVE_DB)[0];
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

  const showActual = !editing && executed && data.status === 'sent';

  // Build available dates for this project from MOCK_CURVE_DB
  const availableDates = useMemo(() => {
    return Object.values(MOCK_CURVE_DB)
      .filter(c => c.projectName === data.projectName)
      .map(c => ({ date: c.curveDate, id: c.id, status: c.status }));
  }, [data.projectName]);

  const handleDateChange = useCallback((newId: string) => {
    navigate(`/curve-detail?id=${newId}`, { replace: true });
    // Force re-mount by using key on component - handled via URL change
    window.location.href = `/curve-detail?id=${newId}`;
  }, [navigate]);

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
        availableDates={availableDates}
        onDateChange={handleDateChange}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: config area */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-panel-border p-5 space-y-6">
          <PeriodConfigPanel periods={activePeriods} onChange={setPeriods} disabled={!editing} />

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

          {data.hasLoad && (
            <div className="space-y-2 rounded-md border border-panel-border bg-panel-bg p-3">
              <h3 className="text-sm font-semibold text-foreground">负荷信息</h3>
              <p className="text-xs text-muted-foreground">
                本项目已配置负荷控制能力。当前版本仅展示负荷实际功率曲线，负荷计划配置功能后续迭代实现。
              </p>
            </div>
          )}

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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">储能计划限值</h3>
            <EnergyStorageChart periods={activePeriods} showActual={showActual} />
          </div>

          {data.hasPv && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">光伏预测功率</h3>
              <PvChart showActual={showActual} />
            </div>
          )}

          {data.hasLoad && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">负荷曲线</h3>
              <LoadChart />
            </div>
          )}

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
