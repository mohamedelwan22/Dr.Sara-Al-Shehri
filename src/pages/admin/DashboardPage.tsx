import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Download,
  Share2,
  Inbox,
  Heart,
  Users,
  Newspaper,
  BookOpen,
  Presentation,
  Lightbulb,
  Megaphone,
  CalendarDays,
  Plus,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { adminContentService, ADMIN_ENTITY_MAP, type DashboardPeriod } from '@/services/adminContentService';
import type { DashboardStats } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { LoadingState, ErrorState, Badge } from '@/components/ui';
import { SeriesChart, StatusBar, type SeriesDatum } from '@/components/charts/SeriesChart';
import { formatNumber, formatDate } from '@/lib/utils';
import { CONTACT_STATUS_LABEL_KEYS } from '@/features/admin/adminConfig';

const PERIODS: DashboardPeriod[] = ['7d', '30d', '90d'];

type KPIKey = 'views' | 'downloads' | 'shares' | 'favorites' | 'submissions' | 'users';

const KPI_CARDS: { key: KPIKey; label: string; icon: LucideIcon; tone: string }[] = [
  { key: 'views', label: 'admin.totalViews', icon: Eye, tone: 'bg-primary-100 text-primary-700' },
  { key: 'downloads', label: 'admin.totalDownloads', icon: Download, tone: 'bg-emerald-100 text-emerald-700' },
  { key: 'shares', label: 'admin.totalShares', icon: Share2, tone: 'bg-sky-100 text-sky-700' },
  { key: 'favorites', label: 'admin.totalFavorites', icon: Heart, tone: 'bg-gold-100 text-gold-700' },
  { key: 'submissions', label: 'admin.totalSubmissions', icon: Inbox, tone: 'bg-violet-100 text-violet-700' },
  { key: 'users', label: 'admin.totalUsers', icon: Users, tone: 'bg-slate-200 text-slate-700' },
];

const STATUS_SEGMENT_TONE: Record<string, string> = {
  published: 'bg-emerald-500',
  draft: 'bg-slate-400',
  scheduled: 'bg-amber-500',
  archived: 'bg-red-400',
};

const RECENT_ENTITY_KEYS: Record<string, string> = {
  research: 'research',
  publication: 'publications',
  supervision: 'supervision',
  discussion: 'discussions',
  project: 'projects',
  course: 'courses',
  lecture: 'lectures',
  axis: 'axes',
  insight: 'insights',
  news: 'news',
  interest: 'interests',
  calendar: 'calendar',
  announcement: 'announcements',
};

