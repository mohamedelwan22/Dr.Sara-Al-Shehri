import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { useFavorite } from '@/hooks/useInteractions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui';
import { cn } from '@/lib/utils';

/** زر تفضيل مضغوط للبطاقات — يعمل بدون تسجيل دخول (يوجّه للتسجيل). */
export function FavoriteButton({
  contentType,
  contentId,
  className,
  showLabel = false,
}: {
  contentType: string;
  contentId: string;
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggle, isPending } = useFavorite(contentType, contentId);

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.info(t('favorites.loginRequired'));
      navigate(`/auth/sign-in?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    try {
      await toggle();
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={t(isFavorite ? 'favorites.remove' : 'favorites.add')}
      onClick={() => void handleClick()}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors',
        isFavorite
          ? 'border-gold-300 bg-gold-100 text-gold-700 hover:bg-gold-200'
          : 'border-slate-200 bg-white text-slate-600 hover:border-gold-300 hover:bg-gold-50 hover:text-gold-700',
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-gold-500 text-gold-500')} />
      )}
      {showLabel && <span>{t(isFavorite ? 'favorites.remove' : 'favorites.add')}</span>}
    </button>
  );
}
