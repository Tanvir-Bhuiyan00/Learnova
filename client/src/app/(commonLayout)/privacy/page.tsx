import type { Metadata } from "next";
import PageContainer from "@/components/shared/PageContainer";

export const metadata: Metadata = {
  title: "Privacy Policy - Learnova",
  description: "How Learnova collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect the information you provide when you register, such as your name and email address, as well as information about your learning activity, course enrollments, and progress so we can deliver and improve our services.",
  },
  {
    title: "How we use your information",
    body: "Your information is used to operate your account, process enrollments and payments, personalize course recommendations, send service updates, and keep the platform secure. We never sell your personal data.",
  },
  {
    title: "Data sharing",
    body: "We share your data only with service providers who help us run Learnova (such as payment processors and hosting infrastructure), under strict confidentiality obligations, and only where required to provide our services.",
  },
  {
    title: "Cookies and analytics",
    body: "We use essential cookies to keep you signed in and to remember your preferences. We may use privacy-respecting analytics to understand how the platform is used and to improve it.",
  },
  {
    title: "Your rights",
    body: "You can request access to, correction of, or deletion of your personal data at any time by contacting support. You can also close your account from your profile settings.",
  },
  {
    title: "Data retention and security",
    body: "We retain your data only as long as needed to provide our services or as required by law, and we protect it with industry-standard security measures, including encryption in transit and at rest.",
  },
  {
    title: "Contact us",
    body: "If you have questions about this privacy policy, please reach out to us through the support channels listed on the Learnova website.",
  },
];

const PrivacyPage = () => {
  return (
    <div>
      <section className="relative overflow-hidden bg-canvas-soft py-20 md:py-24">
        <PageContainer className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Learnova
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-black leading-[0.95] tracking-tight text-ink sm:text-5xl">
            Privacy Policy
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

export default PrivacyPage;
