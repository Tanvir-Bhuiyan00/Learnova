import { Button } from "@/components/ui/button";
import PageContainer from "@/components/shared/PageContainer";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  Users,
} from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: BadgeCheck,
    title: "Quality first",
    description:
      "Every course is reviewed and curated so you only ever learn from the best.",
  },
  {
    icon: HeartHandshake,
    title: "Access for all",
    description:
      "Transparent pricing and flexible learning make great education reachable for anyone.",
  },
  {
    icon: Users,
    title: "Community powered",
    description:
      "Learners, instructors, and mentors grow together in a supportive global community.",
  },
];

const stats = [
  { value: "50+", label: "Expert-led courses" },
  { value: "10k+", label: "Active learners" },
  { value: "120+", label: "Skilled instructors" },
  { value: "4.8", label: "Average course rating" },
];

const team = [
  { initials: "SA", name: "Sarah Ahmed", role: "Founder & CEO" },
  { initials: "MK", name: "Michael Kim", role: "Head of Learning" },
  { initials: "JP", name: "Jamal Patel", role: "Lead Instructor" },
  { initials: "EL", name: "Emily Larsen", role: "Community Lead" },
];

const AboutPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-canvas-soft py-20 md:py-28">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/40 blur-3xl"
        />
        <PageContainer className="relative text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            About Learnova
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-heading text-4xl font-black leading-[0.95] tracking-tight text-ink sm:text-5xl md:text-6xl">
            Learning that moves
            <br />
            as fast as you do
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-body-text">
            Learnova is an online learning platform that connects ambitious
            students with expert instructors. Our mission is simple: make
            quality education accessible to everyone, anywhere, at a pace that
            fits your life.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/courses">
              <Button size="lg" className="gap-2 rounded-full">
                Browse courses
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="rounded-full">
                Get started free
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>

      {/* Values */}
      <section className="bg-white py-20 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
              What we believe in
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              The values behind every course
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-3xl bg-white p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-pale">
                  <value.icon className="size-6 text-ink-deep" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-bold text-ink">
                  {value.title}
                </h3>
                <p className="mt-2.5 leading-relaxed text-body-text">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Stats */}
      <section className="bg-ink-solid py-16 text-white md:py-20">
        <PageContainer>
          <div className="grid grid-cols-2 gap-10 text-center md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-4xl font-black tracking-tight text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Team */}
      <section className="bg-white py-20 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
              Meet the team
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              The people behind Learnova
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center rounded-3xl bg-canvas-soft/60 p-7 text-center ring-1 ring-border"
              >
                <div className="flex size-20 items-center justify-center rounded-full bg-primary-pale font-heading text-2xl font-extrabold text-ink-deep">
                  {member.initials}
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm text-mute-text">{member.role}</p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-primary-pale py-16 md:py-20">
        <PageContainer className="text-center">
          <h2 className="mx-auto max-w-xl font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Ready to start your journey?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-body-text">
            Join thousands of learners building real skills with Learnova.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="gap-2 rounded-full bg-ink-solid text-white hover:bg-ink-solid/90">
                Create free account
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" size="lg" className="rounded-full bg-white/70">
                Explore courses
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default AboutPage;
