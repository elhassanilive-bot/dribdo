export const metadata = {
  title: 'دريبدو',
  description:
    'اكتشف دريبدو، منصة تواصل اجتماعي عربية تجمع النشر والتفاعل والدردشة والمجتمعات والمساحات والخدمات في تجربة واحدة واضحة وسريعة.',
  keywords: [
    'دريبدو',
    'منصة تواصل اجتماعي عربية',
    'تطبيق اجتماعي عربي',
    'مجتمعات عربية',
    'مدونة عربية',
    'منتدى عربي',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'دريبدو',
    description:
      'اكتشف دريبدو، منصة تواصل اجتماعي عربية تجمع النشر والتفاعل والدردشة والمجتمعات والمساحات والخدمات في تجربة واحدة واضحة وسريعة.',
    url: '/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'دريبدو' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دريبدو',
    description:
      'اكتشف دريبدو، منصة تواصل اجتماعي عربية تجمع النشر والتفاعل والدردشة والمجتمعات والمساحات والخدمات في تجربة واحدة واضحة وسريعة.',
    images: ['/icon.png'],
  },
};

import Link from 'next/link';
import Image from 'next/image';
import { homeContent } from '@/content/home';
import BlogImage from '@/components/blog/BlogImage';
import { formatArabicDate } from '@/lib/blog/render';
import { listPostsDetailed } from '@/lib/blog/posts';
import { absoluteUrl, site } from '@/config/site';

const heroScreenshots = homeContent.heroScreenshots;
const galleryScreenshots = homeContent.galleryScreenshots;

const productUseCases = [
  {
    title: 'لصنّاع المحتوى',
    desc: 'أنشر وتفاعل واستمتع بلحظتك كصانع محتوى عبر, وأظهر تواجدك في التطبيق.',
  },
  {
    title: 'للعلامات التجارية',
    desc: 'أنشئ مساحتك الخاصة وأظهر تواجدك بعلامتك التجارية في التطبيق. وفرنا لك امكانية انشاء مساحة لعلامتك التجارية لتبدع كيفما تشاء.',
  },
  {
    title: 'للمجتمعات',
    desc: 'أنشئ مجتمعك أو انضم الى المجتمعات اللذين يتيرون اهتمامك, تفاعل, شارك, أنشر, علق, عبر, وأظهر تواجدك.',
  },
  {
    title: 'للاستخدام اليومي',
    desc: 'أنشر القصص ودردش مع من تحب, شاهد قنواتك المفضلة في التلفاز, وتألق أكثر مع دريبدو.',
  },
];

const quickStats = [
  {
    value: '01',
    title: 'اليوم الأول ',
    text: 'التخطيط لما سيحدث. نعلم أن الجميع يحتاجون الى امبراطورية تجمع الكل في واحد, وكم هو مؤسف أن يكون في هاتفك عدة تطبيقات  وبعضها لا تسير كما ترغب. لهذا وفرنا لك دريبدو اللدي يحتوي على تطبيقات كثيرة في تطبيق واحد.',
  },
  {
    value: '24/7',
    title: 'من 24 ساعة الى أول أسبوع',
    text: 'من 24 ساعة الى الأسبوع الأول استطعنا بناء واجهة وهيكل التطبيق ولا يزال التخطيط مستمر لما سوف يحدث في التطبيق. ',
  },
  {
    value: '1 شهر',
    title: 'من الشهر الأول',
    text: 'في أول شهر استطعنا بناء التطبيق تقريبا وفرنا فيه تجربة سلسة للنشر والتفاعل والمراسلة وكان لا يزال في وضع الاختبارات.',
  },
  {
    value: '5 شهور وأكثر',
    title: 'منذ أكثر من 5 شهور',
    text: 'بعد مرور 5 شهور أصبح التطبيق يظهر بهيئته المتكاملة. الأقسام موزعة بانتضام ولاكن على الرغم من ذالك لا تزال فيه العديد من الأخطاء وجارية في اصلاحها  يوما بعد يوم.',
  },
];

