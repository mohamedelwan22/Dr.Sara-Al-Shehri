import { requireSupabase } from '@/lib/supabase';
import type { News, ScientificInsight, Announcement } from '@/types';
import type { ListFilters, PaginatedResult } from './researchService';

async function listArticles(
  table: 'news' | 'scientific_insights',
  filters: ListFilters,
): Promise<PaginatedResult<News>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  let query = requireSupabase()
    .from(table)
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  const rangeStart = (page - 1) * pageSize;
  query = query.range(rangeStart, rangeStart + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = (data as News[]) ?? [];
  return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
}

export const newsService = {
  listNews(filters: ListFilters = {}) {
    return listArticles('news', filters);
  },
  listInsights(filters: ListFilters = {}) {
    return listArticles('scientific_insights', filters);
  },
  async getNewsBySlug(slug: string) {
    const { data, error } = await requireSupabase()
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as News | null) ?? null;
  },
  async getInsightBySlug(slug: string) {
    const { data, error } = await requireSupabase()
      .from('scientific_insights')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as ScientificInsight | null) ?? null;
  },
  async listAnnouncements(): Promise<Announcement[]> {
    const now = new Date().toISOString();
    const { data, error } = await requireSupabase()
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or(`active_from.is.null,active_from.lte.${now}`)
      .or(`active_until.is.null,active_until.gte.${now}`)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as Announcement[]) ?? [];
  },
};
