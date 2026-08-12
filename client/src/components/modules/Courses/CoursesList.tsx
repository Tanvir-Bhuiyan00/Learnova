"use client";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICategory } from "@/types/category.types";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowDownWideNarrow,
  BookOpen,
  Check,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
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

const sortOptions = [
  { value: "newest", label: "Newest", sortBy: "createdAt", order: "desc" },
  {
    value: "mostPopular",
    label: "Most popular",
    sortBy: "totalStudents",
    order: "desc",
  },
  {
    value: "highestRated",
    label: "Highest rated",
    sortBy: "averageRating",
    order: "desc",
  },
  { value: "priceLow", label: "Price: low to high", sortBy: "price", order: "asc" },
  { value: "priceHigh", label: "Price: high to low", sortBy: "price", order: "desc" },
];

const CoursesList = ({ initialCategory = "all" }: { initialCategory?: string }) => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");
  const [freeOnly, setFreeOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Hydrate filters from URL query params on mount / when they change.
  // Syncing local filter state from the URL is a legitimate effect use.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = searchParams.get("q");
    // Always sync from the URL (including empty) so browser-back clears
    // filters instead of leaving stale local state.
    setSearch(q ?? "");
    setDebouncedSearch(q ?? "");

    const category = searchParams.get("category");
    setCategoryId(category ?? initialCategory);

    setPage(1);
  }, [searchParams, initialCategory]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever an active filter changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, categoryId, level, sort, freeOnly]);

  const activeSort = sortOptions.find((option) => option.value === sort);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    params.set("status", "PUBLISHED");
    if (debouncedSearch.trim()) params.set("searchTerm", debouncedSearch.trim());
    if (categoryId !== "all") params.set("categoryId", categoryId);
    if (level !== "all") params.set("level", level);
    if (activeSort) {
      params.set("sortBy", activeSort.sortBy);
      params.set("sortOrder", activeSort.order);
    }
    if (freeOnly) params.set("price", "0");
    return params.toString();
  };

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: [
      "courses",
      debouncedSearch,
      categoryId,
      level,
      sort,
      freeOnly,
      page,
    ],
    queryFn: () => getCourses(buildQueryString()),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const courses: ICourse[] = coursesData?.data ?? [];
  const total = coursesData?.meta?.total ?? courses.length;
  const categories: ICategory[] = categoriesData?.data ?? [];

  const totalPages = Math.max(1, coursesData?.meta?.totalPages ?? 1);
  const safePage = Math.min(page, totalPages);
  // The server already paginates; items are the current page's data.
  const paged = courses;

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryId !== "all" ||
    level !== "all" ||
    freeOnly;

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryId("all");
    setLevel("all");
    setFreeOnly(false);
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
            <div className="space-y-6 rounded-3xl bg-card p-6 ring-1 ring-border">
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
                  className="rounded-full border-border bg-canvas-soft/70 pl-10 focus-visible:bg-card"
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
                        ? "flex w-full items-center justify-between rounded-xl bg-ink-solid px-3.5 py-2 text-left text-sm font-semibold text-white"
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
                          ? "flex w-full items-center justify-between rounded-xl bg-ink-solid px-3.5 py-2 text-left text-sm font-semibold text-white"
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

              <div className="border-t border-canvas-soft pt-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-mute-text">
                  Price
                </h3>
                <button
                  onClick={() => setFreeOnly(!freeOnly)}
                  className={`flex w-full items-center gap-1.5 rounded-xl px-3.5 py-2 text-left text-sm font-semibold transition-colors ${
                    freeOnly
                      ? "bg-primary-pale text-ink-deep ring-1 ring-primary"
                      : "bg-canvas-soft text-body-text hover:bg-primary-pale hover:text-ink-deep"
                  }`}
                >
                  <Sparkles className="size-4" />
                  Free courses only
                  {freeOnly && <Check className="ml-auto size-4" />}
                </button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-body-text">
                Showing{" "}
                <span className="font-semibold text-ink">{total}</span>{" "}
                {total === 1 ? "course" : "courses"}
                {hasActiveFilters && (
                  <span className="ml-2 text-mute-text">· filters active</span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <ArrowDownWideNarrow className="size-4 text-mute-text" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort courses"
                  className="cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink outline-none transition-colors focus-visible:border-primary"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
              <motion.div
                key={`${debouncedSearch}-${categoryId}-${level}-${sort}-${freeOnly}-${page}`}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {paged.map((course) => (
                  <motion.div
                    key={course.id}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.3, ease: "easeOut" },
                      },
                    }}
                  >
                    <CourseCard course={course} />
                  </motion.div>
                ))}
              </motion.div>
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
