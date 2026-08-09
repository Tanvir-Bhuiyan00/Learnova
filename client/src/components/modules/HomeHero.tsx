"use client";

import { Button } from "@/components/ui/button";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Play,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import PageContainer from "@/components/shared/PageContainer";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: GraduationCap,
    title: "Expert-led learning",
    description:
      "Learn directly from industry professionals with real-world experience and proven teaching skill.",
  },
  {
    icon: Clock,
    title: "Learn at your own pace",
    description:
      "Self-paced lessons and flexible schedules that fit around your life, not the other way round.",
  },
  {
    icon: Award,
    title: "Earn certificates",
    description:
      "Prove your skills with shareable certificates of completion you can add to your portfolio.",
  },
  {
    icon: Users,
    title: "Join a community",
    description:
      "Connect with thousands of motivated learners and instructors around the world.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "This bootcamp took me from writing my first HTML tag to building a full-stack app. The pace is perfect and every lesson has a project.",
    name: "Rahim Uddin",
    role: "Web Development Bootcamp",
    rating: 5,
  },
  {
    quote:
      "Best course I've taken. The teachers explain everything so clearly and real projects make the concepts stick.",
    name: "Nusrat Jahan",
    role: "Python for Data Science",
    rating: 5,
  },
  {
    quote:
      "The wireframing section changed how I think about interfaces. I redesigned my entire portfolio after the first module.",
    name: "Tanvir Ahmed",
    role: "UI/UX Design Fundamentals",
    rating: 5,
  },
  {
    quote:
      "I went from no Python to analyzing real datasets confidently. The visualization module was my absolute favorite.",
    name: "Farhana Islam",
    role: "Machine Learning with Python",
    rating: 5,
  },
  {
    quote:
      "Window functions finally clicked for me. The query plan section alone is a superpower for any backend developer.",
    name: "Minhaj Karim",
    role: "SQL & PostgreSQL Mastery",
    rating: 5,
  },
  {
    quote:
      "Sarah is an incredible teacher. Server components and the App Router finally make sense to me now.",
    name: "Rahim Uddin",
    role: "React & Next.js Masterclass",
    rating: 5,
  },
];

const TESTIMONIAL_AVATAR_COLORS = [
  "bg-primary-pale text-ink-deep",
  "bg-ink text-primary",
  "bg-primary text-ink",
  "bg-amber-100 text-amber-800",
  "bg-sky-100 text-sky-800",
];

