import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TimePeriod, ActionType, ACTION_LABELS, TIME_OPTIONS } from '@/types/curve';

interface Props {
  periods: TimePeriod[];
  onChange: (periods: TimePeriod[]) => void;
  disabled?: boolean;
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">储能计划充放电限值曲线</h3>
        {!disabled && (
          <Button variant="outline" size="sm" onClick={addPeriod}>
            <Plus className="mr-1 h-3 w-3" />
            新增时段
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {periods.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-md border border-panel-border bg-panel-bg p-2">
            <Select value={p.startTime} onValueChange={v => updatePeriod(p.id, 'startTime', v)} disabled={disabled}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">至</span>
            <Select value={p.endTime} onValueChange={v => updatePeriod(p.id, 'endTime', v)} disabled={disabled}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={p.actionType} onValueChange={v => updatePeriod(p.id, 'actionType', v as ActionType)} disabled={disabled}>
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
              disabled={disabled || p.actionType === 'idle'}
              placeholder="kW"
            />
            <span className="text-xs text-muted-foreground">kW</span>
            {!disabled && periods.length > 1 && (
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
