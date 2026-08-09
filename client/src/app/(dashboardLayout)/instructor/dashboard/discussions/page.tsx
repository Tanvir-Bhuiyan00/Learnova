"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getDiscussions } from "@/services/discussion.services";
import { IDiscussion } from "@/types/discussion.types";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

const InstructorDiscussionsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-discussions"],
    queryFn: () => getDiscussions(),
  });

  const discussions: IDiscussion[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Discussions
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Conversations happening across your courses.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : discussions.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description="When learners start talking, threads will show up here."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {discussions.map((d) => (
            <div
              key={d.id}
              className="rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:shadow-primary-pale"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-pale">
                  <MessageSquare className="size-5 text-ink-deep" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-lg font-bold leading-snug text-ink">
                    {d.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body-text">
                    {d.content}
                  </p>
                  <p className="mt-3 text-xs text-mute-text">
                    Course: {d.courseId.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorDiscussionsPage;
