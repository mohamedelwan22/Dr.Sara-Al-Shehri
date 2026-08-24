import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Copyright, FileText, MessageCircle, ShieldCheck } from 'lucide-react';

const FOOTER_LINKS = [
  { to: '/contact', key: 'contact', label: 'استفسار وتواصل', icon: MessageCircle },
  { to: '/privacy', key: 'privacy', label: 'سياسة الخصوصية', icon: ShieldCheck },
  { to: '/terms', key: 'terms', label: 'شروط وأحكام', icon: FileText },
];

export function Footer() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language !== 'en';

  return (
    <footer className="mt-2 border-t border-[#E7DFED] bg-[#F1ECF8] text-[#35145C]">
      <div dir="ltr" className="container-page flex flex-col items-center gap-3 py-3 sm:flex-row-reverse sm:items-center sm:justify-between">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label={t('footer.legal')}>
          {FOOTER_LINKS.map(({ to, key, label, icon: Icon }) => (
            <Link
              key={key}
              to={to}
              className="flex items-center gap-1.5 text-xs font-bold text-[#35145C] transition-colors hover:text-[#D89A16] sm:text-sm"
            >
              <Icon className="h-4 w-4" />
              <span dir="auto">{isAr ? label : t(`nav.${key}`)}</span>
            </Link>
          ))}
        </nav>

        <p className="flex items-center gap-1.5 text-xs font-bold text-[#35145C] sm:text-sm">
          <Copyright className="h-4 w-4 text-[#D89A16]" />
          <span dir="auto">{isAr ? 'جميع الحقوق محفوظة. أ.د. سارة بنت عزيز الشهري' : `${t('footer.rights')}. Dr. Sara Al-Shehri`}</span>
        </p>
      </div>
    </footer>
  );
}
