/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { getUserInfo } from "@/services/auth.services";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from "@/services/cart.services";
import { productToGtmItem, pushEcommerceEvent } from "@/lib/gtm";

interface CartItem extends IProduct {
  cartQuantity: number;
  productVariantId?: string | null;
  variant?: any;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: IProduct, quantity?: number, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  clearCart: () => void;
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Keep auth state in sync across client-side page navigations
  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      const isAuthRelevantRoute =
        pathname === "/cart" ||
        pathname === "/checkout" ||
        pathname === "/login" ||
        pathname === "/register" ||
        prevPathname === "/login" ||
        prevPathname === "/register";

      if (isAuthRelevantRoute) {
        getUserInfo()
          .then((user) => {
            setIsAuthenticated(!!user);
          })
          .catch(() => {
            setIsAuthenticated(false);
          });
      }
    }
  }, [pathname, prevPathname]);

  // Check auth status client-side reliably using our custom backend's user info
  useEffect(() => {
    getUserInfo()
      .then((user) => {
        setIsAuthenticated(!!user);
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setSessionChecked(true);
      });
  }, []);

  const fetchCartFromDb = useCallback(async () => {
    const res = await getCart();
    if (res?.success && res?.data) {
      const dbItems =
        res.data.items?.map((item: any) => ({
          ...item.product,
          cartQuantity: item.quantity,
          productVariantId: item.productVariantId,
          variant: item.productVariant,
        })) || [];
      setCartItems(dbItems);
    } else {
      // Fallback to localStorage for guests
      const storedCart = localStorage.getItem("shoemart_cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch {
          console.error("Failed to parse cart data");
        }
      }
    }
  }, []);

  // Fetch cart once we know the auth state
  useEffect(() => {
    if (!sessionChecked) return;
    fetchCartFromDb();
  }, [sessionChecked, isAuthenticated, fetchCartFromDb]);

  // Persist cart to localStorage for guest users only
  useEffect(() => {
    if (sessionChecked && !isAuthenticated) {
      localStorage.setItem("shoemart_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, sessionChecked]);

  const addToCart = async (product: IProduct, quantity: number = 1, variantId: string | null = null) => {
    let currentAuth = isAuthenticated;
    if (!currentAuth) {
      const user = await getUserInfo();
      if (user) {
        setIsAuthenticated(true);
        currentAuth = true;
      }
    }

    if (!currentAuth) {
      toast.error("Please login to add items to your cart");
      router.push("/login");
      return;
    }

    const variantObj =
      variantId && product.variants ? product.variants.find((v: any) => v.id === variantId) : null;

    // Optimistic UI update
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.productVariantId === variantId);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.productVariantId === variantId
            ? { ...item, cartQuantity: item.cartQuantity + quantity }
            : item,
        );
      }

      return [...prev, { ...product, cartQuantity: quantity, productVariantId: variantId, variant: variantObj }];
    });

    const res = await apiAddToCart(product.id, quantity, variantId);
    if (res?.success) {
      toast.success(`${product.name} added to cart`);
      pushEcommerceEvent("add_to_cart", [
        productToGtmItem(product, { quantity, variant: variantObj }),
      ]);
    } else {
      toast.error(res?.message || "Failed to add to cart");
      fetchCartFromDb(); // Revert on failure
    }
  };

  const updateQuantity = async (productId: string, quantity: number, variantId: string | null = null) => {
    if (!isAuthenticated) return;
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.productVariantId === variantId
          ? { ...item, cartQuantity: quantity }
          : item,
      ),
    );

    const res = await apiUpdateCartItemQuantity(productId, quantity, variantId);
    if (!res?.success) {
      toast.error(res?.message || "Failed to update quantity");
      fetchCartFromDb();
    }
  };

  const removeFromCart = async (productId: string, variantId: string | null = null) => {
    if (!isAuthenticated) return;

    const removed = cartItems.find(
      (item) => item.id === productId && item.productVariantId === variantId,
    );
    if (removed) {
      pushEcommerceEvent("remove_from_cart", [
        productToGtmItem(removed, { quantity: removed.cartQuantity, variant: removed.variant }),
      ]);
    }

    setCartItems((prev) => prev.filter((item) => !(item.id === productId && item.productVariantId === variantId)));

    const res = await apiRemoveFromCart(productId, variantId);
    if (!res?.success) {
      toast.error("Failed to remove item");
      fetchCartFromDb();
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    setCartItems([]);
    const res = await apiClearCart();
    if (!res?.success) {
      fetchCartFromDb();
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.cartQuantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, refreshCart: fetchCartFromDb }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
