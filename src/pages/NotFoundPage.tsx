import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { EmptyState } from '@/components/ui';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title={t('notFound.title')} />
      <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
        <EmptyState
          title={t('notFound.title')}
          description={t('notFound.body')}
          action={
            <Link to="/" className="btn-primary">
              <Home className="h-4 w-4" />
              {t('notFound.backHome')}
            </Link>
          }
        />
      </div>
    </>
  );
}
