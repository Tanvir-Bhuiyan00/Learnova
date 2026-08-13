"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserInfoCell from "@/components/shared/cell/UserInfoCell";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import { getAdmins } from "@/services/admin.services";
import { IAdmin } from "@/types/admin.types";
import { UserStatus } from "@/types/instructor.types";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Pencil, ShieldCheck, Trash2 } from "lucide-react";

interface AdminsManagementContentProps {
  isSuperAdmin: boolean;
}

const AdminsManagementContent = ({
  isSuperAdmin,
}: AdminsManagementContentProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-admins-list"],
    queryFn: () => getAdmins("limit=100"),
  });

  const admins: IAdmin[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Admins management
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          {isSuperAdmin
            ? "View and manage administrators. Edit and delete are limited to super admins."
            : "View-only list of administrators. Edit and delete require super admin access."}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed p-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-canvas-soft">
            <ShieldCheck className="size-7 text-mute-text" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">
              No admins found
            </h3>
            <p className="mt-1 text-sm text-mute-text">
              Administrators will appear here once added.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {isSuperAdmin && <TableHead className="w-28">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <UserInfoCell
                      name={admin.name}
                      email={admin.email}
                      profilePhoto={admin.profilePhoto ?? undefined}
                    />
                  </TableCell>
                  <TableCell>{admin.designation || "—"}</TableCell>
                  <TableCell>
                    <StatusBadgeCell
                      status={admin.user?.status ?? UserStatus.ACTIVE}
                    />
                  </TableCell>
                  <TableCell>
                    <DateCell date={admin.createdAt} />
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-mute-text hover:text-ink"
                          title="Edit admin"
                          aria-label={`Edit ${admin.name}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-mute-text hover:bg-negative/10 hover:text-negative"
                          title="Delete admin"
                          aria-label={`Delete ${admin.name}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isSuperAdmin && admins.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl bg-card p-4 text-sm text-mute-text ring-1 ring-border">
          <Inbox className="size-4" />
          Full admin editing (update / delete) is enforced by the API for super
          admins only.
        </div>
      )}
    </div>
  );
};

export default AdminsManagementContent;
