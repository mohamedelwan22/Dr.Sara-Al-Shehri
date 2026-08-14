import type { QueryClient } from '@tanstack/react-query';

/**
 * إبطال استعلامات الواجهة الرئيسية عند تعديل/حذف/إنشاء في لوحة الإدارة.
 * تُستخدم بادئات جزئية (مثل ['news']) حتى يطابق جميع الاستعلامات المتفرعة
 * (القوائم، الصفحات الداخلية، وواجهة الرئيسية) دفعة واحدة.
 */
const HOME_STATS = ['home', 'stats'] as const;
const HOME_CATEGORIES = ['home', 'categories'] as const;
const HOME_LATEST_RESEARCH = ['home', 'latest-research'] as const;
const CALENDAR = ['calendar'] as const;

const INVALIDATIONS: Record<string, readonly (readonly string[])[]> = {
  research: [
    ['research'],
    ['publications'],
    HOME_STATS,
    HOME_CATEGORIES,
    HOME_LATEST_RESEARCH,
  ],
  publications: [
    ['research'],
    ['publications'],
    HOME_STATS,
    HOME_CATEGORIES,
    HOME_LATEST_RESEARCH,
  ],
  supervision: [['supervision'], CALENDAR, HOME_CATEGORIES],
  discussions: [['discussions'], CALENDAR, HOME_CATEGORIES],
  projects: [['projects'], HOME_CATEGORIES],
  courses: [['courses'], CALENDAR, HOME_CATEGORIES],
  lectures: [['lectures'], CALENDAR, HOME_CATEGORIES],
  axes: [['axes'], HOME_CATEGORIES],
  insights: [['insights']],
  news: [['news']],
  interests: [['interests']],
  calendar: [CALENDAR],
  announcements: [['announcements']],
};

export function invalidateForEntity(queryClient: QueryClient, entity: string): void {
  const groups = INVALIDATIONS[entity] ?? [];
  for (const queryKey of groups) {
    void queryClient.invalidateQueries({ queryKey });
  }
}

/** إبطال كل استعلامات بيانات الواجهة الرئيسية (العدّادات والمحاور والإنتاج). */
export function invalidateHomeData(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: HOME_STATS });
  void queryClient.invalidateQueries({ queryKey: HOME_CATEGORIES });
  void queryClient.invalidateQueries({ queryKey: HOME_LATEST_RESEARCH });
}

/** إبطال استعلامات السيرة الذاتية (تُستخدم في الواجهة الرئيسية أيضًا). */
export function invalidateProfileContent(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ['profile-content'] });
}
