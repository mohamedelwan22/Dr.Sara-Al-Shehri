/**
 * أدوات مشتركة للإعلانات — منطق نقي قابل للاختبار بعيدًا عن شبكة Supabase.
 * يعكس بدقة نافذة النشر في سياسة RLS الخاصة بـ announcements
 * (005_rls.sql): is_active = true مع فحص active_from / active_until.
 */
import type { Announcement } from '@/types';

/**
 * هل الإعلان مرئي للعامة في لحظة معينة؟
 * نفس شروط سياسة القراءة العامة: نشط + داخل نافذة النشر الزمنية (ضمناً الطرفين).
 */
export function announcementIsActive(
  announcement: Pick<Announcement, 'is_active' | 'active_from' | 'active_until'>,
  now: Date = new Date(),
): boolean {
  if (!announcement.is_active) return false;
  const time = now.getTime();

  if (announcement.active_from) {
    const from = new Date(announcement.active_from).getTime();
    if (Number.isNaN(from) || from > time) return false;
  }
  if (announcement.active_until) {
    const until = new Date(announcement.active_until).getTime();
    if (Number.isNaN(until) || until < time) return false;
  }
  return true;
}
