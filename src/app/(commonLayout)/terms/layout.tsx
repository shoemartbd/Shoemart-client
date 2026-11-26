import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Terms & Conditions | Shoe Mart",
  "The terms for shopping and ordering at Shoe Mart.",
  "/terms",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
