import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, BookOpen, GraduationCap, Scale, Lightbulb, Presentation, Mic } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { mapService, queryKeys } from '@/services';
import { ErrorState, LoadingState, EmptyState, Badge } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import type { AxisItemResult } from '@/types';

const TYPE_META = {
  research: { key: 'map.groups.research', icon: FileText, prefix: 'research' },
  publication: { key: 'map.groups.publication', icon: BookOpen, prefix: 'publications' },
  supervision: { key: 'map.groups.supervision', icon: GraduationCap, prefix: 'supervision' },
  discussion: { key: 'map.groups.discussion', icon: Scale, prefix: 'discussions' },
  project: { key: 'map.groups.project', icon: Lightbulb, prefix: 'projects' },
  course: { key: 'map.groups.course', icon: Presentation, prefix: 'courses' },
  lecture: { key: 'map.groups.lecture', icon: Mic, prefix: 'courses' },
} as const;

export function AxisDetailPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const { slug } = useParams<{ slug: string }>();

  const axisQuery = useQuery({
    queryKey: queryKeys.axisItem(slug ?? ''),
    queryFn: () => mapService.getAxisBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  const contentQuery = useQuery({
    queryKey: queryKeys.axisContent(axisQuery.data?.id ?? ''),
    queryFn: () => mapService.getAxisContent(axisQuery.data!.id),
    enabled: Boolean(axisQuery.data?.id),
  });

  if (axisQuery.isLoading) return <LoadingState />;
  if (axisQuery.isError) return <ErrorState message={t('common.error')} onRetry={() => void axisQuery.refetch()} />;

  const axis = axisQuery.data;
  if (!axis) return <ErrorState message={t('common.notFound')} />;

  const items = contentQuery.data ?? [];
  const grouped = items.reduce<Record<string, AxisItemResult[]>>((acc, item) => {
    (acc[item.content_type] ??= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <Seo title={pickLang(axis.name_ar, axis.name_en, locale) ?? ''} />
      <div className="container-page py-10">
        <Link to="/scientific-map" className="btn-ghost px-0">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('map.backToMap')}
        </Link>

        <div className="mt-4 rounded-xl border border-primary-100 bg-white p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl font-bold text-primary-900">
            {pickLang(axis.name_ar, axis.name_en, locale)}
          </h1>
          <div className="gold-divider ms-0" />
          <p className="mt-3 leading-relaxed text-slateGray-dark">
            {pickLang(axis.description_ar, axis.description_en, locale)}
          </p>
        </div>

        <div className="mt-8">
          {contentQuery.isLoading ? (
            <LoadingState />
          ) : items.length === 0 ? (
            <EmptyState title={t('map.noContent')} />
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([type, group]) => {
                const meta = TYPE_META[type as keyof typeof TYPE_META];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <section key={type}>
                    <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-primary-900">
                      <Icon className="h-5 w-5 text-gold-500" />
                      {t(meta.key)}
                      <Badge tone="ivory">{group.length}</Badge>
                    </h2>
                    <ul className="space-y-2">
                      {group.map((item) => (
                        <li key={`${item.content_type}-${item.content_id}`}>
                          <Link
                            to={`/${meta.prefix}/${item.slug}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-primary-100 bg-white px-4 py-3 transition-colors hover:border-gold-300 hover:bg-gold-50"
                          >
                            <span className="text-sm font-bold text-primary-800">
                              {pickLang(item.title_ar, item.title_en, locale)}
                            </span>
                            <span className="shrink-0 text-xs text-slateGray">
                              {item.published_at ? formatDate(item.published_at, locale) : ''}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
