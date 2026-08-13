import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Inbox, CalendarClock } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { PageHeader } from '@/components/layout/PageHeader';
import { authService, interactionService, contactService, queryKeys } from '@/services';
import { profileUpdateSchema, type ProfileUpdateValues } from '@/schemas/auth';
import { Card, CardBody, Input, Select, FieldWrapper, Button, useToast, EmptyState } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatNumber } from '@/lib/utils';

const FAVORITE_LINKS: Record<string, string> = {
  research: '/research',
  publication: '/research?tab=publication',
  supervision: '/supervision',
  discussion: '/discussions',
  project: '/projects',
  course: '/courses',
  lecture: '/courses',
};

export function AccountPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const toast = useToast();
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();

  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    values: {
      displayName: profile?.display_name ?? user?.email?.split('@')[0] ?? '',
      locale: profile?.locale ?? locale,
    },
  });

  const favoritesQuery = useQuery({
    queryKey: queryKeys.favorites,
    queryFn: () => interactionService.listMyFavorites(),
    enabled: Boolean(user),
  });

  const submissionsQuery = useQuery({
    queryKey: queryKeys.contactSubmissions(),
    queryFn: () => contactService.listMySubmissions(),
    enabled: Boolean(user),
  });

  const onSubmit = async (values: ProfileUpdateValues) => {
    try {
      await authService.updateProfile({ display_name: values.displayName, locale: values.locale });
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      if (values.locale !== i18n.language) await i18n.changeLanguage(values.locale);
      toast.success(t('account.saved'));
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  const favorites = favoritesQuery.data ?? [];
  const submissions = submissionsQuery.data ?? [];

  return (
    <>
      <Seo title={t('account.title')} />
      <PageHeader title={t('account.title')} />
      <div className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="h-fit">
            <CardBody>
              <h2 className="mb-4 font-display text-lg font-bold text-primary-900">{t('account.profile')}</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FieldWrapper label={t('account.displayName')} error={form.formState.errors.displayName?.message} id="acc-name">
                  <Input id="acc-name" {...form.register('displayName')} error={Boolean(form.formState.errors.displayName)} />
                </FieldWrapper>
                <FieldWrapper label={t('account.locale')} id="acc-locale">
                  <Select
                    id="acc-locale"
                    value={form.watch('locale')}
                    onChange={(e) => form.setValue('locale', e.target.value as 'ar' | 'en')}
                  >
                    <option value="ar">{t('lang.ar')}</option>
                    <option value="en">{t('lang.en')}</option>
                  </Select>
                </FieldWrapper>
                {user?.email && (
                  <p className="text-sm text-slateGray-dark" dir="ltr">
                    {user.email}
                  </p>
                )}
                <Button type="submit" className="w-full" isLoading={form.formState.isSubmitting}>
                  {t('common.save')}
                </Button>
              </form>
              {profile?.created_at && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-slateGray">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {t('account.memberSince')}: {formatDate(profile.created_at, locale)}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-primary-900">
                <Heart className="h-5 w-5 text-gold-500" />
                {t('account.myFavorites')}
              </h2>
              {favoritesQuery.isLoading ? (
                <p className="text-sm text-slateGray">{t('common.loading')}</p>
              ) : favorites.length === 0 ? (
                <EmptyState title={t('account.noFavorites')} />
              ) : (
                <ul className="space-y-2">
                  {favorites.map((favorite) => (
                    <li key={favorite.id}>
                      <a
                        href={FAVORITE_LINKS[favorite.content_type] ?? '/'}
                        className="flex items-center justify-between rounded-lg border border-primary-100 bg-primary-50/40 px-4 py-2.5 text-sm font-bold text-primary-800 transition-colors hover:border-gold-300 hover:bg-gold-50"
                      >
                        <span>{t(`map.groups.${favorite.content_type}`)}</span>
                        <span className="text-xs text-slateGray">{formatDate(favorite.created_at, locale)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-primary-900">
                <Inbox className="h-5 w-5 text-primary-500" />
                {t('account.mySubmissions')}
                {submissions.length > 0 && (
                  <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-700">
                    {formatNumber(submissions.length)}
                  </span>
                )}
              </h2>
              {submissionsQuery.isLoading ? (
                <p className="text-sm text-slateGray">{t('common.loading')}</p>
              ) : submissions.length === 0 ? (
                <EmptyState title={t('account.noSubmissions')} />
              ) : (
                <ul className="space-y-2">
                  {submissions.map((submission) => (
                    <li key={submission.id}>
                      <div className="rounded-lg border border-primary-100 bg-white px-4 py-2.5">
                        <p className="text-sm font-bold text-primary-800">{t(`contact.types.${submission.type}`)}</p>
                        <p className="line-clamp-2 text-xs text-slateGray-dark">{submission.message}</p>
                        <p className="mt-1 text-[10px] text-slateGray">{formatDate(submission.created_at, locale)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
