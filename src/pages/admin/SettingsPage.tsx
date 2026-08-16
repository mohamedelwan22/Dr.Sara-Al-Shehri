import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Plus, Save, Mail, Lock, UserCircle2, Share2 } from 'lucide-react';
import { adminContentService, authService } from '@/services';
import { isReauthRequiredError, isSessionExpiredError } from '@/services/authService';
import { queryKeys } from '@/services/queryKeys';
import { changeEmailSchema, changePasswordSchema, type ChangeEmailValues, type ChangePasswordValues } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Button, Checkbox, FieldWrapper, Input, LoadingState, useToast } from '@/components/ui';
import { SOCIAL_PLATFORMS, isValidSocialUrl } from '@/lib/socialLinks';
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

      <AccountSection />

      <SocialLinksSection initial={rows.find((setting) => setting.key === 'social_links')} />

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

function AccountSection() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const emailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: '' },
  });

  const emailMutation = useMutation({
    mutationFn: (values: ChangeEmailValues) => authService.updateEmail(values.newEmail),
    onSuccess: () => {
      toast.success(t('admin.emailChangeSent'));
      emailForm.reset();
      void queryClient.invalidateQueries({ queryKey: ['session'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (error) => {
      if (isSessionExpiredError(error)) {
        toast.error(t('errors.sessionExpired'));
        void authService.signOut().catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['session'] });
        void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        void queryClient.invalidateQueries({ queryKey: queryKeys.role });
      } else if (isReauthRequiredError(error)) {
        toast.error(t('errors.reauthRequired'));
      } else {
        toast.error(t('errors.generic'));
      }
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const passwordMutation = useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      if (!user?.email) throw new Error('not-authenticated');
      await authService.verifyPassword(user.email, values.currentPassword);
      await authService.updatePassword(values.newPassword);
    },
    onSuccess: () => {
      toast.success(t('admin.passwordChanged'));
      passwordForm.reset();
    },
    onError: (error) => {
      if (isSessionExpiredError(error)) {
        toast.error(t('errors.sessionExpired'));
        void authService.signOut().catch(() => undefined);
        void queryClient.invalidateQueries({ queryKey: ['session'] });
        void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        void queryClient.invalidateQueries({ queryKey: queryKeys.role });
      } else if (isReauthRequiredError(error)) {
        toast.error(t('errors.reauthRequired'));
      } else {
        const message = error instanceof Error ? error.message : '';
        if (message.toLowerCase().includes('invalid login credentials')) {
          toast.error(t('admin.incorrectCurrentPassword'));
        } else {
          toast.error(t('errors.generic'));
        }
      }
    },
  });

  return (
    <section className="rounded-xl2 border border-primary-100 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-primary-900">
        <UserCircle2 className="h-5 w-5 text-primary-600" />
        {t('admin.account')}
      </h2>

      <div className="mb-5 rounded-lg border border-primary-50 bg-primary-50/40 px-4 py-3 text-sm text-primary-900">
        <span className="font-bold">{t('admin.currentEmail')}:</span>{' '}
        <span dir="ltr">{user?.email ?? '—'}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={emailForm.handleSubmit((values) => emailMutation.mutate(values))}
          className="space-y-3 rounded-lg border border-slate-100 p-4"
          noValidate
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary-900">
            <Mail className="h-4 w-4 text-primary-400" />
            {t('admin.changeEmail')}
          </h3>
          <FieldWrapper label={t('admin.newEmail')} error={emailForm.formState.errors.newEmail?.message}>
            <Input
              type="email"
              dir="ltr"
              {...emailForm.register('newEmail')}
              error={Boolean(emailForm.formState.errors.newEmail)}
            />
          </FieldWrapper>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={emailMutation.isPending}
              disabled={!emailForm.formState.isValid}
              leftIcon={<Mail className="h-3.5 w-3.5" />}
            >
              {t('admin.changeEmail')}
            </Button>
          </div>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit((values) => passwordMutation.mutate(values))}
          className="space-y-3 rounded-lg border border-slate-100 p-4"
          noValidate
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary-900">
            <Lock className="h-4 w-4 text-primary-400" />
            {t('admin.changePassword')}
          </h3>
          <FieldWrapper label={t('admin.currentPassword')} error={passwordForm.formState.errors.currentPassword?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              {...passwordForm.register('currentPassword')}
              error={Boolean(passwordForm.formState.errors.currentPassword)}
            />
          </FieldWrapper>
          <FieldWrapper label={t('admin.newPassword')} error={passwordForm.formState.errors.newPassword?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('newPassword')}
              error={Boolean(passwordForm.formState.errors.newPassword)}
            />
          </FieldWrapper>
          <FieldWrapper label={t('admin.confirmNewPassword')} error={passwordForm.formState.errors.confirmPassword?.message}>
            <Input
              type="password"
              autoComplete="new-password"
              {...passwordForm.register('confirmPassword')}
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
            />
          </FieldWrapper>
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              isLoading={passwordMutation.isPending}
              disabled={!passwordForm.formState.isValid}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
            >
              {t('admin.changePassword')}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function SocialLinksSection({ initial }: { initial?: SiteSetting }) {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const raw = initial?.value?.[platform.id];
      base[platform.id] = typeof raw === 'string' ? raw : '';
    }
    return base;
  });
  const [invalid, setInvalid] = useState<Record<string, boolean>>({});

  const dirty = SOCIAL_PLATFORMS.some((platform) => {
    const raw = initial?.value?.[platform.id];
    return (typeof raw === 'string' ? raw : '') !== values[platform.id];
  });

  const saveMutation = useMutation({
    mutationFn: (value: Record<string, unknown>) =>
      adminContentService.upsertSetting('social_links', value, true),
    onSuccess: () => {
      toast.success(t('social.saved'));
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings('social_links') });
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const handleSave = () => {
    const nextInvalid: Record<string, boolean> = {};
    const payload: Record<string, string> = {};
    for (const platform of SOCIAL_PLATFORMS) {
      const value = values[platform.id] ?? '';
      if (!isValidSocialUrl(value)) nextInvalid[platform.id] = true;
      if (value.trim()) payload[platform.id] = value.trim();
    }
    setInvalid(nextInvalid);
    if (Object.keys(nextInvalid).length > 0) return;
    saveMutation.mutate(payload);
  };

  const setValue = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    setInvalid((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <section className="rounded-xl2 border border-primary-100 bg-white p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-primary-900">
        <Share2 className="h-5 w-5 text-primary-600" />
        {t('social.title')}
      </h2>
      <p className="mb-4 text-sm text-slateGray">{t('social.hint')}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <FieldWrapper
              key={platform.id}
              label={t(platform.labelKey)}
              error={invalid[platform.id] ? t('social.invalidUrl') : undefined}
            >
              <div className="relative">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon className="h-4 w-4" />
                </span>
                <Input
                  dir="ltr"
                  placeholder={t('social.placeholder')}
                  value={values[platform.id] ?? ''}
                  onChange={(e) => setValue(platform.id, e.target.value)}
                  error={Boolean(invalid[platform.id])}
                  className="ps-9"
                />
              </div>
            </FieldWrapper>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          isLoading={saveMutation.isPending}
          disabled={!dirty || saveMutation.isPending}
          leftIcon={<Save className="h-3.5 w-3.5" />}
        >
          {t('common.save')}
        </Button>
      </div>
    </section>
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
