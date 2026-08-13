import type { Metadata } from "next";
import Link from "next/link";
import PageContainer from "@/components/shared/PageContainer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Learnova",
  description:
    "Answers to common questions about Learnova courses, enrollment, payments, certificates, and more.",
};

const faqs = [
  {
    category: "Accounts & getting started",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' in the top navigation, enter your name, email, and a password. You'll receive a verification email — click the code in it to activate your account and start learning.",
      },
      {
        q: "Can I use Google to sign in?",
        a: "Yes. Choose 'Continue with Google' on the login page and you'll be signed in instantly with your Google account.",
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login page click 'Forgot password', enter your registered email, and we'll send you a one-time code to set a new password.",
      },
    ],
  },
  {
    category: "Courses & learning",
    items: [
      {
        q: "How do I enroll in a course?",
        a: "Open any course page and click 'Enroll Now' (or add it to your cart and checkout). Enrolled courses appear under 'My Courses' on your dashboard.",
      },
      {
        q: "How long do I have access to a course?",
        a: "Once enrolled, your access is lifetime — including any future updates to the course content. No subscriptions, no time limits.",
      },
      {
        q: "Can I learn on my phone?",
        a: "Yes. Learnova is fully responsive, so you can watch lessons, take quizzes, and track progress from any device with a browser.",
      },
      {
        q: "What do certificates include?",
        a: "Certificates include your name, the course title, and the date of completion. They're a great addition to your CV, LinkedIn profile, or portfolio.",
      },
    ],
  },
  {
    category: "Payments & refunds",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept major credit and debit cards, as well as popular local and international payment methods via our secure payment provider.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes. If a course doesn't meet your expectations, you can request a refund within the refund window shown at checkout.",
      },
      {
        q: "Is my payment information safe?",
        a: "Absolutely. Payments are processed by industry-standard, PCI-DSS compliant providers. We never store your full card details on our servers.",
      },
    ],
  },
  {
    category: "Instructors",
    items: [
      {
        q: "How do I become an instructor?",
        a: "Create an account, then use the 'Become an Instructor' link in the footer. After your instructor profile is approved, you can publish courses from your dashboard.",
      },
      {
        q: "How do instructors earn?",
        a: "Instructors earn a share of the revenue from each enrollment in their courses. Detailed earnings are available on the instructor dashboard.",
      },
    ],
  },
];

const FaqPage = () => {
  return (
    <div>
      <section className="relative overflow-hidden bg-canvas-soft py-20 md:py-24">
        <PageContainer className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Learnova
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-heading text-4xl font-black leading-[0.95] tracking-tight text-ink sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-body-text">
            Everything you need to know about learning on Learnova. Can&apos;t
            find your answer?{" "}
            <Link href="/about" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>
            .
          </p>
        </PageContainer>
      </section>

      <section className="py-16 md:py-20">
        <PageContainer className="max-w-3xl">
          <div className="space-y-12">
            {faqs.map((group) => (
              <div key={group.category}>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-ink">
                  {group.category}
                </h2>
                <div className="mt-5 divide-y divide-canvas-soft rounded-2xl bg-card ring-1 ring-border">
                  {group.items.map((item) => (
                    <div key={item.q} className="p-5">
                      <h3 className="font-heading text-base font-bold text-ink">
                        {item.q}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-body-text">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default FaqPage;
