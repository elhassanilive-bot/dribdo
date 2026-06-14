export const metadata = {
  title: 'عن دريبدو | القصة والرؤية',
  description: 'تعرف على فلسفة دريبدو؛ فضاء للتعبير الواعي والنشر المرن والتواصل الهادئ المصمم ليناسب تطلعاتك.',
  alternates: { canonical: '/about' },
};

const features = [
  'شريط النشر المتناغم: نافذة تعرض منشوراتك ومرئياتك بتدفق انسيابي يريح العين ويحترم ذوقك البصري.',
  'عالم المرئيات: زاوية مخصصة لمشاهدة ومشاركة مقاطع الفيديو القصيرة والملهمة، مع ميزة حفظ روائع اللقطات للعودة إليها متى شئت.',
  'النبضات الصوتية والقصص: مساحة للتعبير بأبعاد مختلفة، سواء عبر تسجيل صوتي دافئ أو قصة يومية عابرة تروي تفاصيل لحظتك.',
  'صندوق الرسائل الذكي: بريد وارد هادئ ينظم إشعاراتك ويفصل محادثاتك عن طلبات المراسلة الجديدة لتمنح وقتك الهدوء الذي يستحقه.',
  'سيادة الخصوصية: إعدادات تحكم متقدمة تمكّنك من رسم حدود حضورك، وتحديد من يشاهد محتواك، يراسلك، أو يتفاعل معك.',
  'منظومة الأمان والسلامة: أدوات مرنة لحراسة حسابك، تشمل إدارة الجلسات النشطة، سجلات النشاط، وخيارات الكتم والحظر الفعالة.',
];

export default function AboutPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] py-12 text-black">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="grid gap-8 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-700">نبذة عن دريبدو</p>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl text-black">
              دريبدو.. فضاءٌ رقمي يمنح الكلمة واللحظة قيمتها المستحقة
            </h1>
            <p className="mt-5 max-w-4xl text-sm leading-7 text-black/65 sm:text-base sm:leading-8">
              لم نبتكر دريبدو لنضيف رقماً جديداً في عالم المنصات الرقمية، بل أردنا صياغة تجربة تواصل فريدة؛ تجربة تتنفس الهدوء والوضوح. نؤمن بأن النشر والمشاهدة والاستماع والتفاعل يجب أن تنساب مع إيقاع حياتك دون تشتيت أو تعقيد.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-[#f8f4ef] p-6 border border-black/5">
            <h2 className="text-lg font-black text-black">رؤيتنا للتفاعل الرقمي</h2>
            <p className="mt-3 text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">
              في دريبدو، كل تفصيل صُمم ليمنحك السيادة والراحة. لقد ربطنا كل خيار للتحكم ببيانات حقيقية وقرارات فعلية، لنجعل من تصفحك للوسائط وتبادلك للرسائل رحلة آمنة وممتعة ومحاطة بالهدوء التام.
            </p>
          </div>
        </header>

        <section className="mt-8 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black text-black">تجربة دريبدو الفريدة</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <article key={feature} className="rounded-[1.25rem] bg-[#f8f4ef] p-5 text-xs leading-6 sm:text-sm sm:leading-7 text-black/70 border border-black/5">
                {feature}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-black">تصميم أصيل ومريح</h3>
            <p className="mt-3 text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">واجهة متناسقة بنصوص واضحة وتفاصيل تدعم اللغة العربية والاتجاه الطبيعي لعين القارئ لتمنحك استخداماً يومياً هادئاً.</p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-black">وسائط تتدفق بسلاسة</h3>
            <p className="mt-3 text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">آليات تحميل ذكية وصور ثابتة الأبعاد تتلاءم مع قوة اتصالك لتضمن تدفق المحتوى المرئي والصوتي دون أي تشويه أو انقطاع.</p>
          </article>
          <article className="rounded-[1.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-black">سيادة مطلقة لخيارك</h3>
            <p className="mt-3 text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">إعدادات الخصوصية والأمان هي قرارات نافذة فوراً؛ تحمي حسابك وتحدد من يمكنه مرافقتك والتعقيب على فكرك.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
