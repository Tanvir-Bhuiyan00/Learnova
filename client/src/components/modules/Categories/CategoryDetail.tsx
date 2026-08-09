"use client";

import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Star, User } from "lucide-react";
import Link from "next/link";

interface CategoryDetailProps {
  categoryId: string;
}

const CategoryDetail = ({ categoryId }: CategoryDetailProps) => {
  const { data: coursesData } = useQuery({
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
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/categories"
        className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; All Categories
      </Link>

      <h1 className="mb-2 text-3xl font-bold">
        {category?.title || "Category"}
      </h1>
      {category?.description && (
        <p className="mb-8 text-muted-foreground">{category.description}</p>
      )}

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No courses in this category</p>
          <Link
            href="/courses"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Browse all courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="group rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-36 items-center justify-center rounded-md bg-muted">
                <BookOpen className="size-12 text-muted-foreground" />
              </div>
              <Badge variant="secondary" className="mb-2">
                {course.level}
              </Badge>
              <h3 className="mb-1 font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {course.title}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {course.description || ""}
              </p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {course.totalStudents}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {course.averageRating.toFixed(1)}
                </span>
                <span className="ml-auto font-semibold text-foreground">
                  ${course.price.toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
