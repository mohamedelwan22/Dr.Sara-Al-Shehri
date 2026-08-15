import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Microscope, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminContentService } from '@/services';
import { queryKeys } from '@/services/queryKeys';
import { invalidateForEntity } from '@/services/queryInvalidation';
import { interestSchema, type InterestValues } from '@/schemas/content';
import { Button } from '@/components/ui';
import { Input, Textarea, Select } from '@/components/ui';
import { FieldWrapper } from '@/components/ui';
import { Badge } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { pickLang } from '@/lib/utils';
import type { ContentStatus, ResearchInterest } from '@/types';

const STATUS_OPTIONS: { value: ContentStatus; labelKey: string }[] = [
  { value: 'draft', labelKey: 'common.draft' },
  { value: 'published', labelKey: 'common.published' },
  { value: 'scheduled', labelKey: 'common.scheduled' },
  { value: 'archived', labelKey: 'common.archived' },
];

const STATUS_TONE: Record<ContentStatus, 'primary' | 'gold' | 'green' | 'red' | 'gray'> = {
  draft: 'gray',
  published: 'green',
  scheduled: 'gold',
  archived: 'red',
};

const INTERESTS_LIST_KEY = ['admin', 'profile', 'interests'] as const;

export function ResearchInterestsEditor() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState<'new' | string | null>(null);
  const [toDelete, setToDelete] = useState<ResearchInterest | null>(null);
  const locale = i18n.language;

  const listQuery = useQuery({
    queryKey: INTERESTS_LIST_KEY,
    queryFn: () => adminContentService.listInterests(),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: INTERESTS_LIST_KEY });
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.list('interests') });
    void queryClient.invalidateQueries({ queryKey: queryKeys.interests });
    invalidateForEntity(queryClient, 'interests');
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminContentService.remove('interests', id),
    onSuccess: () => {
      toast.success(t('admin.deleted'));
      setToDelete(null);
      invalidate();
    },
    onError: () => toast.error(t('errors.generic')),
  });

  const handleSaved = () => {
    toast.success(t('common.saved'));
    setOpenForm(null);
    invalidate();
  };

  if (listQuery.isPending) return <LoadingState />;
  if (listQuery.isError) {
    return (
      <ErrorState message={t('errors.generic')} onRetry={() => void listQuery.refetch()} />
    );
  }

  const interests = listQuery.data ?? [];
  const creating = openForm === 'new';

  return (
    <section className="rounded-xl2 border border-primary-100 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary-900">
            <Microscope className="h-5 w-5 text-primary-600" />
            {t('admin.interestsList')}
          </h2>
          <p className="mt-1 text-sm text-slateGray">{t('admin.interestsListHint')}</p>
        </div>
        <Button
          size="sm"
          onClick={() => setOpenForm('new')}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          {t('admin.addInterest')}
        </Button>
      </div>

      {creating && (
        <InterestForm key="new" onCancel={() => setOpenForm(null)} onSaved={handleSaved} />
      )}

      <ul className="divide-y divide-slate-100">
        {interests.map((interest) => (
          <li key={interest.id} className="py-3">
            {openForm === interest.id ? (
              <InterestForm
                initial={interest}
                onCancel={() => setOpenForm(null)}
                onSaved={handleSaved}
              />
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slateGray" dir="ltr">
                      {interest.sort_order}
                    </span>
                    <p className="truncate font-semibold text-primary-900">
                      {pickLang(interest.title_ar, interest.title_en, locale)}
                    </p>
                    <Badge tone={STATUS_TONE[interest.status] ?? 'gray'}>
                      {t(`common.${interest.status}`)}
                    </Badge>
                  </div>
                  {interest.description_ar || interest.description_en ? (
                    <p className="mt-1 line-clamp-2 text-sm text-slateGray-dark">
                      {pickLang(interest.description_ar, interest.description_en, locale)}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOpenForm(interest.id)}
                    className="rounded-lg p-2 text-primary-700 transition-colors hover:bg-primary-50"
                    aria-label={t('common.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setToDelete(interest)}
                    className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {interests.length === 0 && !creating && (
        <p className="py-4 text-center text-sm text-slateGray">{t('admin.noInterests')}</p>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id);
        }}
        title={t('admin.deleteTitle')}
        message={t('admin.deleteConfirm')}
        confirmLabel={t('common.delete')}
        danger
      />
    </section>
  );
}

function InterestForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: ResearchInterest;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const isEdit = Boolean(initial);

  const form = useForm<InterestValues>({
    resolver: zodResolver(interestSchema),
    defaultValues: {
      title_ar: initial?.title_ar ?? '',
      title_en: initial?.title_en ?? '',
      description_ar: initial?.description_ar ?? '',
      description_en: initial?.description_en ?? '',
      sort_order: initial?.sort_order ?? 0,
      status: (initial?.status as InterestValues['status']) ?? 'published',
    },
  });

  const { register, handleSubmit, formState } = form;

  const fieldError = (message?: string) => (message ? t(message) : undefined);

  const mutation = useMutation({
    mutationFn: async (values: InterestValues) => {
      const payload: Record<string, unknown> = {
        title_ar: values.title_ar,
        title_en: values.title_en || null,
        description_ar: values.description_ar || null,
        description_en: values.description_en || null,
        sort_order: values.sort_order || 0,
        status: values.status,
      };
      return isEdit
        ? adminContentService.update<ResearchInterest>('interests', String(initial?.id), payload)
        : adminContentService.create<ResearchInterest>('interests', payload);
    },
    onSuccess: onSaved,
    onError: () => toast.error(t('errors.generic')),
  });

  const onSubmit = (values: InterestValues) => mutation.mutate(values);

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="rounded-xl2 border border-primary-100 bg-ivory p-4"
      noValidate
    >
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldWrapper
          label={t('admin.fields.title_ar')}
          error={fieldError(formState.errors.title_ar?.message)}
          id="interest-title-ar"
        >
          <Input
            id="interest-title-ar"
            {...register('title_ar')}
            error={Boolean(formState.errors.title_ar)}
          />
        </FieldWrapper>
        <FieldWrapper
          label={t('admin.fields.title_en')}
          error={fieldError(formState.errors.title_en?.message)}
          id="interest-title-en"
        >
          <Input
            id="interest-title-en"
            {...register('title_en')}
            error={Boolean(formState.errors.title_en)}
          />
        </FieldWrapper>
        <FieldWrapper
          label={t('admin.fields.description_ar')}
          error={fieldError(formState.errors.description_ar?.message)}
          id="interest-description-ar"
        >
          <Textarea
            id="interest-description-ar"
            {...register('description_ar')}
            rows={3}
            error={Boolean(formState.errors.description_ar)}
          />
        </FieldWrapper>
        <FieldWrapper
          label={t('admin.fields.description_en')}
          error={fieldError(formState.errors.description_en?.message)}
          id="interest-description-en"
        >
          <Textarea
            id="interest-description-en"
            {...register('description_en')}
            rows={3}
            error={Boolean(formState.errors.description_en)}
          />
        </FieldWrapper>
        <FieldWrapper
          label={t('admin.fields.sort_order')}
          error={fieldError(formState.errors.sort_order?.message)}
          id="interest-sort-order"
        >
          <Input
            id="interest-sort-order"
            type="number"
            inputMode="numeric"
            {...register('sort_order')}
            error={Boolean(formState.errors.sort_order)}
          />
        </FieldWrapper>
        <FieldWrapper label={t('common.status')}>
          <Select {...register('status')}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button size="sm" type="submit" isLoading={mutation.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
