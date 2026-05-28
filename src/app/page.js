import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'دريبدو | مجتمع عربي للنشر والمشاركة والتواصل',
  description:
    'دريبدو تطبيق اجتماعي عربي يساعدك على نشر يومياتك، مشاركة الصور والفيديوهات والصوتيات، متابعة القصص، استقبال الرسائل، وبناء ملف شخصي يعبر عنك.',
  keywords: [
    'دريبدو',
    'Dribdo',
    'تطبيق اجتماعي عربي',
    'منشورات',
    'فيديوهات',
    'صوتيات',
    'قصص',
    'دردشة',
    'مجتمع عربي',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'دريبدو | مجتمع عربي للنشر والمشاركة والتواصل',
    description: 'شارك منشوراتك وفيديوهاتك وصوتياتك، تابع القصص، وتواصل مع الناس في مساحة عربية واضحة وآمنة.',
    url: '/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Dribdo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دريبدو | مجتمع عربي للنشر والمشاركة والتواصل',
    description: 'مساحتك العربية للنشر، الفيديوهات، الصوتيات، القصص، الرسائل والملف الشخصي.',
    images: ['/icon.png'],
  },
};

const heroHighlights = [
  'منشورات وصور وفيديوهات تظهر بسلاسة في الرئيسية',
  'ملف شخصي يعرض هويتك وسيرتك ومحتواك',
  'بريد وارد يجمع الإشعارات وطلبات المراسلة',
  'خصوصية وأمان وتحكم واضح في الحساب',
];

const everydayUses = [
  {
    title: 'انشر ما تريد قوله',
    text: 'اكتب منشورًا قصيرًا أو شارك صورة أو فيديو أو صوتية. دريبدو يجعل النشر مباشرًا وواضحًا، ثم يظهر محتواك في الرئيسية والملف الشخصي بطريقة مرتبة.',
  },
  {
    title: 'تابع ما يهمك',
    text: 'الرئيسية تعرض محتوى الناس والصفحات التي تتابعها بشكل مريح. يمكنك التفاعل، التعليق، المشاركة، أو تجاوز ما لا يناسبك حتى تصبح الخلاصة أقرب لاهتماماتك.',
  },
  {
    title: 'شاهد الفيديوهات والريلز',
    text: 'قسم الفيديوهات مخصص للمشاهدة السريعة والمستمرة. افتح الفيديو، شاهد، احفظ ما يعجبك للمشاهدة لاحقًا، وانتقل بين المقاطع بسهولة.',
  },
  {
    title: 'استمع للصوتيات',
    text: 'الصوتيات تمنح المستخدم مساحة مختلفة للتعبير: فكرة، رسالة، تعليق صوتي أو محتوى مسموع. تظهر داخل قسمها وتبقى مرتبطة بحساب صاحبها.',
  },
  {
    title: 'شارك اللحظات بالقصص',
    text: 'القصص مناسبة للأحداث السريعة واليومية. صورة أو فيديو قصير يظهر للمتابعين بدون أن يزاحم منشوراتك الأساسية في الملف الشخصي.',
  },
  {
    title: 'تواصل بدون إزعاج',
    text: 'طلبات المراسلة تساعدك على معرفة من يريد الحديث معك قبل فتح محادثة كاملة. تقبل الطلب أو تتجاهله حسب ما يناسبك.',
  },
];

const profileItems = [
  'ضع صورة شخصية وغلافًا يعبران عنك.',
  'اكتب سيرة ذاتية قصيرة تظهر أسفل معلوماتك الأساسية.',
  'اعرض منشوراتك وصورك وفيديوهاتك وصوتياتك في تبويبات واضحة.',
  'تحكم في معلوماتك الشخصية ومن يمكنه رؤية محتواك.',
];

const privacyItems = [
  'اختر من يرى منشوراتك قبل النشر أو كإعداد افتراضي.',
  'حدد من يستطيع التعليق أو الإشارة إليك.',
  'قرر من يمكنه مراسلتك ومن تظهر طلباته في البريد الوارد.',
  'أخفِ حالة النشاط إذا كنت لا تريد أن يعرف الآخرون وقت تواجدك.',
];

