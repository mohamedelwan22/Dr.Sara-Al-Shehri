import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Paperclip, Mail, Send, CheckCircle2 } from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { PageHeader } from '@/components/layout/PageHeader';
import { contactService } from '@/services';
import { contactFormSchema, contactTypeSchema, type ContactFormValues } from '@/schemas/contact';
import { Card, CardBody, Input, Textarea, Select, RadioGroup, FieldWrapper, Button, useToast } from '@/components/ui';

type ContactType = z.infer<typeof contactTypeSchema>;
type LooseErrors = Record<string, { message?: string } | undefined>;

const ACTIVITY_TYPES = ['course', 'lecture', 'workshop', 'meeting'] as const;

export function ContactPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { type: 'inquiry' } as ContactFormValues,
  });

  const selectedType = form.watch('type') as ContactType;
  const errors = form.formState.errors as LooseErrors;

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await contactService.submit({ form: values, attachment });
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('contact.')) toast.error(t(message));
      else toast.error(t('errors.uploadFailed'));
    }
  };

  if (submitted) {
    return (
      <>
        <Seo title={t('contact.title')} />
        <PageHeader title={t('contact.title')} />
        <div className="container-page flex justify-center py-16">
          <Card className="max-w-lg text-center">
            <CardBody className="flex flex-col items-center gap-4 py-10">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <h2 className="font-display text-xl font-bold text-primary-900">{t('contact.successTitle')}</h2>
              <p className="text-sm leading-relaxed text-slateGray-dark">{t('contact.successMessage')}</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                {t('contact.sendAnother')}
              </Button>
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={t('contact.title')} description={t('contact.subtitle')} />
      <PageHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <div className="container-page py-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          <Card className="h-fit lg:col-span-1">
            <CardBody className="space-y-4">
              <h2 className="font-display text-lg font-bold text-primary-900">{t('contact.quickContact')}</h2>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-gold-500" />
                <div>
                  <p className="text-sm font-bold text-primary-900">{t('common.email')}</p>
                  <p className="text-sm text-slateGray-dark" dir="ltr">
                    sara.shehri@iaau.edu.sa
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardBody>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <FieldWrapper label={t('contact.title')} error={errors.type?.message} id="contact-type">
                  <RadioGroup
                    id="contact-type"
                    name="type"
                    options={(contactTypeSchema.options as ContactType[]).map((value) => ({
                      value,
                      label: t(`contact.types.${value}`),
                    }))}
                    value={selectedType}
                    onChange={(value) => form.setValue('type', value as ContactType, { shouldValidate: true })}
                  />
                </FieldWrapper>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper label={t('common.name')} error={errors.name?.message} id="c-name">
                    <Input id="c-name" {...form.register('name')} error={Boolean(errors.name)} placeholder={t('common.name')} />
                  </FieldWrapper>
                  <FieldWrapper label={t('common.email')} error={errors.email?.message} id="c-email">
                    <Input id="c-email" type="email" dir="ltr" {...form.register('email')} error={Boolean(errors.email)} placeholder={t('common.email')} />
                  </FieldWrapper>
                </div>

                <FieldWrapper label={t('common.phone')} hint={t('common.optional')} id="c-phone">
                  <Input id="c-phone" dir="ltr" {...form.register('phone')} placeholder="+966" />
                </FieldWrapper>

                <TypeFields form={form} errors={errors} type={selectedType} />

                <FieldWrapper label={t('common.message')} error={errors.message?.message} id="c-message">
                  <Textarea
                    id="c-message"
                    rows={5}
                    {...form.register('message')}
                    error={Boolean(errors.message)}
                    placeholder={selectedType === 'inquiry' ? t('contact.inquiryHint') : t('common.typeHere')}
                  />
                </FieldWrapper>

                <div>
                  <span className="label-field">{t('contact.attachPdf')}</span>
                  <label
                    htmlFor="attachment"
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-primary-300 px-4 py-3 text-sm text-primary-700 transition-colors hover:border-gold-400 hover:bg-gold-50"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="line-clamp-1">{attachment ? attachment.name : t('contact.attachPdf')}</span>
                    <input
                      id="attachment"
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (file) {
                          if (file.type !== 'application/pdf') {
                            toast.error(t('contact.fileMustBePdf'));
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error(t('contact.fileTooLarge'));
                            return;
                          }
                          setAttachment(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <Button type="submit" variant="gold" className="w-full sm:w-auto" isLoading={form.formState.isSubmitting} leftIcon={<Send className="h-4 w-4" />}>
                  {t('contact.submit')}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function TypeFields({
  form,
  errors,
  type,
}: {
  form: ReturnType<typeof useForm<ContactFormValues>>;
  errors: LooseErrors;
  type: ContactType;
}) {
  const { t } = useTranslation();
  const register = form.register as (name: string, options?: Record<string, unknown>) => Record<string, unknown>;
  const watchStr = (name: string) => String(form.watch(name as never) ?? '');

  const setValue = (name: string, value: string) =>
    form.setValue(name as never, value as never, { shouldValidate: true });

  if (type === 'supervision' || type === 'discussion') {
    const isSupervision = type === 'supervision';
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.degree')} error={errors.degree?.message} id="c-degree">
            <Select id="c-degree" value={watchStr('degree')} onChange={(e) => setValue('degree', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="masters">{t('contact.masters')}</option>
              <option value="phd">{t('contact.phd')}</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t('contact.university')} error={errors.university?.message} id="c-univ">
            <Input id="c-univ" {...register('university')} error={Boolean(errors.university)} />
          </FieldWrapper>
        </div>
        <FieldWrapper
          label={isSupervision ? t('contact.proposedTitle') : t('contact.thesisTitle')}
          error={errors.proposedTitle?.message ?? errors.thesisTitle?.message}
          id="c-thesis"
        >
          <Input id="c-thesis" {...(isSupervision ? register('proposedTitle') : register('thesisTitle'))} />
        </FieldWrapper>
        {isSupervision ? (
          <FieldWrapper label={t('contact.haveResearchPlan')} error={errors.hasResearchPlan?.message} id="c-plan">
            <Select id="c-plan" value={watchStr('hasResearchPlan')} onChange={(e) => setValue('hasResearchPlan', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="yes">{t('common.yes')}</option>
              <option value="no">{t('common.no')}</option>
            </Select>
          </FieldWrapper>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label={t('contact.proposedDate')} error={errors.proposedDate?.message} id="c-date">
              <Input id="c-date" type="date" {...register('proposedDate')} />
            </FieldWrapper>
            <FieldWrapper label={t('contact.discussionLocation')} error={errors.discussionLocation?.message} id="c-loc">
              <Input id="c-loc" {...register('discussionLocation')} />
            </FieldWrapper>
          </div>
        )}
      </>
    );
  }

  if (type === 'course') {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.organization')} error={errors.organization?.message} id="c-org">
            <Input id="c-org" {...register('organization')} error={Boolean(errors.organization)} />
          </FieldWrapper>
          <FieldWrapper label={t('contact.activityTitle')} error={errors.activityTitle?.message} id="c-act">
            <Input id="c-act" {...register('activityTitle')} error={Boolean(errors.activityTitle)} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.activityType')} error={errors.activityType?.message} id="c-acttype">
            <Select id="c-acttype" value={watchStr('activityType')} onChange={(e) => setValue('activityType', e.target.value)}>
              <option value="">{t('common.select')}</option>
              {ACTIVITY_TYPES.map((key) => (
                <option key={key} value={key}>
                  {t(`contact.activityTypes.${key}`)}
                </option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t('contact.date')} error={errors.date?.message} id="c-date2">
            <Input id="c-date2" type="date" {...register('date')} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.attendance')} error={errors.attendance?.message} id="c-att">
            <Select id="c-att" value={watchStr('attendance')} onChange={(e) => setValue('attendance', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="inPerson">{t('contact.attendanceTypes.inPerson')}</option>
              <option value="remote">{t('contact.attendanceTypes.remote')}</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label={t('contact.hours')} error={errors.hours?.message} id="c-hours">
            <Input id="c-hours" {...register('hours')} error={Boolean(errors.hours)} />
          </FieldWrapper>
        </div>
      </>
    );
  }

  if (type === 'conference') {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.conferenceName')} error={errors.conferenceName?.message} id="c-conf">
            <Input id="c-conf" {...register('conferenceName')} error={Boolean(errors.conferenceName)} />
          </FieldWrapper>
          <FieldWrapper label={t('contact.organizer')} error={errors.organizer?.message} id="c-organizer">
            <Input id="c-organizer" {...register('organizer')} error={Boolean(errors.organizer)} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.conferenceLocation')} error={errors.conferenceLocation?.message} id="c-cloc">
            <Input id="c-cloc" {...register('conferenceLocation')} error={Boolean(errors.conferenceLocation)} />
          </FieldWrapper>
          <FieldWrapper label={t('contact.date')} error={errors.date?.message} id="c-date3">
            <Input id="c-date3" type="date" {...register('date')} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={t('contact.participationType')} error={errors.participationType?.message} id="c-ptype">
          <Select id="c-ptype" value={watchStr('participationType')} onChange={(e) => setValue('participationType', e.target.value)}>
            <option value="">{t('common.select')}</option>
            <option value="speaker">{t('contact.participationTypes.speaker')}</option>
            <option value="researcher">{t('contact.participationTypes.researcher')}</option>
            <option value="committee">{t('contact.participationTypes.committee')}</option>
            <option value="session">{t('contact.participationTypes.session')}</option>
          </Select>
        </FieldWrapper>
      </>
    );
  }

  if (type === 'collaboration') {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={t('contact.projectName')} error={errors.projectName?.message} id="c-proj">
            <Input id="c-proj" {...register('projectName')} error={Boolean(errors.projectName)} />
          </FieldWrapper>
          <FieldWrapper label={t('contact.organization')} error={errors.organization?.message} id="c-org2">
            <Input id="c-org2" {...register('organization')} error={Boolean(errors.organization)} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={t('contact.projectDescription')} error={errors.projectDescription?.message} id="c-pdesc">
          <Textarea id="c-pdesc" rows={3} {...register('projectDescription')} error={Boolean(errors.projectDescription)} />
        </FieldWrapper>
        <FieldWrapper label={t('contact.collaborationType')} error={errors.collaborationType?.message} id="c-ctype">
          <Input id="c-ctype" {...register('collaborationType')} error={Boolean(errors.collaborationType)} />
        </FieldWrapper>
      </>
    );
  }

  return null;
}
