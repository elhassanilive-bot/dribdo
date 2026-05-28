import ContactForm from './ContactForm';

export const metadata = {
  title: 'اتصل بنا | دريبدو',
  description: 'تواصل مع فريق Dribdo بخصوص الحساب، الخصوصية، الفيديوهات، الدردشة، البلاغات، الحذف أو مشاكل التطبيق.',
  alternates: { canonical: '/contact' },
};

const cases = [
  'مشكلة في تسجيل الدخول أو جلسات الأجهزة أو التحقق بخطوتين.',
  'مشكلة في رفع الصور أو الفيديوهات أو الصوتيات أو ظهور الوسائط.',
  'طلب متعلق بالخصوصية أو تنزيل البيانات أو حذف الحساب.',
  'بلاغ عن حساب أو منشور أو محادثة أو إساءة استخدام.',
];

export default function ContactPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Contact Dribdo</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">اتصل بنا</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            استخدم هذه الصفحة للتواصل مع فريق Dribdo حول أي موضوع مرتبط بالتطبيق نفسه: الحساب، الوسائط، الدردشة، الخصوصية، البلاغات أو الحذف.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">متى تستخدم هذه الصفحة؟</h2>
            <ul className="mt-5 space-y-3">
              {cases.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-black/70">
                  <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-7 text-black/60">للمساعدة الأسرع، اكتب اسم المستخدم، نوع الجهاز، الصفحة التي ظهرت فيها المشكلة، وأرفق رابط المحتوى إن وجد.</p>
          </aside>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}
