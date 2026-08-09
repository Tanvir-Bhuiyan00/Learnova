import type { Metadata } from "next";
import PublicHeader from "@/components/modules/PublicHeader";

export const metadata: Metadata = {
  title: "Learnova - Online Learning Platform",
  description: "Discover courses from expert instructors. Learn at your own pace and advance your career with Learnova.",
};

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
    </>
  );
}
