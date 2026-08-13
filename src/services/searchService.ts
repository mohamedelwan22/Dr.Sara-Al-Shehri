import { requireSupabase } from '@/lib/supabase';
import type { SearchResultRow } from '@/types';

export interface SearchParams {
  q: string;
  page?: number;
  pageSize?: number;
}

export const searchService = {
  /**
   * بحث حقيقي على الخادم عبر RPC search_site
   * (pg_trgm + فهارس — لا يُنزّل كل الصفوف إلى المتصفح).
   */
  async search({ q, page = 1, pageSize = 20 }: SearchParams): Promise<{
    data: SearchResultRow[];
    count: number;
    page: number;
    pageSize: number;
  }> {
    const query = q.trim();
    if (!query) return { data: [], count: 0, page, pageSize };

    const { data, error } = await requireSupabase().rpc('search_site', {
      p_query: query,
    });
    if (error) throw error;

    const rows = (data as SearchResultRow[]) ?? [];
    const start = (page - 1) * pageSize;
    return {
      data: rows.slice(start, start + pageSize),
      count: rows.length,
      page,
      pageSize,
    };
  },
};
