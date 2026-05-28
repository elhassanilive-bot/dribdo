import Link from 'next/link';
import { site } from '@/config/site';

const appPages = [
  { href: '/about', label: 'عن Dribdo' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/community-guidelines', label: 'معايير المجتمع' },
];

const supportPages = [
  { href: '/help-center', label: 'مركز المساعدة' },
  { href: '/contact', label: 'اتصل بنا' },
  { href: '/report-issue', label: 'الإبلاغ عن مشكلة' },
  { href: '/deletion', label: 'حذف الحساب والبيانات' },
  { href: '/security', label: 'السلامة والأمان' },
];

function LinkColumn({ title, links }) {
  return (
    <div className="text-right">
      <h4 className="mb-5 text-lg font-black text-black">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link prefetch={false} href={link.href} className="text-sm leading-7 text-black/65 transition-colors hover:text-red-700">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer dir="rtl" className="border-t border-black/10 bg-white py-14 text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:items-start">
          <div className="text-right">
            <h3 className="text-3xl font-black text-green-700">دريبدو</h3>
            <p className="mt-5 max-w-md text-base leading-8 text-black/65">
              Dribdo تطبيق اجتماعي عربي يجمع المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، الملف الشخصي، الاستكشاف، الخصوصية والدعم في تجربة واحدة واضحة.
            </p>
            <p className="mt-5 text-sm leading-7 text-black/65">
              تواصل معنا عبر:{' '}
              <a className="font-semibold text-black transition-colors hover:text-red-700 hover:underline" href={`mailto:${site.supportEmail}`}>
                {site.supportEmail}
              </a>
            </p>
          </div>

          <LinkColumn title="صفحات التطبيق" links={appPages} />
          <LinkColumn title="المساعدة والدعم" links={supportPages} />
        </div>

        <div className="mt-12 border-t border-black/10 pt-8">
          <p className="text-center text-sm text-black/55">&copy; {currentYear} دريبدو. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
