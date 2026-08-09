"use client";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICategory } from "@/types/category.types";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Check, RotateCcw, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

const PAGE_SIZE = 6;

const levelOptions = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
  { value: "ALL_LEVELS", label: "All Levels" },
];

const CoursesList = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState("all");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const courses: ICourse[] = coursesData?.data ?? [];
  const categories: ICategory[] = categoriesData?.data ?? [];

  const filtered = courses.filter((c) => {
    if (c.status !== "PUBLISHED") return false;
    if (
      search &&
      !c.title.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (categoryId !== "all" && c.categoryId !== categoryId) return false;
    if (level !== "all" && c.level !== level) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, level]);

  const hasActiveFilters =
    search.trim() !== "" || categoryId !== "all" || level !== "all";

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setLevel("all");
  };

  if (coursesLoading) {
    return (
      <PageContainer>
        <LoadingState.Skeleton className="mb-4 h-48 w-full" count={3} />
      </PageContainer>
    );
  }

  return (
    <div>
      {/* Page header */}
      <section className="bg-canvas-soft py-14 md:py-16">
        <PageContainer>
          <p className="text-sm font-semibold uppercase tracking-widest text-mute-text">
            Course catalog
          </p>
          <h1 className="mt-2 font-heading text-4xl font-black tracking-tight text-ink md:text-5xl">
            Explore courses
          </h1>
          <p className="mt-3 max-w-xl text-lg text-body-text">
            Discover expert-led courses across every category, at a level that
            fits you.
          </p>
        </PageContainer>
      </section>

      <PageContainer spacing="lg">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          {/* Filters sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-6 rounded-3xl bg-white p-6 ring-1 ring-border">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold text-ink">
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-mute-text transition-colors hover:text-ink"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </button>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full border-border bg-canvas-soft/70 pl-10 focus-visible:bg-white"
                />
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-mute-text">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
                  <button
                    onClick={() => setCategoryId("all")}
                    className={
                      categoryId === "all"
                        ? "flex w-full items-center justify-between rounded-xl bg-ink px-3.5 py-2 text-left text-sm font-semibold text-white"
                        : "w-full rounded-xl px-3.5 py-2 text-left text-sm font-medium text-body-text transition-colors hover:bg-canvas-soft hover:text-ink"
                    }
                  >
                    All categories
                    {categoryId === "all" && <Check className="size-4" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={
                        categoryId === cat.id
                          ? "flex w-full items-center justify-between rounded-xl bg-ink px-3.5 py-2 text-left text-sm font-semibold text-white"
                          : "w-full rounded-xl px-3.5 py-2 text-left text-sm font-medium text-body-text transition-colors hover:bg-canvas-soft hover:text-ink"
                      }
                    >
                      {cat.title}
                      {categoryId === cat.id && <Check className="size-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-mute-text">
                  Level
                </h3>
                <div className="flex flex-wrap gap-2">
                  {levelOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setLevel(level === option.value ? "all" : option.value)
                      }
                      className={
                        level === option.value
                          ? "rounded-full bg-primary-pale px-4 py-1.5 text-sm font-semibold text-ink-deep ring-1 ring-primary"
                          : "rounded-full bg-canvas-soft px-4 py-1.5 text-sm font-medium text-body-text transition-colors hover:bg-primary-pale hover:text-ink-deep"
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-body-text">
                Showing{" "}
                <span className="font-semibold text-ink">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "course" : "courses"}
              </p>
              {hasActiveFilters && (
                <p className="text-sm text-mute-text">Filters active</p>
              )}
            </div>

            {paged.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={{
                  label: "Clear filters",
                  onClick: clearFilters,
                }}
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default CoursesList;
