"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Search,
  ShoppingCart,
  Heart,
  User,
  X,
  Boxes,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutUser } from "@/services/auth.services";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/types/user.types";
import { ISiteSetting } from "@/types/siteSetting.types";
import { getDefaultDashboardRoute, getProfileRoute } from "@/lib/authUtils";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { ThemeToggle } from "./ThemeToggle";
import ProductSearch from "./navbar/ProductSearch";
import TrackOrderPopover from "./navbar/TrackOrderPopover";
import WishlistSheet from "./navbar/WishlistSheet";
import MobileMenu from "./navbar/MobileMenu";
import CategoryBar from "./navbar/CategoryBar";

interface NavbarProps {
  className?: string;
  userInfo?: UserInfo | null;
  siteSettings?: ISiteSetting | null;
}

// Icon buttons sit on the red header
const iconButtonClass =
  "relative size-11 rounded-full text-white hover:bg-white/15 hover:text-white transition-colors";

const CountBadge = ({ count }: { count: number }) =>
  count > 0 ? (
    <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 justify-center p-0 px-1 text-[10px]">
      {count > 99 ? "99+" : count}
    </Badge>
  ) : null;

const Navbar = ({ userInfo, className, siteSettings }: NavbarProps) => {
  const router = useRouter();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();

  // Logo on the homepage: glide back to the top instead of doing nothing
  const scrollHomeToTop = () => {
    if (pathname !== "/") return;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const siteName = siteSettings?.siteName || "Shoe Mart";
  const logo = siteSettings?.logo || "/mainlogo.jpeg";
  const dashboardRoute = userInfo
    ? getDefaultDashboardRoute(userInfo.role)
    : "/dashboard";

  const profileRoute = userInfo
    ? getProfileRoute(userInfo.role)
    : "/dashboard/my-profile";

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  // Brand logo from Site Settings (falls back to public/mainlogo.jpeg). It sits on
  // a white tile that only shows as a tile in dark mode.
  const logoMark = (size: "sm" | "lg") => (
    <Image
      src={logo}
      alt={siteName}
      width={1293}
      height={854}
      priority
      sizes={size === "lg" ? "100px" : "80px"}
      className={cn(
        "w-auto rounded-lg bg-white object-contain p-0.5",
        size === "lg"
          ? "h-14 transition-transform group-hover:scale-105"
          : "h-11",
      )}
    />
  );

  return (
    <section
      className={cn(
        "sticky top-0 z-50 w-full shadow-sm transition-all duration-300",
        className,
      )}
    >
      {/* Red header: logo, search and actions */}
      <div className="bg-brand-red">
        <div className="container mx-auto px-4 md:px-8">
          {/* Desktop Menu */}
          <nav className="hidden h-20 items-center justify-between gap-6 lg:flex">
            <Link href="/" onClick={scrollHomeToTop} className="group flex shrink-0 items-center gap-2.5">
              {logoMark("lg")}
            </Link>

            <ProductSearch className="max-w-2xl flex-1" />

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/wholesale"
                className="mr-1 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-white hover:text-brand-red"
              >
                <Boxes className="size-4" />
                Wholesale Request
              </Link>
              <div className="flex items-center gap-1 border-r border-white/30 pr-3 mr-1">
                <TrackOrderPopover triggerClassName="size-11 text-white hover:bg-white/15 hover:text-white" />
                <WishlistSheet>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={iconButtonClass}
                    aria-label="Wishlist"
                    title="Wishlist"
                  >
                    <Heart className="size-6" />
                    <CountBadge count={wishlistCount} />
                  </Button>
                </WishlistSheet>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className={iconButtonClass}
                >
                  <Link href="/cart" aria-label="Cart" title="Cart">
                    <ShoppingCart className="size-6" />
                    <CountBadge count={cartCount} />
                  </Link>
                </Button>
                <ThemeToggle className="size-11 hover:bg-white/15" iconClassName="size-6" />
              </div>

              {userInfo ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="group relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-white/40 ring-offset-2 ring-offset-brand-red transition-all hover:ring-white"
                      aria-label="Account menu"
                    >
                      {userInfo.image ? (
                        <Image
                          src={userInfo.image}
                          alt={userInfo.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary/60 text-sm font-bold text-primary-foreground">
                          {userInfo.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3 px-1 py-1.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {userInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-semibold leading-none">
                            {userInfo.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                            {userInfo.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href={dashboardRoute} className="flex items-center">
                        <LayoutDashboard className="mr-3 h-4 w-4 text-primary" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                      <Link href={profileRoute} className="flex items-center">
                        <User className="mr-3 h-4 w-4 text-primary" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="font-semibold text-white hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="rounded-full px-5 font-bold shadow-md shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Link href="/register">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu — Home / Cart / Wishlist / Profile live in the bottom bar */}
          <div className="flex h-16 items-center justify-between gap-2 lg:hidden">
            <Link href="/" onClick={scrollHomeToTop} className="flex min-w-0 items-center gap-2">
              {logoMark("sm")}
            </Link>

            <div className="flex shrink-0 items-center">
              <Link
                href="/wholesale"
                className="mr-1 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-white hover:text-brand-red"
              >
                <Boxes className="size-3.5" />
                Wholesale
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full text-white hover:bg-white/15 hover:text-white"
                onClick={() => setIsMobileSearchOpen((v) => !v)}
                aria-label={isMobileSearchOpen ? "Close search" : "Search"}
                aria-expanded={isMobileSearchOpen}
              >
                {isMobileSearchOpen ? (
                  <X className="size-6" />
                ) : (
                  <Search className="size-6" />
                )}
              </Button>
              <TrackOrderPopover triggerClassName="size-10 text-white hover:bg-white/15 hover:text-white" />
              <ThemeToggle className="size-10 hover:bg-white/15" iconClassName="size-6" />
              <MobileMenu userInfo={userInfo} siteName={siteName} logo={logo} />
            </div>
          </div>

          {isMobileSearchOpen && (
            <div className="pb-3 lg:hidden">
              <ProductSearch
                autoFocus
                onDone={() => setIsMobileSearchOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      <CategoryBar />
    </section>
  );
};

export default Navbar;
