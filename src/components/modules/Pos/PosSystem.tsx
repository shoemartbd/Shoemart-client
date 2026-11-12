/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import PosProductGrid from "./PosProductGrid";
import PosCartSidebar from "./PosCartSidebar";
import { getPosProducts, getPosCart, addToPosCart } from "@/services/pos.services";
import { Loader2, ScanBarcode, Search, X } from "lucide-react";
import { toast } from "sonner";

// Typing waits this long before searching; a barcode scanner ends with Enter,
// which searches at once
const SEARCH_DELAY_MS = 300;

export default function PosSystem() {
  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Only the latest search may update the grid
  const requestId = useRef(0);
  // Skip the typed-search that follows a scan of the same text
  const lastScan = useRef<string | null>(null);

  const fetchProducts = async (query = "") => {
    const id = ++requestId.current;
    setIsLoadingProducts(true);
    const res = await getPosProducts(query);
    if (id !== requestId.current) return res;
    if (res?.success) {
      setProducts(res.data);
    } else {
      toast.error(res?.message || "Failed to load products");
    }
    setIsLoadingProducts(false);
    return res;
  };

  const fetchCart = async () => {
    setIsLoadingCart(true);
    const res = await getPosCart();
    if (res?.success) {
      setCartItems(res.data);
    }
    setIsLoadingCart(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
    inputRef.current?.focus();
  }, []);

  // Search as you type (a few letters or words are enough); also loads the
  // full list on first open
  useEffect(() => {
    const term = searchTerm.trim();
    if (lastScan.current !== null && lastScan.current === term) return;
    const timer = setTimeout(() => fetchProducts(term), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Enter (what a barcode scanner sends): search now, and if the code is a
  // product / variant barcode, put it straight into the cart
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term || isScanning) return;
    lastScan.current = term;
    setIsScanning(true);
    try {
      const res = await fetchProducts(term);
      const hit = res?.success ? (res.data as any[]).find((p) => p.scanMatch) : null;
      if (!hit) {
        if (res?.success && res.data.length === 0) toast.error(`No product for "${term}"`);
        return;
      }

      const variant = hit.scanMatch?.variantId
        ? hit.variants?.find((v: any) => v.id === hit.scanMatch.variantId)
        : null;
      if (hit.type === "VARIABLE" && hit.variants?.length > 0 && !variant) {
        toast.info(`${hit.name}: choose the size / colour`);
        return;
      }
      const stock = variant ? variant.quantity : hit.stock;
      if (typeof stock === "number" && stock <= 0) {
        toast.error(`${hit.name}${variant ? ` (${variant.combination})` : ""} is out of stock`);
        return;
      }

      const added = await addToPosCart({
        productId: hit.id,
        productVariantId: variant?.id ?? null,
        productName: hit.name,
        price: variant?.sellPrice ?? hit.sellPrice ?? 0,
        quantity: 1,
        combination: variant?.combination ?? null,
        productImage: variant?.image || hit.images?.[0] || null,
      });
      if (added?.success) {
        toast.success(`Added: ${hit.name}${variant ? ` (${variant.combination})` : ""}`);
        fetchCart();
        // Ready for the next scan
        setSearchTerm("");
        lastScan.current = "";
        fetchProducts("");
      } else {
        toast.error(added?.message || "Failed to add to cart");
      }
    } finally {
      setIsScanning(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden gap-4">
      {/* LEFT: Product Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-3 justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Point of Sale</h2>
          <form onSubmit={handleSubmit} className="relative w-full sm:w-96">
            <ScanBarcode className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              autoComplete="off"
              placeholder="Scan barcode or type name / SKU"
              aria-label="Scan barcode or search products"
              className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => {
                lastScan.current = null;
                setSearchTerm(e.target.value);
              }}
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {(isLoadingProducts || isScanning) && <Loader2 className="size-4 animate-spin text-primary" />}
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="rounded-md bg-primary p-1.5 text-white hover:bg-primary/90"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50" data-lenis-prevent>
          {isLoadingProducts && products.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <PosProductGrid products={products} refreshCart={fetchCart} />
          )}
        </div>
      </div>

      {/* RIGHT: Cart Sidebar */}
      <div className="w-[400px] bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {isLoadingCart ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <PosCartSidebar cartItems={cartItems} refreshCart={fetchCart} />
        )}
      </div>
    </div>
  );
}
