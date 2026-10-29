"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  createStaffRole,
  getPermissionGroups,
  updateStaffRole,
} from "@/services/staff.services";
import { IStaffRole } from "@/types/staff.types";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: IStaffRole | null; // present = edit mode
  onSuccess: () => void;
}

// Tri-state for "select all" boxes
const checkState = (selected: number, total: number) =>
  selected === 0 ? false : selected === total ? true : ("indeterminate" as const);

export default function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleFormDialogProps) {
  const [name, setName] = useState(role?.name ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role?.permissions ?? []),
  );
  const [isSaving, setIsSaving] = useState(false);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["staff-permissions"],
    queryFn: () => getPermissionGroups(),
    staleTime: Infinity,
  });

  const allKeys = groups.flatMap((g) => g.permissions.map((p) => p.key));

  const toggle = (keys: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { name: name.trim(), permissions: Array.from(selected) };
      if (role) {
        await updateStaffRole(role.id, payload);
        toast.success("Role updated. Staff get the new access right away.");
      } else {
        await createStaffRole(payload);
        toast.success("Role created");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Add Role"}</DialogTitle>
          <DialogDescription>
            Pick what staff with this role can see and do in the dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="role-name">Role name *</Label>
            <Input
              id="role-name"
              placeholder="e.g. Manager, Staff, Content Writer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold">
                  Permissions{" "}
                  <span className="font-normal text-muted-foreground">
                    ({selected.size} of {allKeys.length})
                  </span>
                </p>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary">
                  <Checkbox
                    checked={checkState(selected.size, allKeys.length)}
                    onCheckedChange={(v) => toggle(allKeys, v === true)}
                  />
                  Select all
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {groups.map((group) => {
                  const keys = group.permissions.map((p) => p.key);
                  const count = keys.filter((k) => selected.has(k)).length;
                  return (
                    <div key={group.group} className="rounded-xl border p-4">
                      <label className="mb-3 flex cursor-pointer items-center gap-2 border-b pb-2 text-sm font-bold">
                        <Checkbox
                          checked={checkState(count, keys.length)}
                          onCheckedChange={(v) => toggle(keys, v === true)}
                        />
                        {group.group}
                        <span className="ml-auto text-xs font-normal text-muted-foreground">
                          {count}/{keys.length}
                        </span>
                      </label>
                      <div className="space-y-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission.key}
                            className="flex cursor-pointer items-start gap-2 text-sm"
                          >
                            <Checkbox
                              className="mt-0.5"
                              checked={selected.has(permission.key)}
                              onCheckedChange={(v) =>
                                toggle([permission.key], v === true)
                              }
                            />
                            {permission.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="min-w-28">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save Role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
