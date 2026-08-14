import { describe, expect, it } from 'vitest';
import {
  announcementSchema,
  profileSectionSchema,
  PROFILE_SECTION_KEYS,
} from './content';

describe('profileSectionSchema', () => {
  it('يقبل قسمًا صالحًا مع محتوى عربي فقط', () => {
    const result = profileSectionSchema.safeParse({
      section: 'privacy',
      body_ar: 'نص سياسة الخصوصية',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('published');
      expect(result.data.title_ar).toBeUndefined();
    }
  });

  it('يرفض قسمًا غير معروف', () => {
    const result = profileSectionSchema.safeParse({
      section: 'unknown-section',
      body_ar: 'نص',
    });
    expect(result.success).toBe(false);
  });

  it('يرفض القسم بدون body_ar', () => {
    const result = profileSectionSchema.safeParse({
      section: 'biography',
      title_ar: 'بدون محتوى',
    });
    expect(result.success).toBe(false);
  });

  it('يقبل جميع المفاتيح المعروفة', () => {
    for (const section of PROFILE_SECTION_KEYS) {
      const result = profileSectionSchema.safeParse({ section, body_ar: 'نص' });
      expect(result.success).toBe(true);
    }
  });
});

describe('announcementSchema', () => {
  it('يقبل إعلانًا صالحًا بحد أدنى', () => {
    const result = announcementSchema.safeParse({ title_ar: 'إعلان جديد' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it('يرفض إعلانًا بدون عنوان', () => {
    const result = announcementSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('يقبل رابط http/https صالحًا', () => {
    const result = announcementSchema.safeParse({
      title_ar: 'إعلان',
      link_url: 'https://example.com',
    });
    expect(result.success).toBe(true);
  });

  it('يرفض رابطًا لا يبدأ بـ http(s)', () => {
    const result = announcementSchema.safeParse({
      title_ar: 'إعلان',
      link_url: 'example.com/foo',
    });
    expect(result.success).toBe(false);
  });

  it('يقبل رابطًا فارغًا', () => {
    const result = announcementSchema.safeParse({
      title_ar: 'إعلان',
      link_url: '',
    });
    expect(result.success).toBe(true);
  });

  it('يحوّل sort_order إلى رقم', () => {
    const result = announcementSchema.safeParse({ title_ar: 'إعلان', sort_order: '3' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sort_order).toBe(3);
  });
});
