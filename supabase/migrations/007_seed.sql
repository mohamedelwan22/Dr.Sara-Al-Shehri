-- 007_seed.sql
insert into public.scientific_axes(slug,name_ar,status) values
('matn-criticism','نقد المتن','published'),
('isnad-defects','علل الأسانيد','published'),
('manuscripts','المخطوطات','published'),
('artificial-intelligence','الذكاء الاصطناعي','published'),
('imam-al-bukhari','الإمام البخاري','published')
on conflict(slug) do nothing;

insert into public.site_settings(key,value,is_public) values
('platform_identity','{"name_ar":"منصة أ.د. سارة بنت عزيز الشهري","tagline_ar":"تعنى بالبحث العلمي، وبناء المعرفة، وخدمة السنة النبوية"}',true)
on conflict(key) do update set value=excluded.value;
