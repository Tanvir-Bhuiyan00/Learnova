"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserInfo } from "@/services/auth.services";
import { UserInfo } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const MyProfilePage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-info"],
    queryFn: () => getUserInfo(),
  });

  const user: UserInfo | null = data ?? null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My profile
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Your account information.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-3xl" />
      ) : (
        <Card className="ring-1 ring-border">
          <div className="flex flex-col items-center gap-4 border-b border-canvas-soft p-8 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary-pale font-heading text-3xl font-extrabold text-ink-deep">
              {getInitials(user?.name ?? "") || "U"}
            </div>
            <div>
              <h2 className="flex items-center justify-center gap-1.5 font-heading text-2xl font-extrabold text-ink">
                {user?.name}
                <ShieldCheck className="size-5 text-positive" />
              </h2>
              <p className="mt-1 text-sm capitalize text-mute-text">
                {user?.role?.toLowerCase().replace("_", " ")}
              </p>
            </div>
            <Badge variant={user?.emailVerified ? "default" : "secondary"} className="rounded-full">
              {user?.emailVerified ? "Email verified" : "Email not verified"}
            </Badge>
          </div>

          <CardContent className="space-y-4 p-8">
            <div className="space-y-2">
              <Label htmlFor="profile-name" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Name
              </Label>
              <Input id="profile-name" value={user?.name || ""} readOnly className="rounded-xl border-border bg-canvas-soft/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
                <Input id="profile-email" value={user?.email || ""} readOnly className="rounded-xl border-border bg-canvas-soft/50 pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Role
              </Label>
              <Input id="profile-role" value={user?.role?.toLowerCase().replace("_", " ") || ""} readOnly className="rounded-xl border-border bg-canvas-soft/50 capitalize" />
            </div>

            <Link href="/change-password">
              <Button variant="outline" className="mt-2 gap-2 rounded-full">
                <KeyRound className="size-4" />
                Change password
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProfilePage;
