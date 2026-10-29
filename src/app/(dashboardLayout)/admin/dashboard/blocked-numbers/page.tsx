import { Metadata } from "next";
import BlockedNumbersView from "./_components/BlockedNumbersView";

export const metadata: Metadata = {
  title: "Blocked Numbers | Admin Dashboard",
  description: "Phone numbers that can't place orders",
};

export default async function BlockedNumbersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  return <BlockedNumbersView initialSearch={search ?? ""} />;
}
