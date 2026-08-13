import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Seo } from '@/components/layout/Seo';
import { profileContentService } from '@/services/contentService';
import { queryKeys } from '@/services';
import { ErrorState, LoadingState } from '@/components/ui';
import { pickLang } from '@/lib/utils';

export function ProfileSectionPage({
  section,
  titleKey,
  subtitleKey,
  seoTitle,
  seoDescription,
}: {
  section: string;
  titleKey: string;
  subtitleKey?: string;
  seoTitle?: string;
  seoDescription?: string;
}) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const query = useQuery({
    queryKey: queryKeys.profileContent(section),
    queryFn: () => profileContentService.getSection(section),
  });

  const content = query.data;

  const renderContent = () => {
    if (query.isLoading) return <LoadingState />;
    if (query.isError) return <ErrorState message={t('common.error')} onRetry={() => void query.refetch()} />;
    if (!content) return <p className="text-slateGray-dark">{t('common.notFound')}</p>;
    const body = pickLang(content.body_ar, content.body_en, locale);
    if (!body) return <p className="text-slateGray-dark">{t('common.empty')}</p>;
    return (
      <div className="prose-arabic">
        {body.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  };

  return (
    <>
      <Seo title={seoTitle ?? t(titleKey)} description={seoDescription} />
      <PageHeader title={t(titleKey)} subtitle={subtitleKey ? t(subtitleKey) : undefined} />
      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl rounded-xl border border-primary-100 bg-white p-6 shadow-card sm:p-10">
          {renderContent()}
        </div>
      </div>
    </>
  );
}
