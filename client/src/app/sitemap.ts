import type { MetadataRoute } from "next";
import { getCategories } from "@/services/category.services";
import { getCourses } from "@/services/course.services";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
  "https://learnova-lms.duckdns.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/instructors`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];

  try {
    const courses = await getCourses("status=PUBLISHED&limit=100");
    courseRoutes = (courses.data ?? []).map((course) => ({
      url: `${SITE_URL}/courses/${course.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      lastModified: course.updatedAt,
    }));
  } catch {
    // sitemap still works without dynamic entries
  }

  try {
    const categories = await getCategories();
    categoryRoutes = (categories.data ?? []).map((category) => ({
      url: `${SITE_URL}/courses?category=${category.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // sitemap still works without category entries
  }

  return [...staticRoutes, ...courseRoutes, ...categoryRoutes];
}