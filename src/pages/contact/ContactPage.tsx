import { useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Mail, Phone, MapPin, Building2, Clock, Send, CheckCircle2, Paperclip,
  BookOpen, GraduationCap, Mic, Handshake, HelpCircle, ChevronLeft,
  User, UserCheck, Tag, Edit3, ShieldCheck, Users, Calendar, MoreHorizontal,
} from 'lucide-react';
import { Seo } from '@/components/layout/Seo';
import { contactService, settingsService, queryKeys } from '@/services';
import { contactFormSchema, type ContactFormValues, type ContactType } from '@/schemas/contact';
import {
  Card, CardBody, Input, Textarea, Select, FieldWrapper, Button, useToast,
} from '@/components/ui';

type LooseErrors = Record<string, { message?: string } | undefined>;

const QUICK_TYPES: { type: ContactType; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'inquiry',       icon: BookOpen },
  { type: 'supervision',   icon: GraduationCap },
  { type: 'discussion',    icon: Users },
  { type: 'course',        icon: Mic },
  { type: 'conference',    icon: Calendar },
  { type: 'collaboration', icon: Handshake },
  { type: 'other',         icon: MoreHorizontal },
];

export function ContactPage() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  const toast = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const contactInfoQuery = useQuery({
    queryKey: queryKeys.settings('contact_info'),
    queryFn: () => settingsService.getContactInfo(),
  });

  const info = contactInfoQuery.data ?? {};
  const email        = info.email ?? '';
  const phone        = info.phone ?? '';
  const university   = locale === 'en' ? (info.university_en ?? info.university_ar ?? '') : (info.university_ar ?? '');
  const department   = locale === 'en' ? (info.department_en ?? info.department_ar ?? '') : (info.department_ar ?? '');
  const location     = locale === 'en' ? (info.location_en ?? info.location_ar ?? '') : (info.location_ar ?? '');
  const responseTime = locale === 'en' ? (info.response_time_en ?? '') : (info.response_time_ar ?? '');
  const subtitle     = locale === 'en' ? (info.subtitle_en ?? '') : (info.subtitle_ar ?? '');
  const noticeText   = locale === 'en' ? (info.notice_en ?? '') : (info.notice_ar ?? '');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { type: 'inquiry', role: '' } as ContactFormValues,
  });

  const selectedType = form.watch('type') as ContactType;
  const errors = form.formState.errors as LooseErrors;

  const messagePlaceholder = useMemo(
    () => t(`contact.messagePlaceholders.${selectedType}`, t('common.typeHere')),
    [selectedType, t],
  );

  const handleQuickSelect = (type: ContactType) => {
    form.setValue('type', type, { shouldValidate: false });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await contactService.submit({ form: values, attachment });
      toast.success(t('contact.successTitle'));
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
        <ContactHeader customSubtitle={subtitle} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex justify-center">
          <Card className="max-w-lg w-full text-center border border-[#E7DFED]">
            <CardBody className="flex flex-col items-center gap-4 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="font-display text-xl font-bold text-[#35145C]">{t('contact.successTitle')}</h2>
              <p className="text-sm leading-relaxed text-slateGray">{t('contact.successMessage')}</p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>{t('contact.sendAnother')}</Button>
            </CardBody>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo title={t('contact.title')} description={subtitle || t('contact.subtitle')} />
      <ContactHeader customSubtitle={subtitle} />

      {/* 3-column grid container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.8fr_1fr]">

          {/* ── Contact Info (بيانات التواصل) — desktop LEFT, mobile LAST ── */}
          <div className="order-3 space-y-4 lg:order-3">
            <div className="rounded-2xl border border-[#E7DFED] bg-white p-5 shadow-xs flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h2 className="font-display text-lg font-bold text-[#35145C] border-b border-[#E7DFED] pb-3">
                  {t('contact.contactInfo')}
                </h2>

                <div className="space-y-3.5">
                  {email && (
                    <InfoRow icon={<Mail className="h-4 w-4" />} label={t('common.email')}>
                      <a href={`mailto:${email}`} className="text-sm font-medium text-[#35145C] hover:underline" dir="ltr">{email}</a>
                    </InfoRow>
                  )}
                  {phone && (
                    <InfoRow icon={<Phone className="h-4 w-4" />} label={t('common.phone')}>
                      <span className="text-sm font-medium text-[#35145C]" dir="ltr">{phone}</span>
                    </InfoRow>
                  )}
                  {university && (
                    <InfoRow icon={<Building2 className="h-4 w-4" />} label={t('contact.university')}>
                      <span className="text-sm font-medium text-[#35145C]">{university}</span>
                    </InfoRow>
                  )}
                  {department && (
                    <InfoRow icon={<BookOpen className="h-4 w-4" />} label={t('contact.orgLabel')}>
                      <span className="text-sm font-medium text-[#35145C]">{department}</span>
                    </InfoRow>
                  )}
                  {location && (
                    <InfoRow icon={<MapPin className="h-4 w-4" />} label={t('calendar.location')}>
                      <span className="text-sm font-medium text-[#35145C]">{location}</span>
                    </InfoRow>
                  )}
                </div>
              </div>

              {responseTime && (
                <div className="mt-6 rounded-xl bg-[#F8F3FC] border border-[#E9DCF5] p-3.5 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#35145C] shadow-xs border border-[#E0D0F0]">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slateGray mb-0.5">{t('contact.responseTime')}</p>
                    <p className="text-xs font-semibold text-[#35145C]">{responseTime}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Send Message Form (أرسل رسالة) — desktop CENTER, mobile FIRST ── */}
          <div ref={formRef} className="order-1 lg:order-2">
            <div className="rounded-2xl border border-[#E7DFED] bg-white p-6 shadow-xs">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl font-bold text-[#35145C]">
                  {t('contact.sendMessage')}
                </h2>
                <div className="relative my-2 flex h-px w-24 mx-auto items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/50 to-transparent">
                  <span className="bg-white px-1.5 text-[9px] text-[#D89A16]">❖</span>
                </div>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {/* Row 1: الاسم والبريد */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper label={`${t('contact.fullName')} *`} error={errors.name?.message} id="c-name">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <Input id="c-name" {...form.register('name')} error={Boolean(errors.name)} placeholder={t('contact.fullName')} className="ps-9" />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label={`${t('common.email')} *`} error={errors.email?.message} id="c-email">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input id="c-email" type="email" dir="ltr" {...form.register('email')} error={Boolean(errors.email)} placeholder="name@domain.com" className="ps-9" />
                    </div>
                  </FieldWrapper>
                </div>

                {/* Row 2: الجهة أو الجامعة + الصفة */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper label={t('contact.orgLabel')} hint={t('common.optional')} id="c-org">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <Input id="c-org" {...form.register('organization')} placeholder={t('contact.orgLabel')} className="ps-9" />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label={`${t('contact.roleLabel')} *`} error={errors.role?.message} id="c-role">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <UserCheck className="h-4 w-4" />
                      </span>
                      <Select id="c-role" value={form.watch('role')} onChange={(e) => form.setValue('role', e.target.value, { shouldValidate: true })} error={Boolean(errors.role)} className="ps-9">
                        <option value="">{t('common.select')}</option>
                        <option value="student">{t('contact.roles.student')}</option>
                        <option value="researcher">{t('contact.roles.researcher')}</option>
                        <option value="faculty">{t('contact.roles.faculty')}</option>
                        <option value="independent">{t('contact.roles.independent')}</option>
                        <option value="other">{t('contact.roles.other')}</option>
                      </Select>
                    </div>
                  </FieldWrapper>
                </div>

                {/* Row 3: موضوع الرسالة + نوع الاستفسار */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper label={`${t('contact.subject')} *`} error={errors.subject?.message} id="c-subject">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Tag className="h-4 w-4" />
                      </span>
                      <Input id="c-subject" {...form.register('subject')} error={Boolean(errors.subject)} placeholder={t('contact.subject')} className="ps-9" />
                    </div>
                  </FieldWrapper>

                  <FieldWrapper label={`${t('contact.typeLabel')} *`} id="c-type">
                    <div className="relative">
                      <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <HelpCircle className="h-4 w-4" />
                      </span>
                      <Select
                        id="c-type"
                        value={selectedType}
                        onChange={(e) => form.setValue('type', e.target.value as ContactType, { shouldValidate: true })}
                        className="ps-9"
                      >
                        {QUICK_TYPES.map(({ type }) => (
                          <option key={type} value={type}>{t(`contact.types.${type}`)}</option>
                        ))}
                      </Select>
                    </div>
                  </FieldWrapper>
                </div>

                {/* dynamic fields */}
                <TypeFields form={form} errors={errors} type={selectedType} />

                {/* Row 4: نص الرسالة */}
                <FieldWrapper label={`${t('contact.message')} *`} error={errors.message?.message} id="c-message">
                  <div className="relative">
                    <span className="pointer-events-none absolute start-3 top-3 text-slate-400">
                      <Edit3 className="h-4 w-4" />
                    </span>
                    <Textarea
                      id="c-message"
                      rows={4}
                      {...form.register('message')}
                      error={Boolean(errors.message)}
                      placeholder={messagePlaceholder}
                      className="ps-9"
                    />
                  </div>
                </FieldWrapper>

                {/* Attachment Row */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <span className="block text-xs font-bold text-primary-900 mb-1.5">
                    {t('contact.attachPdf')} ({t('common.optional')})
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor="attachment"
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-primary-900 shadow-2xs hover:bg-slate-50 transition-colors"
                    >
                      {t('common.chooseFile')}
                    </label>
                    <span className="text-xs text-slateGray">
                      {attachment ? (
                        <span className="font-semibold text-[#35145C] flex items-center gap-1.5">
                          <Paperclip className="h-3.5 w-3.5 text-[#D89A16]" />
                          {attachment.name}
                        </span>
                      ) : (
                        'يمكنك إرفاق ملفات بصيغة (PDF, DOC, DOCX) وبحجم لا يزيد عن 10 ميجابايت'
                      )}
                    </span>
                    <input
                      id="attachment"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        if (!file) return;
                        const ext = file.name.split('.').pop()?.toLowerCase();
                        if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
                          toast.error(t('contact.fileMustBePdf'));
                          return;
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error(t('contact.fileTooLarge'));
                          return;
                        }
                        setAttachment(file);
                      }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-[#35145C] hover:bg-[#280E47] text-white py-3.5 text-base font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all mt-2"
                  isLoading={form.formState.isSubmitting}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  {form.formState.isSubmitting ? t('contact.sending') : t('contact.submit')}
                </Button>

                {/* Privacy footer inside form */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slateGray pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{t('contact.privacyNote')}</span>
                </div>
              </form>
            </div>
          </div>

          {/* ── Quick Contact (تواصل سريع) — desktop RIGHT, mobile SECOND ── */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-[#E7DFED] bg-white p-5 shadow-xs space-y-3">
              <h2 className="font-display text-lg font-bold text-[#35145C] border-b border-[#E7DFED] pb-2">
                {t('contact.quickContact')}
              </h2>
              <p className="text-xs text-slateGray leading-relaxed">{t('contact.quickContactSubtitle')}</p>

              <div className="space-y-2.5 pt-1">
                {QUICK_TYPES.map(({ type, icon: Icon }) => {
                  const isActive = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleQuickSelect(type)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-all ${
                        isActive
                          ? 'border-[#35145C] bg-[#F9F5FC] shadow-xs'
                          : 'border-[#E7DFED] bg-white hover:border-[#35145C]/40 hover:bg-[#FAF6FC]'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-[#35145C] text-white' : 'bg-[#F3EBF9] text-[#35145C]'}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#35145C] leading-snug">{t(`contact.types.${type}`)}</p>
                        <p className="text-[11px] text-slate-500 font-normal leading-snug line-clamp-1">{t(`contact.typeSubtitles.${type}`)}</p>
                      </div>
                      <ChevronLeft className={`ms-auto h-4 w-4 shrink-0 rtl:rotate-0 ltr:rotate-180 ${isActive ? 'text-[#35145C]' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── Full-Width Academic Notice Section (أسفل الأعمدة) ── */}
        <div className="mt-10">
          <div className="relative rounded-2xl border border-[#E9DCF5] bg-[#FCFAFE] px-8 py-6 text-center shadow-2xs">
            <span className="absolute start-6 top-3 font-serif text-3xl font-extrabold text-[#D89A16]/50 select-none">“</span>
            <p className="mx-auto max-w-4xl text-xs sm:text-sm font-medium leading-relaxed text-[#4A3B5C]">
              {noticeText || 'يرحب الموقع بالمراسلات العلمية والأكاديمية، ويُعتذر عن الرد على الرسائل غير المتعلقة بمجالات الاهتمام العلمي للموقع. ويتم الرد - بمشيئة الله - بحسب أولوية الرسائل الواردة وظروف الارتباطات الأكاديمية.'}
            </p>
            <span className="absolute end-6 bottom-3 font-serif text-3xl font-extrabold text-[#D89A16]/50 select-none">”</span>
          </div>
        </div>

      </div>
    </>
  );
}

// ── Contact header component ──────────────────────────────────────────────────
function ContactHeader({ customSubtitle }: { customSubtitle?: string }) {
  const { t } = useTranslation();
  return (
    <header className="relative bg-gradient-to-b from-[#F5F0FA]/80 via-white to-white pb-8 pt-10 border-b border-[#E7DFED]/60 overflow-hidden">
      {/* Bookmark ribbon */}
      <div className="absolute top-0 right-6 sm:right-10 z-10 hidden sm:block">
        <div
          className="flex h-16 w-10 items-center justify-center bg-[#35145C] text-[#D89A16] shadow-sm"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
        >
          <span className="text-base font-bold">❖</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F0FA] ring-4 ring-[#F5F0FA]/60 shadow-inner">
            <Mail className="h-6 w-6 text-[#35145C]" />
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#35145C] sm:text-4xl">{t('contact.title')}</h1>
        </div>
        <div className="relative my-2.5 flex h-px w-48 mx-auto items-center justify-center bg-gradient-to-r from-transparent via-[#D89A16]/50 to-transparent">
          <span className="bg-white px-2 text-[10px] text-[#D89A16]">❖</span>
        </div>
        <p className="mx-auto max-w-xl text-sm font-medium leading-relaxed text-slateGray sm:text-base">
          {customSubtitle || t('contact.subtitle')}
        </p>
      </div>
    </header>
  );
}

// ── Info row helper component ─────────────────────────────────────────────────
function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-[#F5EDFA] last:border-b-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4ECFA] text-[#35145C]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-slateGray mb-0.5">{label}</p>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ── Dynamic type-specific fields component ────────────────────────────────────
function TypeFields({
  form, errors, type,
}: {
  form: ReturnType<typeof useForm<ContactFormValues>>;
  errors: LooseErrors;
  type: ContactType;
}) {
  const { t } = useTranslation();
  const reg = form.register as (name: string) => Record<string, unknown>;
  const watch = (name: string) => String(form.watch(name as never) ?? '');
  const set = (name: string, val: string) => form.setValue(name as never, val as never, { shouldValidate: true });

  if (type === 'supervision') {
    return (
      <div className="space-y-4 rounded-xl border border-[#E9DCF5] bg-[#FDFBFD] p-4 my-2">
        <p className="text-xs font-bold text-[#35145C] border-b border-[#E9DCF5] pb-2">{t('contact.supervisionSection')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.degree')} *`} error={errors.degree?.message} id="c-degree">
            <Select id="c-degree" value={watch('degree')} onChange={(e) => set('degree', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="masters">{t('contact.masters')}</option>
              <option value="phd">{t('contact.phd')}</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.university')} *`} error={errors.university?.message} id="c-univ">
            <Input id="c-univ" {...reg('university')} error={Boolean(errors.university)} placeholder={t('contact.university')} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={`${t('contact.proposedTitle')} *`} error={errors.proposedTitle?.message} id="c-ptitle">
          <Input id="c-ptitle" {...reg('proposedTitle')} error={Boolean(errors.proposedTitle)} placeholder={t('contact.proposedTitle')} />
        </FieldWrapper>
        <FieldWrapper label={`${t('contact.haveResearchPlan')} *`} error={errors.hasResearchPlan?.message} id="c-plan">
          <Select id="c-plan" value={watch('hasResearchPlan')} onChange={(e) => set('hasResearchPlan', e.target.value)}>
            <option value="">{t('common.select')}</option>
            <option value="yes">{t('common.yes')}</option>
            <option value="no">{t('common.no')}</option>
          </Select>
        </FieldWrapper>
      </div>
    );
  }

  if (type === 'discussion') {
    return (
      <div className="space-y-4 rounded-xl border border-[#E9DCF5] bg-[#FDFBFD] p-4 my-2">
        <p className="text-xs font-bold text-[#35145C] border-b border-[#E9DCF5] pb-2">{t('contact.discussionSection')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.degree')} *`} error={errors.degree?.message} id="c-ddeg">
            <Select id="c-ddeg" value={watch('degree')} onChange={(e) => set('degree', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="masters">{t('contact.masters')}</option>
              <option value="phd">{t('contact.phd')}</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.university')} *`} error={errors.university?.message} id="c-duniv">
            <Input id="c-duniv" {...reg('university')} error={Boolean(errors.university)} placeholder={t('contact.university')} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={`${t('contact.thesisTitle')} *`} error={errors.thesisTitle?.message} id="c-dtitle">
          <Input id="c-dtitle" {...reg('thesisTitle')} error={Boolean(errors.thesisTitle)} placeholder={t('contact.thesisTitle')} />
        </FieldWrapper>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.proposedDate')} *`} error={errors.proposedDate?.message} id="c-ddate">
            <Input id="c-ddate" type="date" {...reg('proposedDate')} />
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.discussionLocation')} *`} error={errors.discussionLocation?.message} id="c-dloc">
            <Input id="c-dloc" {...reg('discussionLocation')} error={Boolean(errors.discussionLocation)} placeholder={t('contact.discussionLocation')} />
          </FieldWrapper>
        </div>
      </div>
    );
  }

  if (type === 'course') {
    return (
      <div className="space-y-4 rounded-xl border border-[#E9DCF5] bg-[#FDFBFD] p-4 my-2">
        <p className="text-xs font-bold text-[#35145C] border-b border-[#E9DCF5] pb-2">{t('contact.courseSection')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.organization')} *`} error={errors.organization?.message} id="c-corg">
            <Input id="c-corg" {...reg('organization')} error={Boolean(errors.organization)} placeholder={t('contact.organization')} />
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.activityTitle')} *`} error={errors.activityTitle?.message} id="c-act">
            <Input id="c-act" {...reg('activityTitle')} error={Boolean(errors.activityTitle)} placeholder={t('contact.activityTitle')} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.activityType')} *`} error={errors.activityType?.message} id="c-atype">
            <Select id="c-atype" value={watch('activityType')} onChange={(e) => set('activityType', e.target.value)}>
              <option value="">{t('common.select')}</option>
              {(['course', 'lecture', 'workshop', 'meeting'] as const).map((k) => (
                <option key={k} value={k}>{t(`contact.activityTypes.${k}`)}</option>
              ))}
            </Select>
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.date')} *`} error={errors.date?.message} id="c-cdate">
            <Input id="c-cdate" type="date" {...reg('date')} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.attendance')} *`} error={errors.attendance?.message} id="c-att">
            <Select id="c-att" value={watch('attendance')} onChange={(e) => set('attendance', e.target.value)}>
              <option value="">{t('common.select')}</option>
              <option value="inPerson">{t('contact.attendanceTypes.inPerson')}</option>
              <option value="remote">{t('contact.attendanceTypes.remote')}</option>
            </Select>
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.hours')} *`} error={errors.hours?.message} id="c-hrs">
            <Input id="c-hrs" type="number" {...reg('hours')} error={Boolean(errors.hours)} placeholder="1" />
          </FieldWrapper>
        </div>
      </div>
    );
  }

  if (type === 'conference') {
    return (
      <div className="space-y-4 rounded-xl border border-[#E9DCF5] bg-[#FDFBFD] p-4 my-2">
        <p className="text-xs font-bold text-[#35145C] border-b border-[#E9DCF5] pb-2">{t('contact.conferenceSection')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.conferenceName')} *`} error={errors.conferenceName?.message} id="c-cname">
            <Input id="c-cname" {...reg('conferenceName')} error={Boolean(errors.conferenceName)} placeholder={t('contact.conferenceName')} />
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.organizer')} *`} error={errors.organizer?.message} id="c-organ">
            <Input id="c-organ" {...reg('organizer')} error={Boolean(errors.organizer)} placeholder={t('contact.organizer')} />
          </FieldWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.conferenceLocation')} *`} error={errors.conferenceLocation?.message} id="c-cloc">
            <Input id="c-cloc" {...reg('conferenceLocation')} error={Boolean(errors.conferenceLocation)} placeholder={t('contact.conferenceLocation')} />
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.date')} *`} error={errors.date?.message} id="c-cfdate">
            <Input id="c-cfdate" type="date" {...reg('date')} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={`${t('contact.participationType')} *`} error={errors.participationType?.message} id="c-ptype">
          <Select id="c-ptype" value={watch('participationType')} onChange={(e) => set('participationType', e.target.value)}>
            <option value="">{t('common.select')}</option>
            {(['speaker', 'researcher', 'committee', 'session'] as const).map((k) => (
              <option key={k} value={k}>{t(`contact.participationTypes.${k}`)}</option>
            ))}
          </Select>
        </FieldWrapper>
      </div>
    );
  }

  if (type === 'collaboration') {
    return (
      <div className="space-y-4 rounded-xl border border-[#E9DCF5] bg-[#FDFBFD] p-4 my-2">
        <p className="text-xs font-bold text-[#35145C] border-b border-[#E9DCF5] pb-2">{t('contact.collaborationSection')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label={`${t('contact.projectName')} *`} error={errors.projectName?.message} id="c-proj">
            <Input id="c-proj" {...reg('projectName')} error={Boolean(errors.projectName)} placeholder={t('contact.projectName')} />
          </FieldWrapper>
          <FieldWrapper label={`${t('contact.organization')} *`} error={errors.organization?.message} id="c-prg">
            <Input id="c-prg" {...reg('organization')} error={Boolean(errors.organization)} placeholder={t('contact.organization')} />
          </FieldWrapper>
        </div>
        <FieldWrapper label={`${t('contact.projectDescription')} *`} error={errors.projectDescription?.message} id="c-pdesc">
          <Textarea id="c-pdesc" rows={3} {...reg('projectDescription')} error={Boolean(errors.projectDescription)} placeholder={t('contact.projectDescription')} />
        </FieldWrapper>
        <FieldWrapper label={`${t('contact.collaborationType')} *`} error={errors.collaborationType?.message} id="c-ctype">
          <Input id="c-ctype" {...reg('collaborationType')} error={Boolean(errors.collaborationType)} placeholder={t('contact.collaborationType')} />
        </FieldWrapper>
      </div>
    );
  }

  return null;
}
