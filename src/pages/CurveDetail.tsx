import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { toast } from '@/hooks/use-toast';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import AdjustableLoadChart from '@/components/curve/AdjustableLoadChart';
import NonAdjustableLoadChart from '@/components/curve/NonAdjustableLoadChart';
import CurveDataTable from '@/components/curve/CurveDataTable';
import ProjectParamsCard from '@/components/curve/ProjectParamsCard';

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
    hasAdjustableLoad: projectType === 'C',
    hasNonAdjustableLoad: projectType === 'C',
    periods: [{ id: '1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }],
    adjustableLoadPeriods: projectType === 'C' ? [{ id: 'al1', startTime: '00:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 }] : undefined,
    projectParams: {
      projectType,
      region: '—',
      stationCode: '—',
      storageRatedPower: 200,
      storageRatedCapacity: 400,
      ...(projectType === 'B' || projectType === 'C' ? { pvInstalledCapacity: 500 } : {}),
      ...(projectType === 'C' ? { adjustableLoadCapacity: 120, nonAdjustableLoadScale: 350 } : {}),
    },
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
  const [adjLoadPeriods, setAdjLoadPeriods] = useState<TimePeriod[]>(data.adjustableLoadPeriods ?? []);
  const [savedAdjLoadPeriods, setSavedAdjLoadPeriods] = useState<TimePeriod[]>(data.adjustableLoadPeriods ?? []);
  const [editing, setEditing] = useState(isNew || shouldEdit);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const editable = useMemo(() => isCurveEditable(data.curveDate), [data.curveDate]);
  const historical = useMemo(() => !isCurveEditable(data.curveDate), [data.curveDate]);
  const executed = useMemo(() => isCurveExecuted(data.curveDate), [data.curveDate]);

  const showActual = !editing && executed;

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
    if (data.hasAdjustableLoad) count++;
    if (data.hasNonAdjustableLoad) count++;
    return count;
  }, [data.hasPv, data.hasAdjustableLoad, data.hasNonAdjustableLoad]);

  const chartHeight = useMemo(() => {
    const headerHeight = 57;
    const actionBarHeight = 56;
    const padding = 40;
    const sectionTitleAndGap = 56;
    const availableHeight = window.innerHeight - headerHeight - actionBarHeight - padding - (sectionTitleAndGap * chartCount);
    const perChart = Math.max(180, Math.floor(availableHeight / chartCount));
    return Math.min(perChart, 450);
  }, [chartCount]);

  const handleSave = useCallback(() => {
    const err = validatePeriods(periods);
    if (err) {
      toast({ title: '储能时段校验失败', description: err, variant: 'destructive' });
      return;
    }
    if (data.hasAdjustableLoad && adjLoadPeriods.length > 0) {
      const adjErr = validatePeriods(adjLoadPeriods);
      if (adjErr) {
        toast({ title: '可调负荷时段校验失败', description: adjErr, variant: 'destructive' });
        return;
      }
    }
    setSavedPeriods(periods);
    setSavedAdjLoadPeriods(adjLoadPeriods);
    setEditing(false);
    toast({ title: '保存成功', description: '时段配置已更新，保存 ≠ 下发，请在只读态点击「下发」将可执行曲线发送至控制器。' });
  }, [periods, adjLoadPeriods, data.hasAdjustableLoad]);

  const handleCancel = useCallback(() => {
    setPeriods(savedPeriods);
    setAdjLoadPeriods(savedAdjLoadPeriods);
    setEditing(false);
  }, [savedPeriods, savedAdjLoadPeriods]);

  const handleSend = useCallback(() => {
    const targets = ['储能计划'];
    if (data.hasAdjustableLoad) targets.push('可调负荷计划');
    toast({ title: '下发成功', description: `已下发：${targets.join('、')}（演示）` });
  }, [data.hasAdjustableLoad]);

  const handleDelete = useCallback(() => {
    toast({ title: '已删除', description: '曲线记录已删除（演示），将返回列表页' });
  }, []);

  const handleExport = useCallback(() => {
    toast({ title: '导出曲线', description: `${data.projectName}_调度曲线_${data.curveDate.replace(/-/g, '')}.xlsx（演示）` });
  }, [data.projectName, data.curveDate]);

  const activeStoragePeriods = editing ? periods : savedPeriods;
  const activeAdjLoadPeriods = editing ? adjLoadPeriods : savedAdjLoadPeriods;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DetailHeader
        projectName={data.projectName}
        curveDate={data.curveDate}
        status={data.status}
        lastSentAt={data.lastSentAt}
        operator={data.operator}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-panel-border p-5 space-y-5">
          <DateSidebar
            currentDate={data.curveDate}
            availableDates={availableDates}
            onDateChange={handleDateChange}
            disabled={editing}
          />

          {/* Project params */}
          <ProjectParamsCard params={data.projectParams} />

          {/* Storage config */}
          <PeriodConfigPanel periods={activeStoragePeriods} onChange={setPeriods} disabled={!editing} />

          {data.hasPv && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">光伏预测功率曲线</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                系统根据气象和历史发电数据，自动预测本站点次日的光伏发电功率（每 15 分钟一个点），仅作为参考数据，不参与控制下发。
              </p>
            </div>
          )}

          {data.hasAdjustableLoad && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">可调负荷计划曲线</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                可调负荷功率的时段计划，属于可执行内容，与储能计划一起参与下发，由控制器执行调节。
              </p>
              {editing && (
                <p className="text-xs text-primary">
                  提示：可调负荷计划的时段配置在右侧图表中体现，当前与储能计划共同保存和下发。
                </p>
              )}
            </div>
          )}

          {data.hasNonAdjustableLoad && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">不可调负荷预测曲线</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                根据用电负荷特征生成的次日负荷预测曲线，仅作为参考数据展示，不参与控制下发。
              </p>
            </div>
          )}
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

          {viewMode === 'chart' ? (
            <>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">储能计划充放电限值曲线</h3>
                <EnergyStorageChart periods={activeStoragePeriods} showActual={showActual} chartHeight={chartHeight} />
              </div>

              {data.hasPv && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">光伏预测功率曲线</h3>
                  <PvChart showActual={showActual} chartHeight={chartHeight} curveDate={data.curveDate} />
                </div>
              )}

              {data.hasAdjustableLoad && activeAdjLoadPeriods.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">可调负荷计划曲线</h3>
                  <AdjustableLoadChart periods={activeAdjLoadPeriods} showActual={showActual} chartHeight={chartHeight} />
                </div>
              )}

              {data.hasNonAdjustableLoad && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">不可调负荷预测曲线</h3>
                  <NonAdjustableLoadChart chartHeight={chartHeight} />
                </div>
              )}
            </>
          ) : (
            <CurveDataTable
              periods={activeStoragePeriods}
              showActual={showActual}
              hasPv={data.hasPv}
              hasAdjustableLoad={data.hasAdjustableLoad}
              hasNonAdjustableLoad={data.hasNonAdjustableLoad}
              adjustableLoadPeriods={activeAdjLoadPeriods}
            />
          )}

          <DispatchHistory />
        </div>
      </div>
    </div>
  );
};

export default CurveDetail;
