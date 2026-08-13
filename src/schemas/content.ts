import { z } from 'zod';
import { contentStatusSchema, slugSchema } from './common';

const baseContent = {
  title_ar: z.string().min(1, { message: 'fieldRequired' }).max(500),
  title_en: z.string().max(500).optional().or(z.literal('')),
  status: contentStatusSchema.default('draft'),
};

export const researchPaperSchema = z.object({
  ...baseContent,
  slug: slugSchema,
  author_ar: z.string().max(300).optional().or(z.literal('')),
  author_en: z.string().max(300).optional().or(z.literal('')),
  institution_ar: z.string().max(300).optional().or(z.literal('')),
  institution_en: z.string().max(300).optional().or(z.literal('')),
  publication_year: z.coerce.number().int().min(1800).max(2100).optional().nullable(),
  abstract_ar: z.string().max(10000).optional().or(z.literal('')),
  abstract_en: z.string().max(10000).optional().or(z.literal('')),
  document_path: z.string().max(500).optional().nullable().or(z.literal('')),
  axisIds: z.array(z.string()).default([]),
});

export const supervisionSchema = z.object({
  ...baseContent,
  slug: slugSchema,
  researcher_ar: z.string().max(300).optional().or(z.literal('')),
  researcher_en: z.string().max(300).optional().or(z.literal('')),
  university_ar: z.string().max(300).optional().or(z.literal('')),
  university_en: z.string().max(300).optional().or(z.literal('')),
  degree: z.enum(['masters', 'phd']).optional().or(z.literal('')),
  summary_ar: z.string().max(10000).optional().or(z.literal('')),
  summary_en: z.string().max(10000).optional().or(z.literal('')),
  completion_date: z.string().optional().nullable().or(z.literal('')),
  axisIds: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  ...baseContent,
  slug: slugSchema,
  description_ar: z.string().max(20000).optional().or(z.literal('')),
  description_en: z.string().max(20000).optional().or(z.literal('')),
  project_status: z.string().max(100).optional().or(z.literal('')),
  start_date: z.string().optional().nullable().or(z.literal('')),
  end_date: z.string().optional().nullable().or(z.literal('')),
  axisIds: z.array(z.string()).default([]),
});

export const courseSchema = z.object({
  ...baseContent,
  slug: slugSchema,
  description_ar: z.string().max(20000).optional().or(z.literal('')),
  description_en: z.string().max(20000).optional().or(z.literal('')),
  activity_date: z.string().optional().nullable().or(z.literal('')),
  location_ar: z.string().max(300).optional().or(z.literal('')),
  location_en: z.string().max(300).optional().or(z.literal('')),
  axisIds: z.array(z.string()).default([]),
});

export const newsSchema = z.object({
  ...baseContent,
  slug: slugSchema,
  excerpt_ar: z.string().max(1000).optional().or(z.literal('')),
  excerpt_en: z.string().max(1000).optional().or(z.literal('')),
  body_ar: z.string().max(50000).optional().or(z.literal('')),
  body_en: z.string().max(50000).optional().or(z.literal('')),
  image_path: z.string().max(500).optional().nullable().or(z.literal('')),
});

export const axisSchema = z.object({
  name_ar: z.string().min(1, { message: 'fieldRequired' }).max(200),
  name_en: z.string().max(200).optional().or(z.literal('')),
  slug: slugSchema,
  description_ar: z.string().max(2000).optional().or(z.literal('')),
  description_en: z.string().max(2000).optional().or(z.literal('')),
  status: contentStatusSchema.default('published'),
  sort_order: z.coerce.number().int().default(0),
});

export const interestSchema = z.object({
  title_ar: z.string().min(1, { message: 'fieldRequired' }).max(500),
  title_en: z.string().max(500).optional().or(z.literal('')),
  description_ar: z.string().max(2000).optional().or(z.literal('')),
  description_en: z.string().max(2000).optional().or(z.literal('')),
  sort_order: z.coerce.number().int().default(0),
  status: contentStatusSchema.default('published'),
});

export const announcementSchema = z.object({
  title_ar: z.string().min(1, { message: 'fieldRequired' }).max(300),
  title_en: z.string().max(300).optional().or(z.literal('')),
  link_url: z
    .string()
    .max(500)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//.test(v), { message: 'invalidUrl' }),
  icon: z.string().max(60).optional().or(z.literal('')),
  active_from: z.string().optional().nullable().or(z.literal('')),
  active_until: z.string().optional().nullable().or(z.literal('')),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const calendarEventSchema = z.object({
  title_ar: z.string().min(1, { message: 'fieldRequired' }).max(500),
  title_en: z.string().max(500).optional().or(z.literal('')),
  event_type: z.string().min(1, { message: 'fieldRequired' }).max(100),
  starts_at: z.string().min(1, { message: 'fieldRequired' }),
  ends_at: z.string().optional().nullable().or(z.literal('')),
  location_ar: z.string().max(300).optional().or(z.literal('')),
  location_en: z.string().max(300).optional().or(z.literal('')),
  source_type: z.string().max(100).optional().nullable().or(z.literal('')),
  source_id: z.string().optional().nullable().or(z.literal('')),
  status: contentStatusSchema.default('published'),
});

export const profileContentSchema = z.object({
  section: z.string().min(1, { message: 'fieldRequired' }).max(100),
  title_ar: z.string().max(300).optional().or(z.literal('')),
  title_en: z.string().max(300).optional().or(z.literal('')),
  body_ar: z.string().max(100000).optional().or(z.literal('')),
  body_en: z.string().max(100000).optional().or(z.literal('')),
  status: contentStatusSchema.default('published'),
});

export type ResearchPaperValues = z.infer<typeof researchPaperSchema>;
export type SupervisionValues = z.infer<typeof supervisionSchema>;
export type ProjectValues = z.infer<typeof projectSchema>;
export type CourseValues = z.infer<typeof courseSchema>;
export type NewsValues = z.infer<typeof newsSchema>;
export type AxisValues = z.infer<typeof axisSchema>;
export type InterestValues = z.infer<typeof interestSchema>;
export type AnnouncementValues = z.infer<typeof announcementSchema>;
export type CalendarEventValues = z.infer<typeof calendarEventSchema>;
export type ProfileContentValues = z.infer<typeof profileContentSchema>;
