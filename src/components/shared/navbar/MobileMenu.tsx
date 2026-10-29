"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  LogOut,
  MoreVertical,
  PackageSearch,
  User,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getAllCategories } from "@/services/category.services";
import { logoutUser } from "@/services/auth.services";
import { getDefaultDashboardRoute, getProfileRoute } from "@/lib/authUtils";
import { ICategory } from "@/types/category.types";
import { UserInfo } from "@/types/user.types";
import { cn } from "@/lib/utils";
import { TrackOrderForm } from "./TrackOrderPopover";

interface MobileMenuProps {
  userInfo?: UserInfo | null;
  siteName: string;
}

// ⋮ menu on small screens: categories with their subcategories, order
// tracking and account actions
export default function MobileMenu({ userInfo, siteName }: MobileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showTrack, setShowTrack] = useState(false);

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });
  const categories = ((data?.data ?? []) as ICategory[]).filter(
    (c) => c.isActive !== false && !c.parentId,
  );

  const close = () => setOpen(false);

  const handleLogout = async () => {
    close();
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
          <MoreVertical className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-[380px] gap-0 p-0">
        <SheetHeader className="border-b p-5 text-left">
          <SheetTitle>
            <Link href="/" onClick={close} className="flex items-center gap-2">
              <Image
                src="/logo.jpeg"
                alt={siteName}
                width={1293}
                height={854}
                sizes="80px"
                className="h-12 w-auto rounded-lg bg-white object-contain p-0.5"
              />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">Site menu</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          {/* Categories */}
          <div className="p-5 pb-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <LayoutGrid className="size-4" />
              Categories
            </p>
            <ul className="space-y-0.5">
              {categories.length === 0 && (
                <li className="py-2 text-sm text-muted-foreground">Loading...</li>
              )}
              {categories.map((category) => {
                const subs = (category.subcategories ?? []).filter(
                  (s) => s.isActive !== false,
                );
                const isExpanded = expandedId === category.id;
                return (
                  <li key={category.id}>
                    <div className="flex items-center">
                      <Link
                        href={`/products?categoryId=${category.id}`}
                        onClick={close}
                        className="flex-1 rounded-lg px-2 py-2.5 text-sm font-semibold hover:bg-muted hover:text-primary"
                      >
                        {category.name}
                      </Link>
                      {subs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : category.id)}
                          aria-label={`${isExpanded ? "Hide" : "Show"} ${category.name} subcategories`}
                          aria-expanded={isExpanded}
                          className="rounded-lg p-2.5 text-muted-foreground hover:bg-muted"
                        >
                          <ChevronDown
                            className={cn("size-4 transition-transform", isExpanded && "rotate-180")}
                          />
                        </button>
                      )}
                    </div>
                    {isExpanded && (
                      <ul className="mb-1 ml-3 border-l pl-3">
                        {subs.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?categoryId=${sub.id}`}
                              onClick={close}
                              className="block rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-primary"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Track order */}
          <div className="border-t p-5">
            <button
              type="button"
              onClick={() => setShowTrack((v) => !v)}
              aria-expanded={showTrack}
              className="flex w-full items-center gap-3 rounded-xl border px-4 h-12 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors"
            >
              <PackageSearch className="size-5 text-primary" />
              Track Order
              <ChevronDown
                className={cn("ml-auto size-4 transition-transform", showTrack && "rotate-180")}
              />
            </button>
            {showTrack && (
              <div className="mt-3 rounded-xl border p-4">
                <TrackOrderForm onSubmitted={close} />
              </div>
            )}
          </div>
        </div>

        {/* Account */}
        <div className="border-t bg-muted/30 p-5">
          {userInfo ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{userInfo.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{userInfo.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="h-11 justify-start gap-2 rounded-xl">
                  <Link href={getDefaultDashboardRoute(userInfo.role)} onClick={close}>
                    <LayoutDashboard className="size-4 text-primary" />
                    Dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 justify-start gap-2 rounded-xl">
                  <Link href={getProfileRoute(userInfo.role)} onClick={close}>
                    <User className="size-4 text-primary" />
                    Profile
                  </Link>
                </Button>
              </div>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="h-11 gap-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-11 gap-2 rounded-xl font-bold">
                <Link href="/login" onClick={close}>
                  <LogIn className="size-4" />
                  Login
                </Link>
              </Button>
              <Button asChild className="h-11 gap-2 rounded-xl font-bold">
                <Link href="/register" onClick={close}>
                  <UserPlus className="size-4" />
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
