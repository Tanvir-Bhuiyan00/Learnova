"use client";

import { Button } from "@/components/ui/button";
import { getCourses } from "@/services/course.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import CourseCard from "@/components/shared/CourseCard";
import PageContainer from "@/components/shared/PageContainer";

const HomeHero = () => {
  const { data } = useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
  });

  const courses: ICourse[] = (data?.data ?? []).filter(
    (c) => c.status === "PUBLISHED",
  );
  const featured = courses.slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Learn Without Limits
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Master new skills with expert-led courses. Learn at your own pace
            and advance your career with Learnova.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/courses">
              <Button size="lg">Browse Courses</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <PageContainer spacing="lg">
          <h2 className="mb-8 text-2xl font-bold">Featured Courses</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </PageContainer>
      )}

      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Become an Instructor</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Share your knowledge and inspire thousands of students. Start
            teaching with Learnova today.
          </p>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Start Teaching
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomeHero;
