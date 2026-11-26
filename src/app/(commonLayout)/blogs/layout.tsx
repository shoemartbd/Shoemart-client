import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "Blog | Shoe Mart",
  "Shoe care tips, style guides and news from Shoe Mart, your online shoe store in Bangladesh.",
  "/blogs",
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
