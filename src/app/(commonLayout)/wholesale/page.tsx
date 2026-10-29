import { Metadata } from "next";
import { getSiteSettings } from "@/services/siteSetting.services";
import WholesaleLanding from "./_components/WholesaleLanding";

export const metadata: Metadata = {
  title: "Wholesale Shoes in Bangladesh | Shoe Mart",
  description:
    "Buy shoes in bulk for your shop, online store or company. Send a wholesale request and the Shoe Mart team will call you with a quotation.",
};

export default async function WholesalePage() {
  const siteSettings = (await getSiteSettings()).data;
  return <WholesaleLanding phone={siteSettings?.phone ?? null} />;
}
