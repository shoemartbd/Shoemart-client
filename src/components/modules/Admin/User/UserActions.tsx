"use client";

import {
  changeUserRoleAction,
  changeUserStatusAction,
} from "@/app/(dashboardLayout)/admin/dashboard/users/_action";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IUser } from "@/types/user.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Shield, UserCog, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

const UserActions = ({ user }: { user: IUser }) => {
  const queryClient = useQueryClient();

  const { mutate: changeStatus, isPending: isStatusPending } = useMutation({
    mutationFn: async (status: IUser["status"]) =>
      changeUserStatusAction(user.id, status),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(result.message);
      }
    },
  });

  const { mutate: changeRole, isPending: isRolePending } = useMutation({
    mutationFn: async (role: IUser["role"]) =>
      changeUserRoleAction(user.id, role),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(result.message);
      }
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Role Management */}
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Change Role
        </DropdownMenuLabel>
        {user.role !== "ADMIN" && (
          <DropdownMenuItem onClick={() => changeRole("ADMIN")} disabled={isRolePending}>
            <Shield className="mr-2 h-4 w-4" />
            Make Admin
          </DropdownMenuItem>
        )}
        {user.role !== "USER" && (
          <DropdownMenuItem onClick={() => changeRole("USER")} disabled={isRolePending}>
            <UserCog className="mr-2 h-4 w-4" />
            Make Customer
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Status Management */}
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Account Status
        </DropdownMenuLabel>
        {user.status === "ACTIVE" ? (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => changeStatus("BLOCKED")}
            disabled={isStatusPending}
          >
            <UserMinus className="mr-2 h-4 w-4" />
            Block User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-primary focus:text-primary"
            onClick={() => changeStatus("ACTIVE")}
            disabled={isStatusPending}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Activate User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
