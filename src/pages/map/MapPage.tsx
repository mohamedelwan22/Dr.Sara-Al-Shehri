import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { mapService, queryKeys } from '@/services';
import { SkeletonGrid, ErrorState, EmptyState } from '@/components/ui';
import { AxisCard } from '@/features/scientific-map/AxisCard';

export function MapPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const query = useQuery({
    queryKey: queryKeys.axes,
    queryFn: () => mapService.listAxes(),
  });

  const axes = query.data ?? [];

  return (
    <>
      <Seo title={t('map.title')} description={t('map.subtitle')} />
      <PageHeader title={t('map.title')} subtitle={t('map.subtitle')} />
      <div className="container-page py-10">
        {query.isLoading ? (
          <SkeletonGrid count={9} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : axes.length === 0 ? (
          <EmptyState title={t('map.noContent')} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {axes.map((axis) => (
              <AxisCard key={axis.id} axis={axis} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
