"use client";

import { cn } from "@/lib/utils";

// A small round swatch for colour names the browser understands ("Red",
// "Navy Blue" -> navyblue); unknown names (e.g. "Chocolate Mix") show none.
// Only rendered after user interaction (dialog / picked lines), never in SSR.
export default function ColorDot({ name, className }: { name: string; className?: string }) {
  const css = name.trim().toLowerCase().replace(/\s+/g, "");
  if (typeof CSS === "undefined" || !CSS.supports("color", css)) return null;
  return (
    <span
      aria-hidden
      className={cn("inline-block size-3 shrink-0 rounded-full border border-black/15", className)}
      style={{ backgroundColor: css }}
    />
  );
}
