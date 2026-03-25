export const reportTypes = [
  {
    value: 'user',
    label: 'إبلاغ عن مستخدم',
    description: 'سلوك مخالف أو مضايقة من حساب معين.',
    icon: 'user',
  },
  {
    value: 'article',
    label: 'إبلاغ عن مقال',
    description: 'مقال يحتوي معلومات مضللة أو محتوى مخالف.',
    icon: 'post',
  },
  {
    value: 'comment',
    label: 'إبلاغ عن تعليق',
    description: 'تعليق مسيء أو سبام داخل صفحة مقال.',
    icon: 'comment',
  },
  {
    value: 'copyright',
    label: 'انتهاك حقوق النشر',
    description: 'إبلاغ عن محتوى منسوخ أو استخدام غير مصرح به.',
    icon: 'copyright',
  },
  {
    value: 'technical',
    label: 'مشكلة تقنية',
    description: 'خلل في الموقع أو صفحة لا تعمل كما يجب.',
    icon: 'bug',
  },
  {
    value: 'general',
    label: 'شكوى عامة',
    description: 'ملاحظات عامة غير مشمولة بالأنواع السابقة.',
    icon: 'sparkles',
  },
];
