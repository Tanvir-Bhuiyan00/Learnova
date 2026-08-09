"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "@/services/auth.services";

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    const res = await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
    if (res.success) { toast.success("Password changed successfully"); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
    else { toast.error(res.message || "Failed to change password"); }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Update Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Changing..." : "Change Password"}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
