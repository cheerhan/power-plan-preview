import { cn } from '@/lib/utils';

// 峰谷平电价配置（简化：24小时）
export type TouLevel = 'valley' | 'flat' | 'peak' | 'sharp';

export const TOU_HOURS: TouLevel[] = [
  // 0-6 深谷
  'valley','valley','valley','valley','valley','valley',
  // 6-8 平
  'flat','flat',
  // 8-11 峰
  'peak','peak','peak',
  // 11-13 平
  'flat','flat',
  // 13-17 平/峰
  'flat','peak','peak','peak',
  // 17-21 尖峰
  'sharp','sharp','sharp','sharp',
  // 21-24 平/谷
  'flat','flat','valley',
];

export const TOU_META: Record<TouLevel, { label: string; price: number; className: string; dotClass: string }> = {
  valley: { label: '深谷', price: 0.28, className: 'bg-chart-charge/60', dotClass: 'bg-chart-charge' },
  flat:   { label: '平段', price: 0.62, className: 'bg-muted', dotClass: 'bg-muted-foreground/50' },
  peak:   { label: '高峰', price: 1.05, className: 'bg-chart-discharge/50', dotClass: 'bg-chart-discharge' },
  sharp:  { label: '尖峰', price: 1.38, className: 'bg-destructive/40', dotClass: 'bg-destructive' },
};

export const getTouLevel = (hour: number): TouLevel => TOU_HOURS[Math.max(0, Math.min(23, Math.floor(hour)))];

const TouPriceStrip = () => {
  return (
    <div className="rounded-md border border-panel-border bg-background">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-xs font-medium">分时电价</span>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {(['valley','flat','peak','sharp'] as TouLevel[]).map(l => (
            <span key={l} className="inline-flex items-center gap-1">
              <span className={cn('h-2 w-2 rounded-sm', TOU_META[l].dotClass)} />
              {TOU_META[l].label} ¥{TOU_META[l].price.toFixed(2)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex h-5 overflow-hidden">
        {TOU_HOURS.map((lv, i) => (
          <div
            key={i}
            className={cn('flex-1 border-r border-background/40 last:border-r-0', TOU_META[lv].className)}
            title={`${String(i).padStart(2,'0')}:00 - ${String(i+1).padStart(2,'0')}:00 · ${TOU_META[lv].label} ¥${TOU_META[lv].price}`}
          />
        ))}
      </div>
      <div className="flex px-0 pb-1 text-[9px] text-muted-foreground">
        {[0,4,8,12,16,20,24].map(h => (
          <div key={h} className="flex-1 text-center first:text-left last:text-right">
            {String(h).padStart(2,'0')}:00
          </div>
        ))}
      </div>
    </div>
  );
};

export default TouPriceStrip;
