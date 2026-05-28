export const metadata = {
  title: 'مركز المساعدة | دريبدو',
  description: 'مركز مساعدة مخصص لتطبيق Dribdo وميزاته: الحساب، المنشورات، الفيديوهات، الدردشة، الخصوصية، البلاغات والحذف.',
  alternates: { canonical: '/help-center' },
};

const groups = [
  {
    title: 'الحساب والملف الشخصي',
    items: [
      'يمكنك تعديل الاسم، الصورة، الغلاف والسيرة الذاتية من إدارة الحساب داخل الإعدادات.',
      'إذا لم تظهر السيرة الذاتية أو الصورة الجديدة، أغلق الصفحة وافتحها أو اسحب للتحديث.',
      'قسم صحة الحساب يعرض الجلسات، الطلبات المفتوحة، القيود النشطة وبعض إشارات الأمان.',
    ],
  },
  {
    title: 'المنشورات والوسائط',
    items: [
      'عند بطء الإنترنت تظهر أماكن رمادية وسكليتون ثم يتم عرض الصورة أو الفيديو تدريجيا.',
      'الفيديوهات قد تستخدم جودة أقل على الشبكة الضعيفة وجودة أعلى عند تحسن الاتصال.',
      'إذا فشل رفع فيديو، تحقق من الحجم والمدة والصيغة ثم أعد المحاولة عبر شبكة مستقرة.',
    ],
  },
  {
    title: 'البريد الوارد والدردشة',
    items: [
      'البريد الوارد يجمع الإشعارات وطلبات المراسلة في مكان واحد.',
      'طلبات المراسلة تظهر قبل فتح محادثة كاملة، ويمكن قبولها أو تجاهلها حسب إعدادات الخصوصية.',
      'زر بدء مراسلة يبقى متاحا لكن الطلبات الواردة تظهر بوضوح داخل صفحة البريد الوارد.',
    ],
  },
  {
    title: 'الخصوصية والسلامة',
    items: [
      'يمكنك تحديد من يرى منشوراتك افتراضيا، من يستطيع مراسلتك، من يستطيع التعليق أو الإشارة إليك.',
      'استخدم الحظر أو الكتم أو البلاغ عند وجود محتوى مزعج أو حساب مسيء.',
      'الكلمات المحظورة تساعد على تقليل التعليقات أو الرسائل غير المرغوبة حسب إعدادات الحساب.',
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Help Center</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">مركز مساعدة Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الصفحة تشرح استخدام ميزات التطبيق الفعلية: الحساب، المنشورات، الفيديوهات، الصوتيات، القصص، البريد الوارد، الدردشة، الخصوصية والدعم.
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {groups.map((group) => (
            <article key={group.title} className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-black">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
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
