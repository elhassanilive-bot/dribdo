export const site = {
  name: 'أرزابريس',
  nameEn: 'Arzapress',
  description:
    'جريدة إلكترونية عربية متعددة المجالات تقدم أخباراً وتقارير وتحليلات ومقالات رأي، مع تفاعل منظم عبر الحفظ والإعجاب والتعليقات، ولوحة للمساهمين لإرسال المقالات للمراجعة.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://arzapress.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@arzapress.com',
  defaultOgImage: '/icon.png',
  locale: 'ar_MA',
  language: 'ar',
  keywords: [
    'أرزابريس',
    'Arzapress',
    'جريدة إلكترونية',
    'موقع أخبار عربي',
    'أخبار',
    'تقارير',
    'تحليلات',
    'مدونة عربية',
    'مقالات عربية',
    'مساهمون',
  ],
  socials: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X_URL || '',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || '',
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL || '',
  },
};

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, site.url).toString();
}

