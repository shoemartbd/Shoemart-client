"use client";

import React, { useState, useEffect } from "react";
import PosProductGrid from "./PosProductGrid";
import PosCartSidebar from "./PosCartSidebar";
import { getPosProducts, getPosCart } from "@/services/pos.services";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PosSystem() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async (query = "") => {
    setIsLoadingProducts(true);
    const res = await getPosProducts(query);
    if (res?.success) {
      setProducts(res.data);
    } else {
      toast.error(res?.message || "Failed to load products");
    }
    setIsLoadingProducts(false);
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
    fetchProducts();
    fetchCart();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchProducts(searchTerm);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden gap-4">
      {/* LEFT: Product Selection */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Point of Sale</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Search
            </button>
          </form>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50" data-lenis-prevent>
          {isLoadingProducts ? (
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
