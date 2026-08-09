"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getCourseById, getModulesByCourse, getLessonsByModule } from "@/services/course.services";
import { ILesson, IModule } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import VideoPlayer from "@/components/modules/Courses/VideoPlayer";

interface Props { params: Promise<{ courseId: string }> }

const CourseLearnPage = ({ params }: Props) => {
  const [courseId, setCourseId] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  useEffect(() => { params.then((p) => setCourseId(p.courseId)); }, [params]);

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

  const { data: lessonsData } = useQuery({
    queryKey: ["course-lessons", courseId, selectedLesson?.moduleId],
    queryFn: () => getLessonsByModule(courseId, selectedLesson!.moduleId),
    enabled: !!courseId && !!selectedLesson?.moduleId,
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Link href="/dashboard/my-learning" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 size-4" /> Back to My Learning
      </Link>
      {courseLoading ? <Skeleton className="h-8 w-48" /> : <h1 className="text-2xl font-bold">{title}</h1>}

      {selectedLesson && (
        <div className="space-y-4">
          <VideoPlayer url={selectedLesson.videoUrl || ""} title={selectedLesson.title} />
          <div>
            <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
            {selectedLesson.description && <p className="mt-1 text-sm text-muted-foreground">{selectedLesson.description}</p>}
          </div>
          {selectedLesson.content && (
            <div className="prose prose-sm max-w-none rounded-lg border p-4">
              <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
            </div>
          )}
        </div>
      )}

      {modulesLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : modules.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No content yet</p>
        </div>
      ) : (
        <div className="space-y-2">
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
  );
};

function ModuleCard({
  mod, courseId, isExpanded, onToggle, selectedLessonId, onSelectLesson,
}: {
  mod: IModule; courseId: string; isExpanded: boolean; onToggle: () => void;
  selectedLessonId?: string; onSelectLesson: (lesson: ILesson) => void;
}) {
  const { data } = useQuery({
    queryKey: ["lessons", courseId, mod.id],
    queryFn: () => getLessonsByModule(courseId, mod.id),
    enabled: isExpanded,
  });

  const lessons: ILesson[] = data?.data ?? [];

  return (
    <div className="rounded-lg border">
      <button onClick={onToggle} className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors">
        {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        <div className="flex-1">
          <p className="font-medium">Module {mod.order}: {mod.title}</p>
          {mod.description && <p className="text-xs text-muted-foreground">{mod.description}</p>}
        </div>
        <span className="text-xs text-muted-foreground">{lessons.length} lessons</span>
      </button>
      {isExpanded && (
        <div className="border-t">
          {lessons.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No lessons in this module</p>
          ) : (
            lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 ${selectedLessonId === lesson.id ? "bg-primary/5 font-medium" : ""}`}
              >
                {selectedLessonId === lesson.id ? <Play className="size-3.5 text-primary" /> : <FileText className="size-3.5 text-muted-foreground" />}
                <span className="flex-1">{lesson.title}</span>
                {lesson.videoDuration && <span className="text-xs text-muted-foreground">{lesson.videoDuration} min</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CourseLearnPage;
