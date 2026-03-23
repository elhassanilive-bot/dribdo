import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابًا جديدًا في دريبدو وابدأ استخدام المنصة والمجتمعات والمحتوى العربي.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="signup" />
    </Suspense>
  );
}
