import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  Award,
  Bell,
  BookMarked,
  BookOpen,
  Calendar as CalendarIcon,
  Download,
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  Library,
  LogIn,
  Megaphone,
  Quote,
  Search,
  Sparkles,
  UserCircle2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import {
  homepageService,
  newsService,
  queryKeys,
  researchService,
  supervisionService,
  type HomeCategory,
  type HomeStats,
} from '@/services';
import { profileContentService } from '@/services/contentService';
import { pickLang } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { HomeCalendar } from './HomeCalendar';

const ANNOUNCEMENT_ICONS: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  award: Award,
  'graduation-cap': GraduationCap,
  users: Users,
  bell: Bell,
  sparkles: Sparkles,
  quote: Quote,
  'book-open': BookOpen,
  calendar: CalendarIcon,
  'folder-kanban': FolderKanban,
  'user-circle': UserCircle2,
  search: Search,
};

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const newsQuery = useQuery({
    queryKey: queryKeys.news({ home: true }),
    queryFn: () => newsService.listNews({ pageSize: 4 }),
    retry: 1,
  });

  const bioQuery = useQuery({
    queryKey: queryKeys.profileContent('biography'),
    queryFn: () => profileContentService.getSection('biography'),
    retry: 1,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.home.stats,
    queryFn: () => homepageService.getStats(),
    retry: 1,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.home.categories,
    queryFn: () => homepageService.getCategories(),
    retry: 1,
  });

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements,
    queryFn: () => newsService.listAnnouncements(),
    retry: 1,
  });

  const publicationCountQuery = useQuery({
    queryKey: queryKeys.publications({ homeSelectionCount: true }),
    queryFn: () => researchService.listPublications({ pageSize: 1 }),
    retry: 1,
  });

  const supervisionCountQuery = useQuery({
    queryKey: queryKeys.supervision({ homeSelectionCount: true }),
    queryFn: () => supervisionService.listSupervision({ pageSize: 1 }),
    retry: 1,
  });

  const newsList = newsQuery.data?.data ?? [];
  const bio = bioQuery.data;
  const bioSummary =
    bio?.body_ar && bio.body_ar.length > 0 ? (pickLang(bio.body_ar, bio.body_en, locale) ?? '') : '';

  const stats: HomeStats | undefined = statsQuery.data;
  const categories = categoriesQuery.data ?? [];
  const announcements = (announcementsQuery.data ?? []).slice(0, 4);
  const beneficiaryCount = categories.reduce((acc, category) => acc + category.published_count, 0);

  return (
    <>
      <Seo />

      <div className="container-page py-3.5">
        <div className="grid grid-cols-1 gap-3.5 items-start lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* ============================================================ */}
          {/* RIGHT SIDEBAR (Desktop RTL = Right Column)                  */}
          {/* ============================================================ */}
          <aside className="order-2 space-y-2.5 lg:order-1">
            {/* 1. التقويم العلمي */}
            <HomeCalendar />

            {/* 2. تصنيفات المنصة */}
            <CategoriesCard categories={categories} query={categoriesQuery} locale={locale} />

            {/* 3. آخر الأخبار */}
            <LatestNewsCard
              newsList={newsList}
              query={newsQuery}
              locale={locale}
              title={t('home.latestNews')}
              noNews={t('home.noNews')}
              viewAll={t('home.viewAllNews')}
            />
          </aside>

          {/* ============================================================ */}
          {/* MAIN CONTENT AREA (Desktop RTL = Left Column)               */}
          {/* ============================================================ */}
          <main className="order-1 space-y-3.5 lg:order-2">
            {/* 1. HERO BANNER */}
            <section className="relative flex min-h-[210px] items-center overflow-hidden rounded-xl border border-[#E7DFED] bg-white shadow-[0_1px_4px_rgb(53_20_92_/_0.06)] sm:min-h-[230px] md:h-[266px]">
              <img
                src="/images/hero.jpg"
                alt={t('home.altBooks')}
                loading="eager"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-left"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-white/78" />

              <div className="relative z-10 me-auto flex max-w-xl flex-col items-center justify-center px-6 py-5 text-center md:items-start md:ps-12 md:pe-9 md:text-start">
                <h1 className="font-display text-2xl font-extrabold leading-tight text-[#35145C] sm:text-3xl lg:text-[2.55rem]">
                  {t('hero.title')}
                </h1>
                <p className="mt-1 font-display text-base font-bold text-[#D89A16] sm:text-xl">
                  {t('hero.subtitle')}
                </p>
                <p className="mt-2 text-xs font-bold leading-relaxed text-[#35145C] sm:text-sm">
                  {t('home.heroStatement')}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 md:justify-start">
                  <span className="h-px w-20 bg-[#D89A16]/65" />
                  <span className="text-[11px] font-bold text-[#D89A16]">◆</span>
                  <span className="h-px w-20 bg-[#D89A16]/65" />
                </div>
              </div>
            </section>

            {/* 2. STATISTICS STRIP (4 Horizontal Cards) */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statsQuery.isPending ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex min-h-[84px] items-center gap-3 rounded-xl border border-[#E7DFED] bg-white p-3 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]"
                  >
                    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                ))
              ) : statsQuery.isError ? (
                <SectionError onRetry={() => void statsQuery.refetch()} className="col-span-2 sm:col-span-4" />
              ) : stats ? (
                <>
                  <StatCard icon={Eye} label={t('home.statVisitors')} value={formatCount(stats.total_views)} />
                  <StatCard icon={Download} label={t('home.statDownloads')} value={formatCount(stats.total_downloads)} />
                  <StatCard icon={Users} label={t('home.statUsers')} value={formatCount(beneficiaryCount)} />
                  <StatCard icon={BookOpen} label={t('home.statResearch')} value={formatCount(stats.published_research)} />
                </>
              ) : null}
            </section>

            {/* 3. ANNOUNCEMENTS STRIP */}
            <section className="flex min-h-[88px] rounded-xl border border-[#E7DFED] bg-[#FBF8FD] px-4 py-3 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
              <div className="flex w-full flex-col gap-2">
                <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                  <div className="flex shrink-0 items-center gap-2 px-1 md:w-[162px]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35145C] text-white">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <h3 className="font-display text-[15px] font-extrabold text-[#35145C]">
                      {t('home.announcements')}
                    </h3>
                  </div>

                  {announcementsQuery.isPending ? (
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2.5 p-2">
                          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  ) : announcementsQuery.isError ? (
                    <SectionError onRetry={() => void announcementsQuery.refetch()} className="flex-1" />
                  ) : announcements.length === 0 ? (
                    <p className="flex-1 py-2 text-center text-xs font-bold text-slate-500">
                      {t('home.noAnnouncements')}
                    </p>
                  ) : (
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                      {announcements.slice(0, 3).map((ann, index) => {
                        const Icon = ANNOUNCEMENT_ICONS[ann.icon ?? ''] ?? Megaphone;
                        const title = pickLang(ann.title_ar, ann.title_en, locale);
                        const body = pickLang(ann.body_ar, ann.body_en, locale);
                        const inner = (
                          <>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#35145C] text-white">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold leading-snug text-[#35145C]">{title}</h4>
                              {body && <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-500">{body}</p>}
                            </div>
                          </>
                        );
                        const className =
                          'flex min-w-0 items-center gap-2.5 border-s border-[#E2D9E8] px-3 py-1.5 transition-colors hover:bg-white/70 first:border-s-0';
                        const key = ann.id ?? index;
                        if (ann.link_url) {
                          return ann.link_url.startsWith('/') ? (
                            <Link key={key} to={ann.link_url} className={className}>
                              {inner}
                            </Link>
                          ) : (
                            <a key={key} href={ann.link_url} target="_blank" rel="noopener noreferrer" className={className}>
                              {inner}
                            </a>
                          );
                        }
                        return (
                          <div key={key} className={className}>
                            {inner}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  <span className="h-2 w-2 rounded-full bg-[#35145C]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                </div>
              </div>
            </section>

            {/* 4. MAIN 3-CARD GRID */}
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {/* CARD 1 (Right in RTL): الوقوف مع السنة */}
              <section className="relative flex min-h-[180px] flex-col justify-center overflow-hidden rounded-xl border border-[#E7DFED] bg-white shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
                <img
                  src="/images/wedget-main.jpg"
                  alt="الوقوف مع السنة"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-left"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/24 to-white/76" />
                <div className="relative z-10 me-auto flex w-[60%] flex-col justify-center p-4 text-start text-[#35145C] sm:w-[56%]">
                  <h3 className="font-display text-base font-extrabold leading-snug text-[#35145C] sm:text-lg">
                    الوقوف مع السنة
                  </h3>
                  <p className="mt-1 font-display text-xs font-bold text-[#35145C] sm:text-sm">
                    فهماً ودراسة وتحقيقاً
                  </p>
                  <div className="mt-2 text-xs font-bold leading-relaxed text-[#35145C]">
                    <p>مسؤولية علمية</p>
                    <p>وأمانة شرعية</p>
                  </div>
                </div>
              </section>

              {/* CARD 2 (Middle in RTL): تعريف مختصر */}
              <section className="flex flex-col justify-between rounded-xl border border-[#E7DFED] bg-white p-4 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-[#D89A16]" />
                    <h3 className="font-display text-base font-extrabold text-[#35145C]">
                      {t('home.bioSummary')}
                    </h3>
                  </div>
                  <div className="mb-2 h-0.5 w-10 bg-[#D89A16]" />

                  {bioQuery.isPending ? (
                    <Skeleton className="h-20 w-full" />
                  ) : bioQuery.isError ? (
                    <SectionError onRetry={() => void bioQuery.refetch()} />
                  ) : !bioSummary ? (
                    <p className="py-3 text-center text-xs font-bold text-slate-500">{t('home.noBiography')}</p>
                  ) : (
                    <p className="line-clamp-3 text-xs font-medium leading-[1.8] text-[#35145C]">
                      {bioSummary.length > 170 ? `${bioSummary.slice(0, 170).trim()}…` : bioSummary}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-1">
                  <Link
                    to="/biography"
                    className="inline-flex items-center justify-center rounded-lg border border-[#CFC2DA] bg-white px-4 py-1 text-xs font-bold text-[#35145C] transition-colors hover:border-[#D89A16] hover:bg-[#FFF8E8]"
                  >
                    <span>{t('home.readMore')}</span>
                  </Link>
                </div>
              </section>

              {/* CARD 3 (Left in RTL): مختارات علمية */}
              <ScientificSelectionsCard
                stats={stats}
                publicationCount={publicationCountQuery.data?.count}
                supervisionCount={supervisionCountQuery.data?.count}
                isPending={statsQuery.isPending || publicationCountQuery.isPending || supervisionCountQuery.isPending}
                isError={statsQuery.isError || publicationCountQuery.isError || supervisionCountQuery.isError}
                onRetry={() => {
                  void statsQuery.refetch();
                  void publicationCountQuery.refetch();
                  void supervisionCountQuery.refetch();
                }}
              />
            </div>

            {/* 5. QUICK ACCESS ROW */}
            <QuickAccessRow />
          </main>
        </div>
      </div>
    </>
  );
}

function CategoriesCard({
  categories,
  query,
  locale,
}: {
  categories: HomeCategory[];
  query: Pick<UseQueryResult<HomeCategory[], Error>, 'isPending' | 'isError' | 'refetch'>;
  locale: 'ar' | 'en';
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-[#E7DFED] bg-white p-4 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
        <FolderKanban className="h-4 w-4 text-[#D89A16]" />
        <h3 className="font-display text-[15px] font-extrabold text-[#35145C]">{t('home.categories')}</h3>
      </div>

      {query.isPending ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <SectionError onRetry={() => void query.refetch()} />
      ) : categories.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-500">{t('home.noCategories')}</p>
      ) : (
        <div className="space-y-1.5 text-xs">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.axis_id}
              to={`/scientific-map/${cat.slug}`}
              className="flex items-center justify-between rounded-md py-1.5 transition-colors hover:bg-slate-50/70"
            >
              <span className="font-bold text-[#35145C]">{pickLang(cat.name_ar, cat.name_en, locale)}</span>
              <span className="min-w-10 rounded-md bg-[#FFF8E8] px-2 py-0.5 text-center text-[11px] font-extrabold text-[#D89A16]">
                {formatCount(cat.published_count)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/scientific-map"
        className="mt-3 block text-center text-xs font-bold text-[#35145C] transition-colors hover:text-[#D89A16]"
      >
        + {t('home.viewAllCategories')}
      </Link>
    </div>
  );
}

function LatestNewsCard({
  newsList,
  query,
  locale,
  title,
  noNews,
  viewAll,
}: {
  newsList: Array<{ id: string; slug: string; title_ar: string; title_en: string | null; published_at: string | null }>;
  query: Pick<UseQueryResult<unknown, Error>, 'isPending' | 'isError' | 'refetch'>;
  locale: 'ar' | 'en';
  title: string;
  noNews: string;
  viewAll: string;
}) {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-[#E7DFED] bg-white p-4 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#D89A16]" />
          <h3 className="font-display text-base font-extrabold text-[#35145C]">{title}</h3>
        </div>
        <div className="mb-3 h-0.5 w-10 bg-[#D89A16]" />

        {query.isPending ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-14 shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <SectionError onRetry={() => void query.refetch()} />
        ) : newsList.length === 0 ? (
          <p className="py-4 text-center text-xs font-bold text-slate-500">{noNews}</p>
        ) : (
          <div className="space-y-1.5">
            {newsList.map((item) => (
              <div key={item.id} className="flex items-start gap-2 border-b border-slate-100 pb-1.5 last:border-0">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D89A16]" />
                <Link
                  to={`/news/${item.slug}`}
                  className="line-clamp-1 flex-1 text-xs font-bold leading-snug text-[#35145C] hover:text-[#D89A16]"
                >
                  {pickLang(item.title_ar, item.title_en, locale)}
                </Link>
                <span className="mt-0.5 shrink-0 whitespace-nowrap text-[10px] font-bold text-slate-500">
                  {(item.published_at ?? '').slice(0, 10).replace(/-/g, '/')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-1">
        <Link
          to="/news"
          className="inline-flex w-full items-center justify-center rounded-lg border border-[#E7DFED] bg-white py-1.5 text-xs font-bold text-[#35145C] transition-colors hover:border-[#D89A16] hover:bg-[#FFF8E8]"
        >
          <span>{viewAll}</span>
        </Link>
      </div>
    </section>
  );
}

function ScientificSelectionsCard({
  stats,
  publicationCount,
  supervisionCount,
  isPending,
  isError,
  onRetry,
}: {
  stats: HomeStats | undefined;
  publicationCount: number | undefined;
  supervisionCount: number | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  const rows = [
    { label: 'الأبحاث المختارة', value: stats?.published_research ?? 0, icon: FileText },
    { label: 'المؤلفات المختارة', value: publicationCount ?? 0, icon: Library },
    { label: 'الرسائل العلمية المتميزة', value: supervisionCount ?? 0, icon: GraduationCap },
  ];

  return (
    <section className="flex flex-col justify-between rounded-xl border border-[#E7DFED] bg-white p-4 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)]">
      <div>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-extrabold text-[#35145C]">مختارات علمية</h3>
            <p className="mt-0.5 text-[10px] font-bold text-[#35145C]/80">أبحاث ومؤلفات ورسائل مختارة للباحثين</p>
          </div>
          <BookMarked className="h-7 w-7 shrink-0 text-[#35145C]" />
        </div>

        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : isError ? (
          <SectionError onRetry={onRetry} />
        ) : (
          <div className="space-y-2">
            {rows.map(({ label, value, icon: Icon }) => (
              <div key={label} className="grid grid-cols-[24px_1fr_auto] items-center gap-2">
                <Icon className="h-4 w-4 text-[#35145C]" />
                <span className="text-xs font-bold text-[#35145C]">{label}</span>
                <span className="min-w-9 rounded-md bg-[#FFF8E8] px-2 py-0.5 text-center text-[11px] font-extrabold text-[#D89A16]">
                  {formatCount(value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function QuickAccessRow() {
  const { t } = useTranslation();

  const items = [
    { to: '/auth/sign-in', icon: LogIn, title: t('home.loginTitle'), subtitle: t('home.loginSubtitle') },
    { to: '/scientific-map', icon: Sparkles, title: t('home.quickAssistant'), subtitle: t('home.quickAssistantSub') },
    { to: '/insights', icon: Quote, title: t('home.quickInsights'), subtitle: t('home.quickInsightsSub') },
    { to: '/news', icon: Bell, title: t('home.quickUpdates'), subtitle: t('home.quickUpdatesSub') },
  ];

  return (
    <section aria-label={t('home.quickAccess')} className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ to, icon: Icon, title, subtitle }) => (
        <Link
          key={to}
          to={to}
          className="group flex min-h-[72px] items-center gap-3 rounded-xl border border-[#E7DFED] bg-white px-4 py-3 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)] transition-all hover:border-[#D89A16] hover:bg-[#FFF8E8]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#35145C] text-white shadow-[0_6px_14px_-8px_rgb(53_20_92_/_0.8)]">
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold text-[#35145C]">{title}</span>
            <span className="mt-0.5 block truncate text-[11px] font-bold text-[#35145C]/80">{subtitle}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[92px] items-center gap-3 rounded-xl border border-[#E7DFED] bg-white px-3.5 py-2.5 shadow-[0_1px_4px_rgb(53_20_92_/_0.05)] transition-all hover:border-[#D89A16]">
      <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-[#35145C] text-white shadow-[0_6px_14px_-8px_rgb(53_20_92_/_0.8)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-extrabold leading-none text-[#35145C] sm:text-[1.35rem]">{value}</p>
        <p className="mt-1 truncate text-[11px] font-bold text-[#35145C]/90">{label}</p>
      </div>
    </div>
  );
}

function SectionError({
  onRetry,
  className,
}: {
  onRetry: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2.5 text-xs font-medium text-red-800 ${className ?? ''}`}
    >
      <span>{t('common.error')}</span>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded border border-red-200 bg-white px-2 py-1 font-bold text-red-700 transition-colors hover:bg-red-50"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}


