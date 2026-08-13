import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRound } from 'lucide-react';
import { adminContentService } from '@/services';
import { invalidateProfileContent } from '@/services/queryInvalidation';
import { Button } from '@/components/ui';
import { Input, Textarea, Select } from '@/components/ui';
import { FieldWrapper } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui';
import { useToast } from '@/components/ui';
import type { ProfileContent } from '@/types';

const SECTIONS = ['biography', 'mission', 'interests'] as const;
const STATUS_OPTIONS = [
  { value: 'published', labelKey: 'common.published' },
  { value: 'draft', labelKey: 'common.draft' },
];

interface SectionForm {
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  status: string;
}

export function ProfilePage() {
  const { t } = useTranslation();
  const toast = useToast();

  const sectionsQuery = useQuery({
    queryKey: ['admin', 'profile-sections'],
    queryFn: () => adminContentService.listProfileSections(),
  });

  const bySection = useMemo(() => {
    const map: Record<string, ProfileContent> = {};
    for (const row of sectionsQuery.data ?? []) {
      if (row.section) map[row.section] = row as ProfileContent;
    }
    return map;
  }, [sectionsQuery.data]);

  if (sectionsQuery.isPending) return <LoadingState />;
  if (sectionsQuery.isError) {
    return (
      <ErrorState message={t('errors.generic')} onRetry={() => void sectionsQuery.refetch()} />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-xl font-bold text-primary-900">
          <UserRound className="h-5 w-5 text-primary-600" />
          {t('admin.profile')}
        </h1>
        <p className="mt-1 text-sm text-slateGray">{t('admin.profileHint')}</p>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <SectionEditor
            key={section}
            section={section}
            initial={bySection[section]}
            toast={toast}
          />
        ))}
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  initial,
  toast,
}: {
  section: string;
  initial?: ProfileContent;
  toast: ReturnType<typeof useToast>;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SectionForm>({
    title_ar: initial?.title_ar ?? '',
    title_en: initial?.title_en ?? '',
    body_ar: initial?.body_ar ?? '',
    body_en: initial?.body_en ?? '',
    status: initial?.status ?? 'published',
  });

  useEffect(() => {
    setForm({
      title_ar: initial?.title_ar ?? '',
      title_en: initial?.title_en ?? '',
      body_ar: initial?.body_ar ?? '',
      body_en: initial?.body_en ?? '',
      status: initial?.status ?? 'published',
    });
  }, [initial]);

  const set = (key: keyof SectionForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await adminContentService.upsertProfileSection(section, form);
      invalidateProfileContent(queryClient);
      toast.success(t('common.saved'));
    } catch {
      toast.error(t('errors.generic'));
    }
  };

  return (
    <section className="rounded-xl2 border border-primary-100 bg-white p-5">
      <h2 className="mb-4 font-display text-lg font-bold text-primary-900">
        {t(`admin.sections.${section}`)}
      </h2>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldWrapper label={t('admin.fields.title_ar')}>
          <Input value={form.title_ar} onChange={(e) => set('title_ar')(e.target.value)} />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.title_en')}>
          <Input value={form.title_en} onChange={(e) => set('title_en')(e.target.value)} />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.body_ar')}>
          <Textarea
            value={form.body_ar}
            onChange={(e) => set('body_ar')(e.target.value)}
            rows={6}
          />
        </FieldWrapper>
        <FieldWrapper label={t('admin.fields.body_en')}>
          <Textarea
            value={form.body_en}
            onChange={(e) => set('body_en')(e.target.value)}
            rows={6}
          />
        </FieldWrapper>
        <FieldWrapper label={t('common.status')}>
          <Select value={form.status} onChange={(e) => set('status')(e.target.value)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => void handleSave()}>{t('common.save')}</Button>
      </div>
    </section>
  );
}
