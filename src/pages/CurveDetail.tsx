import { useState, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DetailHeader from '@/components/curve/DetailHeader';
import PeriodConfigPanel from '@/components/curve/PeriodConfigPanel';
import EnergyStorageChart from '@/components/curve/EnergyStorageChart';
import PvChart from '@/components/curve/PvChart';
import ActionBar from '@/components/curve/ActionBar';
import DispatchHistory from '@/components/curve/DispatchHistory';
import { TimePeriod, CurveDetail as CurveDetailType } from '@/types/curve';
import { validatePeriods, isCurveEditable } from '@/lib/curve-utils';

const MOCK_DATA: CurveDetailType = {
  projectName: '示范储能电站一期',
  curveDate: '2026-03-07',
  status: 'sent',
  lastSentAt: '2026-03-06 08:30:00',
  operator: '张工',
  hasPv: true,
  hasLoad: false,
  periods: [
    { id: '1', startTime: '00:00', endTime: '07:00', actionType: 'idle', powerLimit: 0 },
    { id: '2', startTime: '07:00', endTime: '11:00', actionType: 'charge', powerLimit: 80 },
    { id: '3', startTime: '11:00', endTime: '14:00', actionType: 'idle', powerLimit: 0 },
    { id: '4', startTime: '14:00', endTime: '18:00', actionType: 'discharge', powerLimit: 60 },
    { id: '5', startTime: '18:00', endTime: '24:00', actionType: 'idle', powerLimit: 0 },
  ],
};

const CurveDetail = () => {
  const [data] = useState(MOCK_DATA);
  const [periods, setPeriods] = useState<TimePeriod[]>(data.periods);
  const [savedPeriods, setSavedPeriods] = useState<TimePeriod[]>(data.periods);
  const [editing, setEditing] = useState(false);
  const [autoDispatch, setAutoDispatch] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const editable = useMemo(() => isCurveEditable(data.curveDate), [data.curveDate]);

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
    toast({ title: '保存成功', description: '时段配置已更新' });
  }, [periods]);

  const handleCancel = useCallback(() => {
    setPeriods(savedPeriods);
    setEditing(false);
  }, [savedPeriods]);

  const handleSend = useCallback(() => {
    toast({ title: '下发成功', description: '曲线已下发至控制器（演示）' });
  }, []);

  const handleDelete = useCallback(() => {
    toast({ title: '已删除', description: '曲线记录已删除（演示）' });
  }, []);

  const handleExport = useCallback(() => {
    toast({ title: '导出曲线', description: `${data.projectName}_调度曲线_${data.curveDate.replace(/-/g, '')}.xlsx（演示）` });
  }, [data.projectName, data.curveDate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DetailHeader
        projectName={data.projectName}
        curveDate={data.curveDate}
        status={data.status}
        lastSentAt={data.lastSentAt}
        operator={data.operator}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[420px] shrink-0 overflow-y-auto border-r border-panel-border p-5 space-y-6">
          <PeriodConfigPanel periods={periods} onChange={setPeriods} disabled={!editing} />

          {data.hasPv && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">光伏预测功率曲线</h3>
              <p className="text-xs text-muted-foreground">已配置光伏预测算法，数据由系统自动生成。</p>
            </div>
          )}

          {/* Auto dispatch switch */}
          <div className="flex items-center justify-between rounded-md border border-panel-border bg-panel-bg p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">自动下发</Label>
              <p className="text-xs text-muted-foreground">开启后系统每日自动下发次日曲线</p>
            </div>
            <Switch checked={autoDispatch} onCheckedChange={setAutoDispatch} />
          </div>

          {/* Dispatch history toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-primary hover:underline"
          >
            {showHistory ? '收起下发记录' : '查看下发记录'}
          </button>
          {showHistory && <DispatchHistory />}
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
              <EnergyStorageChart periods={editing ? periods : savedPeriods} />
            </TabsContent>

            {data.hasPv && (
              <TabsContent value="pv">
                <PvChart />
              </TabsContent>
            )}

            {data.hasLoad && (
              <TabsContent value="load">
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  负荷曲线（待接入数据）
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      <ActionBar
        editing={editing}
        editable={editable}
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
