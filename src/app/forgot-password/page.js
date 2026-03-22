import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="forgot-password" />
    </Suspense>
  );
}
