"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInstructorById } from "@/services/instructor.services";
import { IInstructorDetails } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, MapPin, Star, User } from "lucide-react";
import Link from "next/link";

interface Props { instructorId: string }

const InstructorDetail = ({ instructorId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: () => getInstructorById(instructorId),
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8"><Skeleton className="h-64" /></div>;

  const instructor: IInstructorDetails | null = data?.data ?? null;

  if (!instructor) return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Instructor not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/instructors" className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground">&larr; Back to Instructors</Link>

      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-6 p-8 md:flex-row md:items-start">
          <div className="flex size-24 items-center justify-center rounded-full bg-muted md:size-32">
            <User className="size-12 text-muted-foreground md:size-16" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{instructor.name}</h1>
            <p className="text-lg text-muted-foreground">{instructor.designation || "Instructor"}</p>
            {instructor.currentWorkingPlace && (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground md:justify-start">
                <MapPin className="size-3.5" />{instructor.currentWorkingPlace}
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-4 md:justify-start">
              <div className="flex items-center gap-1"><Star className="size-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{instructor.averageRating?.toFixed(1) ?? "0.0"}</span></div>
              <span className="text-sm text-muted-foreground">{instructor.experience ?? 0} years experience</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {instructor.bio && (
        <Card className="mb-8">
          <CardHeader><CardTitle>About</CardTitle></CardHeader>
          <CardContent><p>{instructor.bio}</p></CardContent>
        </Card>
      )}

      {instructor.courses && instructor.courses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Courses ({instructor.courses.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {instructor.courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                    {course.thumbnail && (
                      <div className="h-32 overflow-hidden rounded-t-lg">
                        <img src={course.thumbnail} alt={course.title} className="size-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="mb-2 font-semibold line-clamp-2">{course.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Star className="size-3.5 fill-yellow-400 text-yellow-400" />{course.averageRating.toFixed(1)}</span>
                        <span>${course.price.toFixed(2)}</span>
                        <span className="text-xs uppercase">{course.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {instructor.reviews && instructor.reviews.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-bold">Reviews ({instructor.reviews.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {instructor.reviews.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-4 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent><p className="text-sm">{r.comment || "No comment"}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDetail;
