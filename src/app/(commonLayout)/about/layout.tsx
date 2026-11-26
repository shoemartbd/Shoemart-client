import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "About Us | Shoe Mart",
  "Shoe Mart is an online shoe store in Bangladesh for men, women and kids: quality footwear, fair prices and delivery across the country.",
  "/about",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
