import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { courseService, queryKeys } from '@/services';
import { SkeletonGrid, ErrorState, EmptyState } from '@/components/ui';
import { CourseCard } from '@/features/courses/CourseCard';

type Tab = 'course' | 'lecture';

export function CoursesPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [tab, setTab] = useState<Tab>('course');

  const filters = useMemo(() => ({ page: 1, pageSize: 24 }), []);
  const query = useQuery({
    queryKey: tab === 'course' ? queryKeys.courses(filters) : queryKeys.lectures(filters),
    queryFn: () =>
      tab === 'course' ? courseService.listCourses(filters) : courseService.listLectures(filters),
  });

  const items = query.data?.data ?? [];

  return (
    <>
      <Seo title={t('courses.title')} description={t('courses.subtitle')} />
      <PageHeader title={t('courses.title')} subtitle={t('courses.subtitle')} />

      <div className="container-page py-8">
        <div className="mb-8 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setTab('course')}
            className={tab === 'course' ? 'btn-primary' : 'btn-outline'}
          >
            {t('courses.title')}
          </button>
          <button
            type="button"
            onClick={() => setTab('lecture')}
            className={tab === 'lecture' ? 'btn-primary' : 'btn-outline'}
          >
            {t('courses.lecturesTitle')}
          </button>
        </div>

        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={tab === 'course' ? t('courses.noCourses') : t('courses.noLectures')} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((course) => (
              <CourseCard key={course.id} course={course} contentType={tab} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
