"use client";

import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";

interface WishlistContextType {
  wishlistItems: IProduct[];
  addToWishlist: (product: IProduct) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<IProduct[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shoemart_wishlist");
      if (stored) {
        setWishlistItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to parse wishlist from local storage", error);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage whenever wishlist changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("shoemart_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isInitialized]);

  const addToWishlist = (product: IProduct) => {
    if (!wishlistItems.some((item) => item.id === product.id)) {
      pushEcommerceEvent("add_to_wishlist", [productToGtmItem(product)]);
    }
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        toast.info(`${product.name} is already in your wishlist`);
        return prev;
      }
      toast.success(`${product.name} added to wishlist`);
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    toast.success("Item removed from wishlist");
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
