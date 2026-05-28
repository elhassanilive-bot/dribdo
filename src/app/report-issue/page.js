import ReportIssueForm from './ReportIssueForm';

export const metadata = {
  title: 'الإبلاغ عن مشكلة | دريبدو',
  description: 'أرسل بلاغا تقنيا عن مشكلة في Dribdo: الوسائط، الفيديوهات، الصوتيات، الدردشة، الإشعارات، الإعدادات أو الحساب.',
  alternates: { canonical: '/report-issue' },
};

const issueTypes = [
  'منشورات أو صور أو فيديوهات لا تظهر أو تظهر فجأة بعد تأخير.',
  'مشكلة في تشغيل الفيديو، الصوت، الصور المصغرة أو جودة الوسائط.',
  'خلل في البريد الوارد، طلبات المراسلة، الدردشة أو الإشعارات.',
  'مشكلة في الإعدادات، الخصوصية، الحظر، التحقق بخطوتين أو جلسات الأجهزة.',
  'فشل رفع فيديو أو صورة أو صوت رغم أن الملف صحيح.',
];

export default function ReportIssuePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Technical Report</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">الإبلاغ عن مشكلة داخل Dribdo</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الصفحة مخصصة للأعطال التقنية في التطبيق، وليست للبلاغات السلوكية فقط. اكتب خطوات واضحة حتى نستطيع إعادة المشكلة ومعالجتها.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">أمثلة على المشاكل المناسبة</h2>
            <ul className="mt-5 space-y-3">
              {issueTypes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-black/70">
                  <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-black/60">اذكر نوع الجهاز، سرعة الشبكة إن أمكن، الرابط أو اسم الحساب، وما الذي توقعت حدوثه مقابل ما حدث فعلا.</p>
          </aside>
          <ReportIssueForm />
        </section>
      </div>
    </main>
  );
}
