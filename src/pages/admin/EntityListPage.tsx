import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { invalidateForEntity } from '@/services/queryInvalidation';
import { ENTITY_CONFIGS } from '@/features/admin/adminConfig';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { AdminTable, type Column } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { useToast } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ContentStatus } from '@/types';

export function EntityListPage() {
  const { entity = '' } = useParams<{ entity: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const config = ENTITY_CONFIGS[entity];
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [toDelete, setToDelete] = useState<string | null>(null);

  const locale = i18n.language;
  const statusLabels: Record<ContentStatus, string> = useMemo(
    () => ({
      draft: t('common.draft'),
      published: t('common.published'),
      scheduled: t('common.scheduled'),
      archived: t('common.archived'),
    }),
    [t],
  );

  const listQuery = useQuery({
    queryKey: queryKeys.admin.list(entity, { page, q, status: status || null }),
    queryFn: () => adminContentService.list<Record<string, unknown>>(entity, { page, q, status: status || null }),
    enabled: Boolean(config),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminContentService.remove(entity, id),
    onSuccess: () => {
      toast.success(t('admin.deleted'));
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list(entity) });
      invalidateForEntity(queryClient, entity);
    },
    onError: () => toast.error(t('errors.generic')),
  });

  if (!config) {
    return <p className="text-center text-sm text-slateGray">{t('notFound.title')}</p>;
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'title',
      header: t('admin.fields.title_ar'),
      render: (row) => {
        const label = config.displayField === 'name' ? pickLang(row.name_ar, row.name_en, locale) : pickLang(row.title_ar, row.title_en, locale);
        return <span className="font-semibold text-primary-900">{(label as string | null) ?? String(row.id ?? '')}</span>;
      },
    },
    {
      key: 'status',
      header: t('common.status'),
      className: 'w-32',
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status as ContentStatus] ?? 'gray'}>
          {statusLabels[row.status as ContentStatus] ?? String(row.status ?? '')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: t('common.createdAt'),
      className: 'w-36',
      render: (row) => <span className="text-xs" dir="ltr">{formatDate(row.created_at as string)}</span>,
    },
    {
      key: 'actions',
      header: '—',
      className: 'w-24',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/${entity}/${String(row.id)}/edit`}
            className="rounded-lg p-2 text-primary-700 transition-colors hover:bg-primary-50"
            aria-label={t('common.edit')}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToDelete(String(row.id));
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
        <h1 className="font-display text-xl font-bold text-primary-900">{t(`admin.entities.${entity}`)}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void listQuery.refetch()}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            {t('common.refresh')}
          </Button>
          <Link to={`/admin/${entity}/new`}>
            <Button size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              {t('admin.createEntity')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slateGray" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={t('admin.searchPlaceholder')}
            className="pr-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field min-w-40"
          aria-label={t('common.status')}
        >
          <option value="">{t('common.all')}</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={listQuery.data?.data ?? []}
        isLoading={listQuery.isPending}
        rowKey={(row) => String(row.id)}
        emptyTitle={t('admin.noData')}
        emptyDescription={t('admin.createFirstEntity')}
        onRowClick={(row) => navigate(`/admin/${entity}/${String(row.id)}/edit`)}
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

const STATUS_TONE: Record<ContentStatus, 'primary' | 'gold' | 'green' | 'red' | 'gray'> = {
  draft: 'gray',
  published: 'green',
  scheduled: 'gold',
  archived: 'red',
};
