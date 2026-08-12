"use client";

import { getInstructors } from "@/services/instructor.services";
import { IInstructor } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const InstructorsList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: () => getInstructors(),
  });

  const instructors: IInstructor[] = data?.data ?? [];

  if (isLoading) {
    return (
      <PageContainer spacing="lg">
        <LoadingState.Skeleton className="mb-4 h-40 w-full" count={3} />
      </PageContainer>
    );
  }

  return (
    <div>
      <section className="bg-canvas-soft py-14 md:py-16">
        <PageContainer>
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Learn from the best
          </p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight text-ink md:text-5xl">
            Our instructors
          </h1>
          <p className="mt-3 max-w-xl text-lg text-body-text">
            Meet the experts behind our courses, each one ready to guide you
            from first lesson to career-changing skills.
          </p>
        </PageContainer>
      </section>

      <PageContainer spacing="lg">
        {instructors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No instructors yet"
            description="Instructor profiles are being added. Check back soon."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {instructors.map((instructor) => (
              <Link
                key={instructor.id}
                href={`/instructors/${instructor.id}`}
                className="group flex flex-col rounded-3xl bg-card p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
              >
                <div className="flex items-center gap-4">
                  {instructor.profilePhoto ? (
                    <Image
                      src={instructor.profilePhoto}
                      alt={instructor.name}
                      width={64}
                      height={64}
                      className="size-16 rounded-full object-cover ring-2 ring-canvas-soft"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary-pale font-heading text-xl font-extrabold text-ink-deep">
                      {getInitials(instructor.name) || "IN"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-heading text-lg font-bold text-ink">
                      {instructor.name}
                    </h3>
                    <p className="truncate text-sm text-body-text">
                      {instructor.designation || "Instructor"}
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas-soft text-body-text transition-colors duration-300 group-hover:bg-primary group-hover:text-ink">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>

                {instructor.currentWorkingPlace && (
                  <p className="mt-4 text-sm font-medium text-ink-deep">
                    {instructor.currentWorkingPlace}
                  </p>
                )}
                {instructor.bio && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body-text">
                    {instructor.bio}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-4 border-t border-canvas-soft pt-5 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold text-ink">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {instructor.averageRating?.toFixed(1) ?? "0.0"}
                  </span>
                  <span className="text-mute-text">
                    {instructor.experience ?? 0} years experience
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default InstructorsList;
