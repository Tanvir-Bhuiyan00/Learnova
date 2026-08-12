import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/register",
        "/dashboard",
        "/instructor",
        "/admin",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: "https://learnova-lms.duckdns.org/sitemap.xml",
  };
}