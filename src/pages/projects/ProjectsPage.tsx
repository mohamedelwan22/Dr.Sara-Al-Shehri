import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { projectService, queryKeys } from '@/services';
import { SkeletonGrid, ErrorState, EmptyState, Pagination } from '@/components/ui';
import { ProjectCard } from '@/features/projects/ProjectCard';

export function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const query = useQuery({
    queryKey: queryKeys.projects({ page }),
    queryFn: () => projectService.list({ page }),
  });

  const items = query.data?.data ?? [];

  return (
    <>
      <Seo title={t('projects.title')} description={t('projects.subtitle')} />
      <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')} />
      <div className="container-page py-8 sm:py-10">
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('projects.noProjects')} />
        ) : (
          <>
            {/* Responsive Grid: 3 columns Desktop, 2 Tablet, 1 Mobile */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((project) => (
                <ProjectCard key={project.id} project={project} locale={locale} />
              ))}
            </div>

            {query.data && query.data.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={query.data.totalPages}
                  onChange={(next) => {
                    const params = new URLSearchParams(searchParams);
                    if (next === 1) params.delete('page');
                    else params.set('page', String(next));
                    setSearchParams(params);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