const QUICK_ACTIONS: { entity: string; labelKey: string; icon: LucideIcon }[] = [
  { entity: 'news', labelKey: 'admin.entities.news', icon: Newspaper },
  { entity: 'research', labelKey: 'admin.entities.research', icon: BookOpen },
  { entity: 'courses', labelKey: 'admin.entities.courses', icon: Presentation },
  { entity: 'projects', labelKey: 'admin.entities.projects', icon: Lightbulb },
  { entity: 'announcements', labelKey: 'admin.entities.announcements', icon: Megaphone },
  { entity: 'calendar', labelKey: 'admin.entities.calendar', icon: CalendarDays },
];

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  const [period, setPeriod] = useState<DashboardPeriod>('30d');

  const stats = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => adminContentService.dashboardStats(),
    retry: 1,
  });

  const series = useQuery({
    queryKey: queryKeys.admin.dashboardSeries(period),
    queryFn: () => adminContentService.dashboardSeries(period),
    retry: 1,
  });

  if (stats.isPending && series.isPending) return <LoadingState />;
  if (stats.isError && series.isError) {
    return (
      <ErrorState
        message={t('errors.generic')}
        onRetry={() => {
          void stats.refetch();
          void series.refetch();
        }}
      />
    );
  }

  const s = stats.data ?? {
    totals: { views: 0, downloads: 0, shares: 0, favorites: 0, submissions: 0, users: 0, new_submissions: 0, submissions_by_status: { new: 0, in_review: 0, responded: 0, closed: 0 } },
    content: { published: 0, draft: 0, scheduled: 0, archived: 0 },
    announcements: { active: 0, inactive: 0 },
    entities: {} as DashboardStats['entities'],
    recent: [],
  };
  const totals = s.totals ?? { views: 0, downloads: 0, shares: 0, favorites: 0, submissions: 0, users: 0, new_submissions: 0, submissions_by_status: { new: 0, in_review: 0, responded: 0, closed: 0 } };
  const chartData: SeriesDatum[] = (series.data?.points ?? []).map((p) => ({
    date: p.date,
    views: p.views,
    downloads: p.downloads,
  }));

  const statusSegments = [
    { key: 'published', value: s.content.published, className: STATUS_SEGMENT_TONE.published, label: t('admin.published') },
    { key: 'draft', value: s.content.draft, className: STATUS_SEGMENT_TONE.draft, label: t('admin.draft') },
    { key: 'scheduled', value: s.content.scheduled, className: STATUS_SEGMENT_TONE.scheduled, label: t('admin.scheduled') },
    { key: 'archived', value: s.content.archived, className: STATUS_SEGMENT_TONE.archived, label: t('admin.archived') },
  ];

  const entityRows = Object.entries(ADMIN_ENTITY_MAP).map(([entityKey, { table }]) => {
    const stat = s.entities[table];
    return { entityKey, stat };
  });

  const statusLabels = {
    draft: t('admin.draft'),
    published: t('admin.published'),
    scheduled: t('admin.scheduled'),
    archived: t('admin.archived'),
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-900">{t('admin.statistics')}</h1>
          <p className="mt-1 text-sm text-slateGray">{t('admin.dashboardSubtitle')}</p>
        </div>
      </div>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {KPI_CARDS.map(({ key, label, icon: Icon, tone }) => (
          <Card key={key} className="shadow-elevated">
            <CardBody className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight text-primary-900" dir="ltr">
                  {formatNumber(totals[key], locale)}
                </p>
                <p className="truncate text-xs text-slateGray">{t(label)}</p>
                {key === 'submissions' && totals.new_submissions > 0 && (
                  <Badge tone="red" className="mt-1">
                    {t('admin.new')} {formatNumber(totals.new_submissions, locale)}
                  </Badge>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* مخطط التفاعل */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('admin.engagement')}</CardTitle>
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5" dir="ltr">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    period === p ? 'bg-primary-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  {t(`admin.period${p}`)}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardBody>
            <div className="mb-4 flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slateGray-dark">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
                {t('admin.totalViews')}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slateGray-dark">
                <span className="h-2.5 w-2.5 rounded-sm bg-gold-500" />
                {t('admin.totalDownloads')}
              </span>
            </div>
            <SeriesChart data={chartData} />
          </CardBody>
        </Card>

        {/* توزيع الحالات */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.statusBreakdown')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <StatusBar segments={statusSegments} />
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-2 text-xs font-bold text-slateGray">{t('admin.entities.announcements')}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slateGray-dark">{t('admin.announcementsActive')}</span>
                <b className="text-primary-900" dir="ltr">
                  {formatNumber(s.announcements.active, locale)}
                </b>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-slateGray-dark">{t('admin.announcementsInactive')}</span>
                <b className="text-primary-900" dir="ltr">
                  {formatNumber(s.announcements.inactive, locale)}
                </b>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* نظرة على المحتوى */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('admin.contentOverview')}</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {entityRows.map(({ entityKey, stat }) => (
                <Link
                  key={entityKey}
                  to={`/admin/${entityKey}`}
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-primary-300 hover:bg-primary-50/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary-900">{t(`admin.entities.${entityKey}`)}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slateGray">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {t('admin.published')} {stat?.published ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {t('admin.draft')} {stat?.draft ?? 0}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <b className="text-lg text-primary-900" dir="ltr">
                      {stat?.total ?? 0}
                    </b>
                    <ArrowLeft className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary-500" />
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* إجراءات سريعة + صندوق التواصل */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.quickActions')}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_ACTIONS.map(({ entity, labelKey, icon: Icon }) => (
                  <Link
                    key={entity}
                    to={`/admin/${entity}/new`}
                    className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-primary-800 transition-colors hover:border-gold-300 hover:bg-gold-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 truncate">{t(labelKey)}</span>
                    <Plus className="h-4 w-4 text-gold-600" />
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary-500" />
                {t('admin.inboxSummary')}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {(['new', 'in_review', 'responded', 'closed'] as const).map((status) => (
                  <Link
                    key={status}
                    to="/admin/inbox"
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50"
                  >
                    <span className="font-semibold text-primary-900">{t(CONTACT_STATUS_LABEL_KEYS[status])}</span>
                    <span className="text-slateGray" dir="ltr">
                      {totals.submissions_by_status?.[status] ?? 0}
                    </span>
                  </Link>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* أحدث المحتوى */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.recentContent')}</CardTitle>
          <Badge tone="gray">{t('admin.recentContentHint')}</Badge>
        </CardHeader>
        <CardBody>
          {s.recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-slateGray">{t('admin.noActivity')}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {s.recent.map((item) => {
                const adminKey = RECENT_ENTITY_KEYS[item.entity];
                const title = locale === 'en' && item.title_en ? item.title_en : item.title_ar;
                const status = item.status as 'published' | 'draft' | 'scheduled' | 'archived';
                return (
                  <li key={`${item.entity}-${item.id}`}>
                    <Link
                      to={`/admin/${adminKey}/${item.id}/edit`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 transition-colors hover:bg-primary-50/40"
                    >
                      <Badge tone="ivory">{t(`admin.entities.${adminKey}`)}</Badge>
                      <p className="min-w-0 flex-1 truncate text-sm font-bold text-primary-900">{title}</p>
                      <Badge
                        tone={
                          status === 'published' ? 'green' : status === 'draft' ? 'gray' : status === 'scheduled' ? 'gold' : 'red'
                        }
                      >
                        {statusLabels[status]}
                      </Badge>
                      <span className="text-xs text-slateGray" dir="ltr">
                        {formatDate(item.updated_at, locale)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