const HomeHero = () => {
  const { data } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
  });

  const courses: ICourse[] = (data?.data ?? []).filter(
    (c) => c.status === "PUBLISHED",
  );
  const featured = courses.slice(0, 3);
  const heroCourse = featured[0];

  const totalLearners = courses.reduce(
    (sum, c) => sum + (c.totalStudents || 0),
    0,
  );
  const avgRating =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + (c.averageRating || 0), 0) /
        courses.length
      : 0;

  return (
    <div>
      {/* Hero band */}
      <section className="relative overflow-hidden bg-canvas-soft pb-24 pt-14 md:pb-32 md:pt-20">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/40 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-32 bottom-0 size-80 rounded-full bg-primary-pale blur-3xl"
        />

        <PageContainer className="relative">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-deep shadow-sm">
                <Sparkles className="size-4" />
                Skills for ambitious people
              </span>

              <h1 className="mt-6 font-heading text-5xl font-black leading-[0.95] tracking-tight text-ink sm:text-6xl xl:text-7xl">
                Master skills
                <br />
                without{" "}
                <span className="relative inline-block text-ink-deep">
                  limits
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-primary sm:h-3"
                  />
                </span>
                .
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-relaxed text-body-text">
                Expert-led online courses for ambitious people. Learn at your
                own pace, earn real certificates, and grow without limits.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full shadow-lg shadow-primary/40"
                  >
                    Browse courses
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full bg-white/70"
                  >
                    Get started free
                  </Button>
                </Link>
              </div>

              <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-6 border-t border-ink/10 pt-8">
                <div>
                  <dt className="text-sm font-medium text-body-text">
                    Courses available
                  </dt>
                  <dd className="mt-1 font-heading text-3xl font-extrabold text-ink">
                    {courses.length}+
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-body-text">
                    Active learners
                  </dt>
                  <dd className="mt-1 font-heading text-3xl font-extrabold text-ink">
                    {totalLearners.toLocaleString()}+
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-body-text">
                    Average rating
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-heading text-3xl font-extrabold text-ink">
                    {avgRating.toFixed(1)}
                    <Star className="size-5 fill-amber-400 text-amber-400" />
                  </dd>
                </div>
              </dl>
            </div>

            {/* Decorative course spotlight */}
            <div className="relative mx-auto hidden w-full max-w-md lg:block">
              <div
                aria-hidden
                className="absolute -inset-4 rotate-3 rounded-[2.75rem] bg-primary/70"
              />
              <div
                aria-hidden
                className="absolute -inset-4 -rotate-3 rounded-[2.75rem] bg-primary-pale"
              />
              <div className="relative overflow-hidden rounded-[2.75rem] bg-white p-5 shadow-2xl shadow-ink/10">
                <div className="flex h-72 items-center justify-center overflow-hidden rounded-[2rem] bg-canvas-soft">
                  {heroCourse?.thumbnail ? (
                    <img
                      src={heroCourse.thumbnail}
                      alt={heroCourse.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <BookOpen className="size-20 text-mute-text" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 px-2 pb-2 pt-6">
                  <div className="min-w-0">
                    <h3 className="truncate font-heading text-xl font-extrabold text-ink">
                      {heroCourse?.title ?? "Featured course spotlight"}
                    </h3>
                    <p className="mt-1 text-sm text-mute-text">
                      {heroCourse
                        ? `${heroCourse.totalLessons} lessons${
                            heroCourse.totalDuration
                              ? ` · ${Math.max(
                                  1,
                                  Math.round(heroCourse.totalDuration / 60),
                                )} hours`
                              : ""
                          }`
                        : "Take a look at what is inside"}
                    </p>
                  </div>
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Play className="ml-0.5 size-6 text-ink" fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="absolute -left-10 top-10 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-ink/5">
                <p className="text-xs font-medium text-mute-text">
                  Average rating
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-heading text-xl font-extrabold text-ink">
                  {avgRating.toFixed(1)}
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                </p>
              </div>

              <div className="absolute -right-8 bottom-16 rounded-2xl bg-ink px-5 py-4 text-white shadow-xl shadow-ink/20">
                <p className="font-heading text-2xl font-extrabold">
                  {totalLearners.toLocaleString()}+
                </p>
                <p className="text-xs text-white/60">active learners</p>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Featured courses */}
      <PageContainer spacing="lg">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
              Hand-picked
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Featured courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink-deep transition-colors hover:text-primary-hover"
          >
            View all courses
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Courses are being prepared. Check back soon."
          />
        )}
      </PageContainer>

      {/* Why Learnova */}
      <section className="bg-white py-20 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
              Why Learnova
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Everything you need to keep growing
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body-text">
              A simple, transparent learning experience designed around one
              thing: your progress.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-pale">
                  <feature.icon className="size-6 text-ink-deep" />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-body-text">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Testimonials */}
      <section className="bg-canvas-soft/60 py-20 md:py-24">
        <PageContainer>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
              Testimonials
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Loved by ambitious learners
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body-text">
              Thousands of learners are growing with Learnova every day. Here is
              what some of them have to say.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <figure
                key={`${testimonial.name}-${index}`}
                className="flex flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
              >
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 leading-relaxed text-body-text">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-canvas-soft pt-5">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold",
                      TESTIMONIAL_AVATAR_COLORS[index % TESTIMONIAL_AVATAR_COLORS.length],
                    )}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {testimonial.name}
                    </p>
                    <p className="truncate text-sm text-mute-text">
                      {testimonial.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Instructor CTA band */}
      <section className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <PageContainer className="relative text-center">
          <h2 className="mx-auto max-w-2xl font-heading text-4xl font-black tracking-tight md:text-5xl">
            Share what you know with the world
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/65">
            Design courses, inspire thousands of students, and earn from your
            expertise, no matter where you are.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 rounded-full bg-primary text-ink shadow-lg shadow-primary/20 hover:bg-primary-hover"
              >
                Become an instructor
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Explore courses
              </Button>
            </Link>
          </div>
        </PageContainer>
      </section>
    </div>
  );
};

export default HomeHero;
