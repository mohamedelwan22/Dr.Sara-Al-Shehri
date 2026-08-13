import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { requireSupabase } from '@/lib/supabase';
import { queryKeys } from '@/services/queryKeys';
import { mapService } from '@/services/mapService';
import { pickLang } from '@/lib/utils';
import { Badge } from '@/components/ui';
import type { AxisContentType } from '@/types';

function useAxesList() {
  return useQuery({
    queryKey: queryKeys.axes,
    queryFn: () => mapService.listAxes(),
  });
}

/** جلب ارتباطات محاور لمجموعة عناصر دفعة واحدة (بلا N+1). */
function useAxisLinksForItems(contentType: AxisContentType, contentIds: string[]) {
  return useQuery({
    queryKey: ['axis-links', contentType, contentIds],
    queryFn: async () => {
      if (!contentIds.length) return new Map<string, string[]>();
      const { data, error } = await requireSupabase()
        .from('content_axis_links')
        .select('content_id, axis_id')
        .eq('content_type', contentType)
        .in('content_id', contentIds);
      if (error) throw error;
      const map = new Map<string, string[]>();
      for (const link of data ?? []) {
        const list = map.get(link.content_id) ?? [];
        list.push(link.axis_id);
        map.set(link.content_id, list);
      }
      return map;
    },
    enabled: contentIds.length > 0,
    staleTime: 5 * 60_000,
  });
}

export function AxisTagsForItems({
  contentType,
  contentIds,
  renderContentId,
}: {
  contentType: AxisContentType;
  contentIds: string[];
  renderContentId: string;
}) {
  const { i18n } = useTranslation();
  const { data: links } = useAxisLinksForItems(contentType, contentIds);
  const { data: axes } = useAxesList();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';

  const axisIds = links?.get(renderContentId) ?? [];
  if (!axisIds.length) return null;

  const items = axisIds
    .map((id) => axes?.find((axis) => axis.id === id))
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <MapPin className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
      {items.slice(0, 4).map((axis) => (
        <Link key={axis!.id} to={`/scientific-map/${axis!.slug}`}>
          <Badge tone="ivory" className="transition-colors hover:bg-gold-100 hover:text-gold-800">
            {pickLang(axis!.name_ar, axis!.name_en, locale)}
          </Badge>
        </Link>
      ))}
      {items.length > 4 && <Badge tone="gray">+{items.length - 4}</Badge>}
    </div>
  );
}

export function AxisTagsForSingle({
  contentType,
  contentId,
}: {
  contentType: AxisContentType;
  contentId: string;
}) {
  return <AxisTagsForItems contentType={contentType} contentIds={[contentId]} renderContentId={contentId} />;
}

export { useAxesList };
