import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "استعادة كلمة المرور",
  description: "استعد الوصول إلى حسابك في دريبدو عبر طلب إعادة تعيين كلمة المرور.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="forgot-password" />
    </Suspense>
  );
}
