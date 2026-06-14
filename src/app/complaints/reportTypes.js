export const reportTypes = [
  {
    value: 'user',
    label: 'إبلاغ عن مستخدم',
    description: 'سلوك مخالف أو مضايقة من حساب معين.',
    icon: 'user',
  },
  {
    value: 'post',
    label: 'إبلاغ عن منشور',
    description: 'محتوى ينتهك السياسات أو مضلل.',
    icon: 'post',
  },
  {
    value: 'message',
    label: 'إبلاغ عن رسالة',
    description: 'رسائل غير مرغوبة أو مسيئة داخل الدردشة.',
    icon: 'message',
  },
  {
    value: 'technical',
    label: 'مشكلة تقنية',
    description: 'تعطل في التطبيق أو وظائف غير متوفرة.',
    icon: 'bug',
  },
  {
    value: 'general',
    label: 'شكوى عامة',
    description: 'ملاحظات عامة غير مشمولة بالأنواع السابقة.',
    icon: 'sparkles',
  },
];
