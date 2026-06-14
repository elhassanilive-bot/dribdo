export const metadata = {
  title: 'السلامة والأمان | دريبدو',
  description: 'اكتشف منظومة حماية حضورك الرقمي في دريبدو: إدارة الجلسات، حراسة الدخول، مرونة التفاعل، وسلامة الوسائط.',
  alternates: { canonical: '/security' },
};

const sections = [
  {
    title: 'حراسة جلساتك ونشاطك',
    items: [
      'نمنحك نافذة كاملة لتأمل الأجهزة والجلسات التي ينشط من خلالها حسابك، لتطمئن على سلامة حضورك الرقمي في كل لحظة.',
      'يرصد نظامنا الحذر أي محاولات دخول غريبة، ويسجلها فوراً في سجل نشاطك لتظل على بيّنة ويقظة تامة.',
      'نحيط حسابك بطبقة إضافية من التحقق الواقي عند ولوجك للتطبيق أو قيامك بأي تغييرات تتصل بأمان بياناتك.',
    ],
  },
  {
    title: 'صون سلامة حضورك',
    items: [
      'مساحة مخصصة تطلعك على حالة حسابك الراهنة، والجلسات الفعالة، ومدى اتساق حضورك مع معايير مجتمعنا.',
      'نؤمن بالتوجيه الهادئ؛ لذا نفضل إجراءات تقليص الظهور المؤقت على الحظر الكلي عند حدوث هفوات بسيطة تستدعي المراجعة.',
      'تُطبق بعض القيود الاحترازية مؤقتاً عند رصد سلوك مريب لحماية حسابك وبقية أفراد مجتمعنا حتى تنجلي مراجعته.',
    ],
  },
  {
    title: 'حماية من التشتيت والإزعاج',
    items: [
      'بإمكانك كتم الحسابات المزعجة أو حظرها بلمسة وقار واحدة، لتصنع لنفسك فضاءً تصفحياً خالياً من الضوضاء.',
      'نظام طلبات المراسلة يصون صندوقك الخاص؛ يفلتر الرسائل الغريبة ليتيح لك قبول الحوار أو صرفه بسلام دون محادثات مفاجئة.',
      'أدوات البلاغات وضعت في متناول يدك دائماً، لتكون شريكاً في إرساء الهدوء والإبلاغ عن أي تجاوز يسيء لسلامة المجتمع.',
    ],
  },
  {
    title: 'أمان وسلامة الوسائط المرفوعة',
    items: [
      'نحلل ملفات الفيديو والوسائط قبل إرسالها لنتأكد من سلامة بنيتها ومناسبتها للمشاهدة وحفظاً لأداء التطبيق وسرعته.',
      'الصور المصغرة الذكية، والتخزين المؤقت المتقدم، وتقنيات ضبط الجودة التكيفية تمنع انقطاع متعة المشاهدة وتجنب الشاشات الفارغة.',
      'نصفّي الملفات التالفة أو المشبوهة تلقائياً لنحمي مساحة التخزين الخاصة بك ونوفر بيئة عرض نظيفة وخالية من الأعطال.',
    ],
  },
];

export default function SecurityPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-700">Safety & Security</p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl text-black">سلامتك الرقمية هي الملاذ الذي نصونه</h1>
          <p className="mt-4 max-w-4xl text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">
            نؤمن بأن البيئة الآمنة والهادئة هي حجر الأساس لتجربة تفاعلية ممتعة. لأجل ذلك، هيأنا لك منظومة أمان متكاملة تمنحك السيادة الكاملة لإدارة خصوصية حسابك، وحمايته من التشتيت، ومتابعة نشاطه بيسر.
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
