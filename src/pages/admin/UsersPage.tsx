import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { AdminTable, type Column } from '@/components/ui';
import { Pagination } from '@/components/ui';
import { Badge } from '@/components/ui';
import { LoadingState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { Profile } from '@/types';

const ROLE_OPTIONS = [
  { value: 'user', labelKey: 'admin.roleUser' },
  { value: 'admin', labelKey: 'admin.roleAdmin' },
];

export function UsersPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: queryKeys.admin.users({ q, page }),
    queryFn: () => adminContentService.listUsers({ q, page }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'user' }) =>
      adminContentService.setUserRole(userId, role),
    onSuccess: () => {
      toast.success(t('admin.updated'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const roleLabels = useMemo(
    () => ({ user: t('admin.roleUser'), admin: t('admin.roleAdmin') }),
    [t],
  );

  if (listQuery.isPending) return <LoadingState />;

  const rows = listQuery.data?.data ?? [];
  const roleByUser = listQuery.data?.roleByUser ?? {};

  const columns: Column<Profile>[] = [
    {
      key: 'display_name',
      header: t('common.name'),
      render: (row) => (
        <div>
          <p className="font-semibold text-primary-900">{row.display_name || t('common.name')}</p>
          <p className="text-xs text-slateGray" dir="ltr">{row.id}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: t('admin.role'),
      className: 'w-40',
      render: (row) => (
        <Badge tone={roleByUser[row.id] === 'admin' ? 'gold' : 'gray'}>
          {roleLabels[roleByUser[row.id] ?? 'user']}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: t('common.createdAt'),
      className: 'w-36',
      render: (row) => (
        <span className="text-xs" dir="ltr">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: t('admin.role'),
      className: 'w-40',
      render: (row) =>
        user?.id === row.id ? (
          <span className="text-xs text-slateGray">{t('admin.selfRoleNote')}</span>
        ) : (
          <Select
            value={roleByUser[row.id] ?? 'user'}
            onChange={(e) =>
              roleMutation.mutate({ userId: row.id, role: e.target.value as 'admin' | 'user' })
            }
            className="min-w-32 py-1.5 text-sm"
            aria-label={t('admin.role')}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          {t('admin.users')}
        </h1>
      </div>

      <div className="relative max-w-sm">
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

      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle={t('admin.noData')}
      />

      <Pagination page={listQuery.data?.page ?? 1} totalPages={listQuery.data?.totalPages ?? 1} onChange={setPage} />
    </div>
  );
}
