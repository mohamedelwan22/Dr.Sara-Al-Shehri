import { z } from 'zod';

export const contentStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);

export const slugSchema = z
  .string()
  .min(1, { message: 'slugRequired' })
  .max(120)
  .regex(/^[a-z0-9-]+$/, { message: 'invalidSlug' });

export const requiredArabic = z
  .string()
  .min(1, { message: 'fieldRequired' })
  .max(500, { message: 'tooLong' });

export const optionalEnglish = z.string().max(500).optional().nullable().or(z.literal(''));

export const requiredEnglish = z
  .string()
  .min(1, { message: 'fieldRequired' })
  .max(500);

export const urlSchema = z
  .string()
  .max(500)
  .refine(
    (value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'invalidUrl' },
  )
  .optional()
  .nullable()
  .or(z.literal(''));

export const isoDateSchema = z.string().refine(
  (value) => {
    if (!value) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  },
  { message: 'invalidDate' },
);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
