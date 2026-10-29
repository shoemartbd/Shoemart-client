"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIconComponent } from "@/lib/iconMapper";
import { getNavItemsByRole } from "@/lib/navItems";
import { canAccessAdminPath, Permissions } from "@/lib/permissions";
import { PermissionProvider } from "@/providers/PermissionProvider";

interface AdminAccessGuardProps {
  permissions: Permissions;
  name?: string;
  roleName?: string | null;
  children: React.ReactNode;
}

// Staff opening a page their role doesn't include see a notice instead of a
// page full of failing requests. The API refuses these calls anyway.
export default function AdminAccessGuard({
  permissions,
  name,
  roleName,
  children,
}: AdminAccessGuardProps) {
  const pathname = usePathname();

  if (canAccessAdminPath(permissions, pathname)) {
    return <PermissionProvider permissions={permissions}>{children}</PermissionProvider>;
  }

  // Dashboard home without sales access: a welcome with their sections
  if (pathname === "/admin/dashboard") {
    const sections = getNavItemsByRole("ADMIN", permissions).filter(
      (section) => section.title,
    );
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-2 md:p-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Welcome{name ? `, ${name}` : ""} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {roleName ? `You're signed in as ${roleName}. ` : ""}
            Here is everything you can work on.
          </p>
        </div>
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => {
                const Icon = getIconComponent(item.icon);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="flex-1 font-semibold">{item.title}</span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldAlert className="size-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-black">No access</h2>
        <p className="text-muted-foreground">
          {roleName ? `The ${roleName} role` : "Your role"} doesn&apos;t include
          this section. Ask an admin if you need it.
        </p>
        <Button asChild className="rounded-full">
          <Link href="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