const sectionPillars = [
  {
    title: 'النشر والتفاعل',
    desc: 'شارك وانشر وتفاعل, أنشر منشورات نصية صورية فيديو مستنداث منشورات صوتية أو حتى البث المباشر, حريتك مع دريبدو لا تنتهي.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16V8m6 8V5m6 11v-6" />
      </svg>
    ),
  },
  {
    title: 'دردش بحرية',
    desc: 'الآن في الدردشة, يمكنك التواصل مع عائلتك زملائك أصدقائك ومع من تحب, رسائلك مشفرة بخصوصية محترمة, لا قيود ولا حظر ولا بيع البيانات, نحن هنا لنرضيك بما يسعدك.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3V8a2 2 0 0 1 2-2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 14h5" />
      </svg>
    ),
  },
  {
    title: 'ابنِ مجتمعك',
    desc: 'أنشئ مساحتك الخاصة لعلامتك التجارية, لابراز تواجدك في دريبدو. أو يمكنك انشاء مجموعتك وتشجيع الأشخاص للانضمام من أجل النشر والتفاعل وتبادل الآراء والنقاشات.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 19a4.5 4.5 0 0 1 9 0M13 19a3.5 3.5 0 0 1 7 0" />
      </svg>
    ),
  },
];

const executiveSignals = [
  {
    value: 'بدون قيود وحرية ثامة',
    label: 'أنشر وتفاعل وعبر عن رأيك أكثر في دريبدو بحريتك بدون قيود ولا حظر للمحتوى ولا خوارزميات مزعجة ولا بيع للبيانات.',
  },
  {
    value: 'خدمات متعددة',
    label: 'وفرنا في دريبدو العديد من الخدمات مثل التجارة للبيع والشراء , بيع العقارات, البحث عن الزواج, تقديم الزكاة, المذكرات, وغيرها من الخدمات.',
  },
  {
    value: 'هوية مستقلة',
    label: 'واجهة حديثة تناسب احتياجات المستخدمين وتنضيم سلس موزع بالتساوي في التطبيق دون تشتت وانزعاج.',
  },
];

const comparisonRows = [
  {
    feature: 'من يستطيع رؤية ما تنشره؟',
    dribdo: 'المتابعون والمهتمون بالمحتوى وحتى الغير متابعين.',
    others: 'ربما اذا سمحت خواريزميات التواصل الاجتماعي بعرضه للمستخدمين.',
  },
  {
    feature: 'ترتيب المحتوى',
    dribdo: 'يظهر مباشرة لمتابعيك والمهتمين والغير متابعين بعد النشر فورا.',
    others: 'تدفق سريع ومزدحم واقتراحات لمحتوى غير مرغوب فيه بسبب خواريزميات اللتي تقترح لك محتوى مزعج غير طبيعي.',
  },
  {
    feature: 'المساحات والمجتمعات',
    dribdo: 'مدمجة داخل التطبيق تنضيم احترافي وكذالك منشورات المساحات ومنشورات المجتمعات يتم عرضها لك في الرئيسية بدون الحاجة للدخول الى أقسام المساحات والمجتمعات.',
    others: 'غالبًا تكون موزعة أو ثانوية داخل المنتج.',
  },
  {
    feature: 'الدردشة والمراسلة',
    dribdo: 'مدمجة داخل التطبيق اشعارات فورية بمجرد تلقي الرسالة سوف يتم اشعارك بشارة التنبيه فوق فقاعة الدردشة.',
    others: 'أحيانًا تتطلب تنقلًا إضافيًا أو تطبيقات موازية.',
  },
  {
    feature: 'الخصوصية والتحكم',
    dribdo: 'إعدادات أوضح ومسار أبسط لفهم ما يحدث.',
    others: 'خيارات كثيرة لكن غير مريحة للمستخدم العادي.',
  },
  {
    feature: 'تعدد الأقسام',
    dribdo: 'في دريبدو موجود قسم العقارات والوظائف والسوق والصدقات والبحث عن الزواج والمذكرات والجداول وغيرها.',
    others: 'أقسام محدودة وفي بعض التطبيقات أقسام غير مفيدة على الأساس.',
  },
  {
    feature: 'المبدعون والمحتوى',
    dribdo: 'المساحات مصممة لتخدم الحضور والعلامات التجارية وصناع المحتوى والنشر باحتراف',
    others: 'مزعج كثيرا ومشتت بسبب كثرة الاعلانات المنبثقة وهدا ليس جيد للمستخدمين أساسا.',
  },
  {
    feature: 'تجربة الاستخدام',
    dribdo: 'تجربة متوازنة أقرب لمنتج احترافي منظم',
    others: 'إدمانية أكثر من كونها منظمة أو واضحة',
  },
];

