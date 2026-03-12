import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { CurveStatus } from '@/types/curve';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';
import { Sun, Cloud, CloudRain, CloudSnow, CloudDrizzle, CloudSun } from 'lucide-react';

type WeatherType = 'sunny' | 'cloudy' | 'partly_cloudy' | 'rainy' | 'drizzle' | 'snow';

interface WeatherInfo {
  type: WeatherType;
  tempHigh: number;
  tempLow: number;
}

const WEATHER_CONFIG: Record<WeatherType, { icon: React.ElementType; label: string; color: string }> = {
  sunny: { icon: Sun, label: '晴', color: 'text-status-warning' },
  partly_cloudy: { icon: CloudSun, label: '多云', color: 'text-status-pending' },
  cloudy: { icon: Cloud, label: '阴', color: 'text-muted-foreground' },
  drizzle: { icon: CloudDrizzle, label: '小雨', color: 'text-status-pending' },
  rainy: { icon: CloudRain, label: '中雨', color: 'text-status-pending' },
  snow: { icon: CloudSnow, label: '雪', color: 'text-muted-foreground' },
};

// Mock weather data keyed by date
const MOCK_WEATHER: Record<string, WeatherInfo> = {
  '2026-03-05': { type: 'sunny', tempHigh: 18, tempLow: 6 },
  '2026-03-06': { type: 'partly_cloudy', tempHigh: 16, tempLow: 5 },
  '2026-03-07': { type: 'rainy', tempHigh: 12, tempLow: 4 },
  '2026-03-08': { type: 'cloudy', tempHigh: 14, tempLow: 5 },
  '2026-03-09': { type: 'sunny', tempHigh: 20, tempLow: 8 },
  '2026-03-10': { type: 'partly_cloudy', tempHigh: 17, tempLow: 7 },
  '2026-03-11': { type: 'drizzle', tempHigh: 13, tempLow: 6 },
  '2026-03-12': { type: 'sunny', tempHigh: 21, tempLow: 9 },
  '2026-03-13': { type: 'cloudy', tempHigh: 15, tempLow: 7 },
};

interface CurveDateInfo {
  date: string;
  id: string;
  status: CurveStatus;
}

interface Props {
  currentDate: string;
  availableDates: CurveDateInfo[];
  onDateChange: (id: string) => void;
  disabled?: boolean;
}

const STATUS_DOT_COLOR: Record<CurveStatus, string> = {
  sent: 'bg-status-success',
  pending: 'bg-status-pending',
  failed: 'bg-destructive',
};

const STATUS_DOT_LABEL: Record<CurveStatus, string> = {
  sent: '成功',
  pending: '待下发',
  failed: '失败',
};

export default function DateSidebar({ currentDate, availableDates, onDateChange, disabled }: Props) {
  const dateMap = useMemo(() => {
    const map = new Map<string, CurveDateInfo>();
    availableDates.forEach(d => map.set(d.date, d));
    return map;
  }, [availableDates]);

  const selectedCalendarDate = useMemo(() => {
    const [y, m, d] = currentDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [currentDate]);

  const modifiers = useMemo(() => {
    const sent: Date[] = [];
    const pending: Date[] = [];
    const failed: Date[] = [];
    availableDates.forEach(d => {
      const [y, m, day] = d.date.split('-').map(Number);
      const date = new Date(y, m - 1, day);
      if (d.status === 'sent') sent.push(date);
      else if (d.status === 'pending') pending.push(date);
      else if (d.status === 'failed') failed.push(date);
    });
    return { sent, pending, failed };
  }, [availableDates]);

  const modifiersStyles = {
    sent: { fontWeight: 700 },
    pending: { fontWeight: 700 },
    failed: { fontWeight: 700 },
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date || disabled) return;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const info = dateMap.get(dateStr);
    if (info && info.date !== currentDate) {
      onDateChange(info.id);
    }
  };

  // Current date weather
  const currentWeather = MOCK_WEATHER[currentDate];

  return (
    <div className="rounded-lg border border-panel-border bg-card p-4 space-y-3">
      {/* Header with weather */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">曲线日历</h3>
        {currentWeather && (() => {
          const cfg = WEATHER_CONFIG[currentWeather.type];
          const Icon = cfg.icon;
          return (
            <div className="flex items-center gap-1.5 text-xs">
              <Icon className={cn("h-4 w-4", cfg.color)} />
              <span className="text-muted-foreground">{cfg.label}</span>
              <span className="text-foreground font-medium">{currentWeather.tempLow}°~{currentWeather.tempHigh}°</span>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {(['sent', 'pending', 'failed'] as CurveStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1">
            <span className={cn("inline-block w-2 h-2 rounded-full", STATUS_DOT_COLOR[s])} />
            {STATUS_DOT_LABEL[s]}
          </span>
        ))}
      </div>

      <Calendar
        mode="single"
        selected={selectedCalendarDate}
        onSelect={handleSelect}
        locale={zhCN}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        disabled={disabled}
        className={cn("p-0 pointer-events-auto")}
        classNames={{
          months: "flex flex-col w-full",
          month: "space-y-2 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
          row: "flex w-full mt-1",
          cell: "flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
        }}
        components={{
          DayContent: ({ date }) => {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const info = dateMap.get(dateStr);
            const weather = MOCK_WEATHER[dateStr];
            const weatherCfg = weather ? WEATHER_CONFIG[weather.type] : null;
            const WeatherIcon = weatherCfg?.icon;
            return (
              <div className="relative flex flex-col items-center leading-none gap-0.5">
                <span className="text-xs">{date.getDate()}</span>
                <div className="flex items-center h-2.5">
                  {WeatherIcon && (
                    <WeatherIcon className={cn("h-2.5 w-2.5", weatherCfg!.color)} />
                  )}
                  {!WeatherIcon && info && (
                    <span className={cn(
                      "w-1 h-1 rounded-full",
                      STATUS_DOT_COLOR[info.status]
                    )} />
                  )}
                </div>
              </div>
            );
          },
        }}
      />

      {/* Weekly forecast strip for upcoming days */}
      <div className="border-t border-panel-border pt-3">
        <p className="text-xs text-muted-foreground mb-2">近期天气</p>
        <div className="grid grid-cols-5 gap-1">
          {Object.entries(MOCK_WEATHER)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-5)
            .map(([date, w]) => {
              const cfg = WEATHER_CONFIG[w.type];
              const Icon = cfg.icon;
              const day = date.split('-')[2];
              const isSelected = date === currentDate;
              return (
                <div
                  key={date}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-md py-1.5 text-xs",
                    isSelected ? "bg-accent" : "hover:bg-accent/50"
                  )}
                >
                  <span className="text-muted-foreground">{parseInt(day)}日</span>
                  <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                  <span className="text-[10px] text-muted-foreground">{w.tempLow}°~{w.tempHigh}°</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
