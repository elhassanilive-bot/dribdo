-- Blog categories hierarchy
-- شغّل هذا الملف بعد blog_schema.sql لإضافة تصنيفات رئيسية/فرعية حقيقية للمقالات.

alter table public.blog_posts
  add column if not exists category_parent text;

alter table public.blog_posts
  add column if not exists category_slug text;

create index if not exists blog_posts_category_parent_idx
  on public.blog_posts (category_parent);

create index if not exists blog_posts_category_slug_idx
  on public.blog_posts (category_slug);

create table if not exists public.blog_categories (
  slug text primary key,
  name text not null,
  parent_slug text references public.blog_categories(slug) on delete cascade,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists blog_categories_parent_slug_idx
  on public.blog_categories (parent_slug, sort_order, name);

insert into public.blog_categories (slug, name, parent_slug, sort_order, is_active)
values
  ('technology', 'التكنولوجيا', null, 10, true),
  ('ai', 'الذكاء الاصطناعي', 'technology', 11, true),
  ('computers-electronics', 'أجهزة الكمبيوتر والإلكترونيات', 'technology', 12, true),

  ('history', 'التاريخ', null, 20, true),

  ('investment', 'الاستثمار', null, 30, true),
  ('economy', 'اقتصاد', 'investment', 31, true),
  ('business-finance', 'المال والأعمال', 'investment', 32, true),

  ('sports', 'الرياضة', null, 40, true),
  ('fitness', 'الرياضة البدنية', 'sports', 41, true),
  ('yoga', 'اليوجا', 'sports', 42, true),

  ('travel', 'السفر', null, 50, true),

  ('politics', 'السياسة', null, 60, true),
  ('middle-east', 'شرق أوسط', 'politics', 61, true),
  ('world', 'عالم', 'politics', 62, true),

  ('arts', 'الفنون', null, 70, true),
  ('culture', 'ثقافة', 'arts', 71, true),
  ('variety', 'منوعات', 'arts', 72, true),

  ('animals', 'الحيوانات', null, 80, true),
  ('environment', 'البيئة', null, 90, true),

  ('self-development', 'تطوير الذات', null, 100, true),
  ('mental-health', 'الصحة النفسية', 'self-development', 101, true),
  ('education-communication', 'التعليم والتواصل', 'self-development', 102, true),

  ('health', 'الصحة', null, 110, true),
  ('maternal-health', 'صحة الأم', 'health', 111, true),
  ('sleep-rest', 'النوم والراحة', 'health', 112, true),
  ('nutrition-meals', 'الوجبات والتغذية', 'health', 113, true),

  ('women', 'المرأة', null, 120, true),
  ('womens-rights', 'حقوق المرأة', 'women', 121, true),
  ('womens-interests', 'اهتمامات المرأة', 'women', 122, true),
  ('womens-needs', 'إعدادات المرأة', 'women', 123, true),

  ('cooking', 'الطبخ', null, 130, true)
on conflict (slug) do update
set
  name = excluded.name,
  parent_slug = excluded.parent_slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

update public.blog_posts
set category_parent = category
where category is not null
  and category_parent is null;
