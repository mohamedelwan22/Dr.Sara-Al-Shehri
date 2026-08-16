import { DatedListPage } from '@/features/supervision/DatedListPage';
import { DatedDetailPage } from '@/features/supervision/DatedDetailPage';
import { supervisionService } from '@/services';

export function DiscussionsPage() {
  return (
    <DatedListPage
      listFn={supervisionService.listDiscussions}
      titleKey="discussions.title"
      subtitleKey="discussions.subtitle"
      emptyKey="discussions.noItems"
      detailPrefix="discussions"
      contentType="discussion"
      seoTitleKey="discussions.title"
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
