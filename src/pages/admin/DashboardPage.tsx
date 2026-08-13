import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Eye, Download, Inbox, Heart, Activity } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui';
import { formatDate } from '@/lib/utils';

const STAT_CARDS = [
  { key: 'total_views', label: 'admin.totalViews', icon: Eye },
  { key: 'total_downloads', label: 'admin.totalDownloads', icon: Download },
  { key: 'total_submissions', label: 'admin.totalSubmissions', icon: Inbox },
  { key: 'total_favorites', label: 'admin.totalFavorites', icon: Heart },
];

export function DashboardPage() {
  const { t } = useTranslation();

  const overview = useQuery({
    queryKey: queryKeys.admin.analytics,
    queryFn: () => adminContentService.analyticsOverview(),
  });

  const logs = useQuery({
    queryKey: queryKeys.admin.auditLogs,
    queryFn: () => adminContentService.listAuditLogs(10),
  });

  if (overview.isPending || logs.isPending) return <LoadingState />;
  if (overview.isError || logs.isError) {
    return (
      <ErrorState
        message={t('errors.generic')}
        onRetry={() => {
          void overview.refetch();
          void logs.refetch();
        }}
      />
    );
  }

  const stats = overview.data ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary-900">{t('admin.statistics')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="shadow-elevated">
            <CardBody className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-900" dir="ltr">
                  {stats[key] ?? 0}
                </p>
                <p className="text-sm text-slateGray">{t(label)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t('admin.auditLogs')}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {logs.data?.length ? (
              <ul className="divide-y divide-slate-200">
                {logs.data.map((log) => (
                  <li key={log.id} className="py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-primary-900">
                        {t(`admin.actions.${log.action}`, log.action)}
                      </p>
                      <span className="text-xs text-slateGray" dir="ltr">
                        {formatDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slateGray">
                      {log.entity_type} — {log.entity_id}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-slateGray">{t('admin.noData')}</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              {t('admin.contacts')}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {(
                ['new', 'in_review', 'responded'] as const
              ).map((status) => {
                const count = stats[`submissions_${status}`] ?? stats[`status_${status}`] ?? 0;
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-primary-900">
                      {t(`admin.${status}`)}
                    </span>
                    <span className="text-lg font-bold text-primary-900" dir="ltr">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
