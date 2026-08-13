import { requireSupabase } from '@/lib/supabase';
import type { ResearchPaper, Publication } from '@/types';

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListFilters {
  page?: number;
  pageSize?: number;
  year?: number | null;
  axisId?: string | null;
  q?: string | null;
}

const PAGE_SIZE = 12;

async function fetchList<T>(
  table: 'research_papers' | 'publications',
  filters: ListFilters,
): Promise<PaginatedResult<T>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? PAGE_SIZE;

  let ids: string[] | null = null;
  if (filters.axisId) {
    const { data: links, error: linkError } = await requireSupabase()
      .from('content_axis_links')
      .select('content_id')
      .eq('axis_id', filters.axisId)
      .eq('content_type', table === 'research_papers' ? 'research' : 'publication');
    if (linkError) throw linkError;
    ids = (links ?? []).map((l) => l.content_id);
  }

  let query = requireSupabase()
    .from(table)
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (filters.year) {
    query = query.eq('publication_year', filters.year);
  }
  if (ids !== null) {
    if (ids.length === 0) {
      return { data: [], count: 0, page, pageSize, totalPages: 0 };
    }
    query = query.in('id', ids);
  }

  const rangeStart = (page - 1) * pageSize;
  query = query.range(rangeStart, rangeStart + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  let rows = (data as T[]) ?? [];

  if (filters.q) {
    const q = filters.q.trim();
    rows = rows.filter((row) =>
      (row as ResearchPaper).title_ar.includes(q) ||
      ((row as ResearchPaper).title_en ?? '').includes(q),
    );
  }

  return {
    data: rows,
    count: count ?? rows.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)),
  };
}

export const researchService = {
  listResearch(filters: ListFilters = {}) {
    return fetchList<ResearchPaper>('research_papers', filters);
  },

  listPublications(filters: ListFilters = {}) {
    return fetchList<Publication>('publications', filters);
  },

  async getBySlug(table: 'research_papers' | 'publications', slug: string) {
    const { data, error } = await requireSupabase()
      .from(table)
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as ResearchPaper | null) ?? null;
  },

  async getYearOptions(): Promise<number[]> {
    const { data, error } = await requireSupabase()
      .from('research_papers')
      .select('publication_year')
      .eq('status', 'published')
      .not('publication_year', 'is', null)
      .order('publication_year', { ascending: false });
    if (error) throw error;
    const years = new Set<number>();
    for (const row of data ?? []) {
      if (row.publication_year) years.add(row.publication_year);
    }
    return Array.from(years);
  },
};
