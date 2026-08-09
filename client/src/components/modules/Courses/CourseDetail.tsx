"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Globe, Star, User } from "lucide-react";
import Link from "next/link";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

interface CourseDetailProps {
  courseId: string;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
  });

  const course: ICourse | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="mb-2 h-4 w-full max-w-lg" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Course not found.</p>
        <Link href="/courses" className="text-primary hover:underline mt-2 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/courses"
        className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        &larr; Back to courses
      </Link>

      {course.thumbnail && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <img src={course.thumbnail} alt={course.title} className="h-64 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge>{levelLabels[course.level] || course.level}</Badge>
              <Badge variant="outline">
                {course.language}
              </Badge>
            </div>
            <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">
              {course.description || "No description available."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {course.totalStudents} students
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              {course.averageRating.toFixed(1)} rating
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-4" />
              {course.totalLessons} lessons
            </span>
            {course.totalDuration && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {course.totalDuration} min
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Globe className="size-4" />
              {course.language}
            </span>
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {course.discountPrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">
                      ${course.price.toFixed(2)}
                    </span>
                    <span>${course.discountPrice.toFixed(2)}</span>
                  </div>
                ) : (
                  <span>${course.price.toFixed(2)}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                Enroll Now
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
