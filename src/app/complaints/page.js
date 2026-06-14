import ComplaintsForm from './ComplaintsForm';

export const metadata = {
  title: 'شكاوى وبلاغات | دريبدو',
  description: 'أرسل بلاغاً عن محتوى مخالف، سلوك غير لائق، أو مشكلة تقنية، ليتولى فريق مراجعة دريبدو فحصها بدقة.',
  alternates: { canonical: '/complaints' },
};

export default function ComplaintsPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <section className="space-y-4 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-red-700">النظام الإشرافي</p>
          <h1 className="text-3xl font-black leading-tight sm:text-4xl text-black">الشكاوى والبلاغات</h1>
          <p className="max-w-3xl text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">
            نعمل بجد لنبقي فضاء دريبدو مكاناً آمناً يتسم بالاحترام المتبادل. إن صادفك محتوى ينتهك معاييرنا، أو سلوك يسيء لتجربتك، أو واجهت عقبة تقنية أثناء الاستخدام، فيرجى إطلاعنا على التفاصيل عبر النموذج أدناه ليتولى فريق الدعم والمراجعة الفحص والرد عليك.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-[#f8f4ef] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/75">
              صون سلامة المحتوى
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#f8f4ef] px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-black/75">
              مراجعة سريعة وحريصة
            </div>
          </div>
        </section>

        <ComplaintsForm />
      </div>
    </main>
  );
}

