import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";

export const metadata: Metadata = privateMetadata("Track Order");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
