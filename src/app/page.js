import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: 'دريبدو | للنشر والمشاركة والتواصل',
  description:
    'دريبدو تطبيق يساعدك على نشر يومياتك، مشاركة الصور والفيديوهات والصوتيات، متابعة القصص، استقبال الرسائل، وبناء ملف شخصي يعبر عنك.',
  keywords: [
    'دريبدو',
    'Dribdo',
    'تطبيق اجتماعي',
    'منشورات',
    'فيديوهات',
    'صوتيات',
    'قصص',
    'دردشة',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'دريبدو | للنشر والمشاركة والتواصل',
    description: 'شارك منشوراتك وفيديوهاتك وصوتياتك، تابع القصص، وتواصل مع الناس في مساحة واضحة وآمنة.',
    url: '/',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Dribdo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'دريبدو | للنشر والمشاركة والتواصل',
    description: 'مساحتك للنشر، الفيديوهات، الصوتيات، القصص، الرسائل والملف الشخصي.',
    images: ['/icon.png'],
  },
};

const heroHighlights = [
  'منشورات المبدعين مثلك تحدث لحظة بلحظة',
  'صوتيات من القراء أو المغنيين, صوت مسموع',
  ' قصص وفيديوهات المبدعين مثلك',
  ' التفاعلات المتعددة على حسب حالة المنشور',
];

const everydayUses = [
  {
    title: 'استكشف المبدعين في آن واحد',
    text: 'من خلال قسم الاستكشاف وفرنا لك خيارات متعددة للبحث عن منشورات مستخدمين فيديوهات وغيرها بدون الحاجة للبحث اليدوي داخل التطبيق .',
  },
  {
    title: '  دوّن فكرة أو شارك تفصيلاً ',
    text: 'اكتب ما يجول بخاطرك، شارك لقطة ملهمة، أو ارفع تسجيلاً صوتياً أو مقطعاً مرئياً. النشر هنا ينساب بيسر لتجد كلماتك ووسائطك مكاناً لائقاً ومرتباً..',
  },
  {
    title: 'دوّن فيديو كصناع المحتوى المرئي',
    text: 'مساحة مخصصة لعرض ورفع مقاطع الفيديو القصيرة والملهمة. تصفح بسلاسة، احفظ ما أثار إعجابك للعودة إليه لاحقاً، وشارك حكاياتك المصورة.',
  },
  {
    title: 'دوّن مقطع صوتي أو شارك صوتك ',
    text: 'لأن الصوت يحمل دفء المشاعر، نوفر لك خيار رفع وتسجيل مقاطع صوتية تعبّر عن رأي أو تسرد خاطرة، لتبقى لصيقةً بملفك الشخصي ومتاحةً لمن يود الاستماع.',
  },
  {
    title: 'قصصٌ ترويها اللحظة',
    text: 'انشر قصصاً يومية سريعة لتوثيق لحظاتك العابرة. صورة أو لقطة فيديو خفيفة تشاركها مع متابعيك وتختفي بلطف دون أن تزدحم بها صفحتك الأساسية.',
  },
  {
    title: 'تواصلٌ محفوف بالهدوء',
    text: 'نحمي وقتك بنظام ذكي للرسائل؛ حيث تصلك طلبات المراسلة أولاً لتمنحك خيار القبول أو التجاهل بوقار، دون صخب المحادثات المفاجئة.',
  },
];

const profileItems = [
  'زيّن حضورك بصورة شخصية وغلاف يعكسان هويتك وشخصيتك.',
  'سطّر نبذةً دافئة تصف للزائرين اهتماماتك وتطلعاتك.',
  'استعرض منشوراتك، ووسائطك، وتسجيلاتك الصوتية في أروقة مرتبة.',
  'تحكّم ببياناتك واختر من يملك حق تأمل محتواك ومشاركتك دروبك.',
];

const privacyItems = [
  'امكانية تعديل معلومات الملف الشخصي .',
  'التحكم في خصوصيتك حول من يمكنه رؤية معلومات ملفك الشخصي.',
  'المزيد من خصوصية المنشورات ومن يمكنه التعليق والوصول اليك',
 'اشعارات فورية تصلك لحظة بلحظة دون الحاجة للستكشاف جوانب التطبيق.',
  'امكانية تبديل لغة التطبيق من الانجليزية الى الفرنسية أو العربية.',
 'اعرف من يتواصل معك عبر طلبات الرسائل في البريد الوارد.',
  'المزيد من التحكم حول أهم اعدادات الخصوصية و الحظر و الحالة والوسائط.',
];

