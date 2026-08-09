import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Learnova",
};

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
