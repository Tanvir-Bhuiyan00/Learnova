"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus, Star, User } from "lucide-react";
import Link from "next/link";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const InstructorCoursesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => getCourses(),
  });

  const courses: ICourse[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-sm text-muted-foreground">Manage your courses</p>
        </div>
        <Link href="/instructor/dashboard/courses/create">
          <Button><Plus className="mr-2 size-4" />Create Course</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen className="mb-4 size-12 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">No courses yet</p>
            <p className="mb-4 text-sm text-muted-foreground">Create your first course to get started.</p>
            <Link href="/instructor/dashboard/courses/create"><Button>Create Course</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/instructor/dashboard/courses/${course.id}/edit`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-3">
                    <Badge className={statusColors[course.status]}>{course.status}</Badge>
                  </div>
                  <h3 className="mb-2 font-semibold line-clamp-2">{course.title}</h3>
                  <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
                    {course.description || "No description"}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="size-3.5" />{course.totalStudents}</span>
                    <span className="flex items-center gap-1"><Star className="size-3.5 fill-yellow-400 text-yellow-400" />{course.averageRating.toFixed(1)}</span>
                    <span className="ml-auto text-xs">{levelLabels[course.level]}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCoursesPage;
