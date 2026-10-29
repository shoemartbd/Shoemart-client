import { Metadata } from "next";
import LowStockView from "./_components/LowStockView";

export const metadata: Metadata = {
  title: "Low Stock | Admin Dashboard",
  description: "Products and variants running out of stock",
};

export default async function LowStockPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "out" || type === "low" ? type : "all";

  return <LowStockView initialType={initialType} />;
}
