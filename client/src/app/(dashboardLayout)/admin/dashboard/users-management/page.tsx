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
import { getStudents } from "@/services/student.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type Tab = "students" | "instructors";

const UsersManagementPage = () => {
  const [tab, setTab] = useState<Tab>("students");

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["users-students"],
    queryFn: () => getStudents(),
    enabled: tab === "students",
  });

  const { data: instructorsData, isLoading: instructorsLoading } = useQuery({
    queryKey: ["users-instructors"],
    queryFn: () => getInstructors(),
    enabled: tab === "instructors",
  });

  const students = studentsData?.data ?? [];
  const instructors = instructorsData?.data ?? [];
  const isLoading = tab === "students" ? studentsLoading : instructorsLoading;
  const items = tab === "students" ? students : instructors;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-sm text-muted-foreground">Manage students and instructors</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("students")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "students" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setTab("instructors")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "instructors" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          Instructors
        </button>
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
                {tab === "instructors" && <TableHead>Qualification</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  {tab === "instructors" && <TableCell>{item.qualification || "—"}</TableCell>}
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

export default UsersManagementPage;
