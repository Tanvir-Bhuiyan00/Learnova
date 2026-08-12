import type { Metadata } from "next";
import PublicFooter from "@/components/modules/PublicFooter";
import PublicHeader from "@/components/modules/PublicHeader";

export const metadata: Metadata = {
  title: "Learnova - Online Learning Platform",
  description: "Discover courses from expert instructors. Learn at your own pace and advance your career with Learnova.",
};

// Note: this layout intentionally performs no cookies()/headers() reads so the
// public pages under it can be statically rendered (ISR). The header resolves
// the logged-in user client-side via the same-origin /api/me route.
export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
