"use client";

import { createElement, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronDown, FileText } from "lucide-react";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavChild, NavItem } from "@/types/dashboard.types";

// A sidebar item with sub-links (e.g. Online Orders → Pending, Confirmed, ...).
// Opens by itself while one of its pages is showing; the chevron toggles it.
export default function NavItemGroup({
  item,
  isActive,
}: {
  item: NavItem & { children: NavChild[] };
  isActive: boolean;
}) {
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? isActive;

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Link href={item.href} className="flex flex-1 items-center gap-3 px-3 py-2">
          {createElement(getIconComponent(item.icon), { className: "h-4 w-4" })}
          <span className="flex-1">{item.title}</span>
        </Link>
        <button
          type="button"
          onClick={() => setManualOpen(!open)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${item.title}`}
          className="mr-1 rounded-md p-1.5 hover:bg-background/60"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="ml-5 mt-1 space-y-0.5 border-l pl-2">
          {/* useSearchParams needs a Suspense boundary; links still render without it */}
          <Suspense fallback={<ChildLinks items={item.children} activeHref={null} />}>
            <ActiveChildLinks items={item.children} enabled={isActive} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function ActiveChildLinks({ items, enabled }: { items: NavChild[]; enabled: boolean }) {
  const searchParams = useSearchParams();
  // "All" is the bare list; a status link matches the orderStatus in the URL
  const status = searchParams.get("orderStatus");
  const activeHref = enabled
    ? (items.find((c) => (status ? c.href.endsWith(`orderStatus=${status}`) : !c.href.includes("?")))
        ?.href ?? null)
    : null;
  return <ChildLinks items={items} activeHref={activeHref} />;
}

function ChildLinks({ items, activeHref }: { items: NavChild[]; activeHref: string | null }) {
  return items.map((child) => {
    const active = child.href === activeHref;
    return (
      <Link
        key={child.href}
        href={child.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
          active
            ? "bg-primary font-semibold text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        {child.title}
      </Link>
    );
  });
}