const inboxItems = [
  {
    title: 'الإشعارات',
    text: 'تعرف على التفاعلات الجديدة: إعجابات، تعليقات، مشاركات، إشارات وتنبيهات مهمة مرتبطة بحسابك.',
  },
  {
    title: 'طلبات المراسلة',
    text: 'مكان ثابت يظهر لك الأشخاص الذين أرسلوا طلب تواصل، بدل أن تختلط الطلبات مع كل المحادثات.',
  },
  {
    title: 'الدردشة',
    text: 'بعد قبول الطلب يمكن بدء محادثة واضحة ومباشرة، مع بقاء زر بدء المراسلة متاحًا عند الحاجة.',
  },
];

const pages = [
  { href: '/privacy', label: 'سياسة الخصوصية' },
  { href: '/terms', label: 'شروط الاستخدام' },
  { href: '/community-guidelines', label: 'معايير المجتمع' },
  { href: '/help-center', label: 'مركز المساعدة' },
  { href: '/contact', label: 'اتصل بنا' },
  { href: '/deletion', label: 'طلب حذف الحساب والبيانات' },
];

function SectionHeading({ eyebrow, title, text, dark = false }) {
  return (
    <div className="max-w-3xl text-right">
      <p className={dark ? "text-[10px] font-bold uppercase tracking-[0.28em] text-white/45" : "text-[10px] font-bold uppercase tracking-[0.28em] text-red-700/70"}>{eyebrow}</p>
      <h2 className={dark ? "mt-2 text-xl font-black leading-tight text-white sm:text-2xl" : "mt-2 text-xl font-black leading-tight text-black sm:text-2xl"}>{title}</h2>
      {text ? <p className={dark ? "mt-2 text-[13px] leading-6 text-white/68" : "mt-2 text-[13px] leading-6 text-black/62"}>{text}</p> : null}
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <article className="rounded-[1.1rem] border border-black/10 bg-white p-4 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <h3 className="text-[15px] font-black sm:text-base text-black">{title}</h3>
      <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-black/65">{text}</p>
    </article>
  );
}

