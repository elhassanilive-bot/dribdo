import FaqAccordion from './FaqAccordion';
import { faqSections } from './faqData';

export const metadata = {
  title: 'الأسئلة الشائعة | أرزابريس',
  description: 'أسئلة كثيرة مع بحث وأكورديون: الحساب، الحفظ، الإعجاب، التعليقات، والمساهمة بالمقالات داخل أرزابريس.',
  alternates: { canonical: '/faq' },
};

export default function FaqPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f5f1] py-12 text-black">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4">
        <header className="rounded-[2rem] border border-black/10 bg-white p-8 text-right shadow-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-black/45">مساعدة</p>
          <h1 className="mt-4 text-4xl font-black text-black sm:text-5xl">الأسئلة الشائعة</h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-black/65">
            اختر قسماً ثم افتح السؤال لرؤية الجواب. يمكنك أيضاً استخدام شريط البحث للعثور على السؤال بسرعة.
          </p>
        </header>

        <FaqAccordion sections={faqSections} />
      </div>
    </div>
  );
}

