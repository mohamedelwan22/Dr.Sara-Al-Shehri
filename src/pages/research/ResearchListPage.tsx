import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search, X, Filter, Sparkles, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { researchService, queryKeys } from '@/services';
import { Select, Pagination, SkeletonGrid, ErrorState, EmptyState, Badge, Input, Button } from '@/components/ui';
import { ResearchCard } from '@/features/research/ResearchCard';
import { useAxesList } from '@/features/scientific-map/AxisTags';
import { pickLang } from '@/lib/utils';

type Tab = 'research' | 'publication';

export function ResearchListPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = (searchParams.get('tab') === 'publication' ? 'publication' : 'research') as Tab;
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : undefined;
  const axisParam = searchParams.get('axis');
  const axisId = axisParam || undefined;
  const qParam = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(qParam);

  // Synchronize local search input with URL searchParam
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  const { data: axes } = useAxesList();

  const filters = useMemo(
    () => ({ page, year, axisId, q: qParam || undefined }),
    [page, year, axisId, qParam],
  );

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
      if (value !== undefined && value !== '') next.set(key, value);
      else next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || undefined, page: undefined });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateParams({ q: undefined, page: undefined });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(tab === 'publication' ? { tab: 'publication' } : {});
  };

  const result = query.data;
  const items = result?.data ?? [];
  const hasActiveFilters = Boolean(year || axisId || qParam);

  return (
    <>
      <Seo title={t('research.title')} description={t('research.subtitle')} />

      {/* ── Page Header / Hero Section ── */}
      <PageHeader
        title={
          <span className="flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-gold-500" />
            {t('research.title')}
          </span>
        }
        subtitle={t('research.subtitle')}
      />

      <div className="container-page py-8">
        {/* ── Filter and Search Area Container ── */}
        <div className="mb-10 rounded-2xl border border-primary-100/80 bg-white p-5 shadow-xs sm:p-6">
          {/* Tab Switcher */}
          <div className="mb-6 flex flex-wrap justify-center gap-2 border-b border-primary-100/60 pb-5">
            <button
              type="button"
              onClick={() => updateParams({ tab: undefined, page: undefined })}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-bold transition-all ${
                tab === 'research'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-primary-50/70 text-primary-800 hover:bg-primary-100/70'
              }`}
            >
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span>{t('research.title')}</span>
            </button>
            <button
              type="button"
              onClick={() => updateParams({ tab: 'publication', page: undefined })}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-bold transition-all ${
                tab === 'publication'
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'bg-primary-50/70 text-primary-800 hover:bg-primary-100/70'
              }`}
            >
              <Layers className="h-4 w-4 text-gold-400" />
              <span>{t('publications.title')}</span>
            </button>
          </div>

          {/* Search Box & Controls Grid */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'ابحث في العنوان، الباحث، أو المحتوى...'
                      : 'Search by title, author, or content...'
                  }
                  className="pe-10 leading-relaxed"
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={t('common.close')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="absolute inset-y-0 end-3 my-auto h-4 w-4 text-slate-400" />
                )}
              </div>
              <Button type="submit" variant="primary" leftIcon={<Search className="h-4 w-4" />}>
                {t('common.search')}
              </Button>
            </div>

            {/* Dropdown Filters */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
              <div>
                <label htmlFor="filter-year" className="label-field text-xs text-primary-900 font-semibold mb-1 block">
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
                <label htmlFor="filter-axis" className="label-field text-xs text-primary-900 font-semibold mb-1 block">
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

              {hasActiveFilters && (
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAllFilters}
                    leftIcon={<X className="h-4 w-4" />}
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {locale === 'ar' ? 'إلغاء جميع الفلاتر' : 'Reset Filters'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── Results Count and Status Header ── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gold-500" />
            <h2 className="font-display text-lg font-bold text-primary-900">
              {tab === 'research' ? t('research.listOf') : t('publications.title')}
            </h2>
          </div>

          <Badge tone="ivory" className="px-3 py-1 text-xs font-bold text-primary-900 border border-primary-200/60">
            {result?.count ?? 0} {tab === 'research' ? (locale === 'ar' ? 'بحث علمي' : 'research items') : (locale === 'ar' ? 'مؤلف علمي' : 'publications')}
          </Badge>
        </div>

        {/* ── Research Listing Grid ── */}
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState
            message={locale === 'ar' ? 'تعذر تحميل الأبحاث حاليًا.' : 'Failed to load research items.'}
            onRetry={() => void query.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? locale === 'ar'
                  ? 'لا توجد أبحاث منشورة مطابقة لشروط البحث.'
                  : 'No research papers match your search criteria.'
                : tab === 'research'
                  ? t('research.noResearch')
                  : t('publications.noItems')
            }
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

            {/* Pagination Controls */}
            {result && result.totalPages > 1 && (
              <div className="mt-12 flex justify-center">
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
