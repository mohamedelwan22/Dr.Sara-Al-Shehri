import { describe, expect, it } from 'vitest';
import {
  fileDisplayName,
  fileTypeErrorKey,
  isImageStoragePath,
  isPublicBucket,
  splitStoragePath,
  validateContentFile,
} from './storageFiles';

describe('splitStoragePath', () => {
  it('يفصل bucket عن بقية المسار', () => {
    expect(splitStoragePath('public-media/abc/img.png')).toEqual({
      bucket: 'public-media',
      path: 'abc/img.png',
    });
  });

  it('يعيد المسار كاملاً كـ bucket عند عدم وجود شرطة مائلة', () => {
    expect(splitStoragePath('public-media')).toEqual({ bucket: 'public-media', path: '' });
  });
});

describe('fileDisplayName', () => {
  it('يستخرج اسم الملف الأصلي', () => {
    expect(fileDisplayName('course-assets/uuid-123/ملف.pdf')).toBe('ملف.pdf');
    expect(fileDisplayName('public-media/img.png')).toBe('img.png');
  });
});

describe('isPublicBucket', () => {
  it('يميز الـ buckets العامة عن الخاصة', () => {
    expect(isPublicBucket('public-media')).toBe(true);
    expect(isPublicBucket('branding-assets')).toBe(true);
    expect(isPublicBucket('research-documents')).toBe(false);
    expect(isPublicBucket('course-assets')).toBe(false);
  });
});

describe('isImageStoragePath', () => {
  it('يتعرف على امتدادات الصور', () => {
    expect(isImageStoragePath('public-media/img.png')).toBe(true);
    expect(isImageStoragePath('public-media/img.JPG')).toBe(true);
    expect(isImageStoragePath('public-media/doc.pdf')).toBe(false);
    expect(isImageStoragePath('public-media/doc')).toBe(false);
  });
});

describe('fileTypeErrorKey', () => {
  it('يرفض الأنواع غير المدعومة ويقبل المدعومة', () => {
    expect(fileTypeErrorKey('virus.exe')).toBe('admin.fileTypeNotAllowed');
    expect(fileTypeErrorKey('notes')).toBe('admin.fileTypeRequired');
    expect(fileTypeErrorKey('paper.pdf')).toBeNull();
    expect(fileTypeErrorKey('slides.pptx')).toBeNull();
    expect(fileTypeErrorKey('pic.webp')).toBeNull();
  });
});

describe('validateContentFile', () => {
  function file(name: string, size: number): File {
    return { name, size } as File;
  }

  it('يقبل ملفاً ضمن الحدود', () => {
    expect(validateContentFile(file('a.pdf', 1024))).toBeNull();
  });

  it('يرفض الملف الأكبر من 15 ميجابايت', () => {
    expect(validateContentFile(file('a.pdf', 15 * 1024 * 1024 + 1))).toBe('admin.fileTooLarge');
  });

  it('يرفض النوع غير المدعوم حتى لو صغير الحجم', () => {
    expect(validateContentFile(file('a.exe', 10))).toBe('admin.fileTypeNotAllowed');
  });

  it('يقيّد حقل الصور على الامتدادات المصوّرة عند تمرير accept', () => {
    expect(validateContentFile(file('a.png', 1024), 'image/*')).toBeNull();
    expect(validateContentFile(file('a.jpg', 1024), 'image/*')).toBeNull();
    expect(validateContentFile(file('a.webp', 1024), 'image/*')).toBeNull();
    expect(validateContentFile(file('a.pdf', 1024), 'image/*')).toBe('admin.fileTypeNotAllowed');
    expect(validateContentFile(file('a.docx', 1024), 'image/*')).toBe('admin.fileTypeNotAllowed');
  });

  it('يحترم الامتدادات الصريحة في accept', () => {
    expect(validateContentFile(file('a.pdf', 1024), 'application/pdf')).toBeNull();
    expect(validateContentFile(file('a.png', 1024), 'application/pdf')).toBe('admin.fileTypeNotAllowed');
    expect(validateContentFile(file('a.docx', 1024), '.doc,.docx')).toBeNull();
    expect(validateContentFile(file('a.png', 1024), '.doc,.docx')).toBe('admin.fileTypeNotAllowed');
  });

  it('لا يقيّد عند غياب accept أو نمط MIME غير معروف', () => {
    expect(validateContentFile(file('a.pdf', 1024), undefined)).toBeNull();
    expect(validateContentFile(file('a.pdf', 1024), 'application/x-unknown')).toBeNull();
  });
});
