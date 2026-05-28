export const metadata = {
  title: 'معايير المجتمع | دريبدو',
  description: 'تعرف على قواعد السلوك والمحتوى التي تساعد في الحفاظ على مجتمع دريبدو آمنا وواضحا للجميع.',
  alternates: { canonical: '/community-guidelines' },
};

const principles = [
  {
    title: 'الاحترام أولا',
    text: 'نرحب بالنقاش والاختلاف، لكننا لا نقبل الإهانة أو التهديد أو الاستهداف الشخصي أو التحريض ضد الأفراد أو المجموعات.',
  },
  {
    title: 'محتوى حقيقي وواضح',
    text: 'تجنب التضليل، انتحال الهوية، الاحتيال، أو نشر معلومات كاذبة بهدف خداع الآخرين أو الإضرار بهم.',
  },
  {
    title: 'سلامة المستخدمين',
    text: 'أي محتوى يتضمن ابتزازا، استغلالا، عنفا، تحرشا، أو كشف معلومات خاصة قد تتم مراجعته وإزالته أو تقييد الحساب المرتبط به.',
  },
  {
    title: 'حقوق الآخرين',
    text: 'انشر ما تملك حق نشره فقط، واحترم خصوصية الأشخاص وحقوق الملكية الفكرية عند مشاركة الصور أو الفيديوهات أو النصوص.',
  },
];

const sections = [
  {
    title: 'ما الذي لا نسمح به؟',
    items: [
      'التهديد، التحريض، الكراهية، أو استهداف الأشخاص بسبب هويتهم أو آرائهم.',
      'الاحتيال، الروابط الخادعة، انتحال الشخصيات، أو محاولة سرقة الحسابات والبيانات.',
      'نشر معلومات خاصة عن الآخرين دون إذن، مثل أرقام الهواتف أو العناوين أو المحادثات الخاصة.',
      'المحتوى الذي يشجع على إيذاء النفس أو العنف أو الاستغلال أو التحرش.',
    ],
  },
  {
    title: 'كيف نتعامل مع البلاغات؟',
    items: [
      'نراجع البلاغات حسب السياق والأدلة المتاحة ونوع المخالفة وتأثيرها على المستخدمين.',
      'قد تشمل الإجراءات إخفاء المحتوى، تقييد الوصول، تقليل الظهور، تعطيل بعض الميزات، أو إيقاف الحساب في الحالات الخطيرة.',
      'يمكن للمستخدم استعمال أدوات الحظر والكتم والبلاغ لتقليل التواصل غير المرغوب فيه بسرعة.',
    ],
  },
  {
    title: 'مسؤولية المستخدم',
    items: [
      'اختر جمهور منشوراتك بعناية من إعدادات الخصوصية قبل نشر محتوى حساس أو شخصي.',
      'لا تشارك كلمة المرور أو رموز التحقق أو روابط الدخول مع أي شخص.',
      'عند مواجهة مشكلة، استخدم صفحة الإبلاغ عن مشكلة أو اتصل بنا مع وصف واضح ورابط المحتوى إن وجد.',
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Community Guidelines</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">معايير المجتمع</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الصفحة توضح القواعد العامة التي تساعد على إبقاء دريبدو مساحة اجتماعية آمنة، واضحة، ومحترمة لكل المستخدمين.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {principles.map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-black">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black text-black">{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-black/70">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                    <span className="leading-8">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
