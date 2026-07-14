import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplet, Waves, Fuel, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

/** 24 小时时段 */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

type Flex = 'flexible' | 'follow' | 'rigid';
const FLEX_META: Record<Flex, { label: string; badge: string; barOn: string; barOff: string }> = {
  flexible: { label: '可调', badge: 'bg-chart-discharge/20 text-chart-discharge border-chart-discharge/30', barOn: 'bg-chart-discharge/70', barOff: 'bg-muted' },
  follow:   { label: '联动', badge: 'bg-primary/15 text-primary border-primary/30',                 barOn: 'bg-primary/60',        barOff: 'bg-muted' },
  rigid:    { label: '刚性', badge: 'bg-muted text-muted-foreground border-panel-border',            barOn: 'bg-muted-foreground/40', barOff: 'bg-muted/60' },
};

interface DeviceDef {
  id: string;
  name: string;
  power: number;      // kW
  flex: Flex;
  defaultOn: boolean[]; // 24
  note?: string;
}
interface StationDef {
  id: string;
  name: string;
  devices: DeviceDef[];
}
interface CategoryDef {
  key: string;
  name: string;
  Icon: typeof Droplet;
  color: string;
  desc: string;
  stations: StationDef[];
}

const alwaysOn = () => Array(24).fill(true);
const peakOff = (hs: number[]) => HOURS.map(h => !hs.includes(h));
const intermittent = (offsets: number[]) => HOURS.map(h => !offsets.includes(h % 6));

