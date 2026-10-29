"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/providers/CartProvider";
import { useWishlist } from "@/providers/WishlistProvider";
import { getProfileRoute } from "@/lib/authUtils";
import { UserInfo } from "@/types/user.types";
import { cn } from "@/lib/utils";
import WishlistSheet from "./WishlistSheet";

const itemClass =
  "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// Fixed tab bar on phones and tablets: Home, Cart, Wishlist, Profile
export default function MobileBottomNav({ userInfo }: { userInfo?: UserInfo | null }) {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const profileHref = userInfo ? getProfileRoute(userInfo.role) : "/login";
  const tone = (active: boolean) =>
    active ? "text-primary" : "text-muted-foreground hover:text-foreground";

  return (
    <>
      {/* Keeps the footer clear of the fixed bar */}
      <div className="h-16 lg:hidden" aria-hidden />

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden"
      >
        <div className="mx-auto flex h-16 max-w-lg items-stretch">
          <Link href="/" className={cn(itemClass, tone(pathname === "/"))}>
            <Home className="size-6" />
            Home
          </Link>

          <Link href="/cart" className={cn(itemClass, tone(pathname === "/cart"))}>
            <span className="relative">
              <ShoppingCart className="size-6" />
              <CountBadge count={cartCount} />
            </span>
            Cart
          </Link>

          <WishlistSheet>
            <button type="button" className={cn(itemClass, tone(false))}>
              <span className="relative">
                <Heart className="size-6" />
                <CountBadge count={wishlistCount} />
              </span>
              Wishlist
            </button>
          </WishlistSheet>

          <Link
            href={profileHref}
            className={cn(itemClass, tone(pathname === profileHref))}
          >
            <User className="size-6" />
            Profile
          </Link>
        </div>
      </nav>
    </>
  );
}
