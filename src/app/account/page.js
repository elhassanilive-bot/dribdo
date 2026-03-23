import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: "الحساب",
  description: "إدارة بيانات الحساب الشخصي في دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="account" />
    </Suspense>
  );
}
