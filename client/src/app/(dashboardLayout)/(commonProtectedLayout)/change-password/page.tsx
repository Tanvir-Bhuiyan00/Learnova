"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/services/auth.services";
import { KeyRound, Lock } from "lucide-react";

const ChangePasswordPage = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    const res = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    if (res.success) {
      toast.success("Password changed successfully");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(res.message || "Failed to change password");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Change password
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Keep your account secure with a strong password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="ring-1 ring-border">
          <CardContent className="space-y-4 p-8">
            <div className="flex items-center gap-3 rounded-2xl bg-primary-pale p-4">
              <Lock className="size-5 text-ink-deep" />
              <p className="text-sm font-medium text-ink-deep">
                Use at least 8 characters with a mix of letters, numbers, and
                symbols.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Current password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                New password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
                className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-full"
              size="lg"
              disabled={loading}
            >
              <KeyRound className="size-4" />
              {loading ? "Changing..." : "Change password"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
