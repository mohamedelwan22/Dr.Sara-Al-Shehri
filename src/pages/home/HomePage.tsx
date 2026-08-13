import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Download,
  Users,
  BookOpen,
  Calendar as CalendarIcon,
  Search,
  FolderKanban,
  Lock,
  Megaphone,
  GraduationCap,
  Award,
  UserCircle2,
  Bell,
  Sparkles,
  Quote,
  ArrowLeft,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { newsService, queryKeys, homepageService, type HomeStats } from '@/services';
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
  lock: Lock,
  'book-open': BookOpen,
  calendar: CalendarIcon,
  'folder-kanban': FolderKanban,
  'user-circle': UserCircle2,
  search: Search,
  'map-pin': MapPin,
};

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const navigate = useNavigate();
  const [sidebarSearch, setSidebarSearch] = useState('');

  const handleSidebarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (sidebarSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(sidebarSearch.trim())}`);
    }
  };

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

  const latestResearchQuery = useQuery({
    queryKey: queryKeys.home.latestResearch,
    queryFn: () => homepageService.getLatestResearch(6),
    retry: 1,
  });

  const newsList = newsQuery.data?.data ?? [];
  const bio = bioQuery.data;
  const bioSummary =
    bio?.body_ar && bio.body_ar.length > 0 ? (pickLang(bio.body_ar, bio.body_en, locale) ?? '') : '';

  const stats: HomeStats | undefined = statsQuery.data;
  const categories = categoriesQuery.data ?? [];
  const announcements = (announcementsQuery.data ?? []).slice(0, 4);
  const latestResearch = latestResearchQuery.data ?? [];

  return (
    <>
      <Seo />

      <div className="container-page py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ============================================================ */}
          {/* RIGHT SIDEBAR (Order 1 in Desktop RTL Grid = RIGHT COLUMN)   */}
          {/* ============================================================ */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4 order-2 lg:order-1">
            {/* 1. التقويم العلمي */}
            <HomeCalendar />

            {/* 2. تصنيفات المنصة */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <FolderKanban className="h-4 w-4 text-gold-600" />
                <h3 className="font-display text-sm font-bold text-primary-950">
                  {t('home.categories')}
                </h3>
              </div>

              {categoriesQuery.isPending ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : categoriesQuery.isError ? (
                <SectionError onRetry={() => void categoriesQuery.refetch()} />
              ) : categories.length === 0 ? (
                <p className="py-2 text-center text-xs text-slate-500">{t('home.noCategories')}</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {categories.map((cat) => (
                    <Link
                      key={cat.axis_id}
                      to={`/scientific-map/${cat.slug}`}
                      className="flex items-center justify-between border-b border-slate-50 py-1 transition-colors last:border-0 hover:bg-slate-50/60"
                    >
                      <span className="font-bold text-slate-700 hover:text-primary-800">
                        {pickLang(cat.name_ar, cat.name_en, locale)}
                      </span>
                      <span className="rounded bg-gold-50 px-2 py-0.5 text-[11px] font-bold text-gold-700">
                        {formatCount(cat.published_count)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                to="/scientific-map"
                className="mt-3 block text-center text-xs font-bold text-primary-700 hover:text-primary-900"
              >
                {t('home.viewAllCategories')}
              </Link>
            </div>

            {/* 3. البحث في الموقع */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                <Search className="h-4 w-4 text-gold-600" />
                <h3 className="font-display text-sm font-bold text-primary-950">
                  {t('home.searchTitle')}
                </h3>
              </div>
              <form onSubmit={handleSidebarSearch} className="relative">
                <input
                  type="search"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full h-9 rounded-full border border-slate-200 bg-slate-50 pe-4 ps-9 text-xs text-slate-800 focus:bg-white focus:border-primary-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute start-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-700"
                  aria-label={t('home.searchTitle')}
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* 4. تسجيل الدخول */}
            <Link
              to="/auth/sign-in"
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:border-gold-300 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-gold-600 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-950">{t('home.loginTitle')}</h4>
                  <p className="text-[10px] text-slate-500">{t('home.loginSubtitle')}</p>
                </div>
              </div>
              <ArrowLeft className="h-4 w-4 text-slate-400 rtl:rotate-180 group-hover:translate-x-[-2px] transition-transform" />
            </Link>
          </aside>

          {/* ============================================================ */}
          {/* MAIN AREA (Order 2 in Desktop RTL Grid = LEFT/MAIN AREA)     */}
          {/* ============================================================ */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-4 order-1 lg:order-2">
            {/* 1. HERO BANNER */}
            <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-l from-[#F3ECFB] via-[#FAF7FD] to-[#FFFDF9] p-6 lg:p-7 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative shrink-0 order-2 md:order-1">
                  <div className="overflow-hidden rounded-lg border border-amber-900/15 shadow-md bg-amber-950/5">
                    <img
                      src="/images/hero-books.png"
                      alt={t('home.altBooks')}
                      className="h-40 w-56 sm:h-44 sm:w-64 object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-start order-1 md:order-2">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-950 leading-tight">
                    {t('hero.title')}
                  </h1>
                  <p className="font-display text-base sm:text-lg font-bold text-gold-600 mt-1">
                    {t('hero.subtitle')}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium leading-relaxed max-w-xl">
                    {t('home.heroStatement')}
                  </p>
                  <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
                    <span className="h-0.5 w-12 bg-gold-400 rounded-full"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    <span className="h-0.5 w-12 bg-gold-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. STATISTICS STRIP (4 Horizontal Cards) */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statsQuery.isPending ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                ))
              ) : statsQuery.isError ? (
                <SectionError onRetry={() => void statsQuery.refetch()} className="sm:col-span-2 lg:col-span-4" />
              ) : stats ? (
                <>
                  <StatCard icon={Eye} label={t('home.statVisitors')} value={formatCount(stats.total_views)} />
                  <StatCard icon={Download} label={t('home.statDownloads')} value={formatCount(stats.total_downloads)} />
                  <StatCard icon={Users} label={t('home.statUsers')} value={formatCount(stats.total_users)} />
                  <StatCard icon={BookOpen} label={t('home.statResearch')} value={formatCount(stats.published_research)} />
                </>
              ) : null}
            </section>

            {/* 3. QUICK ACTIONS / ANNOUNCEMENTS STRIP */}
            <section className="rounded-xl border border-slate-200 bg-[#FAF9FC] p-4 shadow-sm">
              {announcementsQuery.isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2">
                      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </div>
              ) : announcementsQuery.isError ? (
                <SectionError onRetry={() => void announcementsQuery.refetch()} />
              ) : announcements.length === 0 ? (
                <p className="py-2 text-center text-xs font-bold text-slate-500">
                  {t('home.noAnnouncements')}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {announcements.map((ann) => {
                    const Icon = ANNOUNCEMENT_ICONS[ann.icon ?? ''] ?? Megaphone;
                    const title = pickLang(ann.title_ar, ann.title_en, locale);
                    const inner = (
                      <>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3C1B58] text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-primary-950 leading-snug">{title}</h4>
                          {ann.link_url && (
                            <p className="text-[10px] text-slate-500">{t('home.readMore')}</p>
                          )}
                        </div>
                      </>
                    );
                    const className = 'flex items-center gap-2.5 p-2';
                    if (ann.link_url) {
                      return ann.link_url.startsWith('/') ? (
                        <Link key={ann.id} to={ann.link_url} className={className}>
                          {inner}
                        </Link>
                      ) : (
                        <a
                          key={ann.id}
                          href={ann.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {inner}
                        </a>
                      );
                    }
                    return (
                      <div key={ann.id} className={className}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 4. MAIN CONTENT TWO-SUBCOLUMN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEFT SUBCOLUMN (RTL Left = Latest News) */}
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarIcon className="h-4 w-4 text-gold-600" />
                    <h3 className="font-display text-base font-bold text-primary-950">
                      {t('home.latestNews')}
                    </h3>
                  </div>
                  <div className="h-0.5 w-10 bg-gold-400 mb-4"></div>

                  {newsQuery.isPending ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-2 border-b border-slate-100 pb-2.5 last:border-0">
                          <Skeleton className="h-3 w-16 shrink-0 mt-1" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : newsQuery.isError ? (
                    <SectionError onRetry={() => void newsQuery.refetch()} />
                  ) : newsList.length === 0 ? (
                    <p className="py-6 text-center text-xs font-bold text-slate-500">
                      {t('home.noNews')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {newsList.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 border-b border-slate-100 pb-2.5 last:border-0">
                          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                            {(item.published_at ?? '').slice(0, 10).replace(/-/g, '/')}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-gold-500 mt-2 shrink-0"></span>
                          <Link
                            to={`/news/${item.slug}`}
                            className="text-xs font-bold text-slate-700 hover:text-primary-800 leading-snug line-clamp-2"
                          >
                            {pickLang(item.title_ar, item.title_en, locale)}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to="/news"
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors w-full"
                  >
                    <span>{t('home.viewAllNews')}</span>
                  </Link>
                </div>
              </section>

              {/* RIGHT SUBCOLUMN (RTL Right = Short Biography) */}
              <section className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <UserCircle2 className="h-4 w-4 text-gold-600" />
                    <h3 className="font-display text-base font-bold text-primary-950">
                      {t('home.bioSummary')}
                    </h3>
                  </div>
                  <div className="h-0.5 w-10 bg-gold-400 mb-3"></div>

                  {bioQuery.isPending ? (
                    <Skeleton className="h-32 w-full" />
                  ) : bioQuery.isError ? (
                    <SectionError onRetry={() => void bioQuery.refetch()} />
                  ) : !bioSummary ? (
                    <p className="py-6 text-center text-xs font-bold text-slate-500">
                      {t('home.noBiography')}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {bioSummary.length > 220 ? `${bioSummary.slice(0, 220).trim()}…` : bioSummary}
                    </p>
                  )}

                  <div className="mt-4">
                    <Link
                      to="/biography"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white py-1.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span>{t('home.readMore')}</span>
                    </Link>
                  </div>
                </div>

                {/* Attached Quran Arch Box */}
                <div className="rounded-xl border border-slate-200 bg-[#FAF7F2] p-4 shadow-sm flex items-center gap-4">
                  <img
                    src="/images/bio-quran.png"
                    alt={t('home.altQuran')}
                    className="h-20 w-24 object-cover rounded-lg border border-amber-900/10 shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <h4 className="font-display text-xs font-bold text-primary-950 leading-snug">
                      {t('home.quranTitle')}
                    </h4>
                    <p className="text-[11px] font-bold text-gold-700">{t('home.quranSubtitle')}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* 5. أحدث الإنتاج العلمي */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gold-600" />
                    <h3 className="font-display text-base font-bold text-primary-950">
                      {t('home.latestResearch')}
                    </h3>
                  </div>
                  <div className="h-0.5 w-10 bg-gold-400 mt-1"></div>
                </div>
                <Link
                  to="/research"
                  className="text-xs font-bold text-primary-700 hover:text-primary-900"
                >
                  {t('home.viewAllResearch')}
                </Link>
              </div>

              {latestResearchQuery.isPending ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 border-b border-slate-100 pb-2.5 last:border-0">
                      <Skeleton className="h-5 w-14 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : latestResearchQuery.isError ? (
                <SectionError onRetry={() => void latestResearchQuery.refetch()} />
              ) : latestResearch.length === 0 ? (
                <p className="py-6 text-center text-xs font-bold text-slate-500">
                  {t('home.noResearch')}
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {latestResearch.map((item) => (
                    <li key={`${item.kind}-${item.id}`} className="flex items-start gap-3 border-b border-slate-100 pb-2.5 last:border-0">
                      <span className="rounded bg-gold-50 px-2 py-0.5 text-[11px] font-bold text-gold-700 shrink-0 mt-0.5">
                        {t(`home.researchType.${item.kind}`)}
                      </span>
                      <Link
                        to={item.kind === 'publication' ? `/publications/${item.slug}` : `/research/${item.slug}`}
                        className="text-xs font-bold text-slate-700 hover:text-primary-800 leading-snug line-clamp-2"
                      >
                        {pickLang(item.title_ar, item.title_en, locale)}
                      </Link>
                      {item.published_at && (
                        <span className="ms-auto text-[11px] font-bold text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                          {(item.published_at ?? '').slice(0, 10).replace(/-/g, '/')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* 6. الخريطة العلمية */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-600" />
                <h3 className="font-display text-base font-bold text-primary-950">
                  {t('home.scientificMap')}
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-500">{t('home.mapDescription')}</p>
              <div className="h-0.5 w-10 bg-gold-400 mt-2"></div>

              {categoriesQuery.isPending ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-32 rounded-full" />
                  ))}
                </div>
              ) : categoriesQuery.isError ? (
                <SectionError onRetry={() => void categoriesQuery.refetch()} />
              ) : categories.length === 0 ? (
                <p className="py-6 text-center text-xs font-bold text-slate-500">
                  {t('home.noCategories')}
                </p>
              ) : (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categories.map((axis) => (
                      <Link
                        key={axis.axis_id}
                        to={`/scientific-map/${axis.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50/60 px-3 py-1.5 text-xs font-bold text-primary-800 transition-colors hover:border-gold-300 hover:bg-gold-50"
                      >
                        <span>{pickLang(axis.name_ar, axis.name_en, locale)}</span>
                        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-gold-700 shadow-sm">
                          {formatCount(axis.published_count)}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      to="/scientific-map"
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors w-full"
                    >
                      <span>{t('home.exploreAxes')}</span>
                    </Link>
                  </div>
                </>
              )}
            </section>

            {/* 7. BOTTOM QUICK LINK CARDS */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <Link
                to="/news"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-gold-300 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-950">{t('home.quickUpdates')}</h4>
                  <p className="text-[10px] text-slate-500">{t('home.quickUpdatesSub')}</p>
                </div>
              </Link>

              <Link
                to="/insights"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-gold-300 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <Quote className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-950">{t('home.quickInsights')}</h4>
                  <p className="text-[10px] text-slate-500">{t('home.quickInsightsSub')}</p>
                </div>
              </Link>

              <Link
                to="/scientific-map"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-gold-300 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-950">{t('home.quickAssistant')}</h4>
                  <p className="text-[10px] text-slate-500">{t('home.quickAssistantSub')}</p>
                </div>
              </Link>

              <Link
                to="/auth/sign-in"
                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-gold-300 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-primary-950">{t('home.loginTitle')}</h4>
                  <p className="text-[10px] text-slate-500">{t('home.loginSubtitle')}</p>
                </div>
              </Link>
            </section>
          </main>
        </div>
      </div>
    </>
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
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3C1B58] text-white">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-tight">{value}</p>
        <p className="text-[11px] font-bold text-slate-500">{label}</p>
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
