import Link from 'next/link';
import { downloadContent } from '@/content/download';

export const metadata = {
  title: 'تنزيل دريبدو',
  description: 'نزّل تطبيق دريبدو على Google Play أو App Store أو عبر ملف APK من صفحة التنزيل الرسمية.',
  alternates: { canonical: '/download' },
};

const platforms = [
  {
    id: 'android',
    title: 'التنزيل على متجر Play',
    helper: 'نسخة Android الرسمية',
    note: 'مناسب للمستخدمين الذين يريدون التحديثات التلقائية والاستقرار عبر المتجر.',
    href: downloadContent.links.android,
    accent: 'bg-[#111111] text-white',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 10 7-10 7V5Z" />
      </svg>
    ),
  },
  {
    id: 'ios',
    title: 'التنزيل عبر App Store',
    helper: 'نسخة iPhone وiPad',
    note: 'أفضل خيار لمستخدمي iOS مع تجربة تنزيل وتحديثات موثوقة من متجر آبل.',
    href: downloadContent.links.ios,
    accent: 'bg-white text-black',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5c.6-.8 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.6 1 .1 2-.4 2.6-1.2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.7 12.8c0-2 1.7-3 1.7-3-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.4 2-.9 1.6-.2 4 .7 5.3.5.8 1.1 1.6 1.9 1.6.7 0 1.1-.5 2-.5s1.3.5 2.1.5 1.3-.7 1.9-1.5c.6-.9.8-1.8.8-1.9 0 0-1.3-.5-1.3-2.9Z" />
      </svg>
    ),
  },
  {
    id: 'apk',
    title: 'تنزيل نسخة APK Release',
    helper: 'تنزيل مباشر خارج المتجر',
    note: 'مفيد للتثبيت اليدوي أو للتجربة السريعة عندما لا تريد الاعتماد على المتجر.',
    href: downloadContent.links.apk,
    accent: 'bg-white text-black',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14" />
      </svg>
    ),
  },
];

