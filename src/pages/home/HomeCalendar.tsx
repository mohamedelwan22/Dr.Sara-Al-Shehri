import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarService, queryKeys } from '@/services';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** تقويم الواجهة الرئيسية — شبكة شهر حقيقية من calendarService (published فقط). */
export function HomeCalendar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const range = useMemo(
    () => ({
      from: toLocalISO(new Date(cursor.getFullYear(), cursor.getMonth(), 1)),
      to: toLocalISO(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)),
    }),
    [cursor],
  );

  const query = useQuery({
    queryKey: queryKeys.calendar(range),
    queryFn: () => calendarService.getRange(range),
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of query.data ?? []) map.set(day.date, day.events);
    return map;
  }, [query.data]);

  const grid = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const leading = start.getDay(); // الأحد = 0
    const cells: Array<Date | null> = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    return cells;
  }, [cursor]);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'narrow' });
    const base = new Date(2021, 0, 3); // أحد
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      return fmt.format(d);
    });
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <CalendarIcon className="h-4 w-4 text-gold-600" />
        <h3 className="font-display text-sm font-bold text-primary-950">{t('home.calendarTitle')}</h3>
      </div>

      <div className="mb-3 flex items-center justify-between px-1 text-xs font-bold text-slate-700">
        <button
          type="button"
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
          className="text-slate-400 transition-colors hover:text-slate-700"
          aria-label={t('common.previous')}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span>{monthLabel}</span>
        <button
          type="button"
          onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
          className="text-slate-400 transition-colors hover:text-slate-700"
          aria-label={t('common.next')}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold text-slate-400">
        {weekdays.map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium text-slate-700">
        {grid.map((date, i) => {
          if (!date) return <span key={i} className="text-slate-300" />;
          const key = toLocalISO(date);
          const hasEvents = (eventsByDay.get(key)?.length ?? 0) > 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => navigate('/calendar')}
              className="flex flex-col items-center justify-center py-0.5"
              aria-label={`${t('home.calendarTitle')} — ${date.getDate()}`}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                  isToday(date)
                    ? 'bg-[#3C1B58] text-xs font-bold text-white shadow-sm'
                    : 'hover:bg-slate-100',
                )}
              >
                {date.getDate()}
              </span>
              <span
                className={cn('mt-0.5 h-1 w-1 rounded-full', hasEvents ? 'bg-gold-500' : 'bg-transparent')}
              />
            </button>
          );
        })}
      </div>

      {query.isError && (
        <p className="mt-3 text-center text-[11px] font-bold text-red-600">{t('common.error')}</p>
      )}
    </div>
  );
}
