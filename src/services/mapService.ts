import { requireSupabase } from '@/lib/supabase';
import type { ScientificAxis, AxisItemResult, AxisContentType } from '@/types';

export interface AxisWithCounts extends ScientificAxis {
  counts: Record<string, number>;
}

export const mapService = {
  async listAxes(): Promise<AxisWithCounts[]> {
    const { data, error } = await requireSupabase()
      .from('scientific_axes')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    const axes = (data as ScientificAxis[]) ?? [];

    const { data: links, error: linkError } = await requireSupabase()
      .from('content_axis_links')
      .select('axis_id, content_type');
    if (linkError) throw linkError;

    const countsByAxis: Record<string, Record<string, number>> = {};
    for (const link of links ?? []) {
      countsByAxis[link.axis_id] ??= {};
      countsByAxis[link.axis_id][link.content_type] =
        (countsByAxis[link.axis_id][link.content_type] ?? 0) + 1;
    }

    return axes.map((axis) => ({ ...axis, counts: countsByAxis[axis.id] ?? {} }));
  },

  async getAxisBySlug(slug: string): Promise<ScientificAxis | null> {
    const { data, error } = await requireSupabase()
      .from('scientific_axes')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as ScientificAxis | null) ?? null;
  },

  /** محتوى المحور عبر RPC مؤمّن (published فقط). */
  async getAxisContent(axisId: string): Promise<AxisItemResult[]> {
    const { data, error } = await requireSupabase().rpc('get_axis_content', {
      p_axis_id: axisId,
    });
    if (error) throw error;
    return (data as AxisItemResult[]) ?? [];
  },

  async getAxisIdsForContent(
    contentType: AxisContentType,
    contentId: string,
  ): Promise<string[]> {
    const { data, error } = await requireSupabase()
      .from('content_axis_links')
      .select('axis_id')
      .eq('content_type', contentType)
      .eq('content_id', contentId);
    if (error) throw error;
    return (data ?? []).map((l) => l.axis_id);
  },
};
