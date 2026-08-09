"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSubmissions } from "@/services/assignment.services";
import { IAssignmentSubmission } from "@/types/assignment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props { params: Promise<{ id: string }> }

const AssignmentSubmissionsPage = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["assignment-submissions", id],
    queryFn: () => getSubmissions(id),
    enabled: !!id,
  });

  const submissions: IAssignmentSubmission[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <Link href={`/instructor/dashboard/assignments/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 size-4" /> Back to Assignment
      </Link>
      <h1 className="text-2xl font-bold">Submissions</h1>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : submissions.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No submissions yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((s) => (
            <Card key={s.id}>
              <CardHeader><CardTitle className="text-base">Student: {s.studentId.slice(0, 8)}...</CardTitle></CardHeader>
              <CardContent><p className="text-sm">Marks: {s.marks ?? "Not graded"}</p></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;
