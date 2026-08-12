import type { Metadata } from "next";
import PublicFooter from "@/components/modules/PublicFooter";
import PublicHeader from "@/components/modules/PublicHeader";
import { getCurrentUser } from "@/lib/currentUser";

export const metadata: Metadata = {
  title: "Learnova - Online Learning Platform",
  description: "Discover courses from expert instructors. Learn at your own pace and advance your career with Learnova.",
};

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userInfo = await getCurrentUser();

  return (
    <>
      <PublicHeader userInfo={userInfo} />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
