import { requireSupabase } from '@/lib/supabase';
import { assertAdmin } from '@/lib/adminGuard';
import type { ResearchProject, ScientificSupervision, ProjectMetrics } from '@/types';
import type { ListFilters, PaginatedResult } from './researchService';

export interface ProjectWithRelated extends ResearchProject {
  metrics: ProjectMetrics;
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
    const projects = (data as ResearchProject[]) ?? [];

    if (projects.length === 0) {
      return { data: [], count: count ?? 0, page, pageSize, totalPages: 1 };
    }

    const projectIds = projects.map((p) => p.id);
    const metricsMap = await fetchMetricsForProjects(projectIds, projects);

    const rowsWithMetrics = projects.map((p) => ({
      ...p,
      metrics: metricsMap[p.id] ?? calculateMetrics(p, []),
    }));

    return {
      data: rowsWithMetrics,
      count: count ?? rowsWithMetrics.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((count ?? rowsWithMetrics.length) / pageSize)),
    };
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
      .map((i) => ({ ...(fetched[i.item_id] as ScientificSupervision), item_type: i.item_type as 'supervision' | 'discussion' }));

    const metricsMap = await fetchMetricsForProjects([project.id], [project]);
    const metrics = metricsMap[project.id] ?? calculateMetrics(project, relatedItems);

    return { ...project, metrics, relatedItems };
  },

  /** قائمة جميع المشاريع للاختيار في لوحة التحكم. */
  async listAllForAdmin(): Promise<Pick<ResearchProject, 'id' | 'title_ar' | 'title_en' | 'slug'>[]> {
    const { data, error } = await requireSupabase()
      .from('research_projects')
      .select('id, title_ar, title_en, slug')
      .order('title_ar', { ascending: true });
    if (error) throw error;
    return (data as Pick<ResearchProject, 'id' | 'title_ar' | 'title_en' | 'slug'>[]) ?? [];
  },

  /** الحصول على رقم المشروع المرتبط برسالة معينة. */
  async getLinkedProjectIdForThesis(itemType: 'supervision' | 'discussion', itemId: string): Promise<string | null> {
    const { data, error } = await requireSupabase()
      .from('project_related_items')
      .select('project_id')
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();
    if (error) throw error;
    return data?.project_id ?? null;
  },

  /** ربط أو فك ربط رسالة علمية بمشروع. */
  async linkThesisToProject(
    projectId: string | null,
    itemType: 'supervision' | 'discussion',
    itemId: string
  ): Promise<void> {
    await assertAdmin();
    const client = requireSupabase();
    
    // حذف أي ربط سابق للرسالة
    const { error: delError } = await client
      .from('project_related_items')
      .delete()
      .eq('item_type', itemType)
      .eq('item_id', itemId);
    if (delError) throw delError;

    if (projectId) {
      const { error: insError } = await client
        .from('project_related_items')
        .insert({
          project_id: projectId,
          item_type: itemType,
          item_id: itemId,
          sort_order: 0,
        });
      if (insError) throw insError;
    }
  },
};

/** حساب المتركس لعدد من المشاريع في كويري واحدة. */
async function fetchMetricsForProjects(
  projectIds: string[],
  projects: ResearchProject[]
): Promise<Record<string, ProjectMetrics>> {
  const { data: related } = await requireSupabase()
    .from('project_related_items')
    .select('project_id, item_type, item_id')
    .in('project_id', projectIds);

  const items = related ?? [];
  const supIds = items.filter((i) => i.item_type === 'supervision').map((i) => i.item_id);
  const discIds = items.filter((i) => i.item_type === 'discussion').map((i) => i.item_id);

  const statuses: Record<string, string> = {};
  if (supIds.length) {
    const { data: rows } = await requireSupabase()
      .from('scientific_supervisions')
      .select('id, status')
      .in('id', supIds);
    for (const r of rows ?? []) statuses[r.id] = r.status;
  }
  if (discIds.length) {
    const { data: rows } = await requireSupabase()
      .from('scientific_discussions')
      .select('id, status')
      .in('id', discIds);
    for (const r of rows ?? []) statuses[r.id] = r.status;
  }

  const result: Record<string, ProjectMetrics> = {};
  const projMap = new Map(projects.map((p) => [p.id, p]));

  for (const pid of projectIds) {
    const pItems = items.filter((i) => i.project_id === pid);
    const pSuper = pItems.map((i) => ({ status: statuses[i.item_id] }));
    const proj = projMap.get(pid);
    result[pid] = calculateMetrics(proj, pSuper);
  }

  return result;
}

function calculateMetrics(
  project: ResearchProject | undefined,
  theses: { status?: string }[]
): ProjectMetrics {
  const totalTheses = theses.length;
  const awardedTheses = theses.filter((t) => t.status === 'published').length;
  const inProgressTheses = totalTheses - awardedTheses;

  let progressPercent = 0;
  if (totalTheses > 0) {
    progressPercent = Math.min(100, Math.round((awardedTheses / totalTheses) * 100));
  } else if (project?.project_status === 'مكتمل' || project?.project_status === 'completed') {
    progressPercent = 100;
  } else if (project?.project_status === 'مستمر' || project?.project_status === 'ongoing') {
    progressPercent = 35;
  } else if (project?.project_status) {
    progressPercent = 55;
  }

  return {
    totalTheses,
    awardedTheses,
    inProgressTheses,
    progressPercent,
  };
}
