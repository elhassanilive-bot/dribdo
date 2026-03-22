import { notFound } from "next/navigation";

export const metadata = {
  title: "غير موجود",
  robots: { index: false, follow: false },
};

export default function AdminHome() {
  notFound();
}