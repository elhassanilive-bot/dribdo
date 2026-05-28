import DeletionForm from './DeletionForm';

export const metadata = {
  title: 'طلب حذف الحساب والبيانات | دريبدو',
  description: 'صفحة طلب حذف حساب Dribdo وبياناته: الملف الشخصي، المنشورات، الفيديوهات، الصوتيات، القصص، الرسائل، التفاعلات والوسائط.',
  alternates: { canonical: '/deletion' },
};

const deletedData = [
  'معلومات الملف الشخصي مثل الاسم، الصورة، الغلاف، السيرة الذاتية والإعدادات.',
  'المنشورات والتعليقات والتفاعلات والحفظ والمشاركات المرتبطة بالحساب.',
  'الصور والفيديوهات والصوتيات والقصص والوسائط المرفوعة حسب حالة التخزين.',
  'طلبات المراسلة والرسائل والبيانات المرتبطة بالدردشة حسب قواعد الأمان والامتثال.',
];

export default function DeletionPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/40">Account Deletion</p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">طلب حذف الحساب والبيانات</h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-black/65 sm:text-lg">
            هذه الصفحة مخصصة لحذف حساب Dribdo وبياناته. الطلب يمر بمراجعة إدارية لحماية الحساب من الطلبات غير المصرح بها قبل التنفيذ النهائي.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-5 rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm">
            <div className="rounded-[1.5rem] bg-[#faf8f6] p-5">
              <h2 className="text-2xl font-black">ما الذي قد يتم حذفه؟</h2>
              <ul className="mt-5 space-y-3">
                {deletedData.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-black/70">
                    <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-700" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm leading-7 text-red-950">
              حذف الحساب إجراء حساس وقد لا يمكن التراجع عنه بعد التنفيذ. إذا كنت تريد استراحة مؤقتة فقط، استخدم خيار إلغاء التفعيل المؤقت داخل التطبيق عندما يكون متاحا.
            </div>
          </aside>
          <DeletionForm />
        </section>
      </div>
    </main>
  );
}
