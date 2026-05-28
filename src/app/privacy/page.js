export const metadata = {
  title: 'سياسة الخصوصية | دريبدو',
  description: 'سياسة خصوصية مخصصة لتطبيق دريبدو: الحساب، المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، التوصيات وطلبات الحذف.',
  alternates: { canonical: '/privacy' },
};

const cards = [
  { title: 'بيانات الحساب', text: 'نستخدم الاسم، اسم المستخدم، الصورة، الغلاف، السيرة الذاتية، تاريخ الميلاد، الجنس، البلد ومعلومات الملف الشخصي لتشغيل الحساب وعرضه حسب إعدادات الخصوصية.' },
  { title: 'المحتوى والوسائط', text: 'يشمل ذلك المنشورات، الصور، الفيديوهات، الصور المصغرة، الصوتيات، القصص، التعليقات، التفاعلات، الحفظ والمشاركة داخل Dribdo.' },
  { title: 'الدردشة والبريد الوارد', text: 'نعالج الرسائل وطلبات المراسلة وحالة القبول أو الرفض حتى تعمل المحادثات وطلبات الرسائل بطريقة واضحة وآمنة.' },
  { title: 'الأمان والنشاط', text: 'نسجل نشاطات مهمة مثل تسجيل الدخول، الجلسات، محاولات الدخول الفاشلة والتغييرات الحساسة لحماية الحساب وتنبيه المستخدم عند الحاجة.' },
];

const sections = [
  {
    title: 'لماذا نجمع البيانات؟',
    items: [
      'تشغيل الخلاصة الرئيسية، الملف الشخصي، الفيديوهات، الصوتيات، القصص والاستكشاف.',
      'حفظ إعدادات الخصوصية مثل من يرى المنشورات، من يراسلك، من يعلق أو يذكرك، وإظهار حالة النشاط.',
      'تحسين رفع وتشغيل الوسائط مثل جودة الفيديو، الصور المصغرة، الكاش، وسلوك التحميل حسب الشبكة.',
      'مكافحة الإساءة عبر البلاغات، الكلمات المحظورة، الحساب المقيد، الحظر، الكتم ومراجعة المحتوى.',
    ],
  },
  {
    title: 'التحكم والاختيارات',
    items: [
      'يمكنك تعديل معلومات الملف الشخصي والسيرة الذاتية والجمهور الافتراضي للمنشورات من الإعدادات.',
      'يمكنك التحكم في طلبات المراسلة، من يستطيع إرسال الرسائل، ومن يستطيع التعليق أو الإشارة إليك.',
      'يمكنك تنزيل بياناتك أو إرسال طلب حذف الحساب والبيانات عبر صفحة الحذف الرسمية.',
      'يمكنك حظر أو كتم حسابات، وإعادة ضبط توصيات الاستكشاف وعناصر لست مهتما بها.',
    ],
  },
  {
    title: 'المشاركة مع الخدمات التقنية',
    items: [
      'نستخدم Supabase للمصادقة وقاعدة البيانات والملفات حسب سياسات الوصول.',
      'قد نستخدم Cloudflare R2 أو خدمات تخزين وCDN لعرض الصور والفيديوهات والصوتيات بسرعة واستقرار.',
      'لا نبيع بياناتك الشخصية. أي مشاركة تقنية تكون لتشغيل الخدمة، الأمان، التخزين، التحليلات أو الدعم.',
    ],
  },
  {
    title: 'مدة الاحتفاظ والحذف',
    items: [
      'نحتفظ بالبيانات طالما الحساب نشط أو طالما نحتاجها لتشغيل الميزات أو تنفيذ التزامات أمان وقانونية.',
      'عند طلب حذف الحساب، تتم مراجعة الطلب ثم حذف أو إخفاء البيانات الشخصية والمحتوى حسب نوعه وحالة الطلب.',
      'قد تبقى سجلات محدودة مؤقتا لأغراض منع الاحتيال، الأمان، البلاغات أو الالتزامات القانونية.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">سياسة الخصوصية في Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه السياسة تشرح كيف يتعامل Dribdo مع بيانات الحساب والمحتوى والوسائط والدردشة والإعدادات. صممت الصفحة لتطابق ميزات التطبيق الفعلية، وليست نصا عاما منفصلا عن المنتج.
          </p>
          <p className="mt-4 text-sm font-semibold text-black/45">آخر تحديث: 28 مايو 2026</p>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <article key={card.title} className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black/65">{card.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 space-y-5">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-black">{section.title}</h2>
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
