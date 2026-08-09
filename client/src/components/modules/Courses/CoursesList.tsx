"use client";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";
import { ICategory } from "@/types/category.types";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CourseCard from "@/components/shared/CourseCard";
import EmptyState from "@/components/shared/EmptyState";
import LoadingState from "@/components/shared/LoadingState";
import PageContainer from "@/components/shared/PageContainer";

const PAGE_SIZE = 6;

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

const CoursesList = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [categoryId, setCategoryId] = useState("all");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
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
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryId && categoryId !== "all" && c.categoryId !== categoryId) return false;
    if (level && level !== "all" && c.level !== level) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, categoryId, level]);

  if (coursesLoading) {
    return (
      <PageContainer>
        <LoadingState.Skeleton className="h-48 w-full mb-4" count={3} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Explore Courses</h1>
        <p className="text-muted-foreground">Discover courses from expert instructors</p>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.title}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={level} onValueChange={(v) => v && setLevel(v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="BEGINNER">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
            <SelectItem value="ADVANCED">Advanced</SelectItem>
            <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search or filters to find what you're looking for."
          action={{
            label: "Clear filters",
            onClick: () => {
              setSearch("");
              setCategoryId("all");
              setLevel("all");
            },
          }}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paged.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </PageContainer>
  );
};

export default CoursesList;
