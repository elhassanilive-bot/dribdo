export const metadata = {
  title: "إخلاء المسؤولية",
  description: "توضيح حدود المسؤولية عن المحتوى والمصادر والروابط في أرزابريس.",
  alternates: { canonical: "/disclaimer" },
};

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 text-right shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-7 text-black/70">{children}</div>
    </section>
  );
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">مهم</p>
            <h1 className="mt-3 text-4xl font-black">إخلاء المسؤولية</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
              نهدف لتقديم محتوى عربي مفيد، لكن هناك نقاط مهمة توضح حدود المسؤولية عن المعلومات والروابط والمحتوى الذي يكتبه المساهمون.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-12 sm:px-6 lg:px-8">
        <Section title="المعلومات والمصادر">
          <p>المحتوى المنشور لأغراض إعلامية ومعرفية، وقد يتغير مع الوقت.</p>
          <p>نوصي بالرجوع إلى المصادر الرسمية عند اتخاذ قرارات مهمة.</p>
        </Section>
        <Section title="محتوى المساهمين">
          <p>بعض المقالات يكتبها مساهمون. يتحمل الكاتب مسؤولية صحة ما يقدمه، مع احتفاظنا بحق المراجعة والحذف عند المخالفة.</p>
        </Section>
        <Section title="الروابط الخارجية">
          <p>قد تحتوي المقالات على روابط لمواقع خارجية. لسنا مسؤولين عن محتوى هذه المواقع أو سياساتها.</p>
        </Section>
        <Section title="التواصل والتصحيح">
          <p>إذا لاحظت خطأ أو مخالفة، يمكنك استخدام صفحة الإبلاغ لإرسال التفاصيل وسيتم التعامل معها.</p>
        </Section>
      </div>
    </div>
  );
}

