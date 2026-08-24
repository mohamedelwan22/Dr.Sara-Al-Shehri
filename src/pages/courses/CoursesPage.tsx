import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LayoutGrid, Calendar, Mic, Clock, UserCheck, Wifi } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { courseService, queryKeys, type CourseFilterMode } from '@/services';
import { SkeletonGrid, ErrorState, EmptyState } from '@/components/ui';
import { CourseCard } from '@/features/courses/CourseCard';
import { CoursesStats } from '@/features/courses/CoursesStats';

export function CoursesPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [filterMode, setFilterMode] = useState<CourseFilterMode>('all');

  const filters = useMemo(
    () => ({
      page: 1,
      pageSize: 24,
      filterMode,
    }),
    [filterMode],
  );

  const query = useQuery({
    queryKey: queryKeys.coursesCombined(filters),
    queryFn: () => courseService.listAllCombined(filters),
  });

  const items = query.data?.data ?? [];

  return (
    <>
      <Seo title={t('courses.title')} description={t('courses.subtitle')} />

      {/* الرأس التزييني العلوي (مطابق لتصميم IMAGE 1 المرجعي) */}
      <header className="relative bg-gradient-to-b from-[#F5F0FA]/80 via-white to-white pb-8 pt-10 border-b border-[#E7DFED]/60 overflow-hidden">
        {/* راية وتزيين أكاديمي إسلامي على اليمين (Bookmark Ribbon) */}
        <div className="absolute top-0 right-8 z-10 hidden sm:block">
          <div className="flex flex-col items-center">
            <div
              className="flex h-16 w-10 items-center justify-center bg-[#35145C] text-[#D89A16] shadow-sm"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
            >
              <span className="text-base font-bold">❖</span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20">
          {/* شريط أعلى الرأس: زر جدول الدورات على اليسار */}
          <div className="mb-4 flex items-center justify-start">
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#35145C] shadow-2xs border border-[#E7DFED] hover:bg-[#F5F0FA] transition-colors"
            >
              <Calendar className="h-4 w-4 text-[#35145C]" />
              <span>{t('courses.schedule')}</span>
            </Link>
          </div>

          {/* العنوان الرئيسي، أيقونة الميكروفون التزيينية والوصف */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F0FA] text-[#35145C] ring-4 ring-[#F5F0FA]/60 shadow-inner">
                <Mic className="h-6 w-6 text-[#35145C]" />
              </div>
              <h1 className="font-display text-3xl font-extrabold text-[#35145C] sm:text-4xl">
                {t('courses.title')}
              </h1>
            </div>

            {/* فاصل مذهب تزييني */}
            <div className="relative my-3 flex h-px w-48 mx-auto items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/50 to-transparent">
              <span className="bg-white px-2 text-[10px] text-[#D89A16]">❖</span>
            </div>

            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-slateGray sm:text-base">
              {t('courses.subtitle')}
            </p>
          </div>

          {/* شريط التصفية والتحكم (مطابق لـ IMAGE 1): [ مرتبة زمنياً ] [ جميع الدورات ] [ منجزة ] [ عن بُعد ] */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex flex-wrap items-center justify-center rounded-2xl bg-white p-1.5 shadow-2xs border border-[#E7DFED] gap-1.5">
              {/* مرتبة زمنياً */}
              <button
                type="button"
                onClick={() => setFilterMode('chronological')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  filterMode === 'chronological'
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F5F0FA]'
                }`}
              >
                <Clock className="h-4 w-4 text-[#D89A16]" />
                <span>{t('courses.chronological')}</span>
              </button>

              {/* جميع الدورات */}
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  filterMode === 'all'
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F5F0FA]'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span>{t('courses.allCourses')}</span>
              </button>

              {/* منجزة */}
              <button
                type="button"
                onClick={() => setFilterMode('completed')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  filterMode === 'completed'
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F5F0FA]'
                }`}
              >
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>{t('courses.statuses.completed')}</span>
              </button>

              {/* عن بُعد */}
              <button
                type="button"
                onClick={() => setFilterMode('online')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                  filterMode === 'online'
                    ? 'bg-[#35145C] text-white shadow-xs'
                    : 'bg-white text-[#35145C] hover:bg-[#F5F0FA]'
                }`}
              >
                <Wifi className="h-4 w-4 text-[#35145C]" />
                <span>{t('courses.modes.online')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* شبكة الكروت (3 أعمدة في الشاشات الكبيرة) والإحصائيات */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('courses.noCourses')} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <CourseCard key={`${item.contentType}-${item.id}`} course={item} locale={locale} />
            ))}
          </div>
        )}

        {/* شريط الإحصائيات أسفل الصفحة (بيانات حقيقية من قاعدة البيانات) */}
        <CoursesStats />
      </div>
    </>
  );
}
