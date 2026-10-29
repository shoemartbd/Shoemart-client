import AdminAccessGuard from "@/components/modules/Dashboard/AdminAccessGuard";
import { getUserInfo } from "@/services/auth.services";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userInfo = await getUserInfo();

  return (
    <AdminAccessGuard
      permissions={userInfo?.permissions ?? null}
      name={userInfo?.name}
      roleName={userInfo?.staffRoleName}
    >
      {children}
    </AdminAccessGuard>
  );
}
