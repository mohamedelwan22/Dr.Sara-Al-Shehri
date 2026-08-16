import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { PageHeader } from '@/components/layout/PageHeader';
import { calendarService, queryKeys } from '@/services';
import { ErrorState, LoadingState, Badge } from '@/components/ui';
import { pickLang, cn, formatTime } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

const EVENT_TONES: Record<string, 'primary' | 'gold' | 'green' | 'red' | 'gray' | 'ivory'> = {
  course: 'primary',
  lecture: 'gold',
  supervision: 'green',
  discussion: 'red',
  conference: 'gold',
  publication: 'green',
  other: 'gray',
};

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const range = useMemo(() => {
    const from = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    return { from: toLocalISO(from), to: toLocalISO(to) };
  }, [cursor]);

  const query = useQuery({
    queryKey: queryKeys.calendar(range),
    queryFn: () => calendarService.getRange(range),
  });

  const days = useMemo(() => query.data ?? [], [query.data]);

  const grid = useMemo(() => {
    const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const leading = start.getDay(); // الأحد = 0
    const cells: Array<Date | null> = [];
    for (let i = 0; i < leading; i++) cells.push(null);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return cells;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) map.set(day.date, day.events);
    return map;
  }, [days]);

  const monthLabel = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  }).format(cursor);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'narrow' });
    const base = new Date(2021, 0, 3); // أحد
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      return fmt.format(d);
    });
  }, [locale]);

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return (
    <>
      <Seo title={t('calendar.title')} />
      <PageHeader title={t('calendar.title')} subtitle={t('calendar.subtitle')} />
      <div className="container-page py-10">
        <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-white px-4 py-3 shadow-card">
          <button
            type="button"
            className="btn-outline min-h-10 px-3"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            aria-label={t('common.previous')}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </button>
          <h2 className="font-display text-lg font-bold text-primary-900">{monthLabel}</h2>
          <button
            type="button"
            className="btn-outline min-h-10 px-3"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            aria-label={t('common.next')}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        {query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : (
          <>
            {/* الشبكة */}
            <div className="mt-6 overflow-hidden rounded-xl border border-primary-100 bg-white shadow-card">
              <div className="grid grid-cols-7 border-b border-primary-100 bg-primary-50/60">
                {weekdays.map((day, i) => (
                  <div key={i} className="px-2 py-2 text-center text-xs font-bold text-primary-700">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {grid.map((date, i) => {
                  if (!date) return <div key={i} className="min-h-24 border-b border-primary-50 bg-ivory/50" />;
                  const key = toLocalISO(date);
                  const dayEvents = eventsByDay.get(key) ?? [];
                  return (
                    <div
                      key={i}
                      className={cn(
                        'min-h-24 border-b border-primary-50 p-1.5',
                        isToday(date) && 'bg-gold-50',
                      )}
                    >
                      <div className="mb-1 text-center">
                        <span
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                            isToday(date) ? 'bg-gold-500 text-white' : 'text-primary-900',
                          )}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Badge key={event.id} tone={EVENT_TONES[event.event_type] ?? 'gray'} className="w-full justify-center">
                            <span className="line-clamp-1">{pickLang(event.title_ar, event.title_en, locale)}</span>
                          </Badge>
                        ))}
                        {dayEvents.length > 2 && (
                          <p className="text-center text-[10px] font-bold text-slateGray">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* القائمة */}
            <div className="mt-8">
              <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-primary-900">
                <CalendarDays className="h-5 w-5 text-gold-500" />
                {t('calendar.agenda')}
              </h3>
              {days.length === 0 ? (
                <p className="rounded-xl border border-dashed border-primary-200 bg-white/60 px-6 py-10 text-center text-sm text-slateGray-dark">
                  {t('calendar.noEvents')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {days.flatMap((day) =>
                    day.events.map((event) => (
                      <li
                        key={event.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-100 bg-white px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={EVENT_TONES[event.event_type] ?? 'gray'}>
                              {t(`calendar.eventType.${event.event_type}`)}
                            </Badge>
                            <span className="text-sm font-bold text-primary-900">
                              {pickLang(event.title_ar, event.title_en, locale)}
                            </span>
                            {event.link_url && (
                              <a
                                href={event.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {t('calendar.openLink')}
                              </a>
                            )}
                          </div>
                          {(() => {
                            const description = pickLang(event.description_ar, event.description_en, locale);
                            return description ? (
                              <p className="mt-1 line-clamp-2 text-sm text-slateGray-dark">{description}</p>
                            ) : null;
                          })()}
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slateGray">
                            {event.starts_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {formatTime(event.starts_at, locale)}
                                {event.ends_at ? ` — ${formatTime(event.ends_at, locale)}` : ''}
                              </span>
                            )}
                            {event.location_ar && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {pickLang(event.location_ar, event.location_en, locale)}
                              </span>
                            )}
                            <span>
                              {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long' }).format(new Date(`${day.date}T00:00:00`))}
                            </span>
                          </div>
                        </div>
                      </li>
                    )),
                  )}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