function RedDot() {
  return <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />;
}

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] text-black">
      <section className="relative overflow-hidden border-b border-black/10 bg-[radial-gradient(circle_at_top_left,#fee2e2,transparent_36%),linear-gradient(135deg,#fff7f7,#f8f4ef)]">
        <div className="absolute -right-24 top-16 h-44 w-44 rounded-full bg-red-700/10 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-40 w-40 rounded-full bg-red-700/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-[1fr_0.82fr] lg:px-6 lg:py-12">
          <div className="flex flex-col justify-center text-right">
            <p className="inline-flex w-fit rounded-full border border-red-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-red-700">
              Dribdo
            </p>
            <h1 className="mt-4 max-w-3xl text-[1.75rem] font-black leading-[1.18] text-black sm:text-3xl lg:text-4xl">
              دريبدو مساحة عربية للنشر والمشاهدة والتواصل بطريقتك.
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 sm:text-sm sm:leading-7 text-black/68">
              في دريبدو تستطيع أن تكتب منشورًا، تشارك صورة، تنشر فيديو، تسجل صوتية، تعرض قصتك اليومية، وتفتح باب التواصل مع الآخرين من خلال بريد وارد منظم يحافظ على راحتك وخصوصيتك.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/download" className="rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-800">
                تحميل التطبيق
              </Link>
              <Link href="/moments" className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold text-black transition hover:border-red-300 hover:text-red-700">
                تصفح الواجهة
              </Link>
            </div>
          </div>

          <aside className="rounded-[1.1rem] border border-black/10 bg-white p-3 sm:p-4 text-right shadow-lg">
            <div className="rounded-[1rem] bg-[#111827] p-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">داخل دريبدو</p>
                  <h2 className="mt-2 text-xl font-black sm:text-2xl">ما الذي ستجده؟</h2>
                </div>
              </div>
              <div className="mt-4 grid gap-2.5">
                {heroHighlights.map((item, index) => (
                  <div key={item} className="flex items-center justify-between gap-3 rounded-xl bg-white/8 p-3">
                    <span className="text-xs font-semibold leading-5 sm:text-sm sm:leading-6">{item}</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">0{index + 1}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-white p-4 text-black">
                <p className="text-sm font-black">البداية بسيطة</p>
                <p className="mt-2 text-xs leading-6 text-black/60">أنشئ حسابك، أكمل ملفك الشخصي، ثم ابدأ بالنشر أو متابعة المحتوى الذي يهمك.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-6">
        <SectionHeading
          eyebrow="الاستخدام اليومي"
          title="كل قسم في التطبيق له دور واضح في يومك"
          text="دريبدو لا يطلب من المستخدم فهم إعدادات معقدة. افتح التطبيق، اختر ما تريد فعله، وانشر أو شاهد أو تواصل من المكان المناسب."
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {everydayUses.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="bg-white py-7 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:p-5 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="rounded-[1.35rem] bg-red-700 p-4 sm:p-5 text-right text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">الملف الشخصي</p>
            <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">صفحتك التي تعبر عنك</h2>
            <p className="mt-2 text-[13px] leading-6 text-white/78">
              الملف الشخصي في دريبدو ليس مجرد اسم وصورة. هو المكان الذي يجمع هويتك، سيرتك، منشوراتك، صورك، فيديوهاتك وصوتياتك، حتى يعرف الآخرون من أنت وما الذي تشاركه.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {profileItems.map((item) => (
              <article key={item} className="flex items-start gap-3 rounded-[1.1rem] border border-black/10 bg-[#f8f4ef] p-4 text-right">
                <RedDot />
                <p className="text-[13px] leading-6 text-black/70">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-6">
        <div className="grid gap-4 sm:p-5 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="البريد الوارد"
              title="رسائلك وتنبيهاتك في مكان مفهوم"
              text="البريد الوارد يساعدك على متابعة ما يحدث حول حسابك، ومعرفة من يريد مراسلتك، بدون أن تضيع الطلبات وسط المحادثات العادية."
            />
            <div className="mt-4 grid gap-3">
              {inboxItems.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-black/10 bg-black p-4 sm:p-5 text-right text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">الخصوصية</p>
            <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">أنت تحدد حدودك داخل التطبيق</h2>
            <p className="mt-2 text-[13px] leading-6 text-white/70">
              بعض الناس يحبون النشر للجميع، وآخرون يفضلون جمهورًا محدودًا. لذلك يمنحك دريبدو إعدادات تساعدك على اختيار من يرى محتواك، من يعلق، ومن يستطيع بدء التواصل معك.
            </p>
            <ul className="mt-5 space-y-2.5">
              {privacyItems.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-white/78">
                  <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#111827] py-7 sm:py-8 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="المشاهدة والمشاركة"
            title="وسائط تظهر للمستخدم كما يتوقعها"
            text="عند فتح منشور يحتوي صورة أو فيديو، لا يشعر المستخدم أن الصفحة فارغة. تظهر مساحة المحتوى بشكل ثابت، ثم تصل الصورة أو الفيديو بطريقة هادئة وسلسة حسب سرعة الاتصال."
            dark
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الصور</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">تظهر داخل المنشورات والملف الشخصي والاستكشاف والصور المصغرة بدون قفز مفاجئ في شكل الصفحة.</p>
            </article>
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الفيديوهات</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">تبدأ بصورة مصغرة واضحة ثم يصبح الفيديو جاهزًا للتشغيل، مع أدوات تظهر عند الحاجة وتختفي حتى لا تزعج المشاهدة.</p>
            </article>
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الصور الشخصية</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">صور الحسابات تظهر بسلاسة في القوائم، التعليقات، الرسائل والملف الشخصي، حتى في الصفحات الثقيلة.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-6">
        <div className="rounded-[1.25rem] bg-white p-4 sm:p-5 text-right shadow-sm sm:p-6">
          <div className="grid gap-4 sm:p-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-700/70">الصفحات الرسمية</p>
              <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">معلومات واضحة عندما تحتاجها</h2>
              <p className="mt-2 text-[13px] leading-6 text-black/62">
                من داخل التطبيق يمكن الوصول إلى صفحات تشرح الخصوصية، شروط الاستخدام، معايير المجتمع، الدعم، التواصل وطلب حذف الحساب والبيانات.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pages.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-800 transition hover:bg-red-700 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-white py-7 sm:py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:p-4 px-4 text-right sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-red-700/70">ابدأ الآن</p>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">حمّل دريبدو وابدأ ببناء حضورك</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-black/62">
              أنشئ حسابك، اكتب سيرتك، شارك أول منشور، وتابع المحتوى الذي يشبه اهتماماتك.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/download" className="rounded-full bg-red-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-800">تحميل التطبيق</Link>
            <Link href="/contact" className="rounded-full border border-black/15 px-4 py-2 text-xs font-bold text-black transition hover:border-red-300 hover:text-red-700">اتصل بنا</Link>
          </div>
        </div>
      </section>
    </main>
  );
}











