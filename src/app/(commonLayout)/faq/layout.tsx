import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "FAQ | Shoe Mart",
  "Answers about ordering, delivery charges, cash on delivery, sizes, exchanges and returns at Shoe Mart.",
  "/faq",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
