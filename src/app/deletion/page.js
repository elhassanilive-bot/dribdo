import DeletionForm from './DeletionForm';

export const metadata = {
  title: 'طلب حذف الحساب والبيانات | دريبدو',
  description: 'صفحة إيداع طلب حذف حساب دريبدو وإزالة معالم حضورك الرقمي من منشورات ومرئيات وصوتيات ورسائل.',
  alternates: { canonical: '/deletion' },
};

const deletedData = [
  'تفاصيل حضورك: الاسم، صورة الملف الشخصي، الغلاف، السيرة الذاتية، وإعدادات حسابك المخصصة.',
  'أفكارك وتفاعلاتك: كافة منشوراتك المكتوبة، تعليقاتك، وتفاعلاتك مع محتوى الآخرين.',
  'وسائطك الإبداعية: الصور، مقاطع الفيديو، التسجيلات الصوتية، والقصص اليومية التي قمت برفعها.',
  'مراسلاتك الخاصة: سجلات الدردشة وطلبات المراسلة بما يتماشى مع معايير الأمان والامتثال.',
];

export default function DeletionPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8f4ef] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-red-700">Account Deletion</p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl text-black">طلب حذف الحساب والبيانات</h1>
          <p className="mt-4 max-w-4xl text-xs leading-6 text-black/65 sm:text-sm sm:leading-7">
            هذه الصفحة مخصصة لمن يرغب في إزالة معالم حضوره الرقمي من دريبدو. يمر هذا الإجراء بمرحلة مراجعة أمنية دقيقة للتحقق من هوية مقدم الطلب وحماية حسابك من أي محاولات غير مصرح بها.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-5 rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
            <div className="rounded-[1.5rem] bg-[#f8f4ef] p-5 border border-black/5">
              <h2 className="text-xl font-black text-black">ما الذي سيتم حذفه؟</h2>
              <ul className="mt-5 space-y-3">
                {deletedData.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs leading-6 sm:text-sm sm:leading-7 text-black/70">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-xs leading-6 sm:text-sm sm:leading-7 text-red-950">
              إن إزالة الحساب خطوة جذرية قد لا يكون من الممكن التراجع عنها بعد إتمامها. إذا كنت تبحث عن استراحة مؤقتة من وتيرة التواصل، فيمكنك الاستفادة من خيار إلغاء تفعيل الحساب المؤقت المتوفر في إعدادات التطبيق.
            </div>
          </aside>
          <DeletionForm />
        </section>
      </div>
    </main>
  );
}
