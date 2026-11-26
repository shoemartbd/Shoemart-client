import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Contact Us | Shoe Mart",
  "Call, email or message Shoe Mart for orders, delivery and returns anywhere in Bangladesh.",
  "/contact",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
