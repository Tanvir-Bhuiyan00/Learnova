"use client";

import { getCategories } from "@/services/category.services";
import { ICategory } from "@/types/category.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const CategoriesList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const categories: ICategory[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Categories</h1>
      <p className="mb-8 text-muted-foreground">
        Browse courses by category
      </p>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">No categories found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <BookOpen className="mb-3 size-10 text-primary" />
              <h3 className="mb-1 text-lg font-semibold group-hover:text-primary transition-colors">
                {cat.title}
              </h3>
              {cat.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cat.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
