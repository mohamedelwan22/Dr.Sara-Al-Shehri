-- 026_contact_info_settings.sql
-- Seeds the contact_info site_setting so the contact page reads from DB.
-- Admin can edit all values from /admin/settings.

INSERT INTO public.site_settings (key, value, is_public)
VALUES (
  'contact_info',
  '{
    "email": "b.alhajji@iau.edu.sa",
    "phone": "+966 13 333 3333",
    "university_ar": "جامعة الإمام عبدالرحمن بن فيصل",
    "university_en": "Imam Abdulrahman Bin Faisal University",
    "department_ar": "قسم الحديث وعلومه",
    "department_en": "Department of Hadith and its Sciences",
    "location_ar": "المملكة العربية السعودية",
    "location_en": "Saudi Arabia",
    "response_time_ar": "خلال 7 أيام عمل بمشيئة الله",
    "response_time_en": "Within 7 working days, God willing",
    "subtitle_ar": "يسعدني تواصلكم واستقبال استفساراتكم وآرائكم",
    "subtitle_en": "I am happy to receive your inquiries and feedback",
    "notice_ar": "يرحب الموقع بالمراسلات العلمية والأكاديمية، ويُعتذر عن الرد على الرسائل غير المتعلقة بمجالات الاهتمام العلمي للموقع. ويتم الرد - بمشيئة الله - بحسب أولوية الرسائل الواردة وظروف الارتباطات الأكاديمية.",
    "notice_en": "The website welcomes scientific and academic correspondence and regrets not responding to messages unrelated to the website''s areas of scientific interest. Replies are sent — God willing — according to message priority and academic commitments."
  }',
  true
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
