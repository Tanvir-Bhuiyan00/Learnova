"use client";

import { getInstructorByIdAction } from "@/app/(dashboardLayout)/admin/dashboard/instructors-management/_action";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type IInstructor, type IInstructorDetails } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface ViewInstructorProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructor: IInstructor | null;
}

const formatDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "N/A";
  }

  const dateValue = new Date(value);
  if (Number.isNaN(dateValue.getTime())) {
    return "N/A";
  }

  return format(dateValue, "MMM dd, yyyy hh:mm a");
};

const getAverageRating = (reviews: IInstructorDetails["reviews"]) => {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  const totalRating = reviews.reduce(
    (sum, review) => sum + (review.rating ?? 0),
    0,
  );
  return totalRating / reviews.length;
};

const ViewInstructorProfileDialog = ({
  open,
  onOpenChange,
  instructor,
}: ViewInstructorProfileDialogProps) => {
  const instructorId = instructor ? instructor.id : "";

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["instructor-details", instructorId],
    queryFn: () => getInstructorByIdAction(instructorId),
    enabled: open && instructorId.length > 0,
    staleTime: 1000 * 60,
  });

  const hasError = data && !data.success;
  const instructorDetails = data && "data" in data ? data.data : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] gap-0 overflow-hidden p-0 sm:w-[calc(100vw-3rem)] sm:max-w-[calc(100vw-3rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] lg:w-[min(92vw,78rem)] lg:max-w-[min(92vw,78rem)] xl:w-[min(88vw,88rem)] xl:max-w-[min(88vw,88rem)] 2xl:w-[min(84vw,96rem)] 2xl:max-w-[min(84vw,96rem)]">
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Instructor Profile</DialogTitle>
          <DialogDescription>
            Comprehensive profile view with instructor info, courses, and reviews.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-5.5rem)]">
          <div className="space-y-4 px-6 py-5">
            {(isLoading || isFetching) && (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Loading instructor details...
              </div>
            )}

            {hasError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {data.message || "Failed to load instructor details."}
              </div>
            )}

            {!isLoading && !isFetching && instructorDetails && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 text-sm font-semibold">Instructor Info</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Name:</span>{" "}
                        {instructorDetails.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {instructorDetails.email || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Contact:</span>{" "}
                        {instructorDetails.contactNumber || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Experience:</span>{" "}
                        {instructorDetails.experience ?? 0} years
                      </p>
                      <p>
                        <span className="font-medium">Qualification:</span>{" "}
                        {instructorDetails.qualification || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Designation:</span>{" "}
                        {instructorDetails.designation || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Current Workplace:</span>{" "}
                        {instructorDetails.currentWorkingPlace || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Average Rating:</span>{" "}
                        {instructorDetails.averageRating?.toFixed(1) || "0.0"}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {instructorDetails.address || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Bio:</span>{" "}
                        {instructorDetails.bio || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 text-sm font-semibold">User Account</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">User Name:</span>{" "}
                        {instructorDetails.user?.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">User Email:</span>{" "}
                        {instructorDetails.user?.email || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Role:</span>{" "}
                        {instructorDetails.user?.role || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>{" "}
                        {instructorDetails.user?.status || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Email Verified:</span>{" "}
                        {instructorDetails.user?.emailVerified ? "Yes" : "No"}
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDateTime(instructorDetails.user?.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-semibold">Courses</h3>
                  <div className="space-y-2">
                    {instructorDetails.courses?.length ? (
                      instructorDetails.courses.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-md border p-2 text-sm"
                        >
                          <p>
                            <span className="font-medium">Title:</span>{" "}
                            {course.title || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Price:</span>{" "}
                            {course.price ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <Badge variant="secondary">{course.status}</Badge>
                          </p>
                          <p>
                            <span className="font-medium">Rating:</span>{" "}
                            {course.averageRating?.toFixed(1) || "0.0"}
                          </p>
                          <p>
                            <span className="font-medium">Students:</span>{" "}
                            {course.totalStudents ?? 0}
                          </p>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No courses available.
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 text-sm font-semibold">Reviews</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Total: {instructorDetails.reviews?.length ?? 0}, Average:{" "}
                    {getAverageRating(instructorDetails.reviews).toFixed(1)}
                  </p>
                  <div className="space-y-2">
                    {(instructorDetails.reviews ?? [])
                      .slice(0, 5)
                      .map((review, index) => (
                        <div
                          key={review.id ?? `review-${index}`}
                          className="rounded-md border p-2 text-sm"
                        >
                          <p>
                            <span className="font-medium">Rating:</span>{" "}
                            {review.rating ?? "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Comment:</span>{" "}
                            {review.comment || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(review.createdAt)}
                          </p>
                        </div>
                      ))}
                    {!instructorDetails.reviews?.length && (
                      <p className="text-sm text-muted-foreground">
                        No reviews available.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInstructorProfileDialog;
