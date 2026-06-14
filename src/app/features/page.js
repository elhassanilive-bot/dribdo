export const metadata = {
  title: 'مميزات دريبدو',
  description: 'استكشف مميزات دريبدو: النشر، الفيديوهات، التسجيلات الصوتية، القصص، الاستكشاف، البحث، الدردشة، وإعدادات الخصوصية.',
  alternates: { canonical: '/features' },
};

const featureGroups = [
  {
    title: 'النشر والمحتوى',
    intro: 'منظومة نشر مرنة تتيح لك مشاركة أي شيء — نصاً كان أم صورة أم فيديو أم صوتاً — بطريقة واضحة وبدون خطوات زائدة.',
    items: [
      { title: 'منشورات متعددة الأنواع', description: 'انشر نصوصاً وصوراً وفيديوهات وتسجيلات صوتية من واجهة إنشاء موحدة تتكيف مع نوع المحتوى الذي تختاره.' },
      { title: 'القصص اليومية', description: 'شارك لحظاتك في قصص تختفي بعد فترة، بصيغة صورة أو فيديو قصير أو خلفية نصية مخصصة.' },
      { title: 'التفاعلات والتعليقات', description: 'تفاعل مع المحتوى بتفاعلات متنوعة، وأضف تعليقات نصية أو مرئية من الواجهة ذاتها بدون تنقل بين صفحات.' },
      { title: 'تحكم في من يرى منشورك', description: 'اختر قبل النشر إن كان المحتوى عاماً أو مقيداً بالمتابعين أو مخصصاً، ويمكنك تعديل الإعداد لاحقاً.' },
    ],
  },
  {
    title: 'الفيديوهات',
    intro: 'قسم مخصص للمقاطع المرئية بتصفح عمودي متصل، وأدوات تحكم موحدة لكل ما تحتاجه أثناء المشاهدة.',
    items: [
      { title: 'تصفح عمودي متصل', description: 'انتقل بين الفيديوهات بالتمرير التلقائي لأسفل دون انقطاع في التشغيل أو الانتظار.' },
      { title: 'حفظ، مشاركة، وإبلاغ', description: 'احفظ مقطعاً للمشاهدة لاحقاً، انسخ رابطه، شاركه، أو أبلغ عنه — من قائمة واحدة منظمة.' },
      { title: 'رفع فيديو مع مصغّرة', description: 'ارفع مقطعك وحدد مصغّرة مخصصة أو اختر واحدة من الإطارات المقترحة قبل النشر.' },
    ],
  },
  {
    title: 'التسجيلات الصوتية',
    intro: 'أسلوب تعبير مختلف يتيح لك نشر صوتك مباشرة — تعليقاً كان أم مقطعاً مستقلاً — بدون الحاجة إلى نص أو صورة.',
    items: [
      { title: 'منشور صوتي مستقل', description: 'سجّل مقطعاً صوتياً وانشره في شريطك الرئيسي كمنشور مستقل يظهر للمتابعين بشكل مباشر.' },
      { title: 'تعليق صوتي', description: 'أضف تعليقاً صوتياً على أي منشور بدلاً من الكتابة، مفيد حين تريد التعبير بلهجتك الطبيعية.' },
      { title: 'مشغّل صوتي مدمج', description: 'تشغيل سلس داخل التطبيق بشريط تحكم واضح يتيح الإيقاف والتقديم والتمرير بدون مغادرة الصفحة.' },
    ],
  },
  {
    title: 'الاستكشاف والبحث',
    intro: 'قسم مخصص للعثور على محتوى جديد وحسابات مثيرة للاهتمام، مرتب بأسلوب يُسهّل التنقل والاكتشاف.',
    items: [
      { title: 'استكشاف المنشورات', description: 'تصفح أبرز المنشورات والأكثر تفاعلاً بحسب الاهتمامات والهاشتاقات والتصنيفات.' },
      { title: 'بحث عن المستخدمين', description: 'اعثر على أشخاص بالاسم أو اسم المستخدم وتصفح ملفاتهم الشخصية ومحتواهم مباشرة.' },
      { title: 'هاشتاقات وتصنيفات', description: 'انقر على أي هاشتاق لترى كل المنشورات المرتبطة به في صفحة تجميع واضحة ومنظمة.' },
    ],
  },
  {
    title: 'الدردشة والرسائل',
    intro: 'قناة تواصل مباشرة تدعم المحادثات الفردية والجماعية مع وسائط متنوعة وتحكم كامل في طلبات المراسلة.',
    items: [
      { title: 'محادثات فردية وجماعية', description: 'أنشئ محادثة مباشرة أو ادعُ مجموعة وأدر الطلبات الجديدة من قسم منفصل عن الدردشات النشطة.' },
      { title: 'وسائط وملفات', description: 'أرسل صوراً وفيديوهات وتسجيلات صوتية داخل الدردشة بدون الحاجة لمشاركة روابط خارجية.' },
      { title: 'طلبات المراسلة', description: 'راجع من يريد مراسلتك قبل القبول، وتحكم في من يمكنه الوصول إلى محادثاتك من الإعدادات.' },
    ],
  },
  {
    title: 'الخصوصية والإعدادات',
    intro: 'إعدادات فعلية مرتبطة بسلوك حقيقي داخل التطبيق، وليست مجرد خيارات شكلية لا تُترجَم إلى نتيجة.',
    items: [
      { title: 'إدارة الحساب', description: 'تحكم في البريد وكلمة المرور وطريقة تسجيل الدخول وأذونات الأجهزة المرتبطة بحسابك.' },
      { title: 'إعدادات الخصوصية', description: 'اضبط رؤية الحساب والمتابعة والتعليق والحظر والكتم والإشارة من صفحة إعدادات موحدة.' },
      { title: 'المحفوظات والأرشيف', description: 'راجع المنشورات المحفوظة وأرشيف القصص وسجل بعض العمليات المرتبطة باستخدامك.' },
    ],
  },
];

