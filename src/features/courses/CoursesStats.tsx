import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { GraduationCap, Clock, Presentation, Users } from 'lucide-react';
import { courseService, queryKeys } from '@/services';
import { formatNumber } from '@/lib/utils';

export function CoursesStats() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const { data: stats } = useQuery({
    queryKey: queryKeys.courseStats,
    queryFn: () => courseService.getCourseStats(),
  });

  const allCards = [
    {
      id: 'certificates',
      value: formatNumber(stats?.totalCertificates ?? 0, locale),
      label: t('courses.stats.certificates'),
      icon: GraduationCap,
    },
    {
      id: 'hours',
      value: formatNumber(stats?.totalHours ?? 0, locale),
      label: t('courses.stats.hours'),
      icon: Clock,
    },
    {
      id: 'courses',
      value: formatNumber(stats?.totalItems ?? 0, locale),
      label: t('courses.stats.coursesCount'),
      icon: Presentation,
    },
    {
      id: 'views',
      value: formatNumber(stats?.totalViews ?? 0, locale),
      label: t('courses.stats.views'),
      icon: Users,
    },
  ];

  // إظهار البطاقات التي تحتوي على قيم فعلية فقط
  const activeCards = allCards.filter((card) => card.value !== null);

  if (activeCards.length === 0) return null;

  return (
    <section className="mt-14 rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
      <div
        className={`grid gap-6 divide-y divide-primary-50 sm:divide-y-0 ${
          activeCards.length === 4
            ? 'grid-cols-2 md:grid-cols-4 md:divide-x md:divide-x-reverse md:divide-primary-100'
            : activeCards.length === 3
              ? 'grid-cols-1 md:grid-cols-3 md:divide-x md:divide-x-reverse md:divide-primary-100'
              : 'grid-cols-1 md:grid-cols-2 md:divide-x md:divide-x-reverse md:divide-primary-100'
        }`}
      >
        {activeCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="flex flex-col items-center justify-center p-3 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-display text-2xl font-extrabold text-primary-950 sm:text-3xl">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium text-slateGray">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
