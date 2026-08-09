"use client";

import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

interface CategoryDetailProps {
  categoryId: string;
}

const CategoryDetail = ({ categoryId }: CategoryDetailProps) => {
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const category = (categoriesData?.data ?? []).find(
    (c) => c.id === categoryId,
  );
  const courses: ICourse[] = (coursesData?.data ?? []).filter(
    (c) => c.categoryId === categoryId && c.status === "PUBLISHED",
  );

  return (
    <div>
      <section className="bg-canvas-soft py-14 md:py-16">
        <PageContainer>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            All categories
          </Link>
          <h1 className="mt-6 font-heading text-4xl font-black tracking-tight text-ink md:text-5xl">
            {category?.title ?? "Category"}
          </h1>
          {category?.description && (
            <p className="mt-3 max-w-xl text-lg text-body-text">
              {category.description}
            </p>
          )}
        </PageContainer>
      </section>

      <PageContainer spacing="lg">
        {isLoading ? (
          <LoadingState.Skeleton className="mb-4 h-48 w-full" count={3} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses in this category"
            description="New courses are on the way. Try browsing another category."
          >
            <Link href="/courses">
              <span className="text-sm font-semibold text-ink-deep hover:text-primary-hover">
                Browse all courses
              </span>
            </Link>
          </EmptyState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default CategoryDetail;
