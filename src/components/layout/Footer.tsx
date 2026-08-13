import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const primary = [
    { to: '/', key: 'nav.home' },
    { to: '/biography', key: 'nav.biography' },
    { to: '/scientific-mission', key: 'nav.mission' },
    { to: '/research-interests', key: 'nav.interests' },
    { to: '/research', key: 'nav.research' },
    { to: '/supervision', key: 'nav.supervision' },
    { to: '/discussions', key: 'nav.discussions' },
    { to: '/projects', key: 'nav.projects' },
    { to: '/courses', key: 'nav.courses' },
  ];

  const resources = [
    { to: '/scientific-map', key: 'nav.map' },
    { to: '/calendar', key: 'nav.calendar' },
    { to: '/news', key: 'nav.news' },
    { to: '/insights', key: 'nav.insights' },
    { to: '/search', key: 'nav.search' },
  ];

  const legal = [
    { to: '/contact', key: 'nav.contact' },
    { to: '/privacy', key: 'nav.privacy' },
    { to: '/terms', key: 'nav.terms' },
  ];

  const renderLink = (item: { to: string; key: string }) => (
    <li key={item.key}>
      <Link to={item.to} className="text-sm text-slate-300 transition-colors hover:text-gold-300">
        {t(item.key)}
      </Link>
    </li>
  );

  return (
    <footer className="mt-16 bg-primary-900 text-slate-200">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Link to="/" aria-label={t('nav.home')}>
            <Logo className="[&_p:first-child]:text-white [&_p:last-child]:text-gold-300" />
          </Link>
          <p className="text-sm leading-relaxed text-slate-300">{t('footer.about')}</p>
          <p className="text-xs text-slate-400">{t('footer.university')}</p>
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h3 className="mb-4 font-display text-sm font-bold text-white">{t('footer.quickLinks')}</h3>
          <ul className="space-y-2.5">{primary.map(renderLink)}</ul>
        </nav>

        <nav aria-label={t('footer.resources')}>
          <h3 className="mb-4 font-display text-sm font-bold text-white">{t('footer.resources')}</h3>
          <ul className="space-y-2.5">{resources.map(renderLink)}</ul>
        </nav>

        <nav aria-label={t('footer.legal')}>
          <h3 className="mb-4 font-display text-sm font-bold text-white">{t('footer.legal')}</h3>
          <ul className="space-y-2.5">{legal.map(renderLink)}</ul>
        </nav>
      </div>

      <div className="border-t border-primary-800/60 py-5">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-center sm:flex-row">
          <p className="text-xs text-slate-400">
            © {year} {t('seo.homeTitle')} — {t('footer.rights')}
          </p>
          <p className="font-display text-xs text-gold-300">أ.د. سارة بنت عزيز الشهري</p>
        </div>
      </div>
    </footer>
  );
}
