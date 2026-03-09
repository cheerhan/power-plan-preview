import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CurveStatus } from '@/types/curve';
import { cn } from '@/lib/utils';

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
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        disabled={disabled}
        className={cn("p-1 pointer-events-auto w-full")}
        components={{
          DayContent: ({ date }) => {
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const info = dateMap.get(dateStr);
            return (
              <div className="relative flex flex-col items-center">
                <span>{date.getDate()}</span>
                {info && (
                  <span className={cn(
                    "absolute -bottom-1 w-1.5 h-1.5 rounded-full",
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
