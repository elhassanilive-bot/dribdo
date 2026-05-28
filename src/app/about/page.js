export const metadata = {
  title: 'عن Dribdo',
  description: 'تعرف على Dribdo كتطبيق اجتماعي عربي يجمع المنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، الاستكشاف والإعدادات المتقدمة.',
  alternates: { canonical: '/about' },
};

const features = [
  'خلاصة اجتماعية للمنشورات والصور والفيديوهات مع تحميل تدريجي وسكليتون للوسائط.',
  'قسم فيديوهات وتجربة مشاهدة مرنة مع حفظ للمشاهدة لاحقا وجودة مناسبة للشبكة.',
  'صوتيات، قصص، ملف شخصي، سيرة ذاتية، صور حساب وغلاف، وتبويبات وسائط منظمة.',
  'بريد وارد يجمع الإشعارات وطلبات المراسلة بشكل واضح دون تشتيت.',
  'إعدادات خصوصية حقيقية: من يرى المنشورات، من يراسلك، من يعلق، من يذكرك وحالة النشاط.',
  'أدوات أمان مثل الجلسات، سجل الدخول، التحقق بخطوتين، الحظر، الكتم، البلاغات وصحة الحساب.',
];

export default function AboutPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="grid gap-8 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">About Dribdo</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Dribdo تطبيق اجتماعي عربي مصمم كتجربة واحدة متكاملة</h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
              Dribdo يجمع النشر، الفيديو، الصوتيات، القصص، الدردشة، الاستكشاف، الملف الشخصي والإعدادات المتقدمة في تطبيق واحد. الهدف ليس إضافة ميزات كثيرة فقط، بل جعلها مرتبة وواضحة وتعمل فعليا للمستخدم العربي.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#faf8f6] p-6">
            <h2 className="text-xl font-black">فلسفة المنتج</h2>
            <p className="mt-3 text-sm leading-7 text-black/65">
              كل ميزة في Dribdo يجب أن تكون مفهومة، قابلة للتحكم، وتحترم الخصوصية والأداء. لذلك تم ربط الإعدادات والوسائط والدردشة والبلاغات ببيانات حقيقية وليس بواجهات شكلية فقط.
            </p>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
          <h2 className="text-3xl font-black">ما الذي يقدمه التطبيق؟</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature} className="rounded-[1.25rem] bg-[#faf8f6] p-5 text-sm leading-7 text-black/70">
                {feature}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black">تجربة عربية</h3>
            <p className="mt-3 text-sm leading-7 text-black/65">واجهة عربية RTL، نصوص واضحة، وأقسام مصممة حسب طريقة استخدام المستخدم العربي للتطبيقات الاجتماعية.</p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black">أداء الوسائط</h3>
            <p className="mt-3 text-sm leading-7 text-black/65">تحميل تدريجي، صور مصغرة، كاش، ثبات أبعاد، وجودة فيديو تتعامل مع قوة الشبكة.</p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black">خصوصية قابلة للتحكم</h3>
            <p className="mt-3 text-sm leading-7 text-black/65">الإعدادات ليست واجهة فقط؛ هي خيارات مرتبطة بسلوك الحساب والدردشة والتعليقات والظهور.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
