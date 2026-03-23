import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "تسجيل الدخول",
  description: "سجّل الدخول إلى حسابك في دريبدو للوصول إلى ملفك الشخصي وإعداداتك ومحتواك.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="login" />
    </Suspense>
  );
}
