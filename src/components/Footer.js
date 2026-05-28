import Link from 'next/link';
import { site } from '@/config/site';

const footerLinks = [
  { href: '/about', label: 'عن دريبدو' },
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/community-guidelines', label: 'معايير المجتمع' },
  { href: '/help-center', label: 'مركز المساعدة' },
  { href: '/contact', label: 'اتصل بنا' },
  { href: '/report-issue', label: 'الإبلاغ عن مشكلة' },
  { href: '/deletion', label: 'حذف الحساب والبيانات' },
  { href: '/security', label: 'السلامة والأمان' },
];

export default function Footer() {
  return (
    <footer dir="rtl" className="bg-[#8f1117] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col gap-5 text-right">
            <div className="max-w-5xl">
              <h2 className="text-3xl font-black text-white sm:text-4xl">دريبدو</h2>
              <p className="mt-4 max-w-4xl text-base leading-8 text-white/85">
                دريبدو تطبيق اجتماعي عربي يجمع المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، الملف الشخصي، الاستكشاف، الخصوصية والدعم في تجربة واحدة واضحة ومتصلة.
              </p>
            </div>

            <nav aria-label="روابط فوتر دريبدو" className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  prefetch={false}
                  href={link.href}
                  className="text-sm font-semibold text-white/90 transition hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4 text-sm text-white/75">
              <span>البريد الرسمي: <a className="font-semibold text-white hover:underline" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a></span>
              <span>آخر تحديث للصفحات: 28 مايو 2026</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6">
          <p className="text-center text-sm font-semibold text-white/80">جميع الحقوق محفوظة لموقع دريبدو 2026</p>
        </div>
      </div>
    </footer>
  );
}




