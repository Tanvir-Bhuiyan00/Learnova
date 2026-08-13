"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminListPage } from "@/components/shared/AdminListPage";
import { PaginationMeta } from "@/types/api.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export interface CrudField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  placeholder?: string;
  required?: boolean;
  /** For select fields: option value -> label. */
  options?: { value: string; label: string }[];
}

interface CrudAdminPageProps<T> {
  title: string;
  description?: string;
  queryKey: string[];
  queryFn: (page: number) => Promise<{ data?: T[]; meta?: PaginationMeta }>;
  columns: { key: string; label: string; render: (item: T) => React.ReactNode }[];
  fields: CrudField[];
  idKey?: keyof T;
  /** Build an empty payload for the create form. */
  createDefaults: () => Record<string, string>;
  /** Map a row to form values for the edit form. */
  toForm: (item: T) => Record<string, string>;
  createMutation: (values: Record<string, string>) => Promise<{ success: boolean; message: string }>;
  updateMutation: (id: string, values: Record<string, string>) => Promise<{ success: boolean; message: string }>;
  deleteMutation: (id: string) => Promise<{ success: boolean; message: string }>;
}

/**
 * Full CRUD admin page: list + create + edit (modal form) + delete.
 * Built on AdminListPage so every content-management screen gets the same
 * table, pagination, empty/loading states — plus proper create/edit dialogs.
 */
export function CrudAdminPage<T extends { id: string }>({
  title,
  description,
  queryKey,
  queryFn,
  columns,
  fields,
  idKey = "id",
  createDefaults,
  toForm,
  createMutation,
  updateMutation,
  deleteMutation,
}: CrudAdminPageProps<T>) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Build a zod schema from the field config for client-side validation.
  const schema = z.object(
    Object.fromEntries(
      fields.map((f) => [
        f.name,
        f.required
          ? z.string().min(1, `${f.label} is required`)
          : z.string().optional(),
      ]),
    ),
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const mutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        return updateMutation(String(editing[idKey]), values);
      }
      return createMutation(values);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(editing ? "Updated successfully" : "Created successfully");
        setDialogOpen(false);
        setEditing(null);
        invalidate();
      } else {
        toast.error(res.message);
      }
    },
    onError: () => toast.error("Something went wrong. Please try again."),
  });

  const openCreate = () => {
    setEditing(null);
    setValues(createDefaults());
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setValues(toForm(item));
    setErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate();
  };

  const setField = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => {
      if (!e[name]) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  };

  return (
    <>
      <AdminListPage
        title={title}
        description={description}
        queryKey={queryKey}
        queryFn={queryFn}
        columns={columns}
        idKey={idKey}
        actions={[
          { icon: Pencil, label: "Edit", onClick: openEdit, variant: "ghost" },
          {
            icon: Trash2,
            label: "Delete",
            onClick: (item) => deleteMutation(String(item[idKey])).then((res) => {
              if (res.success) {
                toast.success("Deleted successfully");
                invalidate();
              } else {
                toast.error(res.message);
              }
            }),
            variant: "ghost",
            className: "text-mute-text transition-colors hover:bg-negative/10 hover:text-negative",
          },
        ]}
        onDelete={undefined}
        headerAction={
          <Button onClick={openCreate} className="gap-2 rounded-full">
            <Plus className="size-4" />
            Add {title.replace(" Management", "")}
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl font-bold text-ink">
              {editing ? "Edit" : "Add"} {title.replace(" Management", "")}
            </DialogTitle>
            <DialogDescription className="text-sm text-mute-text">
              Fill in the details below and save.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label
                  htmlFor={field.name}
                  className="text-xs font-bold uppercase tracking-widest text-mute-text"
                >
                  {field.label}
                </Label>

                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    rows={3}
                    className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-card"
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={values[field.name] ?? ""}
                    onValueChange={(v) => setField(field.name, v ?? "")}
                  >
                    <SelectTrigger className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-card">
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.name}
                    type={field.type === "number" ? "number" : "text"}
                    value={values[field.name] ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-card"
                  />
                )}
                {errors[field.name] && (
                  <p className="text-xs font-medium text-negative">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2 rounded-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
