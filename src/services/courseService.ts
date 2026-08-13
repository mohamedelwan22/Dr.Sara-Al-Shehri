import { requireSupabase } from '@/lib/supabase';
import type { Course, Lecture } from '@/types';
import type { ListFilters, PaginatedResult } from './researchService';

async function listDated(
  table: 'courses' | 'lectures',
  filters: ListFilters,
): Promise<PaginatedResult<Course>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let ids: string[] | null = null;
  if (filters.axisId) {
    const { data: links } = await requireSupabase()
      .from('content_axis_links')
      .select('content_id')
      .eq('axis_id', filters.axisId)
      .eq('content_type', table);
    ids = (links ?? []).map((l) => l.content_id);
  }

  let query = requireSupabase()
    .from(table)
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('activity_date', { ascending: false, nullsFirst: false });

  if (ids !== null) {
    if (ids.length === 0) return { data: [], count: 0, page, pageSize, totalPages: 0 };
    query = query.in('id', ids);
  }

  const rangeStart = (page - 1) * pageSize;
  query = query.range(rangeStart, rangeStart + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data as Course[]) ?? [];
  return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
}

export const courseService = {
  listCourses(filters: ListFilters = {}) {
    return listDated('courses', filters);
  },
  listLectures(filters: ListFilters = {}) {
    return listDated('lectures', filters);
  },
  async getCourseBySlug(slug: string) {
    const { data, error } = await requireSupabase()
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as Course | null) ?? null;
  },
  async getLectureBySlug(slug: string) {
    const { data, error } = await requireSupabase()
      .from('lectures')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as Lecture | null) ?? null;
  },
};
