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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admins Management</h1>
        <p className="text-sm text-muted-foreground">Manage administrators</p>
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
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
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.designation || "—"}</TableCell>
                  <TableCell>{item.isDeleted ? <Badge variant="destructive">Deleted</Badge> : <Badge>Active</Badge>}</TableCell>
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
