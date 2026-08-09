"use client";

import { updateInstructorAction } from "@/app/(dashboardLayout)/admin/dashboard/instructors-management/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type IInstructor,
  type IUpdateInstructorPayload,
} from "@/types/instructor.types";
import {
  editInstructorFormZodSchema,
  type IEditInstructorFormValues,
} from "@/zod/instructor.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditInstructorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor: IInstructor | null;
}

const getInitialValues = (
  instructor: IInstructor | null,
): IEditInstructorFormValues => ({
  name: instructor?.name ?? "",
  contactNumber: instructor?.contactNumber ?? "",
  address: instructor?.address ?? "",
  bio: instructor?.bio ?? "",
  qualification: instructor?.qualification ?? "",
  experience: instructor?.experience?.toString() ?? "",
  currentWorkingPlace: instructor?.currentWorkingPlace ?? "",
  designation: instructor?.designation ?? "",
});

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "Invalid input";
};

const FieldMessage = ({ error }: { error: unknown }) => {
  if (!error) {
    return null;
  }

  return <p className="text-sm text-destructive">{getErrorMessage(error)}</p>;
};

const EditInstructorFormModal = ({
  open,
  onOpenChange,
  instructor,
}: EditInstructorFormModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      instructorId,
      payload,
    }: {
      instructorId: string;
      payload: IUpdateInstructorPayload;
    }) => updateInstructorAction(instructorId, payload),
  });

  const form = useForm({
    defaultValues: getInitialValues(instructor),
    onSubmit: async ({ value }) => {
      if (!instructor) {
        toast.error("Instructor not found");
        return;
      }

      const payload: IUpdateInstructorPayload = {
        name: value.name,
        contactNumber: value.contactNumber || undefined,
        address: value.address || undefined,
        bio: value.bio || undefined,
        qualification: value.qualification,
        experience: value.experience ? Number(value.experience) : undefined,
        currentWorkingPlace: value.currentWorkingPlace,
        designation: value.designation,
      };

      const result = await mutateAsync({
        instructorId: instructor.id,
        payload,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update instructor");
        return;
      }

      toast.success(result.message || "Instructor updated successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      void queryClient.refetchQueries({
        queryKey: ["instructors"],
        type: "active",
      });
      router.refresh();
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(getInitialValues(instructor));
    }
  }, [instructor, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] lg:w-[min(92vw,78rem)] lg:max-w-[min(92vw,78rem)] xl:w-[min(88vw,88rem)] xl:max-w-[min(88vw,88rem)] 2xl:w-[min(84vw,96rem)] 2xl:max-w-[min(84vw,96rem)]"
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit Instructor</DialogTitle>
          <DialogDescription>
            Update instructor profile information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="px-6 py-5">
            <form
              method="POST"
              action="#"
              noValidate
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <form.Field
                  name="name"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.name,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Full Name"
                      placeholder="Enter instructor name"
                    />
                  )}
                </form.Field>

                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <div className="bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm">
                    {instructor?.email ?? "N/A"}
                  </div>
                </div>

                <form.Field
                  name="contactNumber"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.contactNumber,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Contact Number"
                      placeholder="Enter contact number"
                    />
                  )}
                </form.Field>

                <form.Field
                  name="qualification"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.qualification,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Qualification"
                      placeholder="e.g. PhD, MSc"
                    />
                  )}
                </form.Field>

                <form.Field
                  name="experience"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.experience,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Experience"
                      type="number"
                      placeholder="Years of experience"
                    />
                  )}
                </form.Field>

                <form.Field
                  name="currentWorkingPlace"
                  validators={{
                    onChange:
                      editInstructorFormZodSchema.shape.currentWorkingPlace,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Current Working Place"
                      placeholder="Enter current workplace"
                    />
                  )}
                </form.Field>

                <form.Field
                  name="designation"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.designation,
                  }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Designation"
                      placeholder="Enter designation"
                    />
                  )}
                </form.Field>

                <form.Field
                  name="address"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.address,
                  }}
                >
                  {(field) => {
                    const firstError =
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null;

                    return (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={field.name}
                          className={cn(firstError && "text-destructive")}
                        >
                          Address
                        </Label>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          placeholder="Enter instructor address"
                          onBlur={field.handleBlur}
                          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={!!firstError}
                          className={cn(firstError && "border-destructive")}
                        />
                        <FieldMessage error={firstError} />
                      </div>
                    );
                  }}
                </form.Field>

                <form.Field
                  name="bio"
                  validators={{
                    onChange: editInstructorFormZodSchema.shape.bio,
                  }}
                >
                  {(field) => {
                    const firstError =
                      field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0
                        ? field.state.meta.errors[0]
                        : null;

                    return (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor={field.name}
                          className={cn(firstError && "text-destructive")}
                        >
                          Bio
                        </Label>
                        <Textarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          placeholder="Enter instructor bio"
                          onBlur={field.handleBlur}
                          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={!!firstError}
                          className={cn(firstError && "border-destructive")}
                        />
                        <FieldMessage error={firstError} />
                      </div>
                    );
                  }}
                </form.Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>

                <form.Subscribe
                  selector={(state) =>
                    [state.canSubmit, state.isSubmitting] as const
                  }
                >
                  {([canSubmit, isSubmitting]) => (
                    <AppSubmitButton
                      isPending={isSubmitting || isPending}
                      pendingLabel="Updating instructor..."
                      disabled={!canSubmit}
                      className="w-auto min-w-36"
                    >
                      Update Instructor
                    </AppSubmitButton>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditInstructorFormModal;
