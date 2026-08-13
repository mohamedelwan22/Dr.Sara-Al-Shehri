import { requireSupabase } from '@/lib/supabase';
import { researchService } from './researchService';
import type { ResearchPaper } from '@/types';

export interface HomeStats {
  total_views: number;
  total_downloads: number;
  total_users: number;
  published_research: number;
}

export interface HomeCategory {
  axis_id: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number | null;
  published_count: number;
}

export interface LatestResearchItem {
  id: string;
  slug: string;
  kind: 'research' | 'publication';
  title_ar: string;
  title_en: string | null;
  published_at: string | null;
}

/**
 * بيانات الواجهة الرئيسية القادمة من دوال عامة مؤمَّنة (010_homepage_functions.sql)
 * أو من الخدمات الموجودة (published فقط) — دون أي أرقام افتراضية وهمية.
 */
export const homepageService = {
  async getStats(): Promise<HomeStats> {
    const { data, error } = await requireSupabase().rpc('homepage_stats');
    if (error) throw error;
    const raw = (data ?? {}) as Record<string, unknown>;
    return {
      total_views: typeof raw.total_views === 'number' ? raw.total_views : 0,
      total_downloads: typeof raw.total_downloads === 'number' ? raw.total_downloads : 0,
      total_users: typeof raw.total_users === 'number' ? raw.total_users : 0,
      published_research:
        typeof raw.published_research === 'number' ? raw.published_research : 0,
    };
  },

  async getCategories(): Promise<HomeCategory[]> {
    const { data, error } = await requireSupabase().rpc('homepage_categories');
    if (error) throw error;
    return ((data as HomeCategory[]) ?? []).map((c) => ({
      ...c,
      published_count: Number(c.published_count ?? 0),
    }));
  },

  /** أحدث الإنتاج العلمي: أبحاث + مؤلفات مجمّعة ومرتبة حسب تاريخ النشر (published فقط). */
  async getLatestResearch(limit = 6): Promise<LatestResearchItem[]> {
    const [research, publications] = await Promise.all([
      researchService.listResearch({ pageSize: limit }),
      researchService.listPublications({ pageSize: limit }),
    ]);

    const items: LatestResearchItem[] = [
      ...(research.data as ResearchPaper[]).map((r) => ({
        id: r.id,
        slug: r.slug,
        kind: 'research' as const,
        title_ar: r.title_ar,
        title_en: r.title_en,
        published_at: r.published_at,
      })),
      ...(publications.data as ResearchPaper[]).map((p) => ({
        id: p.id,
        slug: p.slug,
        kind: 'publication' as const,
        title_ar: p.title_ar,
        title_en: p.title_en,
        published_at: p.published_at,
      })),
    ];

    return items
      .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
      .slice(0, limit);
  },
};
