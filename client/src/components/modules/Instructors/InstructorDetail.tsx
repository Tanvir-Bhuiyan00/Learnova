"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getInstructorById } from "@/services/instructor.services";
import { IInstructorDetails } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Briefcase,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/shared/PageContainer";

interface Props {
  instructorId: string;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const InstructorDetail = ({ instructorId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => getInstructorById(instructorId),
  });

  if (isLoading) {
    return (
      <PageContainer spacing="lg">
        <Skeleton className="h-6 w-32" />
        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-3xl lg:col-span-1" />
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </div>
      </PageContainer>
    );
  }

  const instructor: IInstructorDetails | null = data?.data ?? null;

  if (!instructor) {
    return (
      <PageContainer spacing="lg" className="text-center">
        <p className="text-lg font-semibold text-ink">Instructor not found</p>
        <Link
          href="/instructors"
          className="mt-2 inline-block text-sm font-semibold text-ink-deep hover:text-primary-hover"
        >
          Back to instructors
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer spacing="lg">
      <Link
        href="/instructors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to instructors
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* Profile card */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center ring-1 ring-border">
            {instructor.profilePhoto ? (
              <img
                src={instructor.profilePhoto}
                alt={instructor.name}
                className="size-28 rounded-full object-cover ring-4 ring-primary-pale"
              />
            ) : (
              <div className="flex size-28 items-center justify-center rounded-full bg-primary-pale font-heading text-4xl font-extrabold text-ink-deep">
                {getInitials(instructor.name)}
              </div>
            )}
            <h1 className="mt-5 flex items-center gap-1.5 font-heading text-2xl font-extrabold text-ink">
              {instructor.name}
              <BadgeCheck className="size-5 text-positive" />
            </h1>
            <p className="mt-1 text-body-text">
              {instructor.designation || "Instructor"}
            </p>

            {instructor.currentWorkingPlace && (
              <p className="mt-4 flex items-center gap-1.5 text-sm text-body-text">
                <Briefcase className="size-4 text-mute-text" />
                {instructor.currentWorkingPlace}
              </p>
            )}
            {instructor.address && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-body-text">
                <MapPin className="size-4 text-mute-text" />
                {instructor.address}
              </p>
            )}

            <div className="mt-6 w-full border-t border-canvas-soft pt-6">
              <div className="flex items-center justify-center gap-6">
                <div>
                  <p className="flex items-center justify-center gap-1 font-heading text-2xl font-extrabold text-ink">
                    {instructor.averageRating?.toFixed(1) ?? "0.0"}
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </p>
                  <p className="mt-1 text-xs text-mute-text">Rating</p>
                </div>
                <div className="h-10 w-px bg-canvas-soft" />
                <div>
                  <p className="font-heading text-2xl font-extrabold text-ink">
                    {instructor.experience ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-mute-text">
                    Years exp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {instructor.qualification && (
            <div className="mt-4 rounded-3xl bg-white p-6 ring-1 ring-border">
              <p className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Qualification
              </p>
              <p className="mt-2 text-sm leading-relaxed text-body-text">
                {instructor.qualification}
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {instructor.bio && (
            <section>
              <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
                About
              </h2>
              <p className="mt-4 leading-relaxed text-body-text">
                {instructor.bio}
              </p>
            </section>
          )}

          {instructor.courses.length > 0 && (
            <section className="mt-12">
              <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold tracking-tight text-ink">
                <BookOpen className="size-6 text-ink-deep" />
                Courses ({instructor.courses.length})
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {instructor.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
                  >
                    {course.thumbnail && (
                      <div className="h-36 overflow-hidden bg-canvas-soft">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-ink">
                        {course.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="font-heading text-lg font-extrabold text-ink">
                          ${course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {instructor.reviews.length > 0 && (
            <section className="mt-12">
              <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
                Reviews ({instructor.reviews.length})
              </h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {instructor.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-3xl bg-canvas-soft/60 p-6 ring-1 ring-border"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < r.rating
                                ? "size-4 fill-amber-400 text-amber-400"
                                : "size-4 text-mute-text"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-mute-text">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-body-text">
                      {r.comment || "No comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default InstructorDetail;
