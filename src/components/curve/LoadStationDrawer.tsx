import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Droplet, Waves, Fuel, GitMerge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

// 2小时一个时段，共 12 个块
const SLOT_LABELS = Array.from({ length: 12 }, (_, i) => `${String(i * 2).padStart(2, '0')}-${String(i * 2 + 2).padStart(2, '0')}`);

type StationCategory = {
  key: string;
  name: string;
  Icon: typeof Droplet;
  color: string;
  adjustable: boolean; // 是否可参与可调
  devices: { id: string; name: string; power: number; note?: string; defaultOn: boolean[] }[];
};

const CATEGORIES: StationCategory[] = [
  {
    key: 'oil', name: '采油站', Icon: Fuel, color: 'text-chart-discharge', adjustable: true,
    devices: [
      { id: 'w-01', name: '1# 抽油机井', power: 22, note: '可错峰启停', defaultOn: [1,1,1,0,0,1,1,1,1,1,1,1].map(Boolean) },
      { id: 'w-02', name: '2# 抽油机井', power: 22, note: '可错峰启停', defaultOn: [1,1,1,1,0,0,1,1,1,1,1,1].map(Boolean) },
      { id: 'w-03', name: '3# 抽油机井', power: 18, note: '可错峰启停', defaultOn: [1,1,1,1,1,0,0,1,1,1,1,1].map(Boolean) },
      { id: 'w-04', name: '4# 螺杆泵井', power: 15, defaultOn: Array(12).fill(true) },
    ],
  },
  {
    key: 'inject', name: '注水站', Icon: Waves, color: 'text-primary', adjustable: true,
    devices: [
      { id: 'i-01', name: '注水泵 A', power: 55, note: '峰段可降载', defaultOn: [1,1,1,1,1,1,0,0,1,1,1,1].map(Boolean) },
      { id: 'i-02', name: '注水泵 B', power: 55, note: '峰段可降载', defaultOn: [1,1,1,1,1,1,1,0,0,1,1,1].map(Boolean) },
    ],
  },
  {
    key: 'gather', name: '集输站', Icon: GitMerge, color: 'text-status-pending', adjustable: false,
    devices: [
      { id: 'g-01', name: '外输泵', power: 30, note: '连续运行', defaultOn: Array(12).fill(true) },
      { id: 'g-02', name: '加热炉', power: 45, note: '连续运行', defaultOn: Array(12).fill(true) },
    ],
  },
  {
    key: 'transfer', name: '转油站', Icon: Droplet, color: 'text-chart-charge', adjustable: false,
    devices: [
      { id: 't-01', name: '沉降罐搅拌', power: 12, note: '连续运行', defaultOn: Array(12).fill(true) },
      { id: 't-02', name: '掺水泵', power: 20, note: '连续运行', defaultOn: Array(12).fill(true) },
    ],
  },
];

type Schedule = Record<string, boolean[]>;

function initSchedule(): Schedule {
  const s: Schedule = {};
  CATEGORIES.forEach(c => c.devices.forEach(d => { s[d.id] = [...d.defaultOn]; }));
  return s;
}