const customerReasons = [
  {
    title: 'وضوح في التجربة',
    desc: 'المستخدم يصل إلى ما يريده أسرع لأن الصفحة لا تعتمد على التكديس أو التشتيت البصري.',
  },
  {
    title: 'ثقة في الهوية',
    desc: 'المنتج يبدو مستقلاً واحترافيًا، وهذا مهم لأي منصة تريد بناء اسم قوي وطويل المدى.',
  },
  {
    title: 'مرونة للنمو',
    desc: 'التصميم يدعم المجتمعات والمساحات والنشر، ما يجعله مناسبًا للتوسع لاحقًا.',
  },
  {
    title: 'النشر بحرية',
    desc: ' لا خواريزميات مزعجية, لا قيود للمحتوى العربي الهادف, لا حظر للمحتوى.',
  },
];

const customerQuestions = [
  {
    question: 'هل دريبدو مناسب فقط للمحتوى الشخصي؟',
    answer: 'لا، تم تصميمه ليخدم الاستخدام الشخصي والمجتمعات والعلامات التجارية وصنّاع المحتوى في نفس الوقت.',
  },
  {
    question: 'ما الذي يجعل الواجهة مختلفة عن المنصات المعتادة؟',
    answer: 'التركيز هنا على الوضوح، ترتيب المسارات، وتقليل الازدحام البصري حتى تبقى التجربة أخف وأكثر احترافية.',
  },
  {
    question: 'هل يمكن أن تتوسع المنصة لاحقًا بدون إعادة بناء كاملة؟',
    answer: 'نعم، الهيكل الحالي يمنح مساحة لإضافة أقسام ومزايا جديدة مع الحفاظ على اتساق التجربة.',
  },
  {
    question: 'هل الصفحة الرئيسية جاهزة لتقديم المنتج بشكل تجاري؟',
    answer: 'نعم، لأنها تجمع بين التعريف بالمنتج، المقارنة، استخدامات المنصة، وعناصر الثقة في مكان واحد.',
  },
];

const quickStatsCompact = [
  {
    value: '01',
    title: 'الفكرة',
    text: 'منصة واحدة تجمع النشر والتواصل والخدمات بدل التنقل بين تطبيقات كثيرة.',
  },
  {
    value: '24/7',
    title: 'التطوير',
    text: 'بناء متواصل يركز على الوضوح وسرعة الوصول واستقرار الواجهة.',
  },
  {
    value: 'اليوم',
    title: 'النتيجة',
    text: 'تجربة أقرب لمنتج متكامل مع أقسام واضحة وصور أخف ومسار تصفح أبسط.',
  },
].slice(0, Math.min(3, quickStats.length));