const inboxItems = [
  {
    title: ' اشعارات فورية ',
    text: 'تلقى تنبيهاتٍ ناعمة عندما يتفاعل الآخرون مع كلماتك بالإعجابات، التعليقات، أو الإشارات الملهمة.',
  },
  {
    title: 'طلبات المراسلة الوافدة',
    text: 'رواق هادئ يستقبل رسائل من تواصلوا معك لأول مرة، يمنحك مهلةً للتأمل والقبول قبل بدء الحديث.',
  },
  {
    title: 'أروقة الدردشة',
    text: 'بعد تلاقي الأفكار وقبول الطلب، تنطلق محادثة ثنائية مباشرة مع الحفاظ على مرونة التواصل.',
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
                   شارك صوتك وانشر واستكشف المبدعين مثلك, مع دريبدو عبر بطريقتك.
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 sm:text-sm sm:leading-7 text-black/68">
              في دريبدو، نمنح أفكارك صوتاً وصورة. صُغ منشوراتك، وشارك الصور والفيديو، أو سجّل مقاطعك الصوتية وقصصك اليومية، متصلاً بأصدقائك من خلال بريدٍ ذكيّ يصون هدوءك ويحترم خصوصيتك.
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
                <p className="mt-2 text-xs leading-6 text-black/60">ابدأ بخطوة بسيطة؛ أنشئ حسابك، ونسّق معالم صفحتك الشخصية، ثم انطلق لتنشر وبث ما تحب أو تتابع أفكار الآخرين.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-7 sm:px-5 sm:py-8 lg:px-6">
        <SectionHeading
          eyebrow="الاستخدام اليومي"
          title="شارك يومك لحظة بلحظة "
          text="صممنا الميزات لتكون في متناول يدك مباشرة؛ تصفح واكتب وسجل والتقط اللحظات دون الحاجة للمرور بإجراءات معقدة."
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
            <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">مساحتك الخاصة للتعبير</h2>
            <p className="mt-2 text-[13px] leading-6 text-white/78">
              ملفك الشخصي يروي حكايتك ويوثق إبداعاتك؛ يجمع منشوراتك، صورك، مقاطعك المرئية، وتسجيلاتك الصوتية في أروقة منسقة تعكس ذاتك.
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
              title="رسائل وتنبيهات تصلك بكل هدوء"
              text="بريدٌ ذكيّ يرتب محادثاتك، ويفصل طلبات المراسلة الوافدة عن دردشاتك المعتادة لتظل على اتصال دائم وبمنتهى الخصوصية."
            />
            <div className="mt-4 grid gap-3">
              {inboxItems.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>

          <div className="rounded-[1.1rem] border border-black/10 bg-black p-4 sm:p-5 text-right text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/35">الخصوصية</p>
            <h2 className="mt-2 text-xl font-black leading-tight sm:text-2xl">سيادة تامة وإعدادات تحترم خصوصيتك</h2>
            <p className="mt-2 text-[13px] leading-6 text-white/70">
              سواء كنت تفضل مشاركة أفكارك مع الجميع أو الاحتفاظ بها لدائرة مقربة، تمنحك خيارات التحكم القدرة الكاملة على تحديد جمهور منشوراتك، وإدارة التعليقات، والتحكم بمن يراسلك.
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
            title="عرض ذكي وسلس للوسائط"
            text="نمنحك تجربة متكاملة في التطبيق حيت يتم عرض الوسائط مثل الصور والفيديوهات والصوتيات بشكل سلس ونضمن لك أن العرض والتشغيل سريع حسب نوع الشبكة اللتي تستخدمها أو نوع الاتصال عندك, تحقق دائما من الاتصال قبل محاولة عرض الوسائط في التطبيق,."
            dark
          />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الصور</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">تظهر في قسم الموجز وعلى ملفك الشخصي وفي التعليقات والرسائل وقد تظهر في أماكن عامة في التطبيق.</p>
            </article>
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الفيديوهات</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">تبدأ بعرض غلاف واضح ثم تنساب للتشغيل، مع أدوات تحكم ذكية تظهر بلطف وتتوارى لتمنحك مشاهدة مريحة.</p>
            </article>
            <article className="rounded-[1.25rem] bg-white/8 p-4 sm:p-4 text-right">
              <h3 className="text-[15px] font-black sm:text-base">الصوتيات</h3>
              <p className="mt-2 text-[12px] leading-5 sm:text-[13px] sm:leading-6 text-white/68">استمع لأجمل صوتيات اللتي تلامس قلبك. مع أبرز الفنانين اللدين يشاركون أصواتهم.</p>
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
                بوابات رسمية تضع بين يديك كل ما تحتاج لمعرفته حول الخصوصية، وشروط الاستخدام، ومعايير السلامة، وخيارات الدعم.
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
            <h2 className="mt-2 text-xl font-black sm:text-2xl">ابدأ تجربتك وعبر عن ذاتك</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-black/62">
              انضم إلينا الآن؛ صمم صفحتك، شارك منشورك الأول، واكتشف أفكاراً تشبه تطلعاتك.
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
