import Link from "next/link";

export const metadata = {
  title: "سياسة النشر للمساهمين",
  description: "كيف ترسل مقالا؟ معايير القبول والرفض، ونصائح لتحسين فرص نشر المقال في أرزابريس.",
  alternates: { canonical: "/contributor-policy" },
};

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 text-right shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-7 text-black/70">{children}</div>
    </div>
  );
}

export default function ContributorPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] text-black">
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/45">إرشادات النشر</p>
            <h1 className="mt-3 text-4xl font-black">سياسة النشر للمساهمين</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-black/65">
              هذه الصفحة تشرح خطوات إرسال المقال للمراجعة ومعايير القبول والرفض. هدفنا نشر محتوى عربي واضح وموثوق.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="كيف ترسل مقالا؟">
            <p>1. أنشئ حسابا ثم افتح صفحة <Link className="font-semibold text-red-700 hover:underline" href="/contributors">المساهمون</Link>.</p>
            <p>2. املأ عنوان المقال، واختر التصنيف، ثم اكتب المحتوى بشكل منظم.</p>
            <p>3. تأكد من وجود صورة غلاف مناسبة (اختياري) ومقدمة قصيرة.</p>
            <p>4. اضغط إرسال ليتم وضع المقال في حالة قيد المراجعة.</p>
          </Card>
          <Card title="معايير القبول">
            <p>محتوى أصلي غير منسوخ، وكتابة سليمة دون مبالغة أو تضليل.</p>
            <p>عنوان واضح، ومصدر معلومة عند نقل أرقام أو تصريحات.</p>
            <p>عدم مخالفة القوانين أو التحريض أو التشهير.</p>
          </Card>
          <Card title="أسباب الرفض الشائعة">
            <p>نسخ المحتوى من مواقع أخرى أو استخدام صور بدون إذن.</p>
            <p>عنوان مضلل أو معلومات غير موثقة أو روابط مزعجة.</p>
            <p>محتوى قصير جدا أو غير مفهوم أو خارج نطاق النشر.</p>
          </Card>
          <Card title="بعد الرفض ماذا أفعل؟">
            <p>ستظهر لك ملاحظة من فريق المراجعة (إن وجدت). عدل المقال وأعد إرساله للمراجعة.</p>
            <p>نصائح سريعة: حسّن العنوان، أضف مصادر، وقسم النص بعناوين فرعية.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}

