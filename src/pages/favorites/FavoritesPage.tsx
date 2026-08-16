import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { PageHeader } from '@/components/layout/PageHeader';
import { interactionService, queryKeys } from '@/services';
import { Card, CardBody, Badge, Button, EmptyState, LoadingState, ErrorState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';

const TYPE_LABEL_KEY: Record<string, string> = {
  research: 'admin.entities.research',
  publication: 'admin.entities.publications',
  supervision: 'admin.entities.supervision',
  discussion: 'admin.entities.discussions',
  project: 'admin.entities.projects',
  course: 'admin.entities.courses',
  lecture: 'admin.entities.lectures',
  news: 'admin.entities.news',
  insight: 'admin.entities.insights',
};

const STATUS_TONE: Record<string, 'green' | 'gray' | 'gold' | 'red'> = {
  published: 'green',
  draft: 'gray',
  scheduled: 'gold',
  archived: 'red',
};

export function FavoritesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'ar';
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => interactionService.resolveFavorites(),
    enabled: Boolean(user),
  });

  const removeMutation = useMutation({
    mutationFn: ({ contentType, contentId }: { contentType: string; contentId: string }) =>
      interactionService.removeFavorite(contentType, contentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
      queryClient.invalidateQueries({ queryKey: ['favorite', variables.contentType, variables.contentId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.metrics(variables.contentType, variables.contentId) });
    },
  });

  const items = query.data ?? [];

  return (
    <>
      <Seo title={t('favorites.title')} />
      <PageHeader title={t('favorites.title')} subtitle={t('favorites.subtitle')} />
      <div className="container-page py-10">
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState message={t('errors.generic')} onRetry={() => void query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title={t('favorites.empty')}
            description={t('favorites.emptyHint')}
            action={
              <Link to="/courses" className="btn-primary inline-flex">
                {t('nav.courses')}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item.favorite.id} className="shadow-elevated">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="ivory">
                      <Heart className="h-3 w-3 text-gold-500" />
                      {t(TYPE_LABEL_KEY[item.content_type] ?? 'map.groups.research')}
                    </Badge>
                    {item.status && (
                      <Badge tone={STATUS_TONE[item.status] ?? 'gray'}>
                        {item.status === 'published'
                          ? t('admin.published')
                          : item.status === 'draft'
                            ? t('admin.draft')
                            : item.status === 'scheduled'
                              ? t('admin.scheduled')
                              : t('admin.archived')}
                      </Badge>
                    )}
                  </div>

                  <Link
                    to={item.link}
                    className="line-clamp-2 font-display text-base font-bold text-primary-900 transition-colors hover:text-primary-600"
                  >
                    {locale === 'en' && item.title_en ? item.title_en : item.title_ar}
                  </Link>

                  {item.favorite.created_at && (
                    <p className="text-xs text-slateGray">
                      {t('favorites.addedAt')} {formatDate(item.favorite.created_at, locale)}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <Link to={item.link} className="btn-outline flex-1">
                      {t('common.view')}
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                      isLoading={removeMutation.isPending}
                      onClick={() =>
                        void removeMutation.mutateAsync({
                          contentType: item.content_type,
                          contentId: item.id,
                        })
                      }
                    >
                      {removeMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      {t('favorites.remove')}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
