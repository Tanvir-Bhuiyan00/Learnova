"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { createLesson, createModule, deleteLesson, deleteModule, getLessonsByModule, getModulesByCourse, updateLesson, updateModule } from "@/services/course.services";
import { ILesson, IModule } from "@/types/course.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Edit3, FileText, GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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

function LessonForm({ lesson, onSave, onCancel }: { lesson?: Partial<ILesson>; onSave: (data: { title: string; description?: string; videoUrl?: string; videoDuration?: number; content?: string; order: number }) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || "");
  const [videoDuration, setVideoDuration] = useState(lesson?.videoDuration || 0);
  const [content, setContent] = useState(lesson?.content || "");

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
      <div className="space-y-1">
        <Label>Video URL</Label>
        <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
      </div>
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
        <Button size="sm" onClick={() => onSave({ title, description: description || undefined, videoUrl: videoUrl || undefined, videoDuration: videoDuration || undefined, content: content || undefined, order: lesson?.order ?? 0 })}>Save</Button>
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
    setExpandedModules((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Curriculum Builder</h1>
          <p className="text-sm text-muted-foreground">Organize your course into modules and lessons</p>
        </div>
        <Button onClick={() => setAddingModule(true)}><Plus className="mr-2 size-4" />Add Module</Button>
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
                  <div className="rounded-lg border p-3">
                    <LessonForm lesson={lesson} onSave={(data) => onSaveEditLesson(lesson.id, data)} onCancel={onCancelEditLesson} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm truncate">{lesson.title}</span>
                    {lesson.videoDuration && <span className="text-xs text-muted-foreground">{lesson.videoDuration} min</span>}
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => onStartEditLesson(lesson)}><Edit3 className="size-3" /></Button>
                    <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => onDeleteLesson(lesson.id)}><Trash2 className="size-3" /></Button>
                  </div>
                )}
              </div>
            ))}
            {addingLesson && (
              <div className="rounded-lg border p-3">
                <LessonForm onSave={(data) => onSaveLesson({ ...data, order: lessons.length + 1 })} onCancel={onCancelAddLesson} />
              </div>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={onStartAddLesson}>
              <Plus className="mr-2 size-3.5" />Add Lesson
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default CourseCurriculumPage;
