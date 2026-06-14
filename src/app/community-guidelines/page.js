export const metadata = {
  title: 'معايير المجتمع | دريبدو',
  description: 'تعرف على الميثاق الأخلاقي وضوابط التفاعل في دريبدو لضمان بيئة آمنة للمنشورات، المرئيات، الصوتيات، والدردشة.',
  alternates: { canonical: '/community-guidelines' },
};

const sections = [
  {
    title: 'النقاش والاحترام المتبادل',
    items: [
      'نرحب بتعدد الآراء وحرية الفكر، شريطة التزام الكلمة الطيبة والبعد التام عن الإساءة، أو التحريض، أو الاستهداف الشخصي.',
      'نرفض إساءة استخدام التعليقات أو الإشارات لإزعاج الآخرين، أو التشهير بهم، أو تعكير صفو تجربتهم الرقمية.',
      'نصون خصوصية الأفراد؛ ونمنع نشر البيانات الشخصية، أو المحادثات الخاصة، أو الصور دون موافقة صريحة من أصحابها.',
    ],
  },
  {
    title: 'جودة ونظافة المحتوى',
    items: [
      'نهيب بالجميع مشاركة مواد حقيقية ومصادر موثوقة؛ فلا يُقبل نشر الصور أو المقاطع المرئية أو الصوتيات المنتهكة لحقوق الملكية الفكرية للغير.',
      'يمنع استخدام المنشورات، الفيديوهات، أو القصص للترويج للاحتيال، أو مشاركة روابط مشبوهة، أو انتحال هويات الآخرين.',
      'ندعوك لتحديد جمهور منشوراتك بعناية، مستفيداً من إعدادات الخصوصية الفعالة التي توفر لك ملاذاً آمناً لمشاركة لحظاتك الخاصة.',
    ],
  },
  {
    title: 'الدردشة والتواصل الهادئ',
    items: [
      'صُممت طلبات المراسلة لتكون جسراً وقوراً للتواصل؛ لذا نمنع استخدامها للبث المكرر، الإعلان غير المرغوب، أو محاولات المضايقة.',
      'نتعامل بحزم شديد مع أي محاولات ابتزاز أو تهديد داخل الدردشة الخاصة، وقد يؤدي ذلك لتقييد الحساب أو تعطيله فوراً.',
      'تذكر أن السيادة لك؛ فلك كامل الحق في تجاهل أي طلب مراسلة، أو كتم الحساب، أو حظره، أو إرسال بلاغ للفريق عند الحاجة.',
    ],
  },
  {
    title: 'إجراءات المراجعة والإنفاذ',
    items: [
      'يتولى فريقنا مراجعة البلاغات الواردة بحيادية تامة، واضعاً في الاعتبار سياق النقاش وأثره على سلامة الأفراد والبيئة التفاعلية.',
      'تتدرج إجراءاتنا الوقائية لتشمل حجب المحتوى المخالف، تقليص نسب الظهور، كبح ميزات محددة، أو إيقاف الحساب كلياً في حالات المخالفات الجسيمة.',
      'نعتمد خيار "الحساب المقيد" كأداة تهذيبية معتدلة لتقليص ظهور المحتوى المسيء كحل أخف وطأة قبل اللجوء للحظر المباشر والتام.',
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-700">Community Guidelines</p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl text-black">معايير مجتمع دريبدو</h1>
          <p className="mt-4 max-w-4xl text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">
            تمثل هذه المعايير الميثاق الأخلاقي الذي يجمعنا؛ نهدف من خلالها لحماية الأفكار، وصون سلامة الكلمات، وتهيئة بيئة نقية ومريحة لنشر المنشورات ومقاطع الفيديو والقصص، والتواصل بكل يسر واحترام.
          </p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-black text-black">{section.title}</h2>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs leading-6 sm:text-sm sm:leading-7 text-black/70">
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
