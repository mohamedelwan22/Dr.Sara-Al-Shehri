import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Home,
  User,
  Target,
  Microscope,
  GraduationCap,
  Scale,
  Lightbulb,
  Presentation,
  Menu,
  X,
  Search,
  Mail,
  Globe,
  LogOut,
  UserCircle2,
  UserPlus,
  KeyRound,
  BookOpen,
  CalendarDays,
  Map,
  Newspaper,
  Sparkles,
  Heart,
} from 'lucide-react';
import { LogoMark } from './Logo';
import { SocialIcons } from '@/components/social/SocialIcons';
import { useAuth, useLocale } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/contentService';
import { queryKeys } from '@/services/queryKeys';
import { useToast } from '@/components/ui';
import { cn } from '@/lib/utils';

const DESKTOP_NAV = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/biography', key: 'nav.biography', icon: User },
  { to: '/scientific-mission', key: 'nav.mission', icon: Target },
  { to: '/research-interests', key: 'nav.interests', icon: Microscope },
  { to: '/research', key: 'nav.research', icon: BookOpen },
  { to: '/supervision', key: 'nav.supervision', icon: GraduationCap },
  { to: '/insights', key: 'nav.insights', icon: Sparkles },
  { to: '/discussions', key: 'nav.discussions', icon: Scale },
  { to: '/projects', key: 'nav.projects', icon: Lightbulb },
  { to: '/courses', key: 'nav.courses', icon: Presentation },
];

const MOBILE_NAV = [
  ...DESKTOP_NAV,
  { to: '/calendar', key: 'nav.calendar', icon: CalendarDays },
  { to: '/scientific-map', key: 'nav.map', icon: Map },
  { to: '/news', key: 'nav.news', icon: Newspaper },
  { to: '/contact', key: 'nav.contact', icon: Mail },
];

export function Header() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');

  const socialLinksQuery = useQuery({
    queryKey: queryKeys.settings('social_links'),
    queryFn: () => settingsService.getSocialLinks(),
    retry: 1,
  });
  const socialLinks = socialLinksQuery.data ?? {};
  const hasSocialLinks = Object.values(socialLinks).some((url) => Boolean(url));

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success(t('auth.signOut'));
      navigate('/');
    } catch {
      toast.error(t('common.failed'));
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E7DFED] bg-white shadow-[0_1px_3px_rgb(53_20_92_/_0.05)]">
      <div className="container-page">
        {/* ROW 1: TOP HEADER */}
        <div className="flex h-[74px] items-center justify-between gap-2 lg:gap-4 py-2">
          {/* Logo & Identity (RIGHT side in RTL) */}
          <div className="flex items-center gap-2 shrink-0 sm:gap-3">
            <Link to="/" aria-label={t('nav.home')} className="flex items-center gap-2">
              <LogoMark className="h-14 w-14 sm:h-[62px] sm:w-[62px]" />
              <div className="leading-tight">
                <p className="font-display text-base font-bold text-[#35145C] sm:text-xl">
                  أ.د. سارة بنت عزيز الشهري
                </p>
                <p className="text-[11px] font-bold text-[#D89A16] sm:text-sm">
                  منصة علمية في الحديث وعلومـه
                </p>
              </div>
            </Link>

            {/* Social Icons */}
            {hasSocialLinks && (
              <div className="hidden xl:flex items-center gap-1.5 ms-4 border-s border-[#E7DFED] ps-4">
                <SocialIcons
                  links={socialLinks}
                  itemClassName="!h-8 !w-8 !rounded-md !bg-[#35145C] hover:!bg-primary-800"
                />
              </div>
            )}
          </div>

          {/* Search Bar (MIDDLE) */}
          <form onSubmit={handleSearch} className="relative hidden max-w-xs flex-1 md:block lg:max-w-[390px]">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في الموقع..."
              aria-label={t('search.placeholder')}
              className="h-9 w-full rounded-lg border border-[#DCD4E4] bg-white pe-4 ps-10 text-xs text-slate-800 shadow-inner shadow-slate-100/40 placeholder:text-slate-400 focus:border-[#35145C] focus:outline-none focus:ring-1 focus:ring-[#35145C]/20"
            />
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#35145C]" />
          </form>

          {/* Auth & Utility Buttons (LEFT side in RTL) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="hidden sm:flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
              aria-label={t('lang.en')}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{locale === 'ar' ? 'EN' : 'ع'}</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/favorites')}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#D89A16] hover:bg-[#FFF8E8]"
                  aria-label={t('favorites.title')}
                  title={t('favorites.title')}
                >
                  <Heart className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isAdmin ? '/admin' : '/account')}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#E7DFED] bg-slate-50 px-3 text-xs font-bold text-[#35145C] hover:bg-slate-100"
                >
                  <UserCircle2 className="h-4 w-4" />
                  <span className="hidden sm:inline">{isAdmin ? t('nav.admin') : t('nav.account')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2" dir="ltr">
                <Link
                  to="/auth/sign-in"
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-[#D89A16] bg-[#D89A16] px-3 text-xs font-bold text-white shadow-[0_6px_14px_-8px_rgb(216_154_22_/_0.8)] transition-colors hover:bg-[#B9780E] sm:px-4"
                  dir="rtl"
                >
                  <KeyRound className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الدخول</span>
                </Link>
                <Link
                  to="/auth/sign-up"
                  className="hidden h-9 items-center gap-1.5 rounded-lg border border-[#DCD4E4] bg-white px-4 text-xs font-bold text-[#35145C] transition-colors hover:bg-slate-50 sm:flex"
                  dir="rtl"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء حساب</span>
                </Link>
              </div>
            )}

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
              aria-label={drawerOpen ? t('common.close') : 'menu'}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ROW 2: MAIN NAVIGATION - COMPACT ONE ROW */}
        <nav
          className="hidden h-12 items-center justify-between border-t border-[#E7DFED] py-1.5 md:flex overflow-x-auto whitespace-nowrap no-scrollbar"
          aria-label="primary navigation"
        >
          <div className="flex items-center gap-1 w-full justify-between">
            {DESKTOP_NAV.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={key}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap',
                    isActive
                      ? 'bg-[#35145C] text-white shadow-xs'
                      : 'text-[#35145C] hover:text-[#35145C] hover:bg-slate-100/70',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{t(key)}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-6 pt-3 shadow-lg">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث في الموقع..."
              className="w-full h-10 rounded-lg border border-slate-200 pe-4 ps-10 text-xs text-slate-800"
            />
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </form>
          <nav className="max-h-[65vh] space-y-1 overflow-y-auto" aria-label="mobile menu">
            {MOBILE_NAV.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={key}
                to={to}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
                    isActive ? 'bg-[#35145C] text-white' : 'text-slate-700 hover:bg-slate-100',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{t(key)}</span>
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-2">
                <Link
                  to="/auth/sign-in"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 items-center justify-center gap-1 rounded-lg border border-gold-500 text-xs font-bold text-gold-700"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/auth/sign-up"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-10 items-center justify-center gap-1 rounded-lg bg-primary-900 text-xs font-bold text-white"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setDrawerOpen(false)}
                  className="flex w-full h-10 items-center justify-center gap-1.5 rounded-lg border border-gold-200 text-xs font-bold text-gold-700 mt-3"
                >
                  <Heart className="h-4 w-4" />
                  {t('favorites.title')}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    void handleSignOut();
                  }}
                  className="flex w-full h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 mt-3"
                >
                  <LogOut className="h-4 w-4" />
                  {t('auth.signOut')}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => void setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="flex w-full h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 mt-2"
            >
              <Globe className="h-4 w-4" />
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
