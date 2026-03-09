import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { toast } from '@/hooks/use-toast';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import LoadChart from '@/components/curve/LoadChart';
import CurveDataTable from '@/components/curve/CurveDataTable';
import ActionBar from '@/components/curve/ActionBar';
import DispatchHistory from '@/components/curve/DispatchHistory';
import DateSidebar from '@/components/curve/DateSidebar';
import { TimePeriod, CurveDetail as CurveDetailType, ProjectType, CurveStatus } from '@/types/curve';
import { validatePeriods, isCurveEditable, isCurveExecuted, getTomorrowDate } from '@/lib/curve-utils';
import { MOCK_CURVE_DB } from '@/data/mock-curves';
import { cn } from '@/lib/utils';

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
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const editable = useMemo(() => isCurveEditable(data.curveDate), [data.curveDate]);
  const historical = useMemo(() => !isCurveEditable(data.curveDate), [data.curveDate]);
  const executed = useMemo(() => isCurveExecuted(data.curveDate), [data.curveDate]);

  const showActual = !editing && executed && data.status === 'sent';

  // Available dates for this project
  const availableDates = useMemo(() => {
    return Object.values(MOCK_CURVE_DB)
      .filter(c => c.projectName === data.projectName)
      .map(c => ({ date: c.curveDate, id: c.id, status: c.status }));
  }, [data.projectName]);

  const handleDateChange = useCallback((newId: string) => {
    navigate(`/curve-detail?id=${newId}`);
  }, [navigate]);

  // Chart count for dynamic height
  const chartCount = useMemo(() => {
    let count = 1; // storage always
    if (data.hasPv) count++;
    if (data.hasLoad) count++;
    return count;
  }, [data.hasPv, data.hasLoad]);

  // Dynamic chart height: fill available space
  // Header ~57px, ActionBar ~56px, section titles ~32px each, spacing ~24px each, padding ~40px
  const chartHeight = useMemo(() => {
    const headerHeight = 57;
    const actionBarHeight = 56;
    const padding = 40;
    const sectionTitleAndGap = 56; // title + margin per chart
    const availableHeight = window.innerHeight - headerHeight - actionBarHeight - padding - (sectionTitleAndGap * chartCount);
    const perChart = Math.max(200, Math.floor(availableHeight / chartCount));
    return Math.min(perChart, 500); // cap at 500
  }, [chartCount]);

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
        {/* Left sidebar: calendar + config */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-panel-border p-5 space-y-5">
          {/* Fixed calendar for date navigation */}
          <DateSidebar
            currentDate={data.curveDate}
            availableDates={availableDates}
            onDateChange={handleDateChange}
            disabled={editing}
          />

          {/* Storage period config */}
          <PeriodConfigPanel periods={activePeriods} onChange={setPeriods} disabled={!editing} />

          {data.hasPv && (
            <div className="space-y-2 rounded-md border border-panel-border bg-panel-bg p-3">
              <h3 className="text-sm font-semibold text-foreground">光伏预测功率曲线</h3>
              <p className="text-xs text-muted-foreground">
                已配置光伏预测算法，预测数据由系统自动生成。
              </p>
              {editing && (
                <p className="text-xs text-primary">
                  提示：可在右侧查看预测曲线，结合预测结果配置储能时段。
                </p>
              )}
            </div>
          )}

          {data.hasLoad && (
            <div className="space-y-2 rounded-md border border-panel-border bg-panel-bg p-3">
              <h3 className="text-sm font-semibold text-foreground">负荷信息</h3>
              <p className="text-xs text-muted-foreground">
                本项目已配置负荷控制能力。当前版本仅展示负荷实际功率曲线。
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
              {!editing && executed && ' · 已执行（计划+实际）'}
              {!editing && !executed && !historical && ' · 未执行（仅计划）'}
            </p>
          </div>
        </div>

        {/* Right chart/table area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* View mode toggle */}
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 text-xs", viewMode === 'chart' && "bg-accent text-accent-foreground")}
              onClick={() => setViewMode('chart')}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              图表
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 text-xs", viewMode === 'table' && "bg-accent text-accent-foreground")}
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-3.5 w-3.5" />
              数据表
            </Button>
          </div>

          {/* Storage */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">储能计划限值</h3>
            {viewMode === 'chart' ? (
              <EnergyStorageChart periods={activePeriods} showActual={showActual} chartHeight={chartHeight} />
            ) : (
              <CurveDataTable type="storage" periods={activePeriods} showActual={showActual} />
            )}
          </div>

          {/* PV */}
          {data.hasPv && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">光伏预测功率</h3>
              {viewMode === 'chart' ? (
                <PvChart showActual={showActual} chartHeight={chartHeight} />
              ) : (
                <CurveDataTable type="pv" showActual={showActual} />
              )}
            </div>
          )}

          {/* Load */}
          {data.hasLoad && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">负荷曲线</h3>
              {viewMode === 'chart' ? (
                <LoadChart chartHeight={chartHeight} />
              ) : (
                <CurveDataTable type="load" />
              )}
            </div>
          )}

          {/* Dispatch history */}
          <DispatchHistory />
        </div>
      </div>

      <ActionBar
        editing={editing}
        editable={editable}
        isHistorical={historical}
        autoDispatch={autoDispatch}
        onAutoDispatchChange={setAutoDispatch}
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
