"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createLesson, createModule, deleteLesson, deleteModule, getLessonsByModule, getModulesByCourse, updateLesson, updateModule } from "@/services/course.services";
import { ILesson, IModule } from "@/types/course.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, CheckCircle2, Edit3, FileText, GripVertical, Loader2, Plus, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { uploadLessonVideo } from "@/services/video.services";
import { toast } from "sonner";

interface Props { params: Promise<{ courseId: string }> }

function ModuleForm({ module, onSave, onCancel }: { module?: Partial<IModule>; onSave: (data: { title: string; description?: string; order: number }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(module?.title || "");
  const [description, setDescription] = useState(module?.description || "");

  return (
    <div className="space-y-3 py-2">
      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module title" />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Module description" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave({ title, description: description || undefined, order: module?.order ?? 0 })}>Save</Button>
      </div>
    </div>
  );
}

function LessonForm({ lesson, courseId, onSave, onCancel }: { lesson?: Partial<ILesson>; courseId: string; onSave: (data: { title: string; description?: string; videoUrl?: string; videoDuration?: number; content?: string; order: number }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || "");
  const [videoDuration, setVideoDuration] = useState(lesson?.videoDuration || 0);
  const [content, setContent] = useState(lesson?.content || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFile = async (file: File) => {
    if (!courseId) return;
    const MAX = 100 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error("Video must be 100MB or smaller");
      return;
    }
    if (
      !["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-matroska"].includes(file.type)
    ) {
      toast.error("Only mp4, webm, ogg, mov, and mkv videos are supported");
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await uploadLessonVideo(courseId, file, setUploadProgress);
      setVideoUrl(res.data.url);
      toast.success("Video uploaded — save the lesson to finish");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not upload video",
      );
    } finally {
      setUploading(false);
    }
  };

  const isDirectVideo = videoUrl.includes("res.cloudinary.com");

  return (
    <div className="space-y-3 py-2">
      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="space-y-1.5 rounded-2xl border border-dashed border-primary/40 bg-primary-pale/30 p-4">
        <Label>Lesson video</Label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <UploadCloud className="size-3.5" />
            )}
            {uploading ? "Uploading..." : "Upload video file"}
          </Button>
          {uploading && (
            <div className="flex min-w-40 flex-1 items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-pale">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-primary">{uploadProgress}%</span>
            </div>
          )}
          {videoUrl && !uploading && (
            <span className="inline-flex max-w-56 items-center gap-1.5 truncate text-xs font-medium text-mute-text">
              <CheckCircle2 className="size-3.5 shrink-0 text-positive" />
              <span className="truncate">Video attached</span>
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-mute-text">
          MP4, WebM, OGG, MOV or MKV — up to 100MB, hosted on Cloudinary. Or paste a video URL below.
        </p>
      </div>

      <div className="space-y-1">
        <Label>Video URL</Label>
        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or Cloudinary URL" />
      </div>
      {isDirectVideo && videoUrl && (
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-2xl bg-black/5 ring-1 ring-border"
        />
      )}
      <div className="space-y-1">
        <Label>Duration (minutes)</Label>
        <Input type="number" min={0} value={videoDuration} onChange={(e) => setVideoDuration(parseInt(e.target.value) || 0)} />
      </div>
      <div className="space-y-1">
        <Label>Content (HTML)</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" disabled={uploading} onClick={() => onSave({ title, description: description || undefined, videoUrl: videoUrl || undefined, videoDuration: videoDuration || undefined, content: content || undefined, order: lesson?.order ?? 0 })}>
          {uploading ? "Uploading..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

const CourseCurriculumPage = ({ params }: Props) => {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addingModule, setAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: ILesson } | null>(null);

  useEffect(() => { params.then((p) => setCourseId(p.courseId)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["course-modules", courseId],
    queryFn: () => getModulesByCourse(courseId),
    enabled: !!courseId,
  });

  const modules: IModule[] = data?.data ?? [];

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const createModuleMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; order: number }) => createModule(courseId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] }); setAddingModule(false); toast.success("Module added"); },
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Parameters<typeof updateModule>[2] }) => updateModule(courseId, moduleId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] }); setEditingModule(null); toast.success("Module updated"); },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => deleteModule(courseId, moduleId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] }); toast.success("Module deleted"); },
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: Parameters<typeof createLesson>[2] }) => createLesson(courseId, moduleId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["lessons", courseId] }); setAddingLessonTo(null); toast.success("Lesson added"); },
  });

  const updateLessonMutation = useMutation({
    mutationFn: ({ moduleId, lessonId, data }: { moduleId: string; lessonId: string; data: Parameters<typeof updateLesson>[3] }) => updateLesson(courseId, moduleId, lessonId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["lessons", courseId] }); setEditingLesson(null); toast.success("Lesson updated"); },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: ({ moduleId, lessonId }: { moduleId: string; lessonId: string }) => deleteLesson(courseId, moduleId, lessonId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["lessons", courseId] }); toast.success("Lesson deleted"); },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Curriculum builder
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Organize your course into modules and lessons
          </p>
        </div>
        <Button className="gap-2 rounded-full" onClick={() => setAddingModule(true)}>
          <Plus className="size-4" />
          Add Module
        </Button>
      </div>

      {addingModule && (
        <Card><CardContent className="pt-4">
          <ModuleForm onSave={(data) => createModuleMutation.mutate({ ...data, order: modules.length + 1 })} onCancel={() => setAddingModule(false)} />
        </CardContent></Card>
      )}

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : modules.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
          <FileText className="mb-4 size-12" />
          <p className="text-lg font-medium mb-1">No modules yet</p>
          <p className="text-sm">Add modules to build your course curriculum.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {modules.map((mod) => (
            <ModuleSection
              key={mod.id}
              mod={mod}
              courseId={courseId}
              isExpanded={expandedModules.has(mod.id)}
              onToggle={() => toggleModule(mod.id)}
              isEditing={editingModule === mod.id}
              onStartEdit={() => setEditingModule(mod.id)}
              onCancelEdit={() => setEditingModule(null)}
              onSaveEdit={(data) => updateModuleMutation.mutate({ moduleId: mod.id, data })}
              onDelete={() => deleteModuleMutation.mutate(mod.id)}
              addingLesson={addingLessonTo === mod.id}
              onStartAddLesson={() => setAddingLessonTo(mod.id)}
              onCancelAddLesson={() => setAddingLessonTo(null)}
              onSaveLesson={(data) => createLessonMutation.mutate({ moduleId: mod.id, data })}
              editingLesson={editingLesson?.moduleId === mod.id ? editingLesson.lesson : null}
              onStartEditLesson={(lesson) => setEditingLesson({ moduleId: mod.id, lesson })}
              onCancelEditLesson={() => setEditingLesson(null)}
              onSaveEditLesson={(lessonId, data) => updateLessonMutation.mutate({ moduleId: mod.id, lessonId, data })}
              onDeleteLesson={(lessonId) => deleteLessonMutation.mutate({ moduleId: mod.id, lessonId })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function ModuleSection({
  mod, courseId, isExpanded, onToggle, isEditing, onStartEdit, onCancelEdit, onSaveEdit, onDelete,
  addingLesson, onStartAddLesson, onCancelAddLesson, onSaveLesson,
  editingLesson, onStartEditLesson, onCancelEditLesson, onSaveEditLesson, onDeleteLesson,
}: {
  mod: IModule; courseId: string; isExpanded: boolean; onToggle: () => void;
  isEditing: boolean; onStartEdit: () => void; onCancelEdit: () => void; onSaveEdit: (data: any) => void; onDelete: () => void;
  addingLesson: boolean; onStartAddLesson: () => void; onCancelAddLesson: () => void; onSaveLesson: (data: any) => void;
  editingLesson: ILesson | null; onStartEditLesson: (lesson: ILesson) => void; onCancelEditLesson: () => void; onSaveEditLesson: (lessonId: string, data: any) => void; onDeleteLesson: (lessonId: string) => void;
}) {
  const { data } = useQuery({
    queryKey: ["lessons", courseId, mod.id],
    queryFn: () => getLessonsByModule(courseId, mod.id),
    enabled: isExpanded,
  });
  const lessons: ILesson[] = data?.data ?? [];

  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <GripVertical className="size-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <ModuleForm
                module={mod}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Module {mod.order}: {mod.title}</CardTitle>
                  {mod.description && <p className="text-xs text-muted-foreground">{mod.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={onStartEdit}><Edit3 className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={onDelete}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{lessons.length} lessons</span>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t pt-4">
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <div key={lesson.id}>
                {editingLesson?.id === lesson.id ? (
                  <div className="rounded-2xl ring-1 ring-border p-3">
                    <LessonForm courseId={courseId} lesson={lesson} onSave={(data) => onSaveEditLesson(lesson.id, data)} onCancel={onCancelEditLesson} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl ring-1 ring-border px-3 py-2">
                    <FileText className="size-4 text-mute-text shrink-0" />
                    <span className="flex-1 text-sm truncate text-ink">{lesson.title}</span>
                    {lesson.videoDuration && <span className="text-xs text-mute-text">{lesson.videoDuration} min</span>}
                    <Button variant="ghost" size="icon" className="size-7 rounded-full" onClick={() => onStartEditLesson(lesson)}><Edit3 className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 rounded-full text-mute-text hover:bg-negative/10 hover:text-negative" onClick={() => onDeleteLesson(lesson.id)}><Trash2 className="size-3" /></Button>
                  </div>
                )}
              </div>
            ))}
            {addingLesson && (
              <div className="rounded-2xl ring-1 ring-border p-3">
                <LessonForm courseId={courseId} onSave={(data) => onSaveLesson({ ...data, order: lessons.length + 1 })} onCancel={onCancelAddLesson} />
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2 rounded-full" onClick={onStartAddLesson}>
              <Plus className="mr-2 size-3.5" />Add Lesson
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default CourseCurriculumPage;
