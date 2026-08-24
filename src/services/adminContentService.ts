import { requireSupabase } from '@/lib/supabase';
import { assertAdmin } from '@/lib/adminGuard';
import { shouldStampPublishedAt } from '@/lib/content';
import { removeStoredFile } from '@/lib/storageFiles';
import type {
  Announcement,
  AuditLog,
  ContactSubmission,
  DashboardSeries,
  DashboardStats,
  Profile,
  ResearchInterest,
  SiteSetting,
  UserRole,
  AxisContentType,
} from '@/types';

export type DashboardPeriod = '7d' | '30d' | '90d';

export interface AdminListParams {
  page?: number;
  pageSize?: number;
  status?: string | null;
  q?: string | null;
}

export interface AdminListResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

/** خرائط: كيان الواجهة ← جدول قاعدة البيانات ونوع المحور. */
export const ADMIN_ENTITY_MAP: Record<string, { table: string; axisType?: AxisContentType }> = {
  research: { table: 'research_papers', axisType: 'research' },
  publications: { table: 'publications', axisType: 'publication' },
  supervision: { table: 'scientific_supervisions', axisType: 'supervision' },
  discussions: { table: 'scientific_discussions', axisType: 'discussion' },
  projects: { table: 'research_projects', axisType: 'project' },
  courses: { table: 'courses', axisType: 'course' },
  lectures: { table: 'lectures', axisType: 'lecture' },
  axes: { table: 'scientific_axes' },
  insights: { table: 'scientific_insights' },
  news: { table: 'news' },
  interests: { table: 'research_interests' },
  calendar: { table: 'calendar_events' },
  announcements: { table: 'announcements' },
};

const SEARCHABLE_TITLE: Record<string, string> = {
  research_papers: 'title_ar',
  publications: 'title_ar',
  scientific_supervisions: 'title_ar',
  scientific_discussions: 'title_ar',
  research_projects: 'title_ar',
  courses: 'title_ar',
  lectures: 'title_ar',
  scientific_axes: 'name_ar',
  scientific_insights: 'title_ar',
  news: 'title_ar',
  research_interests: 'title_ar',
  calendar_events: 'title_ar',
  announcements: 'title_ar',
};

/** أعمدة ملفات التخزين لكل جدول — تُستخدم لتنظيف الملفات اليتيمة عند حذف الصف. */
const CONTENT_FILE_COLUMNS: Record<string, string[]> = {
  research_papers: ['document_path'],
  publications: ['document_path'],
  courses: ['image_path', 'materials_path'],
  lectures: ['image_path', 'materials_path'],
  news: ['image_path'],
  scientific_insights: ['image_path'],
  research_projects: ['image_path'],
};