const signals = [
  { title: 'نسخة رسمية', text: 'هذه الصفحة هي المسار الرسمي لتنزيل التطبيق ومراجعة قنوات التحميل المتاحة.' },
  { title: 'روابط موحدة', text: 'تجد هنا كل خيارات التنزيل في مكان واحد بدل البحث بين صفحات متعددة.' },
  { title: 'تجربة واضحة', text: 'عرضنا كل منصة بشكل مباشر مع وصف يساعد المستخدم على اختيار النسخة المناسبة.' },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#f6f2ef] text-black">
      <section className="border-b border-black/8">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">الصفحة الرسمية للتنزيل</p>
              <h1 className="text-5xl font-black leading-tight text-black sm:text-6xl">{downloadContent.hero.title}</h1>
              <p className="max-w-2xl text-lg leading-8 text-black/65">{downloadContent.hero.subtitle}</p>

              <div className="grid gap-4 sm:grid-cols-3">
                {signals.map((signal) => (
                  <article key={signal.title} className="rounded-[24px] border border-black/10 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-black">{signal.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-black/60">{signal.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">تنزيل مباشر</p>
              <h2 className="mt-4 text-3xl font-black text-black">اختر نسختك وابدأ الآن</h2>
              <div className="mt-8 space-y-4">
                <DownloadAction
                  href={downloadContent.links.android}
                  label="التنزيل على متجر Play"
                  helper="نسخة Android الرسمية"
                  accent="dark"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 10 7-10 7V5Z" />
                    </svg>
                  }
                />
                <DownloadAction
                  href={downloadContent.links.ios}
                  label="التنزيل عبر App Store"
                  helper="نسخة iPhone وiPad"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5c.6-.8 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.6 1 .1 2-.4 2.6-1.2Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.7 12.8c0-2 1.7-3 1.7-3-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.4 2-.9 1.6-.2 4 .7 5.3.5.8 1.1 1.6 1.9 1.6.7 0 1.1-.5 2-.5s1.3.5 2.1.5 1.3-.7 1.9-1.5c.6-.9.8-1.8.8-1.9 0 0-1.3-.5-1.3-2.9Z" />
                    </svg>
                  }
                />
                <DownloadAction
                  href={downloadContent.links.apk}
                  label="تنزيل نسخة APK Release"
                  helper="تنزيل مباشر خارج المتجر"
                  icon={
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-right">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">خيارات التنزيل</p>
          <h2 className="mt-3 text-4xl font-black text-black">قنوات تنزيل واضحة ومباشرة</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
            صممنا هذه الصفحة لتكون واضحة وسريعة، مع شرح مباشر لكل قناة تنزيل حتى تصل إلى النسخة المناسبة بدون ارتباك أو ازدحام.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {platforms.map((platform) => {
            const ready = Boolean(platform.href);
            const body = (
              <div
                className={`rounded-[1.6rem] border p-6 text-center shadow-sm ${platform.accent} ${platform.accent.includes('bg-white') ? 'border-black/10' : 'border-black/0'}`}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <span>{platform.icon}</span>
                  <div className="text-center">
                    <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${ready ? (platform.accent.includes('bg-white') ? 'text-black/40' : 'text-white/45') : 'text-black/35'}`}>
                      {ready ? 'جاهز للتنزيل' : 'قريبًا'}
                    </p>
                    <h3 className="mt-3 text-2xl font-black">{platform.title}</h3>
                    <p className={`mt-2 text-sm ${platform.accent.includes('bg-white') ? 'text-black/60' : 'text-white/70'}`}>{platform.helper}</p>
                  </div>
                </div>
                <p className={`mt-6 leading-8 ${platform.accent.includes('bg-white') ? 'text-black/65' : 'text-white/75'}`}>{platform.note}</p>
                <div className="mt-8 flex justify-center">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                      ready
                        ? platform.accent.includes('bg-white')
                          ? 'bg-red-700 text-white'
                          : 'bg-white text-black'
                        : 'bg-black/10 text-black/45'
                    }`}
                  >
                    {ready ? 'ابدأ التنزيل' : 'سيتم التفعيل قريبًا'}
                  </span>
                </div>
              </div>
            );

            return ready ? (
              <Link key={platform.id} href={platform.href} className="block transition-transform hover:-translate-y-0.5">
                {body}
              </Link>
            ) : (
              <div key={platform.id}>{body}</div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-black/8 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] bg-[#111111] p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/45">ملاحظات مهمة</p>
              <h2 className="mt-4 text-3xl font-black">قبل تنزيل التطبيق</h2>
              <ul className="mt-6 space-y-3 text-sm leading-8 text-white/75">
                <li>تأكد من تنزيل التطبيق من الروابط الرسمية فقط.</li>
                <li>راجع توافق النسخة مع نظام التشغيل في جهازك قبل التثبيت.</li>
                <li>إذا واجهت مشكلة في التحميل أو التثبيت، استخدم صفحة الإبلاغ عن مشكلة.</li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-[#faf8f6] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">ماذا بعد التنزيل؟</p>
              <h2 className="mt-4 text-3xl font-black text-black">ابدأ تجربتك الأولى داخل دريبدو</h2>
              <p className="mt-4 leading-8 text-black/65">
                بعد التثبيت يمكنك إنشاء الحساب، إعداد ملفك الشخصي، متابعة الأشخاص، النشر، استكشاف الفيديوهات، والدخول إلى المجتمعات والمساحات والاستفادة من أقسام التطبيق المختلفة.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/features" className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/90">
                  استعرض المميزات
                </Link>
                <Link href="/faq" className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-black/5">
                  افتح الأسئلة الشائعة
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function DownloadAction({ href, label, helper, icon, accent = 'light' }) {
  const className =
    accent === 'dark'
      ? 'border-black bg-[#111111] text-white hover:bg-black'
      : 'border-black/10 bg-[#faf8f6] text-black hover:border-black/20 hover:bg-white';

  return (
    <Link href={href} className={`flex items-center justify-between gap-4 rounded-[1.35rem] border px-5 py-4 transition ${className}`}>
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <div className="text-right">
          <p className="text-base font-semibold">{label}</p>
          <p className={`text-sm ${accent === 'dark' ? 'text-white/65' : 'text-black/55'}`}>{helper}</p>
        </div>
      </div>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
