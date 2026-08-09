"use client";

import { deleteInstructorAction } from "@/app/(dashboardLayout)/admin/dashboard/instructors-management/_action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type IInstructor } from "@/types/instructor.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteInstructorConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor: IInstructor | null;
}

const DeleteInstructorConfirmationDialog = ({
  open,
  onOpenChange,
  instructor,
}: DeleteInstructorConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteInstructorAction,
  });

  const handleConfirmDelete = async () => {
    if (!instructor) {
      toast.error("Instructor not found");
      return;
    }

    const result = await mutateAsync(instructor.id);

    if (!result.success) {
      toast.error(result.message || "Failed to delete instructor");
      return;
    }

    toast.success(result.message || "Instructor deleted successfully");
    onOpenChange(false);

    void queryClient.invalidateQueries({ queryKey: ["instructors"] });
    void queryClient.refetchQueries({ queryKey: ["instructors"], type: "active" });
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {instructor?.name ?? "this instructor"}?
            This action will mark the instructor and linked user as deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              void handleConfirmDelete();
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteInstructorConfirmationDialog;
