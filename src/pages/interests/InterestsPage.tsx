import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Microscope } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { requireSupabase } from '@/lib/supabase';
import { queryKeys } from '@/services';
import { Card, CardBody, CardTitle, ErrorState, SkeletonGrid, EmptyState } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { ResearchInterest } from '@/types';

async function fetchInterests(): Promise<ResearchInterest[]> {
  const { data, error } = await requireSupabase()
    .from('research_interests')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as ResearchInterest[]) ?? [];
}

export function InterestsPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const query = useQuery({ queryKey: queryKeys.interests, queryFn: fetchInterests });
  const interests = query.data ?? [];

  return (
    <>
      <Seo title={t('interests.title')} description={t('interests.subtitle')} />
      <PageHeader title={t('interests.title')} subtitle={t('interests.subtitle')} />
      <div className="container-page py-10">
        {query.isLoading ? (
          <SkeletonGrid count={6} />
        ) : query.isError ? (
          <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />
        ) : interests.length === 0 ? (
          <EmptyState title={t('interests.noItems')} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {interests.map((interest) => (
              <Card key={interest.id}>
                <CardBody>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-100 text-gold-600">
                    <Microscope className="h-6 w-6" />
                  </div>
                  <CardTitle className="mb-2">
                    {pickLang(interest.title_ar, interest.title_en, locale)}
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-slateGray-dark">
                    {pickLang(interest.description_ar, interest.description_en, locale)}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
