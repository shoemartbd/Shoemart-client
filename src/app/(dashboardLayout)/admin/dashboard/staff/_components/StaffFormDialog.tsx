"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStaffUser, updateStaffUser } from "@/services/staff.services";
import { IStaffRole, IStaffUser } from "@/types/staff.types";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: IStaffUser | null; // present = edit mode
  roles: IStaffRole[];
  onSuccess: () => void;
}

export default function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  roles,
  onSuccess,
}: StaffFormDialogProps) {
  const isEdit = Boolean(staff);
  const [name, setName] = useState(staff?.name ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [staffRoleId, setStaffRoleId] = useState(staff?.staffRole?.id ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!isEdit && !email.trim()) return toast.error("Email is required");
    if (!staffRoleId) return toast.error("Select a role");
    if ((!isEdit || password) && password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setIsSaving(true);
    try {
      if (staff) {
        await updateStaffUser(staff.id, {
          name: name.trim(),
          phone: phone.trim(),
          staffRoleId,
          ...(password && { password }),
        });
        toast.success(
          password
            ? "Staff updated. They need to log in again with the new password."
            : "Staff updated",
        );
      } else {
        await createStaffUser({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          password,
          staffRoleId,
        });
        toast.success("Staff account created. They can log in now.");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Staff" : "Add Staff"}</DialogTitle>
          <DialogDescription>
            Staff log in from the normal login page with this email and
            password, and only see what their role allows.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 py-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="staff-name">Name *</Label>
              <Input
                id="staff-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input
                id="staff-phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="staff-email">Email *</Label>
              <Input
                id="staff-email"
                type="email"
                autoComplete="off"
                value={email}
                disabled={isEdit}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Role *</Label>
              <Select value={staffRoleId} onValueChange={setStaffRoleId}>
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No roles yet.{" "}
                  <Link href="/admin/dashboard/roles" className="text-primary hover:underline">
                    Create one
                  </Link>
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="staff-password">
                {isEdit ? "New password" : "Password *"}
              </Label>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={isEdit ? "Leave empty to keep" : "Min 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="min-w-28">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
