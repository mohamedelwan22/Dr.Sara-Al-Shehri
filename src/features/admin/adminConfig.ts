import type { ZodTypeAny } from 'zod';
import {
  researchPaperSchema,
  supervisionSchema,
  projectSchema,
  courseSchema,
  newsSchema,
  axisSchema,
  interestSchema,
  calendarEventSchema,
  announcementSchema,
} from '@/schemas/content';
import { ADMIN_ENTITY_MAP } from '@/services';
import type { AxisContentType } from '@/types';

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'axes'
  | 'boolean'
  | 'slug';

export interface FieldConfig {
  key: string;
  kind: FieldKind;
  labelKey: string;
  hintKey?: string;
  options?: { value: string; labelKey: string }[];
  half?: boolean;
  rows?: number;
}

export interface EntityConfig {
  entity: string;
  schema: ZodTypeAny;
  titleField: string;
  displayField: 'title' | 'name';
  axisType?: AxisContentType;
  fields: FieldConfig[];
}

const STATUS_OPTIONS = [
  { value: 'draft', labelKey: 'common.draft' },
  { value: 'published', labelKey: 'common.published' },
  { value: 'scheduled', labelKey: 'common.scheduled' },
  { value: 'archived', labelKey: 'common.archived' },
];

const DEGREE_OPTIONS = [
  { value: 'masters', labelKey: 'contact.masters' },
  { value: 'phd', labelKey: 'contact.phd' },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'conference', labelKey: 'calendar.eventType.conference' },
  { value: 'discussion', labelKey: 'calendar.eventType.discussion' },
  { value: 'lecture', labelKey: 'calendar.eventType.lecture' },
  { value: 'publication', labelKey: 'calendar.eventType.publication' },
  { value: 'course', labelKey: 'calendar.eventType.course' },
  { value: 'supervision', labelKey: 'calendar.eventType.supervision' },
  { value: 'other', labelKey: 'calendar.eventType.other' },
];

function langFields(prefix: string, key: string): FieldConfig[] {
  return [
    { key: `${key}_ar`, kind: 'text', labelKey: `${prefix}.${key}_ar`, half: true },
    { key: `${key}_en`, kind: 'text', labelKey: `${prefix}.${key}_en`, half: true },
  ];
}

export const ADMIN_ENTITIES: string[] = Object.keys(ADMIN_ENTITY_MAP);

