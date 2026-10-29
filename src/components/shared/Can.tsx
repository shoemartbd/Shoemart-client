"use client";

import { usePermissions } from "@/providers/PermissionProvider";

// Renders children only when the current staff role has the permission.
// Usable from server components: <Can permission="product.create">...</Can>
export default function Can({
  permission,
  children,
}: {
  permission: string | string[];
  children: React.ReactNode;
}) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : null;
}
