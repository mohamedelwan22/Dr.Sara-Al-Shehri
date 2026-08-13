import { requireSupabase } from '@/lib/supabase';
import type { PaginatedResult } from './researchService';
import type { ListFilters } from './researchService';
import type { ScientificSupervision } from '@/types';

export const supervisionService = {
  async listSupervision(filters: ListFilters = {}): Promise<PaginatedResult<ScientificSupervision>> {
    return listDatedContent<ScientificSupervision>('scientific_supervisions', filters);
  },

  async listDiscussions(filters: ListFilters = {}): Promise<PaginatedResult<ScientificSupervision>> {
    return listDatedContent<ScientificSupervision>('scientific_discussions', filters);
  },

  async getSupervisionBySlug(slug: string) {
    return getBySlug('scientific_supervisions', slug);
  },

  async getDiscussionBySlug(slug: string) {
    return getBySlug('scientific_discussions', slug);
  },
};

async function listDatedContent<T>(
  table: string,
  filters: ListFilters,
): Promise<PaginatedResult<T>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let ids: string[] | null = null;
  if (filters.axisId) {
    const { data: links } = await requireSupabase()
      .from('content_axis_links')
      .select('content_id')
      .eq('axis_id', filters.axisId)
      .eq('content_type', table === 'scientific_supervisions' ? 'supervision' : 'discussion');
    ids = (links ?? []).map((l) => l.content_id);
  }

  let query = requireSupabase()
    .from(table)
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (ids !== null) {
    if (ids.length === 0) return { data: [], count: 0, page, pageSize, totalPages: 0 };
    query = query.in('id', ids);
  }

  const rangeStart = (page - 1) * pageSize;
  query = query.range(rangeStart, rangeStart + pageSize - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  const rows = data ?? [];

  if (filters.q) {
    const q = filters.q.trim();
    const filtered = (rows as Array<Record<string, unknown>>).filter(
      (r) =>
        String(r.title_ar ?? '').includes(q) ||
        String(r.researcher_ar ?? '').includes(q) ||
        String(r.title_en ?? '').includes(q),
    );
    return {
      data: filtered as T[],
      count: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  }

  return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
}

async function getBySlug(table: string, slug: string) {
  const { data, error } = await requireSupabase()
    .from(table)
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
