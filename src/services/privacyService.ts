import { requireSupabase } from '@/lib/supabase';
import type { PrivacySection, PrivacyInfo, SiteSetting } from '@/types';

export const DEFAULT_PRIVACY_INFO: Required<PrivacyInfo> = {
  title_ar: 'سياسة الخصوصية',
  title_en: 'Privacy Policy',
  subtitle_ar: 'ترحب منصة أ.د. سارة بنت عزيز الشهري بزوارها، وتلتزم بالمحافظة على خصوصية مستخدمي الموقع وسرية بياناتهم، وتوضح هذه السياسة آلية جمع المعلومات واستخدامها وحمايتها.',
  subtitle_en: 'Prof. Sara Al-Shehri platform welcomes its visitors and is committed to preserving privacy and confidentiality, outlining data collection and protection mechanisms.',
  quote_ar: 'خصوصيتكم تهمنا، ونلتزم بحمايتها والحفاظ عليها.',
  quote_en: 'Your privacy matters to us, and we are committed to protecting and preserving it.',
  artwork_url: '/images/policy.png',
};

export const DEFAULT_PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 'default-sec-1',
    section_number: '01',
    title_ar: 'أولاً: البيانات التي يتم جمعها',
    title_en: 'First: Collected Data',
    content_ar: `قد يجمع الموقع بعض البيانات التي يقدمها المستخدم عند التسجيل أو التواصل، مثل:
• الاسم.
• البريد الإلكتروني.
• الجهة أو الجامعة.
• المعلومات التي يختار المستخدم إرسالها من خلال نماذج التواصل.

كما قد تُجمع بيانات تقنية تلقائيًا، مثل:
• عنوان بروتوكول الإنترنت (IP).
• نوع المتصفح.
• نظام التشغيل.
• الصفحات التي تمت زيارتها داخل الموقع.`,
    content_en: `The website may collect certain data provided by the user upon registration or contact, such as:
• Name.
• Email address.
• Organization or University.
• Information sent through contact forms.

Technical data may also be collected automatically, such as:
• IP address.
• Browser type.
• Operating system.
• Pages visited within the platform.`,
    icon: 'ClipboardList',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'default-sec-2',
    section_number: '02',
    title_ar: 'ثانياً: استخدام البيانات',
    title_en: 'Second: Data Usage',
    content_ar: `تُستخدم البيانات للأغراض الآتية:
• الرد على الاستفسارات والمراسلات.
• تحسين تجربة استخدام الموقع.
• تطوير الخدمات والمحتوى العلمي.
• إرسال الإشعارات المتعلقة بالخدمات أو الأنشطة العلمية للموقع عند موافقة المستخدم.`,
    content_en: `Data is used for the following purposes:
• Responding to inquiries and correspondence.
• Improving user experience.
• Developing services and scientific content.
• Sending notifications regarding scientific activities with user consent.`,
    icon: 'Target',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'default-sec-3',
    section_number: '03',
    title_ar: 'ثالثاً: حماية المعلومات',
    title_en: 'Third: Information Protection',
    content_ar: `يحرص الموقع على اتخاذ الإجراءات التقنية والتنظيمية المناسبة لحماية البيانات الشخصية من الوصول غير المصرح به أو الاستخدام أو الإفصاح غير المشروع.`,
    content_en: `The platform takes appropriate technical and organizational measures to protect personal data from unauthorized access, use, or disclosure.`,
    icon: 'ShieldCheck',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'default-sec-4',
    section_number: '04',
    title_ar: 'رابعاً: مشاركة البيانات',
    title_en: 'Fourth: Data Sharing',
    content_ar: `لا يتم بيع أو مشاركة أو تأجير البيانات الشخصية لأي جهة خارجية، إلا إذا اقتضى ذلك التزام نظامي أو وافق المستخدم على ذلك صراحة.`,
    content_en: `Personal data is not sold, shared, or rented to any third parties, unless required by legal obligations or explicitly consented to by the user.`,
    icon: 'Users',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'default-sec-5',
    section_number: '05',
    title_ar: 'خامساً: تعديل السياسة',
    title_en: 'Fifth: Policy Amendments',
    content_ar: `يحتفظ الموقع بحق تحديث سياسة الخصوصية عند الحاجة، ويصبح التعديل نافذًا بمجرد نشره في هذه الصفحة.`,
    content_en: `The platform reserves the right to update this Privacy Policy as needed. Amendments become effective immediately upon publication on this page.`,
    icon: 'FileEdit',
    sort_order: 5,
    is_active: true,
  },
];

export const privacyService = {
  async getPrivacyInfo(): Promise<Required<PrivacyInfo>> {
    try {
      const { data, error } = await requireSupabase()
        .from('site_settings')
        .select('*')
        .eq('key', 'privacy_info')
        .eq('is_public', true)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching privacy info, using defaults:', error);
        return DEFAULT_PRIVACY_INFO;
      }
      const raw = (data as SiteSetting | null)?.value as Partial<PrivacyInfo> | undefined;
      return { ...DEFAULT_PRIVACY_INFO, ...raw };
    } catch (err) {
      console.warn('Supabase not available, using default privacy info:', err);
      return DEFAULT_PRIVACY_INFO;
    }
  },

  async getPrivacySections(): Promise<PrivacySection[]> {
    try {
      const { data, error } = await requireSupabase()
        .from('privacy_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Error fetching privacy sections, using defaults:', error);
        return DEFAULT_PRIVACY_SECTIONS;
      }
      return (data && data.length > 0) ? (data as PrivacySection[]) : DEFAULT_PRIVACY_SECTIONS;
    } catch (err) {
      console.warn('Supabase not available, using default privacy sections:', err);
      return DEFAULT_PRIVACY_SECTIONS;
    }
  },

  async getAllPrivacySectionsAdmin(): Promise<PrivacySection[]> {
    try {
      const { data, error } = await requireSupabase()
        .from('privacy_sections')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as PrivacySection[]) ?? DEFAULT_PRIVACY_SECTIONS;
    } catch (err) {
      console.warn('Admin fetch error, returning defaults:', err);
      return DEFAULT_PRIVACY_SECTIONS;
    }
  },

  async upsertPrivacyInfo(info: PrivacyInfo): Promise<void> {
    const { error } = await requireSupabase()
      .from('site_settings')
      .upsert(
        {
          key: 'privacy_info',
          value: info as unknown as Record<string, unknown>,
          is_public: true,
        },
        { onConflict: 'key' },
      );

    if (error) throw error;
  },

  async createPrivacySection(section: Omit<PrivacySection, 'id' | 'created_at' | 'updated_at'>): Promise<PrivacySection> {
    const { data, error } = await requireSupabase()
      .from('privacy_sections')
      .insert(section)
      .select('*')
      .single();

    if (error) throw error;
    return data as PrivacySection;
  },

  async updatePrivacySection(id: string, updates: Partial<PrivacySection>): Promise<PrivacySection> {
    const { data, error } = await requireSupabase()
      .from('privacy_sections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as PrivacySection;
  },

  async deletePrivacySection(id: string): Promise<void> {
    const { error } = await requireSupabase()
      .from('privacy_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

