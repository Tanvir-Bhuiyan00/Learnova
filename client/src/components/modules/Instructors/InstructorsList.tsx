"use client";

import { getInstructors } from "@/services/instructor.services";
import { IInstructor } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import { Star, User } from "lucide-react";

const InstructorsList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: () => getInstructors(),
  });

  const instructors: IInstructor[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading instructors...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Our Instructors</h1>
      {instructors.length === 0 ? (
        <p className="text-muted-foreground">No instructors found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="rounded-lg border p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                  <User className="size-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {instructor.designation || "Instructor"}
                  </p>
                </div>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                {instructor.currentWorkingPlace || "N/A"}
              </p>
              <p className="mb-2 text-sm">{instructor.qualification || "N/A"}</p>
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {instructor.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({instructor.experience ?? 0} years exp.)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorsList;