export const adminContentService = {
  async list<T>(entity: string, params: AdminListParams = {}): Promise<AdminListResult<T>> {
    const { table } = ADMIN_ENTITY_MAP[entity];
    if (!table) throw new Error(`unknown-admin-entity:${entity}`);

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? PAGE_SIZE;

    let query = requireSupabase()
      .from(table)
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false, nullsFirst: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }
    const titleCol = SEARCHABLE_TITLE[table];
    if (params.q && titleCol) {
      query = query.ilike(titleCol, `%${params.q.trim()}%`);
    }

    const rangeStart = (page - 1) * pageSize;
    query = query.range(rangeStart, rangeStart + pageSize - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    const rows = (data as T[]) ?? [];
    return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
  },

  async get<T>(entity: string, id: string): Promise<T | null> {
    const { table } = ADMIN_ENTITY_MAP[entity];
    if (!table) throw new Error(`unknown-admin-entity:${entity}`);
    const { data, error } = await requireSupabase()
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as T) ?? null;
  },

  async create<T>(entity: string, payload: Record<string, unknown>): Promise<T> {
    await assertAdmin();
    const { table } = ADMIN_ENTITY_MAP[entity];
    if (!table) throw new Error(`unknown-admin-entity:${entity}`);
    const body = { ...payload };
    if (shouldStampPublishedAt(table, payload.status, payload.published_at)) {
      body.published_at = new Date().toISOString();
    }
    if (import.meta.env.DEV) {
      console.debug('[adminContentService.create]', {
        table,
        operation: 'insert',
        keys: Object.keys(body),
        types: Object.fromEntries(Object.entries(body).map(([k, v]) => [k, Array.isArray(v) ? `array(${v.length})` : typeof v])),
      });
    }
    const { data, error } = await requireSupabase()
      .from(table)
      .insert(body)
      .select('*')
      .single();
    if (error) {
      console.error('[adminContentService.create] SUPABASE ERROR', {
        table,
        operation: 'insert',
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }
    return data as T;
  },

  async update<T>(
    entity: string,
    id: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    await assertAdmin();
    const { table } = ADMIN_ENTITY_MAP[entity];
    if (!table) throw new Error(`unknown-admin-entity:${entity}`);
    const body = { ...payload };
    if (shouldStampPublishedAt(table, payload.status, payload.published_at)) {
      const { data: existing } = await requireSupabase()
        .from(table)
        .select('published_at')
        .eq('id', id)
        .maybeSingle();
      if (existing && shouldStampPublishedAt(table, payload.status, (existing as { published_at?: unknown }).published_at)) {
        body.published_at = new Date().toISOString();
      }
    }
    const { data, error } = await requireSupabase()
      .from(table)
      .update(body)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as T;
  },

  async remove(entity: string, id: string): Promise<void> {
    await assertAdmin();
    const { table } = ADMIN_ENTITY_MAP[entity];
    if (!table) throw new Error(`unknown-admin-entity:${entity}`);

    const fileColumns = CONTENT_FILE_COLUMNS[table];
    let filePaths: string[] = [];
    if (fileColumns?.length) {
      const { data: row } = await requireSupabase()
        .from(table)
        .select(fileColumns.join(','))
        .eq('id', id)
        .maybeSingle();
      filePaths = (fileColumns
        .map((column) => (row as Record<string, unknown> | null)?.[column])
        .filter((value): value is string => typeof value === 'string' && value.length > 0) ?? []);
    }

    const { error } = await requireSupabase().from(table).delete().eq('id', id);
    if (error) throw error;

    // تنظيف الملفات المرتبطة (أفضل جهد — لا يمنع نجاح الحذف إن فشل التنظيف).
    for (const path of filePaths) {
      await removeStoredFile(path);
    }
  },

  /** استبدال ارتباطات المحاور لعنصر (حذف ثم إدراج) — نفس النتيجة بدون تكرار. */
  async replaceAxisLinks(contentType: AxisContentType, contentId: string, axisIds: string[]) {
    await assertAdmin();
    const client = requireSupabase();
    const { error: delError } = await client
      .from('content_axis_links')
      .delete()
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    if (delError) throw delError;

    if (!axisIds.length) return;
    const { error: insError } = await client.from('content_axis_links').insert(
      axisIds.map((axis_id) => ({ axis_id, content_type: contentType, content_id: contentId })),
    );
    if (insError) throw insError;
  },

  async listAxesForAdmin() {
    const { data, error } = await requireSupabase()
      .from('scientific_axes')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getAxisLinksForContent(contentType: AxisContentType, contentId: string) {
    const { data, error } = await requireSupabase()
      .from('content_axis_links')
      .select('axis_id')
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    if (error) throw error;
    return (data ?? []).map((l) => l.axis_id);
  },

  // ============ المستخدمون ============
  async listUsers(
    params: AdminListParams = {},
  ): Promise<AdminListResult<Profile> & { roleByUser: Record<string, UserRole['role']> }> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? PAGE_SIZE;
    let query = requireSupabase()
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (params.q) {
      query = query.ilike('display_name', `%${params.q.trim()}%`);
    }
    const rangeStart = (page - 1) * pageSize;
    query = query.range(rangeStart, rangeStart + pageSize - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const rows = (data as Profile[]) ?? [];

    const userIds = rows.map((r) => r.id);
    const { data: roles } = await requireSupabase()
      .from('user_roles')
      .select('*')
      .in('user_id', userIds);
    const roleByUser: Record<string, UserRole['role']> = {};
    for (const role of roles ?? []) roleByUser[role.user_id] = role.role;

    return {
      data: rows,
      count: count ?? rows.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)),
      roleByUser,
    };
  },

  async setUserRole(userId: string, role: 'admin' | 'user') {
    await assertAdmin();
    const { error } = await requireSupabase().rpc('admin_set_user_role', {
      p_user_id: userId,
      p_role: role,
    });
    if (error) throw error;
  },

  // ============ صندوق التواصل ============
  async listSubmissions(params: AdminListParams = {}): Promise<AdminListResult<ContactSubmission>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? PAGE_SIZE;
    let query = requireSupabase()
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    if (params.status) query = query.eq('status', params.status);
    const rangeStart = (page - 1) * pageSize;
    query = query.range(rangeStart, rangeStart + pageSize - 1);
    const { data, error, count } = await query;
    if (error) throw error;
    const rows = (data as ContactSubmission[]) ?? [];
    return { data: rows, count: count ?? rows.length, page, pageSize, totalPages: Math.max(1, Math.ceil((count ?? rows.length) / pageSize)) };
  },

  async getSubmission(id: string) {
    const { data, error } = await requireSupabase()
      .from('contact_submissions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return (data as ContactSubmission) ?? null;
  },

  async updateSubmissionStatus(id: string, status: ContactSubmission['status']) {
    await assertAdmin();
    const { error } = await requireSupabase()
      .from('contact_submissions')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async updateSubmissionNotes(id: string, internal_notes: string) {
    await assertAdmin();
    const { error } = await requireSupabase()
      .from('contact_submissions')
      .update({ internal_notes })
      .eq('id', id);
    if (error) throw error;
  },

  async getSubmissionAttachments(submissionId: string) {
    const { data, error } = await requireSupabase()
      .from('contact_attachments')
      .select('*')
      .eq('submission_id', submissionId);
    if (error) throw error;
    return data ?? [];
  },

  // ============ الإعدادات ============
  async listSettings(): Promise<SiteSetting[]> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .order('key', { ascending: true });
    if (error) throw error;
    return (data as SiteSetting[]) ?? [];
  },

  async upsertSetting(key: string, value: Record<string, unknown>, isPublic = true) {
    await assertAdmin();
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .upsert({ key, value, is_public: isPublic }, { onConflict: 'key' })
      .select('*')
      .single();
    if (error) throw error;
    return data as SiteSetting;
  },

  // ============ سجلات التدقيق والإحصائيات ============
  async listAuditLogs(limit = 100): Promise<AuditLog[]> {
    const { data, error } = await requireSupabase()
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as AuditLog[]) ?? [];
  },

  async analyticsOverview(): Promise<Record<string, number>> {
    const { data, error } = await requireSupabase().rpc('admin_analytics_overview');
    if (error) throw error;
    return (data ?? {}) as Record<string, number>;
  },

  /** إحصائيات لوحة التحكم الكاملة (RPC واحد) — أرقام حقيقية من قاعدة البيانات. */
  async dashboardStats(): Promise<DashboardStats> {
    const { data, error } = await requireSupabase().rpc('admin_dashboard_stats');
    if (error) throw error;
    return (data ?? {}) as DashboardStats;
  },

  /** سلسلة زمنية (مشاهدات/تنزيلات/نشر) — RPC واحد. */
  async dashboardSeries(period: DashboardPeriod): Promise<DashboardSeries> {
    const { data, error } = await requireSupabase().rpc('admin_dashboard_series', {
      p_period: period,
    });
    if (error) throw error;
    return (data ?? {}) as DashboardSeries;
  },

  // ============ أقسام السيرة (profile_content) ============
  async listProfileSections() {
    const { data, error } = await requireSupabase()
      .from('profile_content')
      .select('*')
      .order('updated_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async upsertProfileSection(
    section: string,
    payload: {
      title_ar?: string;
      title_en?: string;
      body_ar?: string;
      body_en?: string;
      status?: string;
      published_at?: string | null;
    },
  ) {
    await assertAdmin();
    const client = requireSupabase();
    const body: Record<string, unknown> = { section, ...payload };

    // الحفاظ على published_at عند النشر (نفس منطق بقية جداول المحتوى).
    if (shouldStampPublishedAt('profile_content', payload.status, payload.published_at)) {
      const { data: existing } = await client
        .from('profile_content')
        .select('published_at')
        .eq('section', section)
        .maybeSingle();
      if (
        existing &&
        shouldStampPublishedAt('profile_content', payload.status, (existing as { published_at?: unknown }).published_at)
      ) {
        body.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await client
      .from('profile_content')
      .upsert(body, { onConflict: 'section' })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // ============ الاهتمامات البحثية (محرر ملف السيرة) ============
  /** قائمة اهتمامات البحثية بكل الحالات، مرتّبة بترتيب العرض العام (sort_order). */
  async listInterests(): Promise<ResearchInterest[]> {
    const { data, error } = await requireSupabase()
      .from('research_interests')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: true });
    if (error) throw error;
    return (data as ResearchInterest[]) ?? [];
  },

  // ============ الإعلانات ============
  /** نشر / إلغاء نشر إعلان (is_active) — بأذونات أدمن معزّزة. */
  async setAnnouncementActive(id: string, isActive: boolean): Promise<Announcement> {
    await assertAdmin();
    const { data, error } = await requireSupabase()
      .from('announcements')
      .update({ is_active: isActive })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Announcement;
  },
};
