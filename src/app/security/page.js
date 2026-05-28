export const metadata = {
  title: 'السلامة والأمان | دريبدو',
  description: 'شرح مخصص لأمان Dribdo: الجلسات، سجل الدخول، التحقق بخطوتين، البلاغات، الحساب المقيد، الحظر والكتم.',
  alternates: { canonical: '/security' },
};

const sections = [
  {
    title: 'حماية تسجيل الدخول',
    items: [
      'يدعم التطبيق متابعة جلسات الأجهزة حتى يعرف المستخدم أين يعمل حسابه.',
      'يسجل Dribdo محاولات الدخول الجديدة أو الحساسة ضمن نشاط الحساب للمراجعة والتنبيه.',
      'يوفر التحقق بخطوتين طبقة حماية إضافية عند تسجيل الدخول أو عند تنفيذ إجراءات حساسة.',
    ],
  },
  {
    title: 'صحة الحساب',
    items: [
      'تعرض صفحة صحة الحساب حالة الأمان، الجلسات، الطلبات المفتوحة والقيود النشطة.',
      'الحساب المقيد يقلل الظهور بدل الحظر الكامل في الحالات التي تحتاج إجراء أخف.',
      'قد تظهر قيود مؤقتة عند وجود بلاغات أو نشاط غير طبيعي أو مخالفة للسياسات.',
    ],
  },
  {
    title: 'السلامة داخل الدردشة والمحتوى',
    items: [
      'يمكن للمستخدم حظر أو كتم حسابات مزعجة من إعدادات موحدة.',
      'طلبات المراسلة تقلل الرسائل غير المرغوبة قبل تحولها إلى محادثة كاملة.',
      'البلاغات تساعد فريق المراجعة في التعامل مع منشورات، محادثات أو حسابات مسيئة.',
    ],
  },
  {
    title: 'أمان الوسائط والرفع',
    items: [
      'يتم التحقق من نوع ملفات الفيديو وحجمها ومدتها قبل الرفع لحماية الأداء والمستخدمين.',
      'تساعد الصور المصغرة والكاش واستراتيجية الجودة حسب الشبكة على تقليل الأعطال والتجربة الفارغة.',
      'الملفات التالفة أو التي ليست فيديو حقيقي يمكن رفضها لحماية التخزين والتشغيل.',
    ],
  },
];

export default function SecurityPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Safety & Security</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">السلامة والأمان في Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الصفحة تشرح أدوات الأمان التي يحتاجها مستخدم Dribdo داخل التطبيق: الجلسات، سجل الدخول، التحقق بخطوتين، البلاغات، الحظر، الكتم وصحة الحساب.
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-black/70">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
