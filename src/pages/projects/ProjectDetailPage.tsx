import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarRange, GraduationCap, Scale, Lightbulb } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { projectService, queryKeys } from '@/services';
import { Card, CardBody, ErrorState, LoadingState, Badge } from '@/components/ui';
import { pickLang, formatMonthYear } from '@/lib/utils';
import { RecordView, MetricsRow } from '@/features/interactions/Interactions';
import { AxisTagsForSingle } from '@/features/scientific-map/AxisTags';

export function ProjectDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const query = useQuery({
    queryKey: queryKeys.projectItem(slug ?? ''),
    queryFn: () => projectService.getBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;

  const project = query.data;
  if (!project) return <ErrorState message={t('common.notFound')} />;

  const title = pickLang(project.title_ar, project.title_en, locale);
  const description = pickLang(project.description_ar, project.description_en, locale);

  return (
    <>
      <Seo title={title ?? ''} description={description ?? undefined} />
      <RecordView contentType="project" contentId={project.id} />

      <div className="container-page py-10">
        <Link to="/projects" className="btn-ghost px-0">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('projects.backToProjects')}
        </Link>

        <Card className="mt-4">
          <CardBody className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="gold">
                <Lightbulb className="h-3.5 w-3.5" />
                {project.project_status ?? t('common.unknown')}
              </Badge>
              <Badge tone="ivory">
                <CalendarRange className="h-3.5 w-3.5" />
                {formatMonthYear(project.start_date, locale)}
                {project.end_date ? ` — ${formatMonthYear(project.end_date, locale)}` : ''}
              </Badge>
            </div>

            <h1 className="font-display text-2xl font-bold leading-relaxed text-primary-900 sm:text-3xl">{title}</h1>

            {description && (
              <div>
                <h2 className="mb-2 font-display text-lg font-bold text-primary-900">{t('projects.aboutProject')}</h2>
                <div className="prose-arabic">
                  <p>{description}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="mb-2 font-display text-base font-bold text-primary-900">{t('research.relatedAxes')}</h3>
              <AxisTagsForSingle contentType="project" contentId={project.id} />
            </div>

            {project.relatedItems.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-bold text-primary-900">
                  {t('projects.relatedTheses')}
                </h2>
                <ul className="space-y-2">
                  {project.relatedItems.map((item) => {
                    const itemTitle = pickLang(item.title_ar, item.title_en, locale);
                    return (
                      <li key={`${item.item_type}-${item.id}`}>
                        <Link
                          to={`/${item.item_type === 'supervision' ? 'supervision' : 'discussions'}/${item.slug}`}
                          className="flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50/50 px-4 py-3 text-sm font-bold text-primary-800 transition-colors hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700"
                        >
                          {item.item_type === 'supervision' ? (
                            <GraduationCap className="h-4 w-4 shrink-0 text-gold-600" />
                          ) : (
                            <Scale className="h-4 w-4 shrink-0 text-gold-600" />
                          )}
                          <span className="line-clamp-1">{itemTitle}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="border-t border-primary-100 pt-4">
              <MetricsRow contentType="project" contentId={project.id} />
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
