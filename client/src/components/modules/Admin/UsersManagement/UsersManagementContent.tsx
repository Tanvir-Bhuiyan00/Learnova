"use client";

import { changeUserRoleAction, changeUserStatusAction } from "@/app/(dashboardLayout)/admin/dashboard/users-management/_action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdmins } from "@/services/admin.services";
import { getInstructors } from "@/services/instructor.services";
import { getStudents } from "@/services/student.services";
import { IAdmin } from "@/types/admin.types";
import { UserRole } from "@/lib/authUtils";
import { IInstructor, UserStatus } from "@/types/instructor.types";
import { IStudent } from "@/types/student.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Ban, Inbox, ShieldCheck, ShieldPlus, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Tab = "users" | "instructors" | "admins";

interface UsersManagementContentProps {
  isSuperAdmin: boolean;
}

interface UserRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

const roleStyles: Record<string, string> = {
  STUDENT: "bg-emerald-50 text-emerald-700",
  INSTRUCTOR: "bg-sky-50 text-sky-700",
  ADMIN: "bg-violet-50 text-violet-700",
  SUPER_ADMIN: "bg-violet-100 text-violet-800",
};

const roleBadge = (role: string) => (
  <Badge
    variant="outline"
    className={`rounded-full px-2.5 py-0.5 ${roleStyles[role] ?? "bg-canvas-soft text-mute-text"}`}
  >
    {role.replace("_", " ")}
  </Badge>
);

