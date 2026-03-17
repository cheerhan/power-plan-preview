import { useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BarChart3, TableIcon, Zap, Sun, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { toast } from '@/hooks/use-toast';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import LoadCombinedChart from '@/components/curve/LoadCombinedChart';
import CurveDataTable from '@/components/curve/CurveDataTable';
import ProjectParamsCard from '@/components/curve/ProjectParamsCard';
import DispatchHistory from '@/components/curve/DispatchHistory';
import DateSidebar from '@/components/curve/DateSidebar';
import { TimePeriod, CurveDetail as CurveDetailType, ProjectType } from '@/types/curve';
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
    pvPredictionStatus: (projectType === 'B' || projectType === 'C') ? 'none' : undefined,
    nonAdjLoadPredictionStatus: projectType === 'C' ? 'none' : undefined,
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
    toast({ title: '保存成功', description: '时段配置已更新，保存 ≠ 下发，请点击「下发」将可执行曲线发送至控制器。' });
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
  const hasLoad = data.hasAdjustableLoad || data.hasNonAdjustableLoad;

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
        <div className="w-[300px] shrink-0 overflow-y-auto border-r border-panel-border p-3 space-y-3">
          <DateSidebar
            currentDate={data.curveDate}
            availableDates={availableDates}
            onDateChange={handleDateChange}
            disabled={editing}
          />
          <ProjectParamsCard params={data.projectParams} />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto px-4 py-3 space-y-3">

            {/* View mode toggle */}
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 gap-1.5 text-xs", viewMode === 'chart' && "bg-accent text-accent-foreground")}
                onClick={() => setViewMode('chart')}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                图表
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 gap-1.5 text-xs", viewMode === 'table' && "bg-accent text-accent-foreground")}
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="h-3.5 w-3.5" />
                数据表
              </Button>
            </div>

            {viewMode === 'chart' ? (
              <div className="space-y-3">
                {/* ── 储能计划充放电限值曲线 ── */}
                <Card className="border-panel-border shadow-sm">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-chart-discharge">
                        <Zap className="h-3.5 w-3.5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">储能计划充放电限值曲线</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">可执行 · 参与下发</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      储能系统每日各时段的充电、放电或禁止动作计划，下发到现场控制器后作为次日实际运行依据。
                    </p>
                    <PeriodConfigPanel periods={activeStoragePeriods} onChange={setPeriods} disabled={!editing} />
                    <EnergyStorageChart periods={activeStoragePeriods} showActual={showActual} chartHeight={260} />
                  </CardContent>
                </Card>

                {/* ── 光伏预测功率曲线 ── */}
                {data.hasPv && (
                  <Card className="border-panel-border shadow-sm">
                    <CardHeader className="pb-2 px-4 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-chart-pv/20">
                          <Sun className="h-3.5 w-3.5 text-chart-pv" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">光伏预测功率曲线</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">参考数据 · 不参与下发</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        基于气象与历史数据生成的光伏发电功率预测曲线，为调度决策和电网申报提供参考。
                      </p>
                      <PvChart showActual={showActual} chartHeight={240} curveDate={data.curveDate} />
                    </CardContent>
                  </Card>
                )}

                {/* ── 负荷曲线（汇总 / 可调 / 不可调 Tab） ── */}
                {hasLoad && (
                  <Card className="border-panel-border shadow-sm">
                    <CardHeader className="pb-2 px-4 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-status-pending/20">
                          <Plug className="h-3.5 w-3.5 text-status-pending" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">负荷曲线</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {data.hasAdjustableLoad && data.hasNonAdjustableLoad
                              ? '可调计划（可执行） + 不可调预测（参考）'
                              : data.hasAdjustableLoad
                                ? '可调负荷计划 · 可执行'
                                : '不可调负荷预测 · 参考数据'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      <LoadCombinedChart
                        hasAdjustableLoad={data.hasAdjustableLoad}
                        hasNonAdjustableLoad={data.hasNonAdjustableLoad}
                        adjustableLoadPeriods={activeAdjLoadPeriods}
                        showActual={showActual}
                        chartHeight={240}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
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

            {/* Dispatch history */}
            <DispatchHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurveDetail;
