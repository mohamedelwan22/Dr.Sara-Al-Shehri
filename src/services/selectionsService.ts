import { requireSupabase } from '@/lib/supabase';
import type { ScientificSelection } from '@/types';

export const selectionsService = {
  async listAll(): Promise<ScientificSelection[]> {
    const { data, error } = await requireSupabase()
      .from('scientific_selections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as ScientificSelection[]) ?? [];
  },

  async listBySection(section: string): Promise<ScientificSelection[]> {
    const { data, error } = await requireSupabase()
      .from('scientific_selections')
      .select('*')
      .eq('is_active', true)
      .eq('section', section)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as ScientificSelection[]) ?? [];
  },
};