const LoadStationDrawer = ({ open, onOpenChange }: Props) => {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);
  const [schedule, setSchedule] = useState<Schedule>(initSchedule);

  const current = CATEGORIES.find(c => c.key === activeCat)!;

  const summary = useMemo(() => {
    return CATEGORIES.map(c => {
      const totalOn = c.devices.reduce((acc, d) => acc + schedule[d.id].filter(Boolean).length, 0);
      const totalSlots = c.devices.length * 12;
      return { key: c.key, name: c.name, ratio: totalSlots ? totalOn / totalSlots : 0, devices: c.devices.length };
    });
  }, [schedule]);

  const toggle = (deviceId: string, slot: number) => {
    setSchedule(prev => {
      const next = { ...prev, [deviceId]: [...prev[deviceId]] };
      next[deviceId][slot] = !next[deviceId][slot];
      return next;
    });
  };

  const applyTemplate = (mode: 'all-on' | 'peak-off' | 'yesterday') => {
    setSchedule(prev => {
      const next: Schedule = { ...prev };
      current.devices.forEach(d => {
        if (mode === 'all-on') next[d.id] = Array(12).fill(true);
        else if (mode === 'peak-off') next[d.id] = SLOT_LABELS.map((_, i) => !(i >= 8 && i <= 10)); // 16-22 关
        else next[d.id] = [...d.defaultOn];
      });
      return next;
    });
    toast({ title: '模板已应用', description: `${current.name}：${mode === 'all-on' ? '全部开启' : mode === 'peak-off' ? '尖峰时段停机' : '恢复昨日排班'}` });
  };

  const handleSave = () => {
    toast({ title: '负荷设备排班已保存', description: '可调负荷曲线将根据新排班重新计算（演示）' });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[720px] flex flex-col">
        <SheetHeader>
          <SheetTitle>编辑负荷设备排班</SheetTitle>
          <SheetDescription>
            按场站分类逐设备设置 2 小时时段启停。可调设备（采油/注水）参与可调负荷曲线；集输/转油为刚性负荷，仅供查看。
          </SheetDescription>
        </SheetHeader>

        {/* 分类切换 */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {CATEGORIES.map(c => {
            const s = summary.find(x => x.key === c.key)!;
            const Icon = c.Icon;
            return (
              <button
                key={c.key}
                onClick={() => setActiveCat(c.key)}
                className={cn(
                  'rounded-md border p-2 text-left transition-colors',
                  activeCat === c.key ? 'border-primary bg-primary/5' : 'border-panel-border hover:bg-accent',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('h-3.5 w-3.5', c.color)} />
                  <span className="text-xs font-medium">{c.name}</span>
                  {!c.adjustable && <Badge variant="outline" className="h-4 px-1 text-[9px]">刚性</Badge>}
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {s.devices} 台 · 运行率 {(s.ratio * 100).toFixed(0)}%
                </div>
              </button>
            );
          })}
        </div>

        {/* 模板按钮 */}
        {current.adjustable && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[11px] text-muted-foreground">快速排班：</span>
            <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => applyTemplate('all-on')}>全部开启</Button>
            <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => applyTemplate('peak-off')}>尖峰停机 (16-22)</Button>
            <Button size="sm" variant="outline" className="h-6 text-[11px]" onClick={() => applyTemplate('yesterday')}>复制昨日</Button>
          </div>
        )}

        {/* 设备 × 时段矩阵 */}
        <div className="mt-3 flex-1 overflow-y-auto rounded-md border border-panel-border">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr>
                <th className="text-left px-2 py-1.5 font-medium w-[180px]">设备</th>
                {SLOT_LABELS.map(l => (
                  <th key={l} className="px-0.5 py-1.5 font-normal text-muted-foreground text-[10px]">{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {current.devices.map(d => (
                <tr key={d.id} className="border-t border-panel-border">
                  <td className="px-2 py-1.5 align-top">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground">{d.power}kW{d.note ? ` · ${d.note}` : ''}</div>
                  </td>
                  {SLOT_LABELS.map((_, i) => (
                    <td key={i} className="px-0.5 py-1 text-center">
                      <button
                        disabled={!current.adjustable}
                        onClick={() => toggle(d.id, i)}
                        className={cn(
                          'mx-auto flex h-5 w-5 items-center justify-center rounded text-[9px] font-semibold',
                          schedule[d.id][i]
                            ? 'bg-chart-discharge/70 text-foreground'
                            : 'bg-muted text-muted-foreground',
                          current.adjustable ? 'hover:ring-1 hover:ring-primary cursor-pointer' : 'cursor-not-allowed opacity-70',
                        )}
                        title={schedule[d.id][i] ? '运行中，点击停机' : '停机中，点击启动'}
                      >
                        {schedule[d.id][i] ? '开' : '停'}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 全场站开关 */}
        {current.adjustable && (
          <div className="mt-2 flex items-center justify-between rounded-md border border-panel-border bg-muted/30 px-3 py-2">
            <div className="text-xs">
              <div className="font-medium">场站总闸</div>
              <div className="text-[10px] text-muted-foreground">紧急情况下整站停运</div>
            </div>
            <Switch defaultChecked />
          </div>
        )}

        <SheetFooter className="mt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>保存排班</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default LoadStationDrawer;
