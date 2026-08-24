import { DatedListPage } from '@/features/supervision/DatedListPage';
import { DatedDetailPage } from '@/features/supervision/DatedDetailPage';
import { supervisionService } from '@/services';
import { useTranslation } from 'react-i18next';

export function DiscussionsPage() {
  const { t } = useTranslation();

  return (
    <DatedListPage
      listFn={supervisionService.listDiscussions}
      titleKey="discussions.title"
      subtitleKey="discussions.subtitle"
      emptyKey="discussions.noItems"
      detailPrefix="discussions"
      contentType="discussion"
      seoTitleKey="discussions.title"
      supervisionTypeLabel={t('discussions.supervisionTypeLabel')}
      completionDateLabel={t('discussions.completionDateLabel')}
    />
  );
}

export function DiscussionDetailPage() {
  return (
    <DatedDetailPage
      getFn={(slug) => supervisionService.getDiscussionBySlug(slug)}
      contentType="discussion"
      listPrefix="discussions"
    />
  );
}
