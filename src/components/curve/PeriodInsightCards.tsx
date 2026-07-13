import { TimePeriod } from '@/types/curve';
import { getTouLevel, TOU_META } from './TouPriceStrip';
import { ArrowDownCircle, ArrowUpCircle, MinusCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  periods: TimePeriod[];
}

const ACTION_META = {
  charge:    { label: '充电',   Icon: ArrowDownCircle, colorClass: 'text-chart-charge',    bgClass: 'bg-chart-charge/10' },
  discharge: { label: '放电',   Icon: ArrowUpCircle,   colorClass: 'text-chart-discharge', bgClass: 'bg-chart-discharge/10' },
  idle:      { label: '禁止动作', Icon: MinusCircle,   colorClass: 'text-muted-foreground',bgClass: 'bg-muted' },
} as const;

function hourOf(t: string) { return parseInt(t.split(':')[0], 10); }

function buildInsight(p: TimePeriod): string {
  const startH = hourOf(p.startTime);
  const endH = hourOf(p.endTime === '24:00' ? '23:59' : p.endTime);
  const midH = Math.floor((startH + endH) / 2);
  const lv = getTouLevel(midH);
  const priceLabel = TOU_META[lv].label;
  const price = TOU_META[lv].price;

  if (p.actionType === 'charge') {
    if (lv === 'valley') return `${priceLabel}电价 ¥${price}/kWh，此时充电成本最低，为后续高峰放电蓄能。`;
    if (lv === 'flat')   return `${priceLabel}电价 ¥${price}/kWh，光伏未达峰或已回落，用平段电补充电量。`;
    return `${priceLabel}电价 ¥${price}/kWh 充电，如非必要建议改到谷段，注意套利收益是否为负。`;
  }
  if (p.actionType === 'discharge') {
    if (lv === 'sharp') return `${priceLabel}电价 ¥${price}/kWh，放电峰谷价差最大，套利收益最高时段。`;
    if (lv === 'peak')  return `${priceLabel}电价 ¥${price}/kWh，放电削峰，降低最大需量电费。`;
    return `${priceLabel}电价 ¥${price}/kWh 放电，价差偏低，请确认必要性（如避峰或应急）。`;
  }
  return `${priceLabel}时段，储能保持待机，等待下一充放电窗口或用于维持 SOC。`;
}

const PeriodInsightCards = ({ periods }: Props) => {
  if (!periods?.length) return null;
  return (
    <div className="rounded-md border border-panel-border bg-muted/30 p-2">
      <div className="flex items-center gap-1.5 px-1 pb-1.5 text-xs font-medium">
        <Lightbulb className="h-3.5 w-3.5 text-status-pending" />
        时段解读
        <span className="text-[10px] font-normal text-muted-foreground">
          共 {periods.length} 个时段，结合分时电价说明每段决策依据
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {periods.map((p) => {
          const meta = ACTION_META[p.actionType];
          const Icon = meta.Icon;
          const startH = hourOf(p.startTime);
          const lv = getTouLevel(startH);
          return (
            <div key={p.id} className="rounded border border-panel-border bg-background p-2">
              <div className="flex items-start gap-2">
                <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', meta.bgClass)}>
                  <Icon className={cn('h-3.5 w-3.5', meta.colorClass)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span>{p.startTime} – {p.endTime}</span>
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-normal', TOU_META[lv].className)}>
                      {TOU_META[lv].label}
                    </span>
                    <span className={cn('text-[10px] font-semibold', meta.colorClass)}>
                      {meta.label}
                      {p.actionType !== 'idle' && ` ${p.powerLimit}kW`}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {buildInsight(p)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PeriodInsightCards;
