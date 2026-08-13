import { requireSupabase } from '@/lib/supabase';
import type { CalendarEvent, Course, Lecture, ScientificSupervision, ScientificDiscussion } from '@/types';

export interface CalendarRange {
  from: string;
  to: string;
}

export interface CalendarDay {
  date: string;
  events: CalendarEvent[];
}

export const calendarService = {
  /**
   * تقويم هجين (وفق 27_CALENDAR_SPEC.md):
   * فعاليات مستقلة من calendar_events + أحداث مشتقة من المحتوى المنشور المؤرَّخ.
   */
  async getRange({ from, to }: CalendarRange): Promise<CalendarDay[]> {
    const client = requireSupabase();
    const [eventsRes, coursesRes, lecturesRes, supervisionRes, discussionsRes] =
      await Promise.all([
        client
          .from('calendar_events')
          .select('*')
          .eq('status', 'published')
          .gte('starts_at', from)
          .lte('starts_at', to),
        client
          .from('courses')
          .select('*')
          .eq('status', 'published')
          .not('activity_date', 'is', null)
          .gte('activity_date', from)
          .lte('activity_date', to),
        client
          .from('lectures')
          .select('*')
          .eq('status', 'published')
          .not('activity_date', 'is', null)
          .gte('activity_date', from)
          .lte('activity_date', to),
        client
          .from('scientific_supervisions')
          .select('*')
          .eq('status', 'published')
          .not('completion_date', 'is', null),
        client
          .from('scientific_discussions')
          .select('*')
          .eq('status', 'published')
          .not('completion_date', 'is', null),
      ]);

    if (eventsRes.error) throw eventsRes.error;
    if (coursesRes.error) throw coursesRes.error;
    if (lecturesRes.error) throw lecturesRes.error;
    if (supervisionRes.error) throw supervisionRes.error;
    if (discussionsRes.error) throw discussionsRes.error;

    const derived: CalendarEvent[] = [
      ...((coursesRes.data as Course[]) ?? []).map((c) => ({
        id: c.id,
        title_ar: c.title_ar,
        title_en: c.title_en,
        event_type: 'course',
        starts_at: c.activity_date as string,
        ends_at: null,
        location_ar: c.location_ar,
        location_en: c.location_en,
        source_type: 'course',
        source_id: c.id,
        status: 'published' as const,
        created_at: null,
        updated_at: null,
      })),
      ...((lecturesRes.data as Lecture[]) ?? []).map((l) => ({
        id: l.id,
        title_ar: l.title_ar,
        title_en: l.title_en,
        event_type: 'lecture',
        starts_at: l.activity_date as string,
        ends_at: null,
        location_ar: l.location_ar,
        location_en: l.location_en,
        source_type: 'lecture',
        source_id: l.id,
        status: 'published' as const,
        created_at: null,
        updated_at: null,
      })),
      ...((supervisionRes.data as ScientificSupervision[]) ?? []).map((s) => ({
        id: s.id,
        title_ar: s.title_ar,
        title_en: s.title_en,
        event_type: 'supervision',
        starts_at: `${s.completion_date}T00:00:00`,
        ends_at: null,
        location_ar: null,
        location_en: null,
        source_type: 'supervision',
        source_id: s.id,
        status: 'published' as const,
        created_at: null,
        updated_at: null,
      })),
      ...((discussionsRes.data as ScientificDiscussion[]) ?? []).map((d) => ({
        id: d.id,
        title_ar: d.title_ar,
        title_en: d.title_en,
        event_type: 'discussion',
        starts_at: `${d.completion_date}T00:00:00`,
        ends_at: null,
        location_ar: null,
        location_en: null,
        source_type: 'discussion',
        source_id: d.id,
        status: 'published' as const,
        created_at: null,
        updated_at: null,
      })),
    ];

    const standalone = (eventsRes.data as CalendarEvent[]) ?? [];
    const all = [...standalone, ...derived].filter((e) => e.starts_at >= from && e.starts_at <= to);

    const byDay = new Map<string, CalendarEvent[]>();
    for (const event of all) {
      const day = event.starts_at.slice(0, 10);
      const list = byDay.get(day) ?? [];
      list.push(event);
      byDay.set(day, list);
    }

    return Array.from(byDay.entries())
      .map(([date, events]) => ({ date, events }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
