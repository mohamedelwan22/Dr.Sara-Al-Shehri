import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  BookOpen,
  Layers,
  Inbox,
  Users,
  Image,
  Settings,
  FileText,
  Lightbulb,
  GraduationCap,
  Scale,
  Presentation,
  Newspaper,
  Sparkles,
  CalendarDays,
  Megaphone,
  Microscope,
  LogOut,
  ArrowRight,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services';
import { useToast } from '@/components/ui';
import { cn } from '@/lib/utils';

const MAIN_LINKS = [
  { to: '/admin', key: 'admin.dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', key: 'admin.profile', icon: User },
];

const CONTENT_LINKS = [
  { to: '/admin/research', key: 'admin.entities.research', icon: BookOpen },
  { to: '/admin/publications', key: 'admin.entities.publications', icon: FileText },
  { to: '/admin/supervision', key: 'admin.entities.supervision', icon: GraduationCap },
  { to: '/admin/discussions', key: 'admin.entities.discussions', icon: Scale },
  { to: '/admin/projects', key: 'admin.entities.projects', icon: Lightbulb },
  { to: '/admin/courses', key: 'admin.entities.courses', icon: Presentation },
  { to: '/admin/lectures', key: 'admin.entities.lectures', icon: Presentation },
  { to: '/admin/axes', key: 'admin.entities.axes', icon: Layers },
  { to: '/admin/interests', key: 'admin.entities.interests', icon: Microscope },
  { to: '/admin/news', key: 'admin.entities.news', icon: Newspaper },
  { to: '/admin/insights', key: 'admin.entities.insights', icon: Sparkles },
  { to: '/admin/announcements', key: 'admin.entities.announcements', icon: Megaphone },
  { to: '/admin/calendar', key: 'admin.entities.calendar', icon: CalendarDays },
];

const SYSTEM_LINKS = [
  { to: '/admin/inbox', key: 'admin.contacts', icon: Inbox },
  { to: '/admin/users', key: 'admin.users', icon: Users },
  { to: '/admin/media', key: 'admin.media', icon: Image },
  { to: '/admin/settings', key: 'admin.settings', icon: Settings },
];

export function AdminLayout() {
  const { t } = useTranslation();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const renderLink = (item: { to: string; key: string; icon: typeof User; end?: boolean }) => (
    <NavLink
      key={item.key}
      to={item.to}
      end={item.end}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors',
          isActive ? 'bg-primary-700 text-white' : 'text-primary-200 hover:bg-primary-800 hover:text-white',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {t(item.key)}
    </NavLink>
  );

  const nav = (
    <nav className="space-y-6" aria-label={t('admin.title')}>
      <div>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-primary-400">—</p>
        <div className="space-y-1">{MAIN_LINKS.map(renderLink)}</div>
      </div>
      <div>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-primary-400">{t('admin.title')}</p>
        <div className="space-y-1">{CONTENT_LINKS.map(renderLink)}</div>
      </div>
      <div>
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-primary-400">·</p>
        <div className="space-y-1">{SYSTEM_LINKS.map(renderLink)}</div>
      </div>
    </nav>
  );

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast.success(t('auth.signOut'));
      navigate('/');
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-primary-800 bg-primary-900">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-100 hover:bg-primary-800 lg:hidden"
              aria-label="menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="font-display text-lg font-bold text-white">{t('admin.title')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-1 text-xs font-bold text-primary-200 hover:text-white">
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              {t('nav.home')}
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-primary-200 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* الشريط الجانبي */}
        <aside
          className={cn(
            'w-64 shrink-0 overflow-y-auto bg-primary-900 py-6',
            'fixed inset-y-0 right-0 z-30 pt-14 transition-transform lg:static lg:pt-6 lg:translate-x-0',
            open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
          )}
        >
          {nav}
        </aside>

        {/* المحتوى */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {user && (
            <p className="mb-4 text-xs text-slateGray" dir="ltr">
              {user.email}
            </p>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