const statusBadge = (status: string) =>
  status === UserStatus.ACTIVE ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-negative/10 px-2.5 py-0.5 text-xs font-semibold text-negative">
      <span className="size-1.5 rounded-full bg-negative" />
      Blocked
    </span>
  );

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const UsersManagementContent = ({ isSuperAdmin }: UsersManagementContentProps) => {
  const [tab, setTab] = useState<Tab>("users");
  const [roleTarget, setRoleTarget] = useState<UserRow | null>(null);
  const [newRole, setNewRole] = useState<UserRole | null>(null);
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ["users-management", "students"],
    queryFn: () => getStudents("limit=100"),
    enabled: tab === "users",
  });
  const instructorsQuery = useQuery({
    queryKey: ["users-management", "instructors"],
    queryFn: () => getInstructors("limit=100"),
    enabled: tab === "users" || tab === "instructors",
  });
  const adminsQuery = useQuery({
    queryKey: ["users-management", "admins"],
    queryFn: () => getAdmins("limit=100"),
    enabled: tab === "admins",
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["users-management"] });
  };

  const statusMutation = useMutation({
    mutationFn: changeUserStatusAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "User status updated");
        invalidateAll();
      } else {
        toast.error(result.message || "Failed to update user status");
      }
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const roleMutation = useMutation({
    mutationFn: changeUserRoleAction,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || "User role updated");
        setRoleTarget(null);
        setNewRole(null);
        invalidateAll();
      } else {
        toast.error(result.message || "Failed to change user role");
      }
    },
    onError: () => toast.error("Failed to change user role"),
  });

  const students = (studentsQuery.data?.data ?? []) as IStudent[];
  const instructors = (instructorsQuery.data?.data ?? []) as IInstructor[];
  const admins = (adminsQuery.data?.data ?? []) as IAdmin[];

  const userRows: UserRow[] =
    tab === "users"
      ? [
          ...students.map((s) => ({
            id: s.id,
            userId: s.userId,
            name: s.name,
            email: s.email,
            role: "STUDENT" as UserRole,
            status: (s.user?.status as UserStatus) ?? UserStatus.ACTIVE,
            createdAt: s.createdAt,
          })),
          ...instructors.map((i) => ({
            id: i.id,
            userId: i.userId,
            name: i.name,
            email: i.email,
            role: "INSTRUCTOR" as UserRole,
            status: i.user?.status ?? UserStatus.ACTIVE,
            createdAt: i.createdAt,
          })),
        ]
      : tab === "instructors"
        ? instructors.map((i) => ({
            id: i.id,
            userId: i.userId,
            name: i.name,
            email: i.email,
            role: "INSTRUCTOR" as UserRole,
            status: i.user?.status ?? UserStatus.ACTIVE,
            createdAt: i.createdAt,
          }))
        : admins.map((a) => ({
            id: a.id,
            userId: a.userId,
            name: a.name,
            email: a.email,
            role: (a.user?.role ?? "ADMIN") as UserRole,
            status: a.user?.status ?? UserStatus.ACTIVE,
            createdAt: a.createdAt,
          }));

  const isLoading =
    tab === "users"
      ? studentsQuery.isLoading || instructorsQuery.isLoading
      : tab === "instructors"
        ? instructorsQuery.isLoading
        : adminsQuery.isLoading;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    {
      key: "users",
      label: "Users",
      count:
        studentsQuery.isSuccess || instructorsQuery.isSuccess
          ? students.length + instructors.length
          : undefined,
    },
    {
      key: "instructors",
      label: "Instructors",
      count: instructorsQuery.isSuccess ? instructors.length : undefined,
    },
    {
      key: "admins",
      label: "Admins",
      count: adminsQuery.isSuccess ? admins.length : undefined,
    },
  ];

  const openRoleDialog = (row: UserRow) => {
    setRoleTarget(row);
    setNewRole(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Users management
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Manage students, instructors, and admins. Role changes are limited to
          super admins.
        </p>
      </div>

      <div className="inline-flex gap-1 rounded-full bg-canvas-soft p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-ink-solid text-white shadow-sm"
                : "text-body-text hover:text-ink"
            }`}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold ${
                  tab === t.key ? "bg-white/20" : "bg-canvas-soft"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : userRows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed p-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-3xl bg-canvas-soft">
            <Inbox className="size-7 text-mute-text" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">
              No {tab} found
            </h3>
            <p className="mt-1 text-sm text-mute-text">
              {tab === "admins"
                ? "No administrators yet."
                : "Nothing here yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-52">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRows.map((row) => (
                <TableRow key={`${tab}-${row.id}`}>
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-bold text-ink-deep">
                        {getInitials(row.name) || "U"}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {row.name}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{roleBadge(row.role)}</TableCell>
                  <TableCell>{statusBadge(row.status)}</TableCell>
                  <TableCell className="text-sm text-mute-text">
                    {format(new Date(row.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {row.status === UserStatus.ACTIVE ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              userId: row.userId,
                              userStatus: UserStatus.BLOCKED,
                            })
                          }
                        >
                          <Ban className="size-3.5" /> Block
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs text-emerald-600"
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              userId: row.userId,
                              userStatus: UserStatus.ACTIVE,
                            })
                          }
                        >
                          <ShieldCheck className="size-3.5" /> Unblock
                        </Button>
                      )}

                      {isSuperAdmin ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-xs text-indigo-600"
                          onClick={() => openRoleDialog(row)}
                        >
                          <UserCog className="size-3.5" /> Change Role
                        </Button>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full bg-canvas-soft px-3 py-1.5 text-xs font-medium text-mute-text"
                          title="Only super admins can change roles"
                        >
                          <ShieldPlus className="size-3.5" />
                          Role locked
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={roleTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRoleTarget(null);
            setNewRole(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Change the role for {roleTarget?.name}. Their existing data is
              kept, but future permissions follow the new role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="role-select">New role</Label>
            <Select
              value={newRole ?? undefined}
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger id="role-select" className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    "STUDENT",
                    "INSTRUCTOR",
                    "ADMIN",
                    "SUPER_ADMIN",
                  ] as const
                ).map((role) => (
                  <SelectItem key={role} value={role} disabled={role === roleTarget?.role}>
                    {role.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRoleTarget(null);
                setNewRole(null);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!newRole || roleMutation.isPending}
              onClick={() =>
                roleTarget &&
                newRole &&
                roleMutation.mutate({ userId: roleTarget.userId, role: newRole })
              }
            >
              {roleMutation.isPending ? "Changing..." : "Change Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagementContent;
