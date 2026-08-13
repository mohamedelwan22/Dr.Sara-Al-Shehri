import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Download, Share2, Heart, Loader2 } from 'lucide-react';
import { useContentMetrics, useFavorite } from '@/hooks/useInteractions';
import { interactionService } from '@/services/interactionService';
import { useAuth } from '@/hooks/useAuth';
import { useToast, Button } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

export function RecordView({ contentType, contentId }: { contentType: string; contentId: string }) {
  useEffect(() => {
    if (!contentId) return;
    void interactionService.recordView(contentType, contentId).catch(() => undefined);
  }, [contentType, contentId]);
  return null;
}

export function MetricsRow({ contentType, contentId }: { contentType: string; contentId: string }) {
  const { t } = useTranslation();
  const { data: metrics } = useContentMetrics(contentType, contentId);
  const { isFavorite, isAuthenticated, toggle, isPending } = useFavorite(contentType, contentId);
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        <span className="metric-chip">
          <Eye className="h-3.5 w-3.5 text-primary-500" />
          <b>{formatNumber(metrics?.views ?? 0)}</b>
          {t('common.views')}
        </span>
        <span className="metric-chip">
          <Download className="h-3.5 w-3.5 text-primary-500" />
          <b>{formatNumber(metrics?.downloads ?? 0)}</b>
          {t('common.downloads')}
        </span>
        <span className="metric-chip">
          <Share2 className="h-3.5 w-3.5 text-primary-500" />
          <b>{formatNumber(metrics?.shares ?? 0)}</b>
          {t('common.shares')}
        </span>
        <span className="metric-chip">
          <Heart className="h-3.5 w-3.5 text-gold-500" />
          <b>{formatNumber(metrics?.favorites ?? 0)}</b>
          {t('common.favorites')}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isFavorite ? 'gold' : 'outline'}
          disabled={!isAuthenticated}
          isLoading={isPending}
          leftIcon={isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5" />}
          onClick={() => void toggle()}
        >
          {isFavorite ? t('research.unfavorite') : t('research.favoriteThis')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Share2 className="h-3.5 w-3.5" />}
          onClick={() => {
            void interactionService.recordShare(contentType, contentId);
            const url = window.location.href;
            void navigator.clipboard?.writeText(url);
            toast.success(t('common.copied'));
          }}
        >
          {t('common.share')}
        </Button>
      </div>
    </div>
  );
}

export function DocumentDownloadButton({
  contentType,
  contentId,
  storagePath,
}: {
  contentType: string;
  contentId: string;
  storagePath: string;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast.error(t('errors.unauthorizedDownload'));
      return;
    }
    try {
      await interactionService.triggerDownload(contentType, contentId, storagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('errors.')) toast.error(t(message));
      else toast.error(t('errors.generic'));
    }
  };

  return (
    <Button variant="gold" leftIcon={<Download className="h-4 w-4" />} onClick={() => void handleClick()}>
      {t('common.download')}
    </Button>
  );
}
