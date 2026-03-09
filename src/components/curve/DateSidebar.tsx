import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { CurveStatus } from '@/types/curve';
import { cn } from '@/lib/utils';
import { zhCN } from 'date-fns/locale';

interface CurveDateInfo {
  date: string; // YYYY-MM-DD
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

  return (
    <div className="rounded-md border border-panel-border bg-panel-bg p-3 space-y-2">
      <h3 className="text-sm font-semibold text-foreground">曲线日历</h3>

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
          day: "h-8 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md inline-flex items-center justify-center",
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
            return (
              <div className="relative flex flex-col items-center leading-none">
                <span className="text-xs">{date.getDate()}</span>
                {info && (
                  <span className={cn(
                    "absolute -bottom-0.5 w-1 h-1 rounded-full",
                    STATUS_DOT_COLOR[info.status]
                  )} />
                )}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
