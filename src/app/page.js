import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'دريبدو | تطبيق اجتماعي عربي متكامل',
  description:
    'Dribdo تطبيق اجتماعي عربي يجمع المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، البريد الوارد، الخصوصية، الأمان وتجربة وسائط ذكية في مكان واحد.',
  keywords: [
    'دريبدو',
    'Dribdo',
    'تطبيق اجتماعي عربي',
    'منشورات',
    'فيديوهات',
    'صوتيات',
    'قصص',
    'دردشة',
    'طلبات المراسلة',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'دريبدو | تطبيق اجتماعي عربي متكامل',
    description: 'تجربة اجتماعية عربية للمنشورات والوسائط والدردشة والخصوصية في تطبيق واحد.',
    url: '/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Dribdo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دريبدو | تطبيق اجتماعي عربي متكامل',
    description: 'منشورات، فيديوهات، صوتيات، قصص، دردشة، خصوصية وأمان في تجربة واحدة.',
    images: ['/icon.png'],
  },
};

const heroStats = [
  { value: 'RTL', label: 'واجهة عربية كاملة' },
  { value: '500MB', label: 'تحقق ذكي لرفع الفيديو' },
  { value: '10 د', label: 'حد مدة الفيديو داخل التطبيق' },
  { value: '24/7', label: 'دعم وتجربة قابلة للتطور' },
];

const coreFeatures = [
  {
    title: 'الرئيسية والمنشورات',
    text: 'خلاصة اجتماعية تعرض المنشورات والصور والفيديوهات بتدرج بصري، سكليتون أثناء التحميل، وثبات أبعاد يمنع القفزات أثناء ضعف الشبكة.',
  },
  {
    title: 'الفيديوهات والريلز',
    text: 'مشاهدة فيديوهات مع صور مصغرة، كاش، جودة مناسبة للشبكة، مشغل احترافي، وحفظ للمشاهدة لاحقا.',
  },
  {
    title: 'الصوتيات',
    text: 'قسم للصوتيات يدعم عرض التسجيلات والتفاعل معها ضمن تجربة اجتماعية مرتبطة بالملف الشخصي وباقي المحتوى.',
  },
  {
    title: 'القصص',
    text: 'قصص سريعة بالصور والفيديوهات مع تحميل تدريجي وتجربة مرئية خفيفة تشبه الاستخدام اليومي للتطبيقات الاجتماعية الحديثة.',
  },
  {
    title: 'البريد الوارد',
    text: 'بدل فصل الإشعارات والدردشة، يجمع البريد الوارد الإشعارات وطلبات المراسلة في صفحة واحدة واضحة.',
  },
  {
    title: 'طلبات المراسلة',
    text: 'طلبات الرسائل تظهر بشكل مستقل قبل فتح محادثة كاملة، حتى يتحكم المستخدم بمن يستطيع بدء التواصل معه.',
  },
];

const privacyFeatures = [
  'من يرى المنشورات افتراضيا.',
  'من يستطيع إرسال الرسائل أو طلب المراسلة.',
  'من يستطيع التعليق أو الإشارة إليك.',
  'إظهار أو إخفاء حالة النشاط.',
  'حظر وكتم من إعدادات موحدة.',
  'إعادة ضبط توصيات الاستكشاف وعناصر لست مهتما.',
];

const mediaFeatures = [
  'رفض الفيديو قبل الرفع إذا تجاوز الحجم أو المدة أو الصيغة المسموحة.',
  'التحقق من نوع الملف الحقيقي وليس الامتداد فقط.',
  'ضغط الفيديو وتوليد صورة مصغرة تلقائيا.',
  'عرض تقدم الرفع ومنع النشر أثناء الرفع.',
  'Queue للرفع مع retry واستئناف أفضل عند انقطاع الشبكة.',
  'Progressive media loading و cache بنمط stale-while-revalidate.',
];

const securityFeatures = [
  {
    title: 'صحة الحساب',
    text: 'صفحة تعرض حالة الأمان، الجلسات، الطلبات المفتوحة، القيود النشطة وسجل النشاط المهم.',
  },
  {
    title: 'جلسات الأجهزة',
    text: 'متابعة الأجهزة والجلسات مع إمكانية إنهاء جلسات محددة لحماية الحساب.',
  },
  {
    title: 'توثيق بخطوتين',
    text: 'طبقة حماية إضافية للحساب عبر 2FA وسجل للأحداث الحساسة.',
  },
  {
    title: 'البلاغات والإدارة',
    text: 'نظام بلاغات للمحتوى والحسابات والدردشة مع حالات pending وreviewed وactioned.',
  },
];

const settingsSections = [
  'إدارة الحساب: الاسم، الصورة، الغلاف، السيرة الذاتية وبيانات الملف.',
  'خصوصية الحساب: الجمهور، الرسائل، التعليقات، المنشن وحالة النشاط.',
  'الأمان وتسجيل الدخول: الجلسات، 2FA، سجل الدخول وصحة الحساب.',
  'إعدادات الوسائط: جودة الرفع، Wi‑Fi للفيديوهات الكبيرة، التحميل التلقائي.',
  'الصفحات والدعم: الخصوصية، الشروط، معايير المجتمع، الحذف، المساعدة والتواصل.',
];

