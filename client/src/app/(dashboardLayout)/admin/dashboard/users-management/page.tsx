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
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Users management
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Manage students and instructors
        </p>
      </div>

      <div className="inline-flex gap-1 rounded-full bg-canvas-soft p-1">
        <button
          onClick={() => setTab("students")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "students" ? "bg-ink-solid text-white shadow-sm" : "text-body-text hover:text-ink"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setTab("instructors")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            tab === "instructors" ? "bg-ink-solid text-white shadow-sm" : "text-body-text hover:text-ink"
          }`}
        >
          Instructors
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
          <Table>
            <TableHeader className="[&_tr]:bg-canvas-soft/70">
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
                  <TableCell className="font-medium text-ink">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  {tab === "instructors" && <TableCell>{item.qualification || "—"}</TableCell>}
                  <TableCell>{item.isDeleted ? <Badge variant="destructive" className="rounded-full">Deleted</Badge> : <Badge className="rounded-full">Active</Badge>}</TableCell>
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
