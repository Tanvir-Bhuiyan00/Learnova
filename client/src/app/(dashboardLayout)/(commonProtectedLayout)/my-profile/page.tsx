"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInfo } from "@/services/auth.services";
import { UserInfo } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";

const MyProfilePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-info"],
    queryFn: () => getUserInfo(),
  });

  const user: UserInfo | null = data ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      {isLoading ? <Skeleton className="h-64" /> : (
        <Card>
          <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={user?.name || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={user?.role || ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email Verified</Label>
              <Input value={user?.emailVerified ? "Yes" : "No"} readOnly />
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/change-password"}>Change Password</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProfilePage;
