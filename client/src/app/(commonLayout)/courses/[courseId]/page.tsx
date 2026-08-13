import type { Metadata } from "next";
import CourseDetail from "@/components/modules/Courses/CourseDetail";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { ICourseDetail } from "@/types/course.types";

// Regenerate this static page at most once per minute.
export const revalidate = 60;

interface CourseDetailParams {
  params: Promise<{ courseId: string }>;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://learnova-lms.duckdns.org";

const fetchCourse = async (
  courseId: string,
): Promise<ICourseDetail | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${courseId}`,
      { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
};

export async function generateMetadata({
  params,
}: CourseDetailParams): Promise<Metadata> {
  const { courseId } = await params;
  const course = await fetchCourse(courseId);

  if (!course) {
    return {
      title: "Course not found - Learnova",
    };
  }

  const description = (course.description ?? "").slice(0, 155);

  return {
    title: `${course.title} - Learnova`,
    description,
    openGraph: {
      title: course.title,
      description,
      type: "website",
      url: `${SITE_URL}/courses/${course.id}`,
      images: course.thumbnail ? [{ url: course.thumbnail }] : undefined,
    },
  };
}

const CourseDetailPage = async ({ params }: CourseDetailParams) => {
  const { courseId } = await params;
  const queryClient = new QueryClient();

  // Seed the course data during static generation / revalidation. This must
  // use Next's fetch with a revalidate window (a plain uncached request would
  // force the route to render dynamically and defeat ISR).
  const course = await fetchCourse(courseId);

  if (course) {
    queryClient.setQueryData(["course", courseId], {
      success: true,
      message: "Course fetched successfully",
      data: course,
    });
  }

  // Course structured data for rich search results (schema.org Course).
  const jsonLd = course
    ? {
        "@context": "https://schema.org",
        "@type": "Course",
        name: course.title,
        description: course.description ?? undefined,
        provider: {
          "@type": "Organization",
          name: "Learnova",
          url: SITE_URL,
        },
        ...(course.thumbnail ? { image: course.thumbnail } : {}),
        ...(course.instructor?.name
          ? {
              instructor: {
                "@type": "Person",
                name: course.instructor.name,
              },
            }
          : {}),
        ...(course.averageRating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: course.averageRating,
                ratingCount: Math.max(1, course.totalStudents),
              },
            }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CourseDetail courseId={courseId} />
      </HydrationBoundary>
    </>
  );
};

export default CourseDetailPage;
