/**
 * أدوات مشتركة للنشر والبحث والترقيم — تُستخدم من الخدمات ومن اختباراتها.
 * الهدف: تركيز المنطق القابل للاختبار في دوال نقية بعيدًا عن شبكة Supabase.
 */

/** جداول المحتوى التي تملك عمود published_at. */
export const PUBLISHABLE_TABLES = new Set<string>([
  'research_papers',
  'publications',
  'scientific_supervisions',
  'scientific_discussions',
  'research_projects',
  'courses',
  'lectures',
  'scientific_insights',
  'news',
  'profile_content',
]);

/**
 * هل يجب ختم published_at عند النشر؟
 * يُطبَّق فقط على الجداول التي تملك العمود، وعندما تصبح الحالة "published"
 * ولم يكن التاريخ مضبوطًا مسبقًا (لتجنّب الكتابة فوق تاريخ نشر سابق).
 */
export function shouldStampPublishedAt(
  table: string,
  status: unknown,
  currentPublishedAt: unknown,
): boolean {
  const empty =
    currentPublishedAt === null ||
    currentPublishedAt === undefined ||
    currentPublishedAt === '';
  return PUBLISHABLE_TABLES.has(table) && status === 'published' && empty;
}

/** تهريب محارف ILIKE الخاصة (% و _ و \). */
export function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/**
 * بناء شرط OR للبحث النصي عبر أعمدة متعددة باستخدام ILIKE على الخادم.
 * يُرجع سلسلة قابلة للتمرير إلى query.or(...) أو سلسلة فارغة إن كان النص فارغًا.
 */
export function buildIlikeOr(columns: string[], raw: string): string {
  const q = escapeIlike(raw.trim());
  if (!q) return '';
  return columns.map((column) => `${column}.ilike.%${q}%`).join(',');
}

/** حساب عدد الصفحات الكلي من العدد الإجمالي وحجم الصفحة. */
export function totalPages(count: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(count / pageSize));
}
