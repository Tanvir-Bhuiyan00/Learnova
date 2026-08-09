"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAssignmentById } from "@/services/assignment.services";
import { IAssignment } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props { params: Promise<{ id: string }> }

const AssignmentDetailPage = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => getAssignmentById(id),
    enabled: !!id,
  });

  const assignment: IAssignment | null = data?.data ?? null;

  return (
    <div className="space-y-6 p-6">
      <Link href="/instructor/dashboard/assignments" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 size-4" /> Back to Assignments
      </Link>

      {isLoading ? <Skeleton className="h-48" /> : !assignment ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Assignment not found</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <span className="text-sm text-muted-foreground">{assignment.totalMarks} pts</span>
            </div>
            {assignment.dueDate && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{assignment.description || "No description"}</p>
            <div className="flex gap-3">
              <Link href={`/instructor/dashboard/assignments/${id}/submissions`}>
                <Button variant="outline"><FileText className="mr-2 size-4" />View Submissions</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetailPage;
