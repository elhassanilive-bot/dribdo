import { Suspense } from "react";
import AccountShell from "@/components/account/AccountShell";

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountShell mode="account" />
    </Suspense>
  );
}
