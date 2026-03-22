import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="login" />
    </Suspense>
  );
}
