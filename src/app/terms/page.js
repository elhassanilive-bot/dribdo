export const metadata = {
  title: 'شروط الاستخدام | دريبدو',
  description: 'شروط استخدام Dribdo المخصصة للحسابات، المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، البلاغات والإعدادات.',
  alternates: { canonical: '/terms' },
};

const sections = [
  {
    title: 'استخدام الحساب',
    items: [
      'أنت مسؤول عن الحفاظ على أمان حسابك وعدم مشاركة كلمة المرور أو رموز التحقق أو الجلسات مع الآخرين.',
      'يجب أن تكون معلومات الملف الشخصي والسيرة الذاتية والصور غير مضللة أو منتحلة لهوية شخص آخر.',
      'قد يتم تقييد الحساب أو تقليل ظهوره أو تعطيل بعض الميزات عند وجود نشاط مخالف أو بلاغات متكررة.',
    ],
  },
  {
    title: 'المحتوى داخل التطبيق',
    items: [
      'يمكنك نشر نصوص، صور، فيديوهات، صوتيات، قصص وتعليقات بشرط احترام القوانين وحقوق الآخرين.',
      'لا يسمح بالمحتوى الذي يتضمن تحريضا، تهديدا، احتيالا، ابتزازا، استغلالا، انتحال هوية أو نشر معلومات خاصة دون إذن.',
      'أنت تمنح Dribdo حق عرض ومعالجة المحتوى داخل المنصة لتشغيل الخلاصة، الملف الشخصي، الاستكشاف، البحث، الإشعارات والمشاركة.',
    ],
  },
  {
    title: 'الدردشة وطلبات المراسلة',
    items: [
      'طلبات المراسلة موجودة لحماية المستخدم من الرسائل غير المرغوبة، وقد يحتاج الطرف الآخر لقبول الطلب قبل بدء المحادثة.',
      'يمنع استخدام الدردشة للإزعاج، الاحتيال، إرسال روابط خطرة، تهديد المستخدمين أو إرسال محتوى مخالف.',
      'يمكن للمستخدم حظر أو كتم أو الإبلاغ عن الحسابات والمحادثات عند الحاجة.',
    ],
  },
  {
    title: 'الوسائط والرفع',
    items: [
      'يجب أن تكون ملفات الفيديو والصور والصوتيات التي ترفعها ملفات حقيقية وغير تالفة أو خادعة.',
      'قد يطبق التطبيق ضغطا، توليد صور مصغرة، كاش، جودة حسب الشبكة أو قيود حجم ومدة لحماية الأداء وتجربة المستخدم.',
      'لا ترفع ملفات تملك حقوقها جهة أخرى إذا لم يكن لديك إذن مناسب للنشر.',
    ],
  },
  {
    title: 'الإجراءات والبلاغات',
    items: [
      'قد تتم مراجعة البلاغات على المنشورات، الدردشة أو الحسابات ثم اتخاذ إجراء مثل الإخفاء، التقييد، التحذير أو التعطيل.',
      'استخدام أدوات البلاغ بشكل كاذب أو منسق للإضرار بالآخرين قد يعتبر إساءة استخدام.',
      'تخضع طلبات حذف الحساب والبيانات للمراجعة لحماية المستخدم من الطلبات غير المصرح بها.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Terms of Use</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">شروط استخدام Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الشروط تنظّم استخدام تطبيق Dribdo وميزاته الاجتماعية: المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، الملف الشخصي، الإعدادات، البلاغات والدعم.
          </p>
          <p className="mt-4 text-sm font-semibold text-black/45">آخر تحديث: 28 مايو 2026</p>
        </header>

        <section className="mt-8 space-y-5">
          {sections.map((section, index) => (
            <article key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold text-red-700">{index + 1}.</p>
              <h2 className="mt-2 text-2xl font-black">{section.title}</h2>
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
    </main>
  );
}