const pageLinks = [
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/community-guidelines', label: 'معايير المجتمع' },
  { href: '/help-center', label: 'مركز المساعدة' },
  { href: '/deletion', label: 'حذف الحساب والبيانات' },
  { href: '/security', label: 'السلامة والأمان' },
];

function CheckIcon() {
  return (
    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-700 text-[11px] font-black text-white">
      ✓
    </span>
  );
}

function FeatureCard({ title, text }) {
  return (
    <article className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <h3 className="text-xl font-black text-black">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-black/65">{text}</p>
    </article>
  );
}

function ListItem({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-7 text-black/70">
      <CheckIcon />
      <span>{children}</span>
    </li>
  );
}

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,#fee2e2,transparent_34%),linear-gradient(135deg,#fff,#f7f5f1)]">
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-red-700/10 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-green-700/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center text-right">
            <p className="inline-flex w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-black/45">
              Dribdo Social App
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight text-black sm:text-6xl lg:text-7xl">
              تطبيق اجتماعي عربي يجمع المحتوى، الدردشة، الوسائط والخصوصية في تجربة واحدة.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-black/65">
              Dribdo ليس صفحة منشورات فقط. هو تطبيق اجتماعي متكامل للمنشورات، الفيديوهات، الصوتيات، القصص، الملف الشخصي، البريد الوارد، طلبات المراسلة، الإعدادات المتقدمة، الأمان، الدعم وتجربة الوسائط الذكية.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/download" className="rounded-full bg-red-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-red-800">
                تحميل التطبيق
              </Link>
              <Link href="/help-center" className="rounded-full border border-black/15 bg-white px-7 py-3 text-sm font-bold text-black transition hover:border-black/30">
                مركز المساعدة
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-black/10 bg-white p-5 shadow-xl">
            <div className="rounded-[2rem] bg-[#111827] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/35">داخل التطبيق</p>
                  <h2 className="mt-2 text-3xl font-black">كل شيء قريب</h2>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-red-700" />
              </div>
              <div className="mt-8 grid gap-3">
                {['الرئيسية', 'الفيديوهات', 'الصوتيات', 'البريد الوارد', 'الملف الشخصي'].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-white/8 p-4">
                    <span className="text-sm font-semibold">{item}</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">0{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-white p-5 text-black">
                <p className="text-sm font-black">تحميل وسائط ذكي</p>
                <p className="mt-2 text-xs leading-6 text-black/60">Thumbnail، كاش، سكليتون، ثبات أبعاد وجودة حسب الشبكة.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {heroStats.map((stat) => (
            <article key={stat.label} className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-right shadow-sm">
              <p className="text-3xl font-black text-red-700">{stat.value}</p>
              <p className="mt-2 text-sm text-black/60">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-right">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-black/35">Core Experience</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">الميزات الأساسية التي يفتحها المستخدم يوميًا</h2>
          <p className="mt-4 text-base leading-8 text-black/60">الصفحة الرئيسية الجديدة تشرح التطبيق كما هو: أقسام تعمل مع البيانات، وتجربة عربية مبنية للوسائط والدردشة والخصوصية.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="bg-black py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[2rem] bg-white/8 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-white/35">Privacy</p>
            <h2 className="mt-4 text-4xl font-black">خصوصية واضحة من داخل الإعدادات</h2>
            <ul className="mt-7 space-y-3">
              {privacyFeatures.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/70">
                  <span className="mt-2.5 h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] bg-white p-8 text-black">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-black/35">Media Engine</p>
            <h2 className="mt-4 text-4xl font-black">رفع وتشغيل وسائط باحتراف</h2>
            <ul className="mt-7 space-y-3">
              {mediaFeatures.map((item) => (
                <ListItem key={item}>{item}</ListItem>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-black/35">Settings</p>
            <h2 className="mt-4 text-4xl font-black">الإعدادات ليست واجهة فقط</h2>
            <p className="mt-4 text-base leading-8 text-black/60">كل قسم في الإعدادات مرتبط بسلوك حقيقي في التطبيق: الحساب، الخصوصية، الأمان، الوسائط، الصفحات والدعم.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {settingsSections.map((item) => (
              <article key={item} className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
                <p className="text-sm leading-7 text-black/70">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-right">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-black/35">Safety</p>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">أمان وحسابات قابلة للمراجعة</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {securityFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-[#111827] p-8 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.45em] text-white/35">Official Pages</p>
              <h2 className="mt-4 text-4xl font-black">صفحات رسمية مرتبطة بالتطبيق</h2>
              <p className="mt-4 text-base leading-8 text-white/65">هذه هي الصفحات التي يفتحها التطبيق من الإعدادات، وكلها بمحتوى مخصص لميزات Dribdo الجديدة.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pageLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-2xl bg-white/10 px-5 py-4 text-sm font-bold text-white transition hover:bg-white hover:text-black">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-white py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 text-right sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-black/35">Start</p>
            <h2 className="mt-3 text-4xl font-black">جاهز لتجربة Dribdo؟</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-black/60">حمّل التطبيق أو افتح مركز المساعدة لتتعرف على الحساب، الخصوصية، الوسائط والدردشة.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/download" className="rounded-full bg-red-700 px-7 py-3 text-sm font-bold text-white transition hover:bg-red-800">تحميل التطبيق</Link>
            <Link href="/contact" className="rounded-full border border-black/15 px-7 py-3 text-sm font-bold text-black transition hover:border-black/35">اتصل بنا</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
