"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Ban,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteStaffUser,
  getStaffRoles,
  getStaffUsers,
  updateStaffUser,
} from "@/services/staff.services";
import { IStaffUser } from "@/types/staff.types";
import { cn } from "@/lib/utils";
import StaffFormDialog from "./StaffFormDialog";
import { confirmAction } from "@/lib/confirmAction";

export default function StaffView({ initialRoleId }: { initialRoleId: string }) {
  const queryClient = useQueryClient();
  const [roleId, setRoleId] = useState(initialRoleId);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IStaffUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: roles = [] } = useQuery({
    queryKey: ["staff-roles"],
    queryFn: () => getStaffRoles(),
  });

  const { data: staff = [], isLoading, isFetching } = useQuery({
    queryKey: ["staff-users", roleId, debounced],
    queryFn: () =>
      getStaffUsers({
        ...(roleId && { staffRoleId: roleId }),
        ...(debounced && { searchTerm: debounced }),
      }),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["staff-users"] });
    void queryClient.invalidateQueries({ queryKey: ["staff-roles"] });
  };

  const openForm = (member: IStaffUser | null) => {
    setEditing(member);
    setFormOpen(true);
  };

  const toggleBlock = async (member: IStaffUser) => {
    const blocking = member.status === "ACTIVE";
    if (
      blocking &&
      !(await confirmAction({
        title: `Block ${member.name}?`,
        text: "They will be logged out and can't sign in until unblocked.",
        confirmText: "Block",
      }))
    ) {
      return;
    }
    setBusyId(member.id);
    try {
      await updateStaffUser(member.id, { status: blocking ? "BLOCKED" : "ACTIVE" });
      toast.success(blocking ? "Staff blocked" : "Staff unblocked");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (member: IStaffUser) => {
    const ok = await confirmAction({
      title: `Delete ${member.name}'s staff account?`,
      text: "This can't be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusyId(member.id);
    try {
      await deleteStaffUser(member.id);
      toast.success("Staff account deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const tabs = [{ id: "", name: "All" }, ...roles.map((r) => ({ id: r.id, name: r.name }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Staff</h3>
          <p className="text-muted-foreground">
            Managers and staff who work in the dashboard with limited access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/dashboard/roles">
              <ShieldCheck className="mr-2 size-4" />
              Roles
            </Link>
          </Button>
          <Button className="rounded-full" onClick={() => openForm(null)}>
            <Plus className="mr-2 size-4" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id || "all"}
              type="button"
              onClick={() => setRoleId(tab.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                roleId === tab.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40",
              )}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or phone"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : staff.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <UserCog className="size-10 text-muted-foreground/50" />
            <p className="font-semibold">No staff yet</p>
            <p className="text-sm text-muted-foreground">
              {roles.length === 0
                ? "Create a role first, then add staff."
                : "Add a staff account to get started."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {member.staffRole?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{member.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          member.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400",
                        )}
                      >
                        {member.status === "ACTIVE" ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9"
                          onClick={() => openForm(member)}
                          aria-label={`Edit ${member.name}`}
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-9"
                          disabled={busyId === member.id}
                          onClick={() => toggleBlock(member)}
                          aria-label={member.status === "ACTIVE" ? "Block" : "Unblock"}
                          title={member.status === "ACTIVE" ? "Block" : "Unblock"}
                        >
                          {member.status === "ACTIVE" ? (
                            <Ban className="size-4 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="size-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="size-9"
                          disabled={busyId === member.id}
                          onClick={() => handleDelete(member)}
                          aria-label={`Delete ${member.name}`}
                          title="Delete"
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
      </div>

      {formOpen && (
        <StaffFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          staff={editing}
          roles={roles}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
