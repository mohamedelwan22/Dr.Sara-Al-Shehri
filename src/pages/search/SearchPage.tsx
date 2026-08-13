import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, FileText, BookOpen, GraduationCap, Scale, Lightbulb, Presentation, Mic, Newspaper, Sparkles, Layers } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { PageHeader } from '@/components/layout/PageHeader';
import { searchService, queryKeys } from '@/services';
import { Card, CardBody, Pagination, ErrorState, EmptyState, LoadingState, Badge } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { SearchResultRow } from '@/types';

const TYPE_META: Record<string, { key: string; icon: typeof FileText; prefix: string }> = {
  research: { key: 'map.groups.research', icon: FileText, prefix: 'research' },
  publication: { key: 'map.groups.publication', icon: BookOpen, prefix: 'publications' },
  supervision: { key: 'map.groups.supervision', icon: GraduationCap, prefix: 'supervision' },
  discussion: { key: 'map.groups.discussion', icon: Scale, prefix: 'discussions' },
  project: { key: 'map.groups.project', icon: Lightbulb, prefix: 'projects' },
  course: { key: 'map.groups.course', icon: Presentation, prefix: 'courses' },
  lecture: { key: 'map.groups.lecture', icon: Mic, prefix: 'courses' },
  news: { key: 'nav.news', icon: Newspaper, prefix: 'news' },
  insight: { key: 'nav.insights', icon: Sparkles, prefix: 'insights' },
  axis: { key: 'nav.map', icon: Layers, prefix: 'scientific-map' },
  other: { key: 'search.title', icon: FileText, prefix: 'research' },
};

export function SearchPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState(searchParams.get('q') ?? '');
  const q = searchParams.get('q') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const params = useMemo(() => ({ q, page, pageSize: 20 }), [q, page]);
  const query = useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => searchService.search(params),
    enabled: q.trim().length > 1,
  });

  useEffect(() => {
    setInput(q);
  }, [q]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (input.trim()) next.set('q', input.trim());
    setSearchParams(next);
  };

  return (
    <>
      <Seo title={t('search.title')} />
      <PageHeader title={t('search.title')}>
        <form onSubmit={submit} className="mx-auto mt-6 max-w-xl">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slateGray" />
            <input
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t('search.placeholder')}
              className="input-field h-12 pe-4 ps-12"
              aria-label={t('search.placeholder')}
            />
          </div>
        </form>
        <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-slateGray">{t('search.searchHint')}</p>
      </PageHeader>

      <div className="container-page py-10">
        {!q ? (
          <EmptyState title={t('search.title')} description={t('search.tryDifferent')} />
        ) : q.trim().length <= 1 ? (
          <EmptyState title={t('search.noResults')} />
        ) : query.isLoading ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : (query.data?.count ?? 0) === 0 ? (
          <EmptyState title={t('search.noResults')} description={t('search.tryDifferent')} />
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-3">
              <Badge tone="gold">
                {t('search.resultsFor')} «{q}»
              </Badge>
              <Badge tone="ivory">{query.data?.count ?? 0}</Badge>
            </div>

            <ul className="space-y-3">
              {(query.data?.data ?? []).map((row: SearchResultRow) => {
                const meta = TYPE_META[row.content_type] ?? TYPE_META.other;
                const Icon = meta?.icon ?? SearchIcon;
                const title = pickLang(row.title_ar, row.title_en, locale);
                const excerpt = pickLang(row.excerpt_ar, row.excerpt_en, locale);
                return (
                  <li key={`${row.content_type}-${row.content_id}`}>
                    <Link to={`/${meta.prefix}/${row.slug}`}>
                      <Card className="transition-colors hover:border-gold-300 hover:bg-gold-50/30">
                        <CardBody>
                          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-slateGray">
                            {meta && <Icon className="h-4 w-4 text-gold-600" />}
                            {meta && t(meta.key)}
                          </div>
                          <h3 className="font-display text-base font-bold text-primary-900">{title}</h3>
                          {excerpt && <p className="mt-1 line-clamp-2 text-sm text-slateGray-dark">{excerpt}</p>}
                        </CardBody>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Pagination
              page={page}
              totalPages={Math.max(1, Math.ceil((query.data?.count ?? 0) / (query.data?.pageSize ?? 20)))}
              onChange={(next) => {
                const params = new URLSearchParams(searchParams);
                if (next === 1) params.delete('page');
                else params.set('page', String(next));
                setSearchParams(params);
              }}
            />
          </>
        )}
      </div>
    </>
  );
}