export const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  research: {
    entity: 'research',
    schema: researchPaperSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'research',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'author'),
      ...langFields('admin.fields', 'institution'),
      { key: 'publication_year', kind: 'number', labelKey: 'admin.fields.publication_year', half: true },
      { key: 'abstract_ar', kind: 'textarea', labelKey: 'admin.fields.abstract_ar', rows: 4 },
      { key: 'abstract_en', kind: 'textarea', labelKey: 'admin.fields.abstract_en', rows: 4 },
      { key: 'document_path', kind: 'text', labelKey: 'admin.fields.document_path', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  publications: {
    entity: 'publications',
    schema: researchPaperSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'publication',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'author'),
      ...langFields('admin.fields', 'institution'),
      { key: 'publication_year', kind: 'number', labelKey: 'admin.fields.publication_year', half: true },
      { key: 'abstract_ar', kind: 'textarea', labelKey: 'admin.fields.abstract_ar', rows: 4 },
      { key: 'abstract_en', kind: 'textarea', labelKey: 'admin.fields.abstract_en', rows: 4 },
      { key: 'document_path', kind: 'text', labelKey: 'admin.fields.document_path', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  supervision: {
    entity: 'supervision',
    schema: supervisionSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'supervision',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'researcher'),
      ...langFields('admin.fields', 'university'),
      { key: 'degree', kind: 'select', labelKey: 'contact.degree', options: DEGREE_OPTIONS, half: true },
      { key: 'completion_date', kind: 'date', labelKey: 'admin.fields.completion_date', half: true },
      { key: 'summary_ar', kind: 'textarea', labelKey: 'admin.fields.summary_ar', rows: 4 },
      { key: 'summary_en', kind: 'textarea', labelKey: 'admin.fields.summary_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  discussions: {
    entity: 'discussions',
    schema: supervisionSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'discussion',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      ...langFields('admin.fields', 'researcher'),
      ...langFields('admin.fields', 'university'),
      { key: 'degree', kind: 'select', labelKey: 'contact.degree', options: DEGREE_OPTIONS, half: true },
      { key: 'completion_date', kind: 'date', labelKey: 'admin.fields.completion_date', half: true },
      { key: 'summary_ar', kind: 'textarea', labelKey: 'admin.fields.summary_ar', rows: 4 },
      { key: 'summary_en', kind: 'textarea', labelKey: 'admin.fields.summary_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  projects: {
    entity: 'projects',
    schema: projectSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'project',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'project_status', kind: 'text', labelKey: 'admin.fields.project_status', half: true },
      { key: 'start_date', kind: 'date', labelKey: 'projects.startDate', half: true },
      { key: 'end_date', kind: 'date', labelKey: 'projects.endDate', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  courses: {
    entity: 'courses',
    schema: courseSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'course',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'activity_date', kind: 'date', labelKey: 'courses.date', half: true },
      ...langFields('admin.fields', 'location'),
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  lectures: {
    entity: 'lectures',
    schema: courseSchema,
    titleField: 'title_ar',
    displayField: 'title',
    axisType: 'lecture',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'activity_date', kind: 'date', labelKey: 'courses.date', half: true },
      ...langFields('admin.fields', 'location'),
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 5 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 5 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
      { key: 'axisIds', kind: 'axes', labelKey: 'admin.fields.axisIds' },
    ],
  },
  axes: {
    entity: 'axes',
    schema: axisSchema,
    titleField: 'name_ar',
    displayField: 'name',
    fields: [
      { key: 'name_ar', kind: 'text', labelKey: 'admin.fields.name_ar', half: true },
      { key: 'name_en', kind: 'text', labelKey: 'admin.fields.name_en', half: true },
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 4 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  interests: {
    entity: 'interests',
    schema: interestSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      { key: 'title_ar', kind: 'text', labelKey: 'admin.fields.title_ar', half: true },
      { key: 'title_en', kind: 'text', labelKey: 'admin.fields.title_en', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'description_ar', kind: 'textarea', labelKey: 'admin.fields.description_ar', rows: 4 },
      { key: 'description_en', kind: 'textarea', labelKey: 'admin.fields.description_en', rows: 4 },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  news: {
    entity: 'news',
    schema: newsSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'excerpt_ar', kind: 'textarea', labelKey: 'admin.fields.excerpt_ar', rows: 3 },
      { key: 'excerpt_en', kind: 'textarea', labelKey: 'admin.fields.excerpt_en', rows: 3 },
      { key: 'body_ar', kind: 'textarea', labelKey: 'admin.fields.body_ar', rows: 8 },
      { key: 'body_en', kind: 'textarea', labelKey: 'admin.fields.body_en', rows: 8 },
      { key: 'image_path', kind: 'text', labelKey: 'admin.fields.image_path', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  insights: {
    entity: 'insights',
    schema: newsSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'slug', kind: 'slug', labelKey: 'admin.fields.slug', half: true },
      { key: 'excerpt_ar', kind: 'textarea', labelKey: 'admin.fields.excerpt_ar', rows: 3 },
      { key: 'excerpt_en', kind: 'textarea', labelKey: 'admin.fields.excerpt_en', rows: 3 },
      { key: 'body_ar', kind: 'textarea', labelKey: 'admin.fields.body_ar', rows: 8 },
      { key: 'body_en', kind: 'textarea', labelKey: 'admin.fields.body_en', rows: 8 },
      { key: 'image_path', kind: 'text', labelKey: 'admin.fields.image_path', half: true },
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  calendar: {
    entity: 'calendar',
    schema: calendarEventSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      ...langFields('admin.fields', 'title'),
      { key: 'event_type', kind: 'select', labelKey: 'admin.fields.event_type', options: EVENT_TYPE_OPTIONS, half: true },
      { key: 'starts_at', kind: 'text', labelKey: 'admin.fields.starts_at', hintKey: 'admin.fields.isoHint', half: true },
      { key: 'ends_at', kind: 'text', labelKey: 'admin.fields.ends_at', hintKey: 'admin.fields.isoHint', half: true },
      ...langFields('admin.fields', 'location'),
      { key: 'status', kind: 'select', labelKey: 'common.status', options: STATUS_OPTIONS, half: true },
    ],
  },
  announcements: {
    entity: 'announcements',
    schema: announcementSchema,
    titleField: 'title_ar',
    displayField: 'title',
    fields: [
      { key: 'title_ar', kind: 'text', labelKey: 'admin.fields.title_ar', half: true },
      { key: 'title_en', kind: 'text', labelKey: 'admin.fields.title_en', half: true },
      { key: 'link_url', kind: 'text', labelKey: 'admin.fields.link_url', hintKey: 'admin.fields.linkUrlHint', half: true },
      { key: 'icon', kind: 'text', labelKey: 'admin.fields.icon', hintKey: 'admin.fields.iconHint', half: true },
      { key: 'active_from', kind: 'text', labelKey: 'admin.fields.active_from', hintKey: 'admin.fields.isoHint', half: true },
      { key: 'active_until', kind: 'text', labelKey: 'admin.fields.active_until', hintKey: 'admin.fields.isoHint', half: true },
      { key: 'sort_order', kind: 'number', labelKey: 'admin.fields.sort_order', half: true },
      { key: 'is_active', kind: 'boolean', labelKey: 'admin.fields.is_active' },
    ],
  },
};