const supportShortcuts = [
  {
    title: 'الأسئلة الشائعة',
    desc: 'افتح مركز الإجابات الكامل بدل تحميل الصفحة الرئيسية بمحتوى طويل.',
    href: '/faq',
    cta: 'افتح الأسئلة الشائعة',
  },
  {
    title: 'صفحة المميزات',
    desc: 'استعرض الوظائف والأقسام بالتفصيل في صفحة مستقلة أخف تنظيمًا.',
    href: '/features',
    cta: 'استعرض المميزات',
  },
  {
    title: 'صفحة التنزيل',
    desc: 'انتقل مباشرة إلى قنوات التنزيل الرسمية عندما تكون جاهزًا للتجربة.',
    href: '/download',
    cta: 'انتقل إلى التنزيل',
  },
].slice(0, Math.min(3, customerQuestions.length));

const downloadOptions = [
  {
    label: 'Google Play',
    helper: 'نسخة Android',
    href: '/download',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="m7 5 10 7-10 7V5Z" />
      </svg>
    ),
    primary: true,
  },
  {
    label: 'App Store',
    helper: 'نسخة iPhone',
    href: '/download',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5c.6-.8 1-1.8.9-2.8-.9.1-2 .6-2.6 1.4-.6.7-1 1.7-.9 2.6 1 .1 2-.4 2.6-1.2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.7 12.8c0-2 1.7-3 1.7-3-.9-1.4-2.3-1.6-2.8-1.6-1.2-.1-2.3.7-2.9.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.6.8-3.4 2-.9 1.6-.2 4 .7 5.3.5.8 1.1 1.6 1.9 1.6.7 0 1.1-.5 2-.5s1.3.5 2.1.5 1.3-.7 1.9-1.5c.6-.9.8-1.8.8-1.9 0 0-1.3-.5-1.3-2.9Z" />
      </svg>
    ),
  },
  {
    label: 'APK',
    helper: 'تنزيل مباشر',
    href: '/download',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v10m0 0 4-4m-4 4-4-4M5 19h14" />
      </svg>
    ),
  },
];

function ScreenshotCard({ item, compact = false }) {
  return (
    <article className={`overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm ${compact ? '' : 'h-full'}`}>
      <div className="relative bg-[#f6f6f6] p-3">
        <Image
          src={item.src}
          alt={`لقطة شاشة: ${item.title}`}
          width={420}
          height={840}
          sizes={compact ? '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw' : '(max-width: 1024px) 100vw, 50vw'}
          quality={72}
          className="h-auto w-full rounded-[22px]"
          priority={item.priority ?? false}
        />
      </div>
      <div className="space-y-2 p-5 text-right">
        <h3 className="text-lg font-bold text-black">{item.title}</h3>
        <p className="text-sm leading-7 text-black/65">{item.subtitle}</p>
      </div>
    </article>
  );
}

function HorizontalScroll({ minWidthClass = 'min-w-[920px]', children }) {
  return (
    <div className="w-full max-w-full overflow-x-auto touch-pan-x overscroll-x-contain [scrollbar-width:thin]">
      <div className={`w-max max-w-none ${minWidthClass}`}>{children}</div>
    </div>
  );
}

