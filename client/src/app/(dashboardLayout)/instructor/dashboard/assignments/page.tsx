"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssignments } from "@/services/assignment.services";
import { IAssignment } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  DRAFT: "bg-yellow-100 text-yellow-800",
};

const InstructorAssignmentsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-assignments"],
    queryFn: () => getAssignments(),
  });

  const assignments: IAssignment[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-sm text-muted-foreground">Manage course assignments</p>
        </div>
        <Button><Plus className="mr-2 size-4" />Create Assignment</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : assignments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No assignments yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((a) => (
            <Link key={a.id} href={`/instructor/dashboard/assignments/${a.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <span className="text-xs text-muted-foreground">{a.totalMarks} pts</span>
                  </div>
                  {a.dueDate && (
                    <p className="text-sm text-muted-foreground">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                  )}
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorAssignmentsPage;
