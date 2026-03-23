import ReportIssueForm from './ReportIssueForm';
import { issueFaq } from './issueFaq';

export const metadata = {
  title: 'الإبلاغ عن شيء لا يعمل | دريبدو',
  description: 'أرسل بلاغًا تقنيًا عن زر أو صفحة أو ميزة لا تعمل داخل دريبدو مع خطوات إعادة المشكلة ومرفقات توضيحية.',
  alternates: { canonical: '/report-issue' },
};
export default function ReportIssuePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <section className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/45">Ø§Ù„Ø¯Ø¹Ù… Ø§Ù„ÙÙ†ÙŠ</p>
          <h1 className="mt-4 text-4xl font-black text-black sm:text-5xl">Ø§Ù„Ø¥Ø¨Ù„Ø§Øº Ø¹Ù† Ø´ÙŠØ¡ Ù„Ø§ ÙŠØ¹Ù…Ù„</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            Ø¥Ø°Ø§ ÙˆØ¬Ø¯Øª Ø²Ø±Ù‹Ø§ Ù„Ø§ ÙŠØ³ØªØ¬ÙŠØ¨ØŒ Ø£Ùˆ ØµÙØ­Ø© Ù„Ø§ ØªØ¹Ù…Ù„ØŒ Ø£Ùˆ Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ù†Ø´Ø± Ø£Ùˆ Ø§Ù„ÙÙŠØ¯ÙŠÙˆ Ø£Ùˆ Ø§Ù„Ø¯Ø±Ø¯Ø´Ø© Ø£Ùˆ Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§ØªØŒ
            ÙØ§Ø³ØªØ®Ø¯Ù… Ù‡Ø°Ø§ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ù„ØªÙ‚Ø¯ÙŠÙ… Ø¨Ù„Ø§Øº ØªÙ‚Ù†ÙŠ ÙˆØ§Ø¶Ø­ ÙŠØ³Ø§Ø¹Ø¯ Ø§Ù„ÙØ±ÙŠÙ‚ Ø¹Ù„Ù‰ ØªØªØ¨Ø¹ Ø§Ù„Ø®Ù„Ù„ Ø¨Ø³Ø±Ø¹Ø©.
          </p>
        </section>

        <ReportIssueForm />

        <section className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <div className="max-w-3xl text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-black/40">Ù‚Ø¨Ù„ Ø§Ù„Ø¥Ø±Ø³Ø§Ù„</p>
            <h2 className="mt-4 text-3xl font-black text-black">Ø£Ø³Ø¦Ù„Ø© Ø´Ø§Ø¦Ø¹Ø© Ø­ÙˆÙ„ Ø§Ù„Ø£Ø¹Ø·Ø§Ù„ ÙˆØ§Ù„Ù…Ø´Ø§ÙƒÙ„ Ø§Ù„ØªÙ‚Ù†ÙŠØ©</h2>
          </div>

          <div className="mt-8 space-y-4">
            {issueFaq.map((item) => (
              <article key={item.question} className="rounded-[1.5rem] border border-black/10 bg-[#fcfbf9] p-5">
                <h3 className="text-lg font-bold text-black">{item.question}</h3>
                <p className="mt-3 text-sm leading-8 text-black/65">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

