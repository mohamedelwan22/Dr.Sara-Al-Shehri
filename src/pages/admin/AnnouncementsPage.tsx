import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, RefreshCw, Eye, EyeOff, Megaphone } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { invalidateForEntity } from '@/services/queryInvalidation';
import { Button } from '@/components/ui';
import { AdminTable, type Column } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { useToast } from '@/components/ui';
import { pickLang, formatDate } from '@/lib/utils';
import { announcementIsActive } from '@/lib/announcements';
import type { Announcement } from '@/types';

export function AnnouncementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const locale = i18n.language;

  const listQuery = useQuery({
    queryKey: queryKeys.admin.list('announcements', { page }),
    queryFn: () => adminContentService.list<Announcement>('announcements', { page }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminContentService.setAnnouncementActive(id, isActive),
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('announcements') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminContentService.remove('announcements', id),
    onSuccess: () => {
      toast.success(t('admin.deleted'));
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('announcements') });
      void queryClient.invalidateQueries({ queryKey: queryKeys.announcements });
      invalidateForEntity(queryClient, 'announcements');
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const columns: Column<Announcement>[] = [
    {
      key: 'title',
      header: t('admin.fields.title_ar'),
      render: (row) => (
        <span className="font-semibold text-primary-900">
          {pickLang(row.title_ar, row.title_en, locale)}
        </span>
      ),
    },
    {
      key: 'active',
      header: t('common.status'),
      className: 'w-40',
      render: (row) => {
        const active = announcementIsActive(row);
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge tone={active ? 'green' : 'gray'}>
              {active ? t('common.active') : t('common.inactive')}
            </Badge>
            {row.active_from || row.active_until ? (
              <span className="text-[10px] text-slateGray">
                {row.active_from && formatDate(row.active_from, locale)}
                {row.active_from && row.active_until ? ' — ' : ''}
                {row.active_until && formatDate(row.active_until, locale)}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: t('common.createdAt'),
      className: 'w-36',
      render: (row) => <span className="text-xs" dir="ltr">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '—',
      className: 'w-28',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/announcements/${row.id}/edit`}
            className="rounded-lg p-2 text-primary-700 transition-colors hover:bg-primary-50"
            aria-label={t('common.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMutation.mutate({ id: row.id, isActive: !row.is_active });
            }}
            className="rounded-lg p-2 text-gold-600 transition-colors hover:bg-gold-50 disabled:opacity-50"
            aria-label={row.is_active ? t('common.unpublish') : t('common.publish')}
            title={row.is_active ? t('common.unpublish') : t('common.publish')}
          >
            {row.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(row.id);
            }}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
            aria-label={t('common.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
          <Megaphone className="h-5 w-5 text-primary-600" />
          {t('admin.entities.announcements')}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void listQuery.refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            {t('common.refresh')}
          </Button>
          <Link to="/admin/announcements/new">
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              {t('admin.createEntity')}
            </Button>
          </Link>
        </div>
      </div>

      <AdminTable
        columns={columns}
        rows={listQuery.data?.data ?? []}
        isLoading={listQuery.isPending}
        rowKey={(row) => row.id}
        emptyTitle={t('admin.noData')}
        emptyDescription={t('admin.createFirstEntity')}
        onRowClick={(row) => navigate(`/admin/announcements/${row.id}/edit`)}
      />

      <Pagination
        page={listQuery.data?.page ?? 1}
        totalPages={listQuery.data?.totalPages ?? 1}
        onChange={setPage}
      />

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