function HomeBlogPostCard({ post, compactClass = '' }) {
  return (
    <article
      className={`group overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compactClass}`}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f6fa]">
          <BlogImage
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="space-y-2 p-4 text-right">
          <div className="text-[11px] font-semibold text-black/45">
            {formatArabicDate(post.publishedAt || post.createdAt)}
          </div>
          <h3 className="line-clamp-2 text-[16px] font-black leading-6 text-black">{post.title}</h3>
          <p className="line-clamp-2 text-[13px] leading-6 text-black/65">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

export default async function Home() {
  const { posts: recentBlogPosts } = await listPostsDetailed({ limit: 6 });
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'دريبدو',
    description: metadata.description,
    url: site.url,
    inLanguage: 'ar',
    primaryImageOfPage: absoluteUrl('/icon.png'),
  };

  return (
    <div className="w-full overflow-x-clip bg-[#fbf7f4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      <section className="border-b border-black/8">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <div className="relative overflow-hidden rounded-[40px] border border-red-100 bg-[linear-gradient(135deg,#fff3f1_0%,#ffd9d2_18%,#f7b4b4_42%,#fbe9e5_72%,#fff7f4_100%)] px-5 py-8 shadow-[0_30px_80px_-50px_rgba(127,29,29,0.42)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="pointer-events-none absolute -right-12 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(190,24,24,0.22),rgba(190,24,24,0)_72%)]" />
            <div className="pointer-events-none absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.45),rgba(255,255,255,0)_72%)]" />
            <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="space-y-8 text-right">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/65 bg-white/75 px-4 py-2 text-sm font-semibold text-black/75 backdrop-blur">
                  <span className="text-xs uppercase tracking-[0.45em] text-black/40">Dribdo</span>
                  <span>{homeContent.hero.badgeName}</span>
                </div>

                <div className="space-y-5">
                  <h1 className="max-w-3xl text-4xl font-black leading-[1.12] text-black sm:text-5xl lg:text-6xl">
                    {homeContent.hero.title.prefix}{' '}
                    <span className="text-red-700">{homeContent.hero.title.highlight}</span>{' '}
                    {homeContent.hero.title.suffix}
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-black/70">{homeContent.hero.description}</p>
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <Link
                    href="/download"
                    className="inline-flex items-center justify-center rounded-full bg-red-700 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-red-800"
                  >
                    {homeContent.hero.ctaPrimary}
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-8 py-3.5 text-base font-semibold text-black transition hover:bg-black/5"
                  >
                    {homeContent.hero.ctaSecondary}
                  </Link>
                </div>
              </div>

              <div className="lg:pr-2">
                <article className="overflow-hidden rounded-[34px] border border-white/55 bg-white/35 shadow-[0_24px_70px_-45px_rgba(127,29,29,0.45)] backdrop-blur-sm">
                  <div className="relative bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))] p-4 sm:p-5">
                    <Image
                      src="/screenshots/ads.png"
                      alt={`لقطة شاشة: ${heroScreenshots[0].title}`}
                      width={1200}
                      height={820}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={76}
                      className="h-[360px] w-full rounded-[26px] object-contain object-center sm:h-[460px] lg:h-[560px]"
                      priority
                    />
                  </div>
                  <div className="space-y-2 p-6 text-right">
                    <h2 className="text-2xl font-black text-black">{heroScreenshots[0].title}</h2>
                    <p className="text-base leading-8 text-black/65">{heroScreenshots[0].subtitle}</p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {recentBlogPosts.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8">
          <div className="rounded-[30px] border border-black/10 bg-white p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/35">Blog</p>
                <h2 className="mt-2 text-3xl font-black text-black sm:text-4xl">أحدث المقالات المنشورة</h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentBlogPosts.map((post) => (
                  <HomeBlogPostCard key={post.id || post.slug} post={post} />
                ))}
              </div>

            <div className="mt-7 flex justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                عرض المزيد
              </Link>
            </div>
          </div>
      </section>
      ) : null}

      <section className="hidden mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-black/10 bg-white p-8 text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">تواصل بلا حدود مع عالم دريبدو </p>
            <h2 className="mt-4 text-4xl font-black text-black">مصمم بأحدث التقنيات اللتي ستناسب العصر الجديد للجيل الجديد</h2>
            <p className="mt-4 text-base leading-8 text-black/65">
              دريبدو يأخدك الى استكشاف عالم مليئ بالاثارة وفرص العمل والتواصل الجماعي, لقد وفرنا فيه كل ما سيحتاجه المستخدم من التواصل وتقديم الخدمات..
            </p>

            <div className="mt-8 grid gap-4">
              {productUseCases.map((item) => (
                <article key={item.title} className="rounded-[24px] bg-[#faf6f3] p-5">
                  <h3 className="text-lg font-bold text-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-black/60">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] bg-[#111111] p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-white/40"> كيف يجري العمل عند دريبدو</p>
            <h2 className="mt-4 text-4xl font-black"> انطلاقتنا لم تكن مصادفة لأن كل ما توصلنا به كان بفضل الله سبحانه وتعالى</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/70">
              تعرف كيف يجري العمل وكيف تسير جهودنا مند انطلاق دريبدو من اليوم الأول قبل النشر للعالم. لم يكن الأمر سهلا, سهرنا الليالي, وقاومنا المرض, والأزمات من أجل صنع دريبدو, ليكون كما تراه اليوم..
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {quickStatsCompact.map((item) => (
                <article key={item.title} className="rounded-[26px] border border-white/10 bg-white/5 p-5 text-right">
                  <p className="text-3xl font-black text-white">{item.value}</p>
                  <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/65">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 text-right lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">ومدا بعد؟</p>
            <h2 className="text-4xl font-black text-black sm:text-5xl">لمدا يجب عليك تنزيل دريبدو على جهازك؟</h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-black/65">
            بعد توضيح الاستخدامات والمؤشرات الأساسية، يأتي هذا القسم ليشرح البنية التي تجعل دريبدو مناسبًا للنشر والتواصل وبناء المجتمع.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            {sectionPillars.map((item) => (
              <article key={item.title} className="rounded-[30px] border border-black/10 bg-white p-7 text-right shadow-sm">
                <div className="mb-5 text-black">{item.icon}</div>
                <h3 className="text-2xl font-bold text-black">{item.title}</h3>
                <p className="mt-3 text-base leading-8 text-black/65">{item.desc}</p>
              </article>
            ))}
          </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-black/10 bg-white p-8 sm:p-10">
          <div className="mb-10 grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="text-right">
                <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">مقارنة مباشرة</p>
                <h2 className="mt-4 text-4xl font-black text-black sm:text-5xl">
                  لماذا  <span className="text-red-700">دريبدو</span>   يختاره المستخدمين أكثر من التطبيقات الأخرى؟
                </h2>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
                  تعرف لمذا دريبدو يختاره أغلب الأشخاص ويفضلونه أكثر من التطبيقات الأخرى, ليس بهذف النشر والتواصل والدردشة فقط, ولاكن هناك هذف معين يجعله مميز من بين التطبيقات الأخرى.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {executiveSignals.map((item) => (
                  <div key={item.value} className="rounded-[24px] bg-[#faf6f3] p-5 text-right">
                    <p className="text-lg font-bold text-black">{item.value}</p>
                    <p className="mt-2 text-sm leading-7 text-black/60">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

          <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white">
            <div className="border-b border-black/10 bg-[#f8f5f3] px-4 py-2 text-xs font-semibold text-black/55 sm:hidden">
              اسحب يمينًا ويسارًا لعرض كامل جدول المقارنة
            </div>
            <div className="overflow-x-auto touch-pan-x overscroll-x-contain [scrollbar-width:thin]">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[220px_minmax(340px,1fr)_minmax(340px,1fr)] bg-[#f7f3f1] text-right">
                  <div className="border-l border-black/10 p-5 text-lg font-bold text-black">السمات</div>
                  <div className="border-l border-black/10 p-5 text-lg font-bold text-black">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-700 text-sm font-bold text-white">D</span>
                      دريبدو
                    </span>
                  </div>
                  <div className="p-5 text-lg font-bold text-black">المنصات الأخرى</div>
                </div>

                {comparisonRows.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-[220px_minmax(340px,1fr)_minmax(340px,1fr)] border-t border-black/10 ${index % 2 === 0 ? 'bg-white' : 'bg-[#fcfaf8]'}`}
                  >
                    <div className="border-l border-black/10 p-5 text-right text-lg font-semibold text-black">
                      {row.feature}
                    </div>
                    <div className="border-l border-black/10 p-5 text-right text-black/80">
                      <span className="inline-flex items-start gap-3">
                        <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                        </svg>
                        <span className="leading-8">{row.dribdo}</span>
                      </span>
                    </div>
                    <div className="p-5 text-right text-black/70">
                      <span className="inline-flex items-start gap-3">
                        <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                        </svg>
                        <span className="leading-8">{row.others}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[34px] border border-black/10 bg-white p-8 text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">لماذا يختارنا المستخدمون</p>
              <h2 className="mt-4 text-4xl font-black text-black">أسباب واضحة تجعل القرار أسهل</h2>
              <p className="mt-4 text-base leading-8 text-black/65">
                عندما تكون المنصة مرتبة وواضحة وتخدم أكثر من سيناريو استخدام، يصبح تبنيها أسهل للمستخدمين والفرق والعلامات.
              </p>

              <div className="mt-8 grid gap-4">
                {customerReasons.map((item) => (
                  <article key={item.title} className="rounded-[24px] bg-[#faf6f3] p-5">
                    <h3 className="text-lg font-bold text-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-black/60">{item.desc}</p>
                  </article>
                ))}
              </div>
            </div>

          <div className="rounded-[34px] border border-black/10 bg-white p-8 text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">مسارات سريعة</p>
              <h2 className="mt-4 text-4xl font-black text-black">التفاصيل الكاملة في صفحات أخف</h2>
              <p className="mt-4 text-base leading-8 text-black/65">
                نقلنا التفاصيل الطويلة إلى الصفحات المتخصصة حتى تبقى الصفحة الرئيسية أسرع وأوضح، مع الوصول السريع إلى كل ما تحتاجه.
              </p>

              <div className="mt-8 grid gap-4">
                {supportShortcuts.map((item) => (
                  <Link key={item.title} href={item.href} className="rounded-[24px] border border-black/10 p-5 transition hover:border-black/20 hover:bg-[#faf8f6]">
                    <h3 className="text-lg font-bold text-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-black/60">{item.desc}</p>
                    <span className="mt-4 inline-flex rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                      {item.cta}
                    </span>
                  </Link>
                ))}
              </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/8 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-right">
            <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">لقطات من الواجهة</p>
            <h2 className="mt-4 text-4xl font-black text-black sm:text-5xl">
              لقطات شاشة من داخل <span className="text-red-700"> دريبدو</span>
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
              عرضنا هنا خمس لقطات أساسية للحفاظ على الصفحة واضحة، ويمكنك استعراض المزيد من صفحة المميزات.
            </p>
          </div>

          <HorizontalScroll minWidthClass="min-w-[1140px]">
            <div className="flex gap-6">
              {galleryScreenshots.map((item) => (
                <div key={item.title} className="w-[260px] shrink-0">
                  <ScreenshotCard item={item} compact />
                </div>
              ))}
            </div>
          </HorizontalScroll>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[34px] bg-[#111111] p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/45">جاهز للتجربة</p>
              <h2 className="mt-4 text-4xl font-black leading-tight">{homeContent.download.heading}</h2>
              <p className="mt-4 text-base leading-8 text-white/70">{homeContent.download.sub}</p>

              <div className="mt-8 grid gap-4">
                {downloadOptions.map((option) => (
                  <Link
                    key={option.label}
                    href={option.href}
                    className={`flex min-h-[7rem] flex-col items-center justify-center rounded-[24px] border px-8 py-5 text-center transition ${
                      option.primary
                        ? 'border-red-700 bg-red-700 text-white hover:bg-red-800'
                        : 'border-white/10 bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    <div className={`mb-3 ${option.primary ? 'text-white' : 'text-black'}`}>{option.icon}</div>
                    <div className="mx-auto flex max-w-full flex-col items-center justify-center text-center">
                      <p className={`text-base font-semibold ${option.primary ? 'text-white' : 'text-black'}`}>{option.label}</p>
                      <p className={`text-sm ${option.primary ? 'text-white/70' : 'text-black/55'}`}>{option.helper}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {homeContent.why.items.map((item) => (
                <article key={item.title} className="rounded-[30px] border border-black/10 bg-white p-7 text-right shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-black/30">ميزة</p>
                  <h3 className="mt-4 text-2xl font-bold text-black">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-black/65">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
      </section>
    </div>
  );
}


