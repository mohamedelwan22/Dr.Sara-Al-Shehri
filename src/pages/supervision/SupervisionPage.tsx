import { DatedListPage } from '@/features/supervision/DatedListPage';
import { DatedDetailPage } from '@/features/supervision/DatedDetailPage';
import { supervisionService } from '@/services';

export function SupervisionPage() {
  return (
    <DatedListPage
      listFn={supervisionService.listSupervision}
      titleKey="supervision.title"
      subtitleKey="supervision.subtitle"
      emptyKey="supervision.noItems"
      detailPrefix="supervision"
      contentType="supervision"
      seoTitleKey="supervision.title"
    />
  );
}

export function SupervisionDetailPage() {
  return (
    <DatedDetailPage
      getFn={(slug) => supervisionService.getSupervisionBySlug(slug)}
      contentType="supervision"
      listPrefix="supervision"
    />
  );
}