const CATEGORIES: CategoryDef[] = [
  {
    key: 'transfer', name: '转油站', Icon: Droplet, color: 'text-chart-charge',
    desc: '油气集输与外输环节，主工艺泵为刚性；加药、热洗等辅助设备可错峰。',
    stations: [
      {
        id: 'la501', name: '喇501转油站',
        devices: [
          { id: 'la501-cs',  name: '掺水泵',  power: 45, flex: 'rigid',    defaultOn: alwaysOn(), note: '维持集输温度，连续运行' },
          { id: 'la501-wx1', name: '外输泵#1', power: 55, flex: 'rigid',    defaultOn: alwaysOn(), note: '外输主泵' },
          { id: 'la501-cn',  name: '采暖泵',  power: 22, flex: 'follow',   defaultOn: peakOff([17,18,19,20]), note: '随气温联动' },
          { id: 'la501-wx2', name: '外输泵#2', power: 55, flex: 'flexible', defaultOn: peakOff([18,19,20,21]), note: '备用/调峰投运' },
          { id: 'la501-rx',  name: '热洗泵',  power: 30, flex: 'flexible', defaultOn: peakOff([8,9,10,17,18,19,20,21]), note: '可批次调度' },
        ],
      },
      {
        id: 'la451', name: '喇451转油站',
        devices: [
          { id: 'la451-wx',  name: '外输泵',  power: 55, flex: 'rigid',    defaultOn: alwaysOn() },
          { id: 'la451-rx',  name: '热洗泵',  power: 28, flex: 'flexible', defaultOn: peakOff([17,18,19,20,21]) },
          { id: 'la451-cn',  name: '采暖泵',  power: 20, flex: 'follow',   defaultOn: peakOff([18,19,20]) },
          { id: 'la451-cs',  name: '掺水泵',  power: 42, flex: 'rigid',    defaultOn: alwaysOn() },
          { id: 'la451-jy1', name: '加药泵#1', power: 8,  flex: 'flexible', defaultOn: peakOff([17,18,19,20,21]) },
          { id: 'la451-jy2', name: '加药泵#2', power: 8,  flex: 'flexible', defaultOn: peakOff([18,19,20]) },
          { id: 'la451-wx2', name: '外输泵#2', power: 55, flex: 'flexible', defaultOn: peakOff([18,19,20,21]) },
          { id: 'la451-jy3', name: '加药泵#3', power: 8,  flex: 'flexible', defaultOn: peakOff([19,20,21]) },
        ],
      },
    ],
  },
  {
    key: 'inject', name: '注水站', Icon: Waves, color: 'text-primary',
    desc: '按日注水量调度，注水泵在高电价时段降载，冷却/润滑泵随注水泵联动。',
    stations: [
      {
        id: 'la5', name: '喇五注水站',
        devices: [
          { id: 'la5-cn',  name: '采暖泵',   power: 25, flex: 'rigid',    defaultOn: alwaysOn() },
          { id: 'la5-lq',  name: '冷却水泵', power: 15, flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
          { id: 'la5-zs1', name: '注水泵#1', power: 90, flex: 'flexible', defaultOn: peakOff([17,18,19,20,21]), note: '高峰段可停' },
          { id: 'la5-zs2', name: '注水泵#2', power: 90, flex: 'flexible', defaultOn: peakOff([18,19,20]), note: '错峰启停' },
          { id: 'la5-rh',  name: '润滑油泵', power: 5,  flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
        ],
      },
      {
        id: 'la412', name: '喇4-12#注入站',
        devices: [
          { id: 'la412-cn', name: '采暖泵',   power: 18, flex: 'rigid',    defaultOn: alwaysOn() },
          { id: 'la412-lq', name: '冷却水泵', power: 11, flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
          { id: 'la412-zs', name: '注水泵',   power: 75, flex: 'flexible', defaultOn: peakOff([17,18,19,20,21]) },
          { id: 'la412-rh', name: '润滑油泵', power: 4,  flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
        ],
      },
      {
        id: 'la413', name: '喇4-13#注入站',
        devices: [
          { id: 'la413-cn', name: '采暖泵',   power: 18, flex: 'rigid',    defaultOn: alwaysOn() },
          { id: 'la413-lq', name: '冷却水泵', power: 11, flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
          { id: 'la413-zs', name: '注水泵',   power: 75, flex: 'flexible', defaultOn: peakOff([18,19,20,21]) },
          { id: 'la413-rh', name: '润滑油泵', power: 4,  flex: 'follow',   defaultOn: peakOff([18,19,20,21]) },
        ],
      },
    ],
  },
  {
    key: 'oil', name: '采油站', Icon: Fuel, color: 'text-chart-discharge',
    desc: '间抽井本身即"间歇启停"设计，可根据电价窗口自由排班，是最灵活的可调负荷。',
    stations: [
      {
        id: 'oil-1', name: '1# 采油场站',
        devices: [
          { id: 'o1-j1', name: '间抽井 J-101', power: 15, flex: 'flexible', defaultOn: intermittent([0,1]) },
          { id: 'o1-j2', name: '间抽井 J-102', power: 15, flex: 'flexible', defaultOn: intermittent([0,2]) },
          { id: 'o1-j3', name: '间抽井 J-103', power: 18, flex: 'flexible', defaultOn: intermittent([1,3]) },
          { id: 'o1-j4', name: '间抽井 J-104', power: 15, flex: 'flexible', defaultOn: intermittent([2,4]) },
        ],
      },
      {
        id: 'oil-2', name: '2# 采油场站',
        devices: [
          { id: 'o2-j1', name: '间抽井 J-201', power: 15, flex: 'flexible', defaultOn: intermittent([3,5]) },
          { id: 'o2-j2', name: '间抽井 J-202', power: 15, flex: 'flexible', defaultOn: intermittent([0,4]) },
          { id: 'o2-j3', name: '间抽井 J-203', power: 18, flex: 'flexible', defaultOn: intermittent([1,5]) },
        ],
      },
    ],
  },
];

type Schedule = Record<string, boolean[]>;
function initSchedule(): Schedule {
  const s: Schedule = {};
  CATEGORIES.forEach(c => c.stations.forEach(st => st.devices.forEach(d => { s[d.id] = [...d.defaultOn]; })));
  return s;
}

const LoadStationDrawer = ({ open, onOpenChange }: Props) => {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [schedule, setSchedule] = useState<Schedule>(initSchedule);

  const current = CATEGORIES.find(c => c.key === activeCat)!;

  const catSummary = useMemo(() => {
    return CATEGORIES.map(c => {
      let devices = 0;
      let onSlots = 0;
      let totalSlots = 0;
      let flexPower = 0;
      c.stations.forEach(st => st.devices.forEach(d => {
        devices += 1;
        onSlots += schedule[d.id].filter(Boolean).length;
        totalSlots += 24;
        if (d.flex === 'flexible') flexPower += d.power;
      }));
      return { key: c.key, devices, stations: c.stations.length, ratio: onSlots / totalSlots, flexPower };
    });
  }, [schedule]);

  const toggleSlot = (id: string, h: number, flex: Flex) => {
    if (flex === 'rigid') return;
    setSchedule(prev => {
      const next = { ...prev, [id]: [...prev[id]] };
      next[id][h] = !next[id][h];
      return next;
    });
  };

  const setDeviceRow = (id: string, value: boolean) => {
    setSchedule(prev => ({ ...prev, [id]: Array(24).fill(value) }));
  };

  const applyStationTemplate = (stationId: string, mode: 'all-on' | 'peak-off' | 'reset') => {
    const st = current.stations.find(s => s.id === stationId)!;
    setSchedule(prev => {
      const next = { ...prev };
      st.devices.forEach(d => {
        if (d.flex === 'rigid') return;
        if (mode === 'all-on') next[d.id] = Array(24).fill(true);
        else if (mode === 'peak-off') next[d.id] = HOURS.map(h => !(h >= 17 && h <= 21));
        else next[d.id] = [...d.defaultOn];
      });
      return next;
    });
    toast({ title: `${st.name}：已应用模板`, description: mode === 'all-on' ? '全部开启' : mode === 'peak-off' ? '尖峰 17-22 停机' : '恢复默认排班' });
  };

  const handleSave = () => {
    toast({ title: '负荷设备排班已保存', description: '可调负荷曲线将根据新排班重新计算（演示）' });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[900px] flex flex-col p-4">
        <SheetHeader className="space-y-1">
          <SheetTitle>编辑负荷设备排班</SheetTitle>
          <SheetDescription className="text-xs">
            按 <b>场站分类 → 场站 → 设备</b> 三级组织。每行为一台设备的 24 小时时间轴，点击色块切换启/停。
            <span className="inline-flex items-center gap-2 ml-2">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-chart-discharge/70" />可调</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-primary/60" />联动</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-muted-foreground/40" />刚性</span>
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* 分类切换 */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {CATEGORIES.map(c => {
            const s = catSummary.find(x => x.key === c.key)!;
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
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {s.stations} 场站 · {s.devices} 台 · 可调 {s.flexPower}kW · 运行率 {(s.ratio * 100).toFixed(0)}%
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 rounded-md border border-panel-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed">
          {current.desc}
        </div>

        {/* 场站列表 */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-3 pr-1">
          {current.stations.map(st => {
            const isCollapsed = collapsed[st.id];
            const stOnSlots = st.devices.reduce((a, d) => a + schedule[d.id].filter(Boolean).length, 0);
            const stTotal = st.devices.length * 24;
            const flexCount = st.devices.filter(d => d.flex === 'flexible').length;
            return (
              <div key={st.id} className="rounded-md border border-panel-border bg-background">
                {/* 场站头 */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border">
                  <button
                    onClick={() => setCollapsed(prev => ({ ...prev, [st.id]: !prev[st.id] }))}
                    className="flex items-center gap-1.5 text-sm font-medium hover:text-primary"
                  >
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {st.name}
                    <span className="text-[10px] text-muted-foreground font-normal">
                      · {st.devices.length} 台 · 可调 {flexCount} · 运行率 {(stOnSlots / stTotal * 100).toFixed(0)}%
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2" onClick={() => applyStationTemplate(st.id, 'all-on')}>全开</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2" onClick={() => applyStationTemplate(st.id, 'peak-off')}>尖峰停</Button>
                    <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2" onClick={() => applyStationTemplate(st.id, 'reset')}>重置</Button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="p-2">
                    {/* 小时刻度 */}
                    <div className="flex items-center gap-2 pl-[180px] pr-1 mb-1">
                      <div className="flex-1 grid grid-cols-24" style={{ display: 'grid', gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
                        {HOURS.map(h => (
                          <div key={h} className="text-center text-[9px] text-muted-foreground">
                            {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 设备行 */}
                    <div className="space-y-1">
                      {st.devices.map(d => {
                        const meta = FLEX_META[d.flex];
                        const row = schedule[d.id];
                        const onHours = row.filter(Boolean).length;
                        const energy = onHours * d.power;
                        return (
                          <div key={d.id} className="flex items-center gap-2">
                            {/* 设备名 */}
                            <div className="w-[180px] shrink-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium truncate" title={d.name}>{d.name}</span>
                                <Badge variant="outline" className={cn('h-4 px-1 text-[9px]', meta.badge)}>{meta.label}</Badge>
                              </div>
                              <div className="text-[9px] text-muted-foreground truncate">
                                {d.power}kW · {onHours}h · {energy}kWh{d.note ? ` · ${d.note}` : ''}
                              </div>
                            </div>

                            {/* 时间轴 */}
                            <div
                              className="flex-1 grid gap-[1px] rounded-sm overflow-hidden"
                              style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                            >
                              {row.map((on, h) => (
                                <button
                                  key={h}
                                  disabled={d.flex === 'rigid'}
                                  onClick={() => toggleSlot(d.id, h, d.flex)}
                                  className={cn(
                                    'h-5 transition-opacity',
                                    on ? meta.barOn : meta.barOff,
                                    d.flex === 'rigid' ? 'cursor-not-allowed' : 'hover:opacity-70 cursor-pointer',
                                  )}
                                  title={`${String(h).padStart(2,'0')}:00-${String(h+1).padStart(2,'0')}:00 · ${on ? '运行' : '停机'}${d.flex === 'rigid' ? '（刚性负荷不可编辑）' : ''}`}
                                />
                              ))}
                            </div>

                            {/* 快捷 */}
                            {d.flex !== 'rigid' && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  className="h-5 px-1.5 rounded border border-panel-border text-[9px] hover:bg-accent"
                                  onClick={() => setDeviceRow(d.id, true)}
                                  title="整行开启"
                                >开</button>
                                <button
                                  className="h-5 px-1.5 rounded border border-panel-border text-[9px] hover:bg-accent"
                                  onClick={() => setDeviceRow(d.id, false)}
                                  title="整行停机"
                                >停</button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SheetFooter className="mt-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>保存排班</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default LoadStationDrawer;
