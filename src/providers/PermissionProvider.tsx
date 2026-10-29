"use client";

import { createContext, useContext } from "react";
import { hasPermission, isStaff, Permissions } from "@/lib/permissions";

const PermissionContext = createContext<Permissions>(null);

export function PermissionProvider({
  permissions,
  children,
}: {
  permissions: Permissions;
  children: React.ReactNode;
}) {
  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
}

// can("order.delete") -> hide buttons the current staff role can't use
export function usePermissions() {
  const permissions = useContext(PermissionContext);
  return {
    permissions,
    isStaff: isStaff(permissions),
    can: (needed: string | string[]) => hasPermission(permissions, needed),
  };
}
