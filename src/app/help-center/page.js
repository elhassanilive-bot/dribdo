import HelpCenterPageView from '@/components/HelpCenterPageView';

export const metadata = {
  title: 'مركز المساعدة | دريبدو',
  description: 'ابحث في مركز المساعدة عن إجابات واضحة حول التسجيل والنشر والدردشة والخصوصية والمشكلات التقنية في دريبدو.',
  alternates: { canonical: '/help-center' },
};
export default function HelpCenterPage() {
  return <HelpCenterPageView />;
}

