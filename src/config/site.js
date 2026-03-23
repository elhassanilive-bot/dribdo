export const site = {
  name: 'دريبدو',
  nameEn: 'Dribdo',
  description:
    'دريبدو منصة اجتماعية عربية متكاملة تجمع النشر والتفاعل والدردشة والفيديو والمجتمعات والمساحات، مع خدمات إضافية مثل السوق والعقارات والوظائف والمذكرات داخل تجربة واحدة واضحة ومنظمة.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dribdo.com',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dribdo.com',
  defaultOgImage: '/screenshots/ads.png',
  locale: 'ar_MA',
  language: 'ar',
  keywords: [
    'دريبدو',
    'Dribdo',
    'منصة تواصل اجتماعي عربية',
    'منتدى عربي',
    'مدونة عربية',
    'مجتمعات عربية',
    'دردشة عربية',
    'منصة محتوى عربي',
    'تطبيق اجتماعي',
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
