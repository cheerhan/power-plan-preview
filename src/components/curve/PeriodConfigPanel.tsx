import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TimePeriod, ActionType, ACTION_LABELS, TIME_OPTIONS } from '@/types/curve';
import { cn } from '@/lib/utils';

interface Props {
  periods: TimePeriod[];
  onChange: (periods: TimePeriod[]) => void;
  disabled?: boolean; // true = readonly mode
}

const PeriodConfigPanel = ({ periods, onChange, disabled }: Props) => {
  const updatePeriod = (id: string, field: keyof TimePeriod, value: string | number) => {
    const updated = periods.map(p => {
      if (p.id !== id) return p;
      const next = { ...p, [field]: value };
      if (field === 'actionType' && value === 'idle') next.powerLimit = 0;
      return next;
    });
    onChange(updated);
  };

  const addPeriod = () => {
    onChange([...periods, {
      id: crypto.randomUUID(),
      startTime: '00:00',
      endTime: '00:15',
      actionType: 'idle',
      powerLimit: 0,
    }]);
  };

  const removePeriod = (id: string) => {
    onChange(periods.filter(p => p.id !== id));
  };

  // Readonly: collapsible summary
  if (disabled) {
    return (
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-panel-border bg-panel-bg px-3 py-2 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">储能充放电计划</h3>
            <span className="text-xs text-muted-foreground">{periods.length} 个时段</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 pt-2">
            {periods.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-md border border-panel-border bg-panel-bg px-3 py-2 text-xs">
                <span className="font-medium w-[130px]">{p.startTime} – {p.endTime}</span>
                <span className={`px-2 py-0.5 rounded-sm ${
                  p.actionType === 'charge' ? 'bg-chart-charge text-foreground' :
                  p.actionType === 'discharge' ? 'bg-chart-discharge text-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {ACTION_LABELS[p.actionType]}
                </span>
                {p.actionType !== 'idle' && (
                  <span className="text-muted-foreground">{p.powerLimit} kW</span>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Edit mode: full controls
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">储能充放电计划</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">展示储能系统每天各时段的充电、放电或禁止动作计划（由运营人员配置），下发到现场控制器后即作为次日实际运行的依据。</p>
        </div>
        <Button variant="outline" size="sm" onClick={addPeriod}>
          <Plus className="mr-1 h-3 w-3" />
          新增时段
        </Button>
      </div>

      <div className="space-y-2">
        {periods.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-md border border-panel-border bg-panel-bg p-2">
            <Select value={p.startTime} onValueChange={v => updatePeriod(p.id, 'startTime', v)}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">至</span>
            <Select value={p.endTime} onValueChange={v => updatePeriod(p.id, 'endTime', v)}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={p.actionType} onValueChange={v => updatePeriod(p.id, 'actionType', v as ActionType)}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACTION_LABELS) as ActionType[]).map(a => (
                  <SelectItem key={a} value={a}>{ACTION_LABELS[a]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={0}
              className="w-[80px] h-8 text-xs"
              value={p.powerLimit}
              onChange={e => updatePeriod(p.id, 'powerLimit', Number(e.target.value))}
              disabled={p.actionType === 'idle'}
              placeholder="kW"
            />
            <span className="text-xs text-muted-foreground">kW</span>
            {periods.length > 1 && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removePeriod(p.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PeriodConfigPanel;
