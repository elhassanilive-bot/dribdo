export const metadata = {
  title: "سياسة التعليقات",
  description: "قواعد النشر والتفاعل داخل التعليقات في أرزابريس لضمان نقاش محترم ومفيد.",
  alternates: { canonical: "/comment-policy" },
};

function Item({ title, children }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 text-right shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-7 text-black/70">{children}</div>
    </div>
  );
}

export default function CommentPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">قواعد التفاعل</p>
            <h1 className="mt-3 text-4xl font-black">سياسة التعليقات</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
              هدفنا أن تكون التعليقات مساحة للنقاش المفيد. أي تعليق يخالف القواعد قد يتم حذفه وقد يتم تقييد الحساب عند التكرار.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <Item title="ماذا نرحب به">
            <p>النقاش المحترم، الإضافة للمعلومة، التصحيح بالأدلة، وطرح الأسئلة.</p>
            <p>الالتزام بموضوع المقال قدر الإمكان لتسهيل المتابعة.</p>
          </Item>
          <Item title="ما الذي يمنع">
            <p>السب والشتم وخطاب الكراهية والتحريض والعنصرية.</p>
            <p>المحتوى الإباحي أو الترويج للمخدرات أو العنف.</p>
            <p>الروابط المزعجة، الرسائل الإعلانية، أو تكرار نفس التعليق.</p>
            <p>نشر بيانات شخصية (هاتف، عنوان، صور خاصة) بدون إذن.</p>
          </Item>
          <Item title="التعديل والحذف">
            <p>يمكنك تعديل تعليقك أو حذفه من داخل صفحة المقال.</p>
            <p>قد نقوم بحذف التعليقات المخالفة حتى إن كانت من صاحب المقال.</p>
          </Item>
          <Item title="الإبلاغ عن تعليق">
            <p>إذا وجدت إساءة أو محتوى غير مناسب، استخدم صفحة الإبلاغ لإرسال البلاغ مع الرابط.</p>
          </Item>
        </div>
      </section>
    </div>
  );
}

