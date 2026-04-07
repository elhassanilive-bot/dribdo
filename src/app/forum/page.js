import { redirect } from "next/navigation";

export const metadata = {
  title: "المنتدى",
  robots: { index: false, follow: false },
};

export default function ForumPage() {
  redirect("/moments");
}
