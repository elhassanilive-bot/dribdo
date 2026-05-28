export const metadata = {
  title: 'معايير المجتمع | دريبدو',
  description: 'معايير مجتمع Dribdo للمنشورات، الفيديوهات، الصوتيات، القصص، الدردشة، التعليقات، البلاغات والحسابات.',
  alternates: { canonical: '/community-guidelines' },
};

const sections = [
  {
    title: 'النقاش والاحترام',
    items: [
      'نسمح بالاختلاف والنقاش، لكن لا نسمح بالإهانة أو التهديد أو التحريض أو الاستهداف الشخصي.',
      'لا تستخدم التعليقات أو الرسائل أو المنشن لإزعاج الآخرين أو الضغط عليهم أو التشهير بهم.',
      'احترم خصوصية الأشخاص ولا تنشر معلوماتهم أو صورهم أو محادثاتهم دون إذن.',
    ],
  },
  {
    title: 'المحتوى والوسائط',
    items: [
      'لا تنشر صورا أو فيديوهات أو صوتيات مضللة أو مسروقة أو مخالفة لحقوق الآخرين.',
      'لا تستخدم القصص أو الفيديوهات أو المنشورات للترويج للاحتيال أو الروابط الخطرة أو انتحال الهوية.',
      'استخدم الجمهور المناسب للمحتوى الشخصي أو الحساس، وتذكر أن إعدادات الخصوصية موجودة لحماية تجربتك.',
    ],
  },
  {
    title: 'الدردشة وطلبات المراسلة',
    items: [
      'طلبات المراسلة ليست مكانا للإزعاج أو الإعلانات المضللة أو الرسائل المتكررة.',
      'أي ابتزاز أو تهديد أو استغلال داخل الدردشة يمكن أن يؤدي إلى تقييد أو تعطيل الحساب.',
      'يمكن للمستخدم تجاهل الطلب، الحظر، الكتم أو إرسال بلاغ عند الحاجة.',
    ],
  },
  {
    title: 'المراجعة والإجراءات',
    items: [
      'تراجع البلاغات حسب السياق ونوع المخالفة وتأثيرها على المستخدمين.',
      'قد تشمل الإجراءات إخفاء المحتوى، تقليل الظهور، تقييد الحساب، تعطيل ميزة محددة أو إيقاف الحساب.',
      'نستخدم الحساب المقيد كإجراء متوسط عندما يكون تقليل الظهور أفضل من الحظر الكامل.',
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Community Guidelines</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">معايير مجتمع Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه المعايير مخصصة لطريقة عمل Dribdo: منشورات، فيديوهات، صوتيات، قصص، تعليقات، رسائل، طلبات مراسلة، بلاغات وحسابات.
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
