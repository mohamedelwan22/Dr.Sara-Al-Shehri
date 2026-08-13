import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Plus, Save } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { FieldWrapper } from '@/components/ui';
import { LoadingState } from '@/components/ui';
import { useToast } from '@/components/ui';
import type { SiteSetting } from '@/types';

function tryParseJson(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: () => adminContentService.listSettings(),
  });

  const upsertMutation = useMutation({
    mutationFn: ({ key, value, isPublic }: { key: string; value: Record<string, unknown>; isPublic: boolean }) =>
      adminContentService.upsertSetting(key, value, isPublic),
    onSuccess: () => {
      toast.success(t('common.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const [newKey, setNewKey] = useState('');

  if (listQuery.isPending) return <LoadingState />;

  const rows = listQuery.data ?? [];

  const handleAdd = () => {
    if (!newKey.trim()) return;
    upsertMutation.mutate({ key: newKey.trim(), value: {}, isPublic: true });
    setNewKey('');
  };

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
        <SettingsIcon className="h-5 w-5 text-primary-600" />
        {t('admin.settings')}
      </h1>

      <div className="flex flex-wrap items-end gap-3 rounded-xl2 border border-primary-100 bg-white p-4">
        <div className="min-w-64 flex-1">
          <FieldWrapper label={t('admin.newSettingKey')}>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. hero_announcement"
              dir="ltr"
            />
          </FieldWrapper>
        </div>
        <Button onClick={handleAdd} leftIcon={<Plus className="h-4 w-4" />}>
          {t('admin.addSetting')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rows.map((setting) => (
          <SettingCard key={setting.key} setting={setting} onSave={(value, isPublic) =>
            upsertMutation.mutate({ key: setting.key, value, isPublic })
          } />
        ))}
      </div>

      {rows.length === 0 && (
        <p className="text-center text-sm text-slateGray">{t('admin.noData')}</p>
      )}
    </div>
  );
}

function SettingCard({
  setting,
  onSave,
}: {
  setting: SiteSetting;
  onSave: (value: Record<string, unknown>, isPublic: boolean) => void;
}) {
  const { t } = useTranslation();
  const [json, setJson] = useState(() => JSON.stringify(setting.value ?? {}, null, 2));
  const [isPublic, setIsPublic] = useState(setting.is_public);

  const valid = useMemo(() => tryParseJson(json), [json]);
  const dirty = valid !== null && JSON.stringify(valid) !== JSON.stringify(setting.value ?? {});

  return (
    <section className="flex flex-col gap-3 rounded-xl2 border border-primary-100 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-mono text-sm font-bold text-primary-900" dir="ltr">
          {setting.key}
        </h2>
        <Checkbox
          id={`public-${setting.key}`}
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          label={t('admin.isPublic')}
        />
      </div>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className={`input-field min-h-40 resize-y font-mono text-xs ${valid ? '' : 'border-red-400'}`}
        dir="ltr"
        spellCheck={false}
      />
      {!valid && <p className="text-xs text-red-600">{t('admin.invalidJson')}</p>}
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!valid || !dirty}
          onClick={() => {
            const parsed = tryParseJson(json);
            if (parsed) onSave(parsed, isPublic);
          }}
          leftIcon={<Save className="h-3.5 w-3.5" />}
        >
          {t('common.save')}
        </Button>
      </div>
    </section>
  );
}
