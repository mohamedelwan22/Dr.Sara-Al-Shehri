import { requireSupabase } from '@/lib/supabase';
import type { ProfileContent, SiteSetting } from '@/types';

export const profileContentService = {
  async getSection(section: string): Promise<ProfileContent | null> {
    const { data, error } = await requireSupabase()
      .from('profile_content')
      .select('*')
      .eq('section', section)
      .eq('status', 'published')
      .maybeSingle();
    if (error) throw error;
    return (data as ProfileContent | null) ?? null;
  },
};

export const settingsService = {
  async getPublicSettings(): Promise<SiteSetting[]> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .eq('is_public', true);
    if (error) throw error;
    return (data as SiteSetting[]) ?? [];
  },

  async getPlatformIdentity(): Promise<Record<string, unknown> | null> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .eq('key', 'platform_identity')
      .eq('is_public', true)
      .maybeSingle();
    if (error) throw error;
    return (data as SiteSetting | null)?.value ?? null;
  },
};
