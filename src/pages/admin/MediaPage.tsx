import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Image as ImageIcon, FileText, Link2 } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui';
import { LoadingState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { useToast } from '@/components/ui';
import { formatBytes, formatDate } from '@/lib/utils';
import { getPublicStorageUrl } from '@/lib/supabase';
import type { Media } from '@/types';

export function MediaPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [toDelete, setToDelete] = useState<Media | null>(null);

  const listQuery = useQuery({
    queryKey: queryKeys.admin.media,
    queryFn: () => adminContentService.listMedia(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => adminContentService.uploadMedia(file),
    onSuccess: () => {
      toast.success(t('admin.uploaded'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.media });
    },
    onError: () => toast.error(t('errors.uploadFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (media: Media) => adminContentService.deleteMedia(media.id, media.bucket, media.storage_path),
    onSuccess: () => {
      toast.success(t('admin.deleted'));
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.media });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  if (listQuery.isPending) return <LoadingState />;

  const rows = listQuery.data ?? [];

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error(t('admin.fileTooLarge'));
      return;
    }
    uploadMutation.mutate(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
          <ImageIcon className="h-5 w-5 text-primary-600" />
          {t('admin.media')}
        </h1>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <Button
          onClick={() => fileRef.current?.click()}
          isLoading={uploadMutation.isPending}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          {t('admin.upload')}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={t('admin.noData')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((media) => {
            const isImage = (media.mime_type ?? '').startsWith('image/');
            return (
              <div
                key={media.id}
                className="flex flex-col overflow-hidden rounded-xl2 border border-primary-100 bg-white"
              >
                <div className="flex h-32 items-center justify-center bg-ivory">
                  {isImage ? (
                    <img
                      src={getPublicStorageUrl(media.bucket, media.storage_path)}
                      alt={media.alt_ar || media.alt_en || media.storage_path}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileText className="h-10 w-10 text-primary-400" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="truncate text-sm font-semibold text-primary-900" dir="ltr">
                    {media.storage_path.split('/').pop()}
                  </p>
                  <p className="text-xs text-slateGray" dir="ltr">
                    {formatBytes(media.size_bytes ?? 0)} · {formatDate(media.created_at)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={getPublicStorageUrl(media.bucket, media.storage_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-50"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {t('common.open')}
                    </a>
                    <button
                      type="button"
                      onClick={() => setToDelete(media)}
                      className="ms-auto flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete);
        }}
        title={t('admin.deleteTitle')}
        message={t('admin.deleteConfirm')}
        confirmLabel={t('common.delete')}
        danger
      />
    </div>
  );
}
