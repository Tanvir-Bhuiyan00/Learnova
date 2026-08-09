"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscussions } from "@/services/discussion.services";
import { IDiscussion } from "@/types/discussion.types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

const InstructorDiscussionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-discussions"],
    queryFn: () => getDiscussions(),
  });

  const discussions: IDiscussion[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Discussions</h1>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : discussions.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <MessageSquare className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No discussions yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {discussions.map((d) => (
            <Card key={d.id}>
              <CardHeader><CardTitle className="text-base">{d.title}</CardTitle></CardHeader>
              <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{d.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">Course: {d.courseId}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDiscussionsPage;
