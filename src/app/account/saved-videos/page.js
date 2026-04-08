import SavedVideosClient from "@/components/account/SavedVideosClient";

export const metadata = {
  title: "المحفوظات",
  description: "عرض الفيديوهات المحفوظة داخل حساب دريبدو.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account/saved-videos" },
};

export default function AccountSavedVideosPage() {
  return <SavedVideosClient />;
}
