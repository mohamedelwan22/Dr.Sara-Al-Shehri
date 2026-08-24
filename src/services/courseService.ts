import { requireSupabase } from '@/lib/supabase';
import type { Course, CourseOrLectureItem, Lecture } from '@/types';
import type { ListFilters, PaginatedResult } from './researchService';

export type CourseFilterMode = 'all' | 'chronological' | 'completed' | 'online';

export interface CombinedCourseFilters extends ListFilters {
  sortByDate?: boolean;
  filterMode?: CourseFilterMode;
}

export interface CoursesFeatureStats {
  totalCourses: number;
  totalLectures: number;
  totalItems: number;
  totalHours: number;
  totalViews: number;
  totalParticipants: number;
  totalCertificates: number;
}

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

  /** قائمة موحدة تجمع الدورات والمحاضرات للواجهة العامة. */
  async listAllCombined(filters: CombinedCourseFilters = {}): Promise<PaginatedResult<CourseOrLectureItem>> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;

    const [coursesRes, lecturesRes] = await Promise.all([
      requireSupabase().from('courses').select('*').eq('status', 'published'),
      requireSupabase().from('lectures').select('*').eq('status', 'published'),
    ]);

    if (coursesRes.error) throw coursesRes.error;
    if (lecturesRes.error) throw lecturesRes.error;

    const courses = (coursesRes.data as Course[] ?? []).map((c) => ({ ...c, contentType: 'course' as const }));
    const lectures = (lecturesRes.data as Course[] ?? []).map((l) => ({ ...l, contentType: 'lecture' as const }));

    let combined: CourseOrLectureItem[] = [...courses, ...lectures];

    // تصفية حسب نمط الحضور أو الحالة إذا تم تخصيص filterMode
    if (filters.filterMode === 'completed') {
      combined = combined.filter((item) => item.event_status === 'completed');
    } else if (filters.filterMode === 'online') {
      combined = combined.filter((item) => item.delivery_mode === 'online');
    }

    // تصفية حسب المحور إن وجد
    if (filters.axisId) {
      const { data: links } = await requireSupabase()
        .from('content_axis_links')
        .select('content_id')
        .eq('axis_id', filters.axisId);
      const validIds = new Set((links ?? []).map((l) => l.content_id));
      combined = combined.filter((item) => validIds.has(item.id));
    }

    // الترتيب:
    // إذا كُنّا في وضع "مرتبة زمنياً" (filterMode === 'chronological' أو sortByDate) -> الترتيب حسب activity_date تنازلياً
    // وإلا -> الترتيب حسب sort_order ثم featured ثم activity_date
    if (filters.filterMode === 'chronological' || filters.sortByDate) {
      combined.sort((a, b) => {
        const dateA = a.activity_date ? new Date(a.activity_date).getTime() : 0;
        const dateB = b.activity_date ? new Date(b.activity_date).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return a.title_ar.localeCompare(b.title_ar, 'ar');
      });
    } else {
      combined.sort((a, b) => {
        const sortA = a.sort_order ?? 0;
        const sortB = b.sort_order ?? 0;
        if (sortA !== sortB) return sortB - sortA;
        const featA = a.featured ? 1 : 0;
        const featB = b.featured ? 1 : 0;
        if (featA !== featB) return featB - featA;
        const dateA = a.activity_date ? new Date(a.activity_date).getTime() : 0;
        const dateB = b.activity_date ? new Date(b.activity_date).getTime() : 0;
        if (dateA !== dateB) return dateB - dateA;
        return a.title_ar.localeCompare(b.title_ar, 'ar');
      });
    }

    const totalCount = combined.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = combined.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedItems,
      count: totalCount,
      page,
      pageSize,
      totalPages,
    };
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

  async getItemBySlug(slug: string): Promise<CourseOrLectureItem | null> {
    const course = await this.getCourseBySlug(slug);
    if (course) return { ...course, contentType: 'course' };
    const lecture = await this.getLectureBySlug(slug);
    if (lecture) return { ...lecture, contentType: 'lecture' };
    return null;
  },

  /**
   * إحصائيات حقيقية 100% من قاعدة البيانات لبطاقات أسفل الصفحة.
   * تُحسب عبر دالة خادمية آمنة (SECURITY DEFINER) تجمّع الأعداد والمجاميع فعليًا:
   * - عدد الدورات/المحاضرات المنشورة (status = 'published')
   * - مجموع ساعات التدريب (SUM duration_hours)
   * - عدد المشاهدات الحقيقية (content_views بصنفي course/lecture)
   * - المشاركون/الشهادات = 0 لعدم وجود نظام تسجيل/شهادات فعلي (صفر صادق لا رقم مختلق)
   */
  async getCourseStats(): Promise<CoursesFeatureStats> {
    const { data, error } = await requireSupabase().rpc('get_courses_stats');
    if (error) throw error;
    const raw = (data ?? {}) as Record<string, number | string>;
    return {
      totalCourses: Number(raw.total_courses ?? 0),
      totalLectures: Number(raw.total_lectures ?? 0),
      totalItems: Number(raw.total_items ?? 0),
      totalHours: Number(raw.total_training_hours ?? 0),
      totalViews: Number(raw.total_views ?? 0),
      totalParticipants: Number(raw.total_participants ?? 0),
      totalCertificates: Number(raw.total_certificates ?? 0),
    };
  },
};
