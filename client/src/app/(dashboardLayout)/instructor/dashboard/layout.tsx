import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instructor Dashboard - Learnova",
};

export default function InstructorDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
