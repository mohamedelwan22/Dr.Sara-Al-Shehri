import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function Seo({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const baseTitle = t('seo.homeTitle');
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;

  useEffect(() => {
    document.title = fullTitle;
    const desc = description ?? t('seo.homeDescription');
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', `${window.location.origin}${location.pathname}`);
    setMeta('property', 'og:locale', document.documentElement.lang === 'ar' ? 'ar_SA' : 'en_US');
    setMeta('property', 'og:site_name', t('seo.homeTitle'));
    setMeta('property', 'og:type', 'website');
  }, [fullTitle, description, location.pathname, t]);

  return null;
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
