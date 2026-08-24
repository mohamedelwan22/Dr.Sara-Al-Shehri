import { requireSupabase } from '@/lib/supabase';
import { normalizeSocialLinks, type SocialLinks } from '@/lib/socialLinks';
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

export const DEFAULT_CONTACT_INFO: Record<string, string> = {
  email: 'b.alhajji@iau.edu.sa',
  phone: '+966 13 333 3333',
  university_ar: 'جامعة الإمام عبدالرحمن بن فيصل',
  university_en: 'Imam Abdulrahman Bin Faisal University',
  department_ar: 'قسم الحديث وعلومه',
  department_en: 'Department of Hadith and its Sciences',
  location_ar: 'المملكة العربية السعودية',
  location_en: 'Saudi Arabia',
  response_time_ar: 'خلال 7 أيام عمل بمشيئة الله',
  response_time_en: 'Within 7 working days, God willing',
  subtitle_ar: 'يسعدني تواصلكم واستقبال استفساراتكم وآرائكم',
  subtitle_en: 'I am happy to receive your inquiries and feedback',
  notice_ar: 'يرحب الموقع بالمراسلات العلمية والأكاديمية، ويُعتذر عن الرد على الرسائل غير المتعلقة بمجالات الاهتمام العلمي للموقع. ويتم الرد - بمشيئة الله - بحسب أولوية الرسائل الواردة وظروف الارتباطات الأكاديمية.',
  notice_en: "The website welcomes scientific and academic correspondence and regrets not responding to messages unrelated to the website's areas of scientific interest. Replies are sent — God willing — according to message priority and academic commitments.",
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

  async getSocialLinks(): Promise<SocialLinks> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .eq('key', 'social_links')
      .eq('is_public', true)
      .maybeSingle();
    if (error) throw error;
    const value = (data as SiteSetting | null)?.value ?? {};
    return normalizeSocialLinks(value);
  },

  async getContactInfo(): Promise<Record<string, string>> {
    const { data, error } = await requireSupabase()
      .from('site_settings')
      .select('*')
      .eq('key', 'contact_info')
      .eq('is_public', true)
      .maybeSingle();
    if (error) throw error;
    const value = ((data as SiteSetting | null)?.value ?? {}) as Record<string, string>;
    return { ...DEFAULT_CONTACT_INFO, ...value };
  },
};
