import { ArrowLeft, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNavigate } from 'react-router-dom';
import { CurveStatus, STATUS_LABELS } from '@/types/curve';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface CurveDateInfo {
  date: string; // YYYY-MM-DD
  id: string;
  status: CurveStatus;
}

interface Props {
  projectName: string;
  curveDate: string;
  status: CurveStatus;
  lastSentAt: string | null;
  operator: string | null;
  editing?: boolean;
  /** All available curve dates for this project, for navigation */
  availableDates?: CurveDateInfo[];
  onDateChange?: (id: string) => void;
}

const STATUS_MAP: Record<CurveStatus, { className: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  sent: { variant: 'default', className: 'bg-status-success' },
  pending: { variant: 'secondary', className: 'bg-status-pending text-primary-foreground' },
  failed: { variant: 'destructive', className: '' },
};

const STATUS_DOT_COLOR: Record<CurveStatus, string> = {
  sent: 'bg-status-success',
  pending: 'bg-status-pending',
  failed: 'bg-destructive',
};

const DetailHeader = ({ projectName, curveDate, status, lastSentAt, operator, editing, availableDates = [], onDateChange }: Props) => {
  const navigate = useNavigate();
  const s = STATUS_MAP[status];
  const [calendarOpen, setCalendarOpen] = useState(false);

  const sortedDates = useMemo(() =>
    [...availableDates].sort((a, b) => a.date.localeCompare(b.date)),
    [availableDates]
  );

  const currentIndex = sortedDates.findIndex(d => d.date === curveDate);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < sortedDates.length - 1;

  const dateMap = useMemo(() => {
    const map = new Map<string, CurveDateInfo>();
    availableDates.forEach(d => map.set(d.date, d));
    return map;
  }, [availableDates]);

  const goToDate = (info: CurveDateInfo) => {
    if (onDateChange) {
      onDateChange(info.id);
    } else {
      navigate(`/curve-detail?id=${info.id}`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) goToDate(sortedDates[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) goToDate(sortedDates[currentIndex + 1]);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const info = dateMap.get(dateStr);
    if (info) {
      goToDate(info);
      setCalendarOpen(false);
    }
  };

  const selectedCalendarDate = useMemo(() => {
    const [y, m, d] = curveDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [curveDate]);

  // Custom day rendering to show status dots
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

  return (
    <div className="flex items-center justify-between border-b border-panel-border px-6 py-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">{projectName}</h1>

        {/* Date navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!hasPrev || editing}
            onClick={handlePrev}
            title="上一天"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-sm font-medium"
                disabled={editing}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {curveDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 pb-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                  <span className="flex items-center gap-1">
                    <span className={cn("inline-block w-2 h-2 rounded-full", STATUS_DOT_COLOR.sent)} />
                    成功
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={cn("inline-block w-2 h-2 rounded-full", STATUS_DOT_COLOR.pending)} />
                    待下发
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={cn("inline-block w-2 h-2 rounded-full", STATUS_DOT_COLOR.failed)} />
                    失败
                  </span>
                </div>
              </div>
              <Calendar
                mode="single"
                selected={selectedCalendarDate}
                onSelect={handleCalendarSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className={cn("p-3 pt-0 pointer-events-auto")}
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
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!hasNext || editing}
            onClick={handleNext}
            title="下一天"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Badge className={s.className} variant={s.variant}>{STATUS_LABELS[status]}</Badge>
        {editing && <Badge variant="secondary" className="bg-status-warning text-primary-foreground">编辑中</Badge>}
        {lastSentAt && <span className="text-xs text-muted-foreground">最近下发：{lastSentAt}</span>}
        {operator && <span className="text-xs text-muted-foreground">操作人：{operator}</span>}
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回列表
      </Button>
    </div>
  );
};

export default DetailHeader;
