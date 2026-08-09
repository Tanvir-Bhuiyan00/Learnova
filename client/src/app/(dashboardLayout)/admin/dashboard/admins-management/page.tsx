"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInstructors } from "@/services/instructor.services";
import { useQuery } from "@tanstack/react-query";

const AdminsManagementPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-admins"],
    queryFn: () => getInstructors(),
  });

  const items: any[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Admins management
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Manage administrators
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-ink">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.designation || "—"}</TableCell>
                  <TableCell>
                    {item.isDeleted ? (
                      <Badge variant="destructive" className="rounded-full">Deleted</Badge>
                    ) : (
                      <Badge className="rounded-full">Active</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminsManagementPage;
