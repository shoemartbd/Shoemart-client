"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStaffRole, getStaffRoles } from "@/services/staff.services";
import { IStaffRole } from "@/types/staff.types";
import RoleFormDialog from "./_components/RoleFormDialog";
import { confirmAction } from "@/lib/confirmAction";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IStaffRole | null>(null);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["staff-roles"],
    queryFn: () => getStaffRoles(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["staff-roles"] });

  const openForm = (role: IStaffRole | null) => {
    setEditing(role);
    setFormOpen(true);
  };

  const handleDelete = async (role: IStaffRole) => {
    const ok = await confirmAction({ title: `Delete the role "${role.name}"?`, confirmText: "Delete" });
    if (!ok) return;
    try {
      await deleteStaffRole(role.id);
      toast.success("Role deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Roles & Access</h3>
          <p className="text-muted-foreground">
            Create roles like Manager or Staff and choose what each can open.
            Admins always have full access.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => openForm(null)}>
          <Plus className="mr-2 size-4" />
          Add Role
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : roles.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
          <ShieldCheck className="size-10 text-muted-foreground/50" />
          <p className="font-semibold">No roles yet</p>
          <p className="text-sm text-muted-foreground">
            Add a role, then create staff accounts with it.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Access</th>
                <th className="px-4 py-3 font-semibold">Staff</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold">{role.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {role.permissions.length} permissions
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/dashboard/staff?role=${role.id}`}
                      className="inline-flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <Users className="size-4" />
                      {role._count?.users ?? 0}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9"
                        onClick={() => openForm(role)}
                        aria-label={`Edit ${role.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="size-9"
                        onClick={() => handleDelete(role)}
                        aria-label={`Delete ${role.name}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <RoleFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          role={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
