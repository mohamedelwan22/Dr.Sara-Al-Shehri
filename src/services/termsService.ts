import { requireSupabase } from '@/lib/supabase';
import type { SiteSetting } from '@/types';

export interface TermsInfo {
  title_ar?: string;
  title_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  quote_ar?: string;
  quote_en?: string;
  artwork_url?: string;
}

export interface TermsSection {
  id: string;
  section_number: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  icon: string;
  sort_order: number;
  is_active?: boolean;
}

export const DEFAULT_TERMS_INFO: Required<TermsInfo> = {
  title_ar: 'شروط الاستخدام',
  title_en: 'Terms of Use',
  subtitle_ar: 'قواعد استخدام المنصة ومسؤولياتك',
  subtitle_en: 'Rules for using the platform and your responsibilities',
  quote_ar: 'باستخدامك للموقع، فإنك توافق على الالتزام بهذه الشروط.',
  quote_en: 'By using the website, you agree to comply with these terms.',
  artwork_url: '/images/terms.png',
};

export const DEFAULT_TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'terms-sec-1',
    section_number: '01',
    title_ar: 'أولاً: طبيعة الموقع',
    title_en: 'First: Nature of the Platform',
    content_ar: 'الموقع منصة علمية متخصصة تهدف إلى نشر المعرفة وخدمة السنة النبوية، وإتاحة الإنتاج العلمي والأنشطة الأكاديمية للباحثين والمهتمين.',
    content_en: 'The website is a specialized scientific platform aiming to disseminate knowledge, serve the Prophetic Sunnah, and provide scholarly output for researchers and interested parties.',
    icon: 'BookOpen',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'terms-sec-2',
    section_number: '02',
    title_ar: 'ثانياً: استخدام المشروع',
    title_en: 'Second: Permitted Use',
    content_ar: 'يلتزم المستخدم باستخدام الموقع للأغراض العلمية والتعليمية المشروعة، ويمنع استخدامه لأي أغراض تخالف الأنظمة أو الآداب العامة أو حقوق الآخرين.',
    content_en: 'The user agrees to use the website for legitimate scientific and educational purposes, and is prohibited from using it for any purposes that violate regulations, public morals, or third-party rights.',
    icon: 'ShieldCheck',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'terms-sec-3',
    section_number: '03',
    title_ar: 'ثالثاً: الملكية الفكرية',
    title_en: 'Third: Intellectual Property',
    content_ar: 'جميع الأبحاث، والملفات، والمواد العلمية، والتصاميم، والمحتويات المنشورة في الموقع محفوظة حقوقها لأصحابها.',
    content_en: 'All research, files, scientific materials, designs, and content published on the website are copyrighted by their respective owners.',
    icon: 'Copyright',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'terms-sec-4',
    section_number: '04',
    title_ar: 'رابعاً: الاقتباس العلمي',
    title_en: 'Fourth: Scientific Citation',
    content_ar: 'يسمح بالاستفادة من المحتوى المنشور والاقتباس منه للأغراض العلمية، مع الالتزام بالأمانة العلمية والإشارة إلى المصدر وفق قواعد التوثيق الأكاديمي.',
    content_en: 'Utilization and citation of published content for academic purposes is permitted, provided scientific integrity is maintained and sources are properly cited according to academic standards.',
    icon: 'Quote',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'terms-sec-5',
    section_number: '05',
    title_ar: 'خامساً: حسابات المستخدمين',
    title_en: 'Fifth: User Accounts',
    content_ar: 'يلتزم المستخدم بالحفاظ على سرية بيانات حسابه، ويتحمل مسؤولية جميع الأنشطة التي تتم من خلاله.',
    content_en: 'The user is responsible for maintaining the confidentiality of their account credentials and assumes responsibility for all activities conducted through their account.',
    icon: 'UserCheck',
    sort_order: 5,
    is_active: true,
  },
  {
    id: 'terms-sec-6',
    section_number: '06',
    title_ar: 'سادساً: إتاحة المحتوى',
    title_en: 'Sixth: Content Availability',
    content_ar: 'قد يتطلب الوصول إلى بعض المواد العلمية أو تحميلها إنشاء حساب أو تسجيل الدخول، ويحتفظ الموقع بحق تنظيم صلاحيات الوصول إلى المحتوى.',
    content_en: 'Accessing or downloading certain scientific materials may require account creation or sign-in. The platform reserves the right to manage content access permissions.',
    icon: 'FileText',
    sort_order: 6,
    is_active: true,
  },
  {
    id: 'terms-sec-7',
    section_number: '07',
    title_ar: 'سابعاً: تعديل الشروط',
    title_en: 'Seventh: Amendment of Terms',
    content_ar: 'يحتفظ الموقع بحق تعديل شروط الاستخدام أو تحديثها متى دعت الحاجة.',
    content_en: 'The platform reserves the right to amend or update these Terms of Use as needed.',
    icon: 'FilePenLine',
    sort_order: 7,
    is_active: true,
  },
];

export const termsService = {
  async getTermsInfo(): Promise<Required<TermsInfo>> {
    try {
      const { data, error } = await requireSupabase()
        .from('site_settings')
        .select('*')
        .eq('key', 'terms_info')
        .eq('is_public', true)
        .maybeSingle();

      if (error) {
        return DEFAULT_TERMS_INFO;
      }
      const raw = (data as SiteSetting | null)?.value as Partial<TermsInfo> | undefined;
      return { ...DEFAULT_TERMS_INFO, ...raw };
    } catch {
      return DEFAULT_TERMS_INFO;
    }
  },

  async getTermsSections(): Promise<TermsSection[]> {
    try {
      const { data, error } = await requireSupabase()
        .from('terms_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        return DEFAULT_TERMS_SECTIONS;
      }
      return data as TermsSection[];
    } catch {
      return DEFAULT_TERMS_SECTIONS;
    }
  },
};
