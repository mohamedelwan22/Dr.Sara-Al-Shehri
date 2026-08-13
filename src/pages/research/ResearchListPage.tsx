import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { researchService, queryKeys } from '@/services';
import { Select, Pagination, SkeletonGrid, ErrorState, EmptyState, Badge } from '@/components/ui';
import { ResearchCard } from '@/features/research/ResearchCard';
import { useAxesList } from '@/features/scientific-map/AxisTags';
import { pickLang } from '@/lib/utils';

type Tab = 'research' | 'publication';

export function ResearchListPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<Tab>(() =>
    searchParams.get('tab') === 'publication' ? 'publication' : 'research',
  );
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : undefined;
  const axisParam = searchParams.get('axis');
  const axisId = axisParam || undefined;

  const { data: axes } = useAxesList();

  const filters = useMemo(() => ({ page, year, axisId }), [page, year, axisId]);

  const query = useQuery({
    queryKey: tab === 'research' ? queryKeys.research(filters) : queryKeys.publications(filters),
    queryFn: () =>
      tab === 'research'
        ? researchService.listResearch(filters)
        : researchService.listPublications(filters),
  });

  const yearsQuery = useQuery({
    queryKey: ['research-years'],
    queryFn: () => researchService.getYearOptions(),
  });

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  const result = query.data;
  const items = result?.data ?? [];

  return (
    <>
      <Seo title={t('research.title')} description={t('research.subtitle')} />
      <PageHeader title={t('research.title')} subtitle={t('research.subtitle')} />

      <div className="container-page py-8">
        {/* تبويبات الأبحاث والمؤلفات */}
        <div className="mb-6 flex justify-center gap-2">
          {(['research', 'publication'] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                updateParams({ tab: value === 'publication' ? 'publication' : undefined, page: undefined });
              }}
              className={
                tab === value
                  ? 'btn-primary'
                  : 'btn-outline'
              }
            >
              {value === 'research' ? t('research.title') : t('publications.title')}
            </button>
          ))}
        </div>

        {/* عوامل التصفية */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="filter-year" className="label-field">
              {t('research.filterByYear')}
            </label>
            <Select
              id="filter-year"
              value={year?.toString() ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                updateParams({ year: v || undefined, page: undefined });
              }}
            >
              <option value="">{t('common.all')}</option>
              {(yearsQuery.data ?? []).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="filter-axis" className="label-field">
              {t('research.filterByAxis')}
            </label>
            <Select
              id="filter-axis"
              value={axisId ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                updateParams({ axis: v || undefined, page: undefined });
              }}
            >
              <option value="">{t('common.all')}</option>
              {(axes ?? []).map((axis) => (
                <option key={axis.id} value={axis.id}>
                  {pickLang(axis.name_ar, axis.name_en, locale)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={tab === 'research' ? t('research.noResearch') : t('publications.noItems')} />
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <Badge tone="ivory">
                {result?.count ?? 0} {t('research.listOf')}
              </Badge>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((paper) => (
                <ResearchCard
                  key={paper.id}
                  paper={paper}
                  contentType={tab}
                  detailPrefix={tab === 'research' ? 'research' : 'publications'}
                  locale={locale}
                />
              ))}
            </div>
            {result && result.totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={result.totalPages}
                  onChange={(next) => updateParams({ page: next === 1 ? undefined : String(next) })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
