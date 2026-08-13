import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './Header';
import { Footer } from './Footer';
import { LogoIntro } from './LogoIntro';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <LogoIntro />
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/sign-in?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <p className="rounded-xl bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
          {t('admin.notAuthorized')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
