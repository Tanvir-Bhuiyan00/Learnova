"use client";

import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICategory } from "@/types/category.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Compass, Layers } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

const CategoriesList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
  });

  const categories: ICategory[] = data?.data ?? [];

  const courseCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const course of coursesData?.data ?? []) {
      if (course.status !== "PUBLISHED") continue;
      map.set(course.categoryId, (map.get(course.categoryId) ?? 0) + 1);
    }
    return map;
  }, [coursesData]);

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
            Browse by topic
          </p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight text-ink md:text-5xl">
            Categories
          </h1>
          <p className="mt-3 max-w-xl text-lg text-body-text">
            Explore our categories and find the perfect course for your next
            skill.
          </p>
        </PageContainer>
      </section>

      <PageContainer spacing="lg">
        {categories.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No categories yet"
            description="Categories are being added. Check back soon."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const count = courseCounts.get(cat.id) ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  className="group relative flex flex-col rounded-3xl bg-white p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-pale">
                      <Layers className="size-6 text-ink-deep" />
                    </div>
                    <span className="flex size-9 items-center justify-center rounded-full bg-canvas-soft text-body-text transition-all duration-300 group-hover:bg-primary group-hover:text-ink">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-bold text-ink">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body-text">
                      {cat.description}
                    </p>
                  )}
                  <p className="mt-5 text-sm font-semibold text-ink-deep">
                    {count} {count === 1 ? "course" : "courses"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default CategoriesList;