function FeatureIcon({ index }) {
  const icons = [
    <path key="1" d="M5 19h14M7 16V8m5 8V5m5 11v-6" strokeLinecap="round" strokeLinejoin="round" />,
    <path key="2" d="M4 12h16M12 4v16" strokeLinecap="round" />,
    <path key="3" d="M4 7h16M4 12h10M4 17h16" strokeLinecap="round" />,
    <path key="4" d="M6 18 18 6M7 7h10v10" strokeLinecap="round" strokeLinejoin="round" />,
    <>
      <path key="5" d="M5 12a7 7 0 1 1 7 7" strokeLinecap="round" />
      <path key="5b" d="M12 9v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    <path key="6" d="M6 8h12M6 12h12M6 16h8" strokeLinecap="round" />,
    <path key="7" d="M6 6h12v12H6z" strokeLinecap="round" strokeLinejoin="round" />,
  ];

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.8">
      {icons[index % icons.length]}
    </svg>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/8">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6 text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.45em] text-black/35">المميزات</p>
              <h1 className="text-5xl font-black leading-tight sm:text-6xl">كل ما يقدمه دريبدو في تجربة واحدة متماسكة</h1>
              <p className="max-w-3xl text-lg leading-8 text-black/65">
                دريبدو يجمع النشر والفيديو والصوتيات والقصص والاستكشاف والبحث والدردشة والإعدادات في تطبيق واحد واضح — بدون ازدحام أو أقسام لا تحتاجها.
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">نظرة سريعة</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  'منشورات وصور وفيديو وتسجيلات صوتية',
                  'قصص يومية ودردشة مباشرة وجماعية',
                  'استكشاف وبحث عن المستخدمين والمحتوى',
                  'إعدادات خصوصية وأمان مفصّلة',
                ].map((item, index) => (
                  <article key={item} className="rounded-[1.5rem] bg-[#faf8f6] p-5">
                    <div className="mb-4"><FeatureIcon index={index} /></div>
                    <p className="text-sm leading-7 text-black/70">{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {featureGroups.map((group, groupIndex) => (
            <article key={group.title} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <div className="mb-8 text-right">
                <p className="text-sm font-semibold uppercase tracking-[0.4em] text-black/35">مجال الميزة</p>
                <h2 className="mt-3 text-3xl font-black text-black">{group.title}</h2>
                <p className="mt-4 max-w-4xl text-base leading-8 text-black/65">{group.intro}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.items.map((item, itemIndex) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-black/10 bg-[#fcfbf9] p-5">
                    <div className="mb-4"><FeatureIcon index={groupIndex + itemIndex} /></div>
                    <h3 className="text-xl font-bold text-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-8 text-black/65">{item.description}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
