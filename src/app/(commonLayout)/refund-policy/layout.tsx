import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Refund & Return Policy | Shoe Mart",
  "How returns, exchanges and refunds work for orders from Shoe Mart.",
  "/refund-policy",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
