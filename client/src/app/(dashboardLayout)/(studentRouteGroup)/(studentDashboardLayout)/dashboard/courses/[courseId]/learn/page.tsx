"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  getCourseById,
  getLessonsByModule,
  getModulesByCourse,
} from "@/services/course.services";
import { ILesson, IModule } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import VideoPlayer from "@/components/modules/Courses/VideoPlayer";

interface Props {
  params: Promise<{ courseId: string }>;
}

const CourseLearnPage = ({ params }: Props) => {
  const [courseId, setCourseId] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: () => getModulesByCourse(courseId),
    enabled: !!courseId,
  });

  const modules: IModule[] = modulesData?.data ?? [];
  const title = courseData?.data?.title ?? "Course";

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/my-learning"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to My Learning
        </Link>
        {courseLoading ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            {title}
          </h1>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Player / lesson content */}
        <div>
          {selectedLesson ? (
            <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
              <VideoPlayer
                url={selectedLesson.videoUrl || ""}
                title={selectedLesson.title}
              />
              <div className="p-6 md:p-8">
                <h2 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
                  {selectedLesson.title}
                </h2>
                {selectedLesson.description && (
                  <p className="mt-2 text-body-text">
                    {selectedLesson.description}
                  </p>
                )}
                {selectedLesson.content && (
                  <div
                    className="prose prose-sm mt-6 max-w-none rounded-2xl bg-canvas-soft/50 p-5 leading-relaxed text-body-text prose-headings:font-heading prose-headings:text-ink"
                    dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center rounded-3xl bg-white p-8 text-center ring-1 ring-border">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary-pale">
                <Play className="ml-0.5 size-8 text-ink-deep" fill="currentColor" />
              </div>
              <h2 className="mt-6 font-heading text-2xl font-extrabold tracking-tight text-ink">
                Ready to learn?
              </h2>
              <p className="mt-2 max-w-sm text-sm text-mute-text">
                Pick a lesson from the curriculum on the right to start
                learning.
              </p>
            </div>
          )}
        </div>

        {/* Curriculum sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
            <div className="border-b border-canvas-soft p-5">
              <h2 className="font-heading text-lg font-bold text-ink">
                Course content
              </h2>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-mute-text">
                <GraduationCap className="size-3.5" />
                {modules.length} modules
              </p>
            </div>

            {modulesLoading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : modules.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="mx-auto size-10 text-mute-text" />
                <p className="mt-3 text-sm font-medium text-ink">
                  No content yet
                </p>
                <p className="mt-1 text-xs text-mute-text">
                  The instructor is still building this course.
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {modules.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    mod={mod}
                    courseId={courseId}
                    isExpanded={expandedModules.has(mod.id)}
                    onToggle={() => toggleModule(mod.id)}
                    selectedLessonId={selectedLesson?.id}
                    onSelectLesson={setSelectedLesson}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

function ModuleCard({
  mod,
  courseId,
  isExpanded,
  onToggle,
  selectedLessonId,
  onSelectLesson,
}: {
  mod: IModule;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  selectedLessonId?: string;
  onSelectLesson: (lesson: ILesson) => void;
}) {
  const { data } = useQuery({
    queryKey: ["lessons", courseId, mod.id],
    queryFn: () => getLessonsByModule(courseId, mod.id),
    enabled: isExpanded,
  });

  const lessons: ILesson[] = data?.data ?? [];

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-border">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-canvas-soft/60"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 shrink-0 text-mute-text" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-mute-text" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            Module {mod.order}: {mod.title}
          </p>
          {mod.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-mute-text">
              {mod.description}
            </p>
          )}
        </div>
        <span className="shrink-0 text-xs text-mute-text">
          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t border-canvas-soft">
          {lessons.length === 0 ? (
            <p className="p-4 text-sm text-mute-text">
              No lessons in this module
            </p>
          ) : (
            lessons.map((lesson) => {
              const isSelected = selectedLessonId === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-primary-pale text-ink-deep"
                      : "text-body-text hover:bg-canvas-soft/60"
                  }`}
                >
                  {isSelected ? (
                    <Play className="size-3.5 shrink-0 text-ink-deep" fill="currentColor" />
                  ) : lesson.videoUrl ? (
                    <Play className="size-3.5 shrink-0 text-mute-text" />
                  ) : (
                    <FileText className="size-3.5 shrink-0 text-mute-text" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                  {lesson.videoDuration ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-mute-text">
                      <Clock className="size-3" />
                      {lesson.videoDuration} min
                    </span>
                  ) : lesson.isFree ? (
                    <span className="shrink-0 text-xs font-semibold text-positive">
                      Free
                    </span>
                  ) : (
                    <CheckCircle2 className="size-3.5 shrink-0 text-mute-text" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default CourseLearnPage;
