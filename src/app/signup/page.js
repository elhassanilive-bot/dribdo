import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="signup" />
    </Suspense>
  );
}
