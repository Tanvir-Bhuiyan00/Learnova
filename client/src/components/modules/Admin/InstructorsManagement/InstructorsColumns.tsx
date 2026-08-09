import DateCell from "@/components/shared/cell/DateCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import { IInstructor } from "@/types/instructor.types";
import { ColumnDef } from "@tanstack/react-table";
import { Star } from "lucide-react";

export const instructorColumns: ColumnDef<IInstructor>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Instructor",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.name}
        email={row.original.email}
        profilePhoto={row.original.profilePhoto ?? undefined}
      />
    ),
  },
  {
    id: "qualification",
    accessorKey: "qualification",
    header: "Qualification",
    cell: ({ row }) => (
      <span className="text-sm">{row.original?.qualification || "N/A"}</span>
    ),
  },
  {
    id: "designation",
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => (
      <span className="text-sm">{row.original?.designation || "N/A"}</span>
    ),
  },
  {
    id: "currentWorkingPlace",
    accessorKey: "currentWorkingPlace",
    header: "Working At",
    cell: ({ row }) => (
      <span className="text-sm">{row.original?.currentWorkingPlace || "N/A"}</span>
    ),
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact Number",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.original?.contactNumber || "N/A"}</span>
      </div>
    ),
  },
  {
    id: "experience",
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium">
          {row.original.experience ?? 0} years
        </span>
      );
    },
  },
  {
    id: "averageRating",
    accessorKey: "averageRating",
    header: "Rating",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">
            {row.original.averageRating?.toFixed(1) || "0.0"}
          </span>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "user.status",
    header: "Status",
    cell: ({ row }) => {
      return <StatusBadgeCell status={row.original.user.status} />;
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Joined On",
    cell: ({ row }) => {
      return (
        <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />
      );
    },
  },
];
