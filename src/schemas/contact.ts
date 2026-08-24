import { z } from 'zod';

export const contactTypeSchema = z.enum([
  'inquiry',
  'supervision',
  'discussion',
  'course',
  'conference',
  'collaboration',
  'other',
]);

export const contactBase = {
  name: z.string().min(1, { message: 'contact.required' }).max(120),
  email: z.string().min(1, { message: 'contact.required' }).email({ message: 'contact.invalidEmail' }),
  organization: z.string().max(200).optional().or(z.literal('')),
  role: z.string().min(1, { message: 'contact.required' }),
  subject: z.string().min(1, { message: 'contact.required' }).max(200),
  phone: z.string().max(30).optional().or(z.literal('')),
  message: z.string().min(1, { message: 'contact.required' }).max(5000),
};

export const contactFormSchema = z
  .discriminatedUnion('type', [
    z.object({
      type: z.literal('inquiry'),
      ...contactBase,
    }),
    z.object({
      type: z.literal('supervision'),
      ...contactBase,
      degree: z.enum(['masters', 'phd'], { message: 'contact.required' }),
      university: z.string().min(1, { message: 'contact.required' }).max(200),
      proposedTitle: z.string().min(1, { message: 'contact.required' }).max(500),
      hasResearchPlan: z.enum(['yes', 'no'], { message: 'contact.required' }),
    }),
    z.object({
      type: z.literal('discussion'),
      ...contactBase,
      university: z.string().min(1, { message: 'contact.required' }).max(200),
      degree: z.enum(['masters', 'phd'], { message: 'contact.required' }),
      thesisTitle: z.string().min(1, { message: 'contact.required' }).max(500),
      proposedDate: z.string().min(1, { message: 'contact.required' }),
      discussionLocation: z.string().min(1, { message: 'contact.required' }).max(300),
    }),
    z.object({
      type: z.literal('course'),
      ...contactBase,
      organization: z.string().min(1, { message: 'contact.required' }).max(200),
      activityTitle: z.string().min(1, { message: 'contact.required' }).max(500),
      activityType: z.enum(['course', 'lecture', 'workshop', 'meeting'], {
        message: 'contact.required',
      }),
      date: z.string().min(1, { message: 'contact.required' }),
      attendance: z.enum(['inPerson', 'remote'], { message: 'contact.required' }),
      hours: z.string().min(1, { message: 'contact.required' }).max(20),
    }),
    z.object({
      type: z.literal('conference'),
      ...contactBase,
      conferenceName: z.string().min(1, { message: 'contact.required' }).max(500),
      organizer: z.string().min(1, { message: 'contact.required' }).max(200),
      conferenceLocation: z.string().min(1, { message: 'contact.required' }).max(300),
      date: z.string().min(1, { message: 'contact.required' }),
      participationType: z.enum(['speaker', 'researcher', 'committee', 'session'], {
        message: 'contact.required',
      }),
    }),
    z.object({
      type: z.literal('collaboration'),
      ...contactBase,
      projectName: z.string().min(1, { message: 'contact.required' }).max(500),
      organization: z.string().min(1, { message: 'contact.required' }).max(200),
      projectDescription: z.string().min(1, { message: 'contact.required' }).max(2000),
      collaborationType: z.string().min(1, { message: 'contact.required' }).max(200),
    }),
    z.object({
      type: z.literal('other'),
      ...contactBase,
    }),
  ])
  .superRefine((data) => {
    // الشرط الأكاديمي: طلب مناقشة يتطلب أن يكون الحقل message نصًا مرسلًا
    return data;
  });

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ContactType = ContactFormValues['type'];

export function getContactPayload(form: ContactFormValues): Record<string, unknown> {
  const { name, email, phone, message, type, ...rest } = form as ContactFormValues & Record<string, unknown>;
  void name;
  void email;
  void phone;
  void message;
  void type;
  return rest as Record<string, unknown>;
}
