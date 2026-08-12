import type { Metadata } from "next";
import PageContainer from "@/components/shared/PageContainer";

export const metadata: Metadata = {
  title: "Terms of Service - Learnova",
  description: "The terms that govern your use of the Learnova learning platform.",
};

const sections = [
  {
    title: "Acceptance of terms",
    body: "By creating an account or using Learnova, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "Accounts and eligibility",
    body: "You must provide accurate information when creating an account and are responsible for keeping your credentials secure. You must be at least 13 years old to use Learnova.",
  },
  {
    title: "Course access and licenses",
    body: "Enrolling in a course grants you a limited, non-transferable license to access the content for personal learning. You may not redistribute, resell, or publicly share course materials without permission.",
  },
  {
    title: "Payments and refunds",
    body: "All payments are processed securely by third-party providers. Refunds follow the policy stated at the time of purchase. Contact support if you believe a charge was made in error.",
  },
  {
    title: "Acceptable use",
    body: "You agree not to misuse the platform, including attempting to disrupt services, access other accounts, upload malicious content, or use the platform for any unlawful purpose.",
  },
  {
    title: "Instructor content",
    body: "Instructors own the content they publish and are responsible for its accuracy and legality. Learnova may remove content that violates these terms.",
  },
  {
    title: "Termination",
    body: "We may suspend or terminate accounts that violate these terms. You may close your account at any time from your profile settings.",
  },
  {
    title: "Changes to these terms",
    body: "We may update these terms from time to time. Continued use of Learnova after changes are posted means you accept the revised terms.",
  },
];

const TermsPage = () => {
  return (
    <div>
      <section className="relative overflow-hidden bg-canvas-soft py-20 md:py-24">
        <PageContainer className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Learnova
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-black leading-[0.95] tracking-tight text-ink sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body-text">
            Last updated: January 2026
          </p>
        </PageContainer>
      </section>

      <section className="py-16 md:py-20">
        <PageContainer className="max-w-3xl">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-heading text-xl font-bold tracking-tight text-ink">
                  {section.title}
                </h2>
                <p className="mt-3 leading-relaxed text-body-text">{section.body}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default TermsPage;
