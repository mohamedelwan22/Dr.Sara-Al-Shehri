import { requireSupabase } from '@/lib/supabase';
import type { ResearchProject, ScientificSupervision } from '@/types';
import type { ListFilters, PaginatedResult } from './researchService';

export interface ProjectWithRelated extends ResearchProject {
  relatedItems: (ScientificSupervision & { item_type: 'supervision' | 'discussion' })[];
}

export const projectService = {
  async list(filters: ListFilters = {}): Promise<PaginatedResult<ResearchProject>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;

    let ids: string[] | null = null;
    if (filters.axisId) {
      const { data: links } = await requireSupabase()
        .from('content_axis_links')
        .select('content_id')
        .eq('axis_id', filters.axisId)
        .eq('content_type', 'project');
      ids = (links ?? []).map((l) => l.content_id);
    }

    let query = requireSupabase()
      .from('research_projects')
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
    const rows = (data as ResearchProject[]) ?? [];
    return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
  },

  async getBySlug(slug: string): Promise<ProjectWithRelated | null> {
    const { data, error } = await requireSupabase()
      .from('research_projects')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const project = data as ResearchProject;

    const { data: related, error: relError } = await requireSupabase()
      .from('project_related_items')
      .select('*')
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true });
    if (relError) throw relError;

    const items = (related ?? []).map((r) => ({ ...r }));
    const supervisionIds = items.filter((i) => i.item_type === 'supervision').map((i) => i.item_id);
    const discussionIds = items.filter((i) => i.item_type === 'discussion').map((i) => i.item_id);

    const fetched: Record<string, ScientificSupervision> = {};
    if (supervisionIds.length) {
      const { data: rows } = await requireSupabase()
        .from('scientific_supervisions')
        .select('*')
        .in('id', supervisionIds);
      for (const row of rows ?? []) fetched[row.id] = row as ScientificSupervision;
    }
    if (discussionIds.length) {
      const { data: rows } = await requireSupabase()
        .from('scientific_discussions')
        .select('*')
        .in('id', discussionIds);
      for (const row of rows ?? []) fetched[row.id] = row as ScientificSupervision;
    }

    const relatedItems = items
      .filter((i) => fetched[i.item_id])
      .map((i) => ({ ...(fetched[i.item_id] as ScientificSupervision), item_type: i.item_type }));

    return { ...project, relatedItems };
  },
};
