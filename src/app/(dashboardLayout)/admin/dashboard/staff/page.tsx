import { Metadata } from "next";
import StaffView from "./_components/StaffView";

export const metadata: Metadata = {
  title: "Staff | Admin Dashboard",
  description: "Staff accounts and their dashboard roles",
};

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return <StaffView initialRoleId={role ?? ""} />;
}
