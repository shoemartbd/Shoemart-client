"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Percent, Truck } from "lucide-react";
import { updatePosCartItemQuantity, removePosCartItem, clearPosCart } from "@/services/pos.services";
import { toast } from "sonner";
import PosCheckoutModal from "./PosCheckoutModal";
import { confirmAction } from "@/lib/confirmAction";

export default function PosCartSidebar({ cartItems, refreshCart }: { cartItems: any[], refreshCart: () => void }) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Discount state
  const [discountType, setDiscountType] = useState<"flat" | "percentage">("flat");
  const [discountValue, setDiscountValue] = useState<number | "">("");

  // VAT state
  const [vatPercent, setVatPercent] = useState<number | "">("");

  // Shipping, entered by hand (e.g. when the walk-in order is delivered)
  const [shippingValue, setShippingValue] = useState<number | "">("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calculate discount amount
  const discountAmount = discountValue === "" ? 0
    : discountType === "percentage"
    ? (subtotal * Number(discountValue)) / 100
    : Number(discountValue);

  const discountCapped = Math.min(discountAmount, subtotal);
  const afterDiscount = Math.max(0, subtotal - discountCapped);

  // Calculate VAT on discounted amount
  const vatAmount = vatPercent === "" ? 0 : (afterDiscount * Number(vatPercent)) / 100;

  const shippingCharge = shippingValue === "" ? 0 : Math.max(0, Number(shippingValue));

  const total = afterDiscount + vatAmount + shippingCharge;

  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleUpdateQuantity = async (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    setIsUpdating(id);
    const res = await updatePosCartItemQuantity(id, newQty);
    if (res?.success) {
      refreshCart();
    } else {
      toast.error(res?.message || "Failed to update quantity");
    }
    setIsUpdating(null);
  };

  const handleRemove = async (id: string) => {
    setIsUpdating(id);
    const res = await removePosCartItem(id);
    if (res?.success) {
      refreshCart();
    } else {
      toast.error(res?.message || "Failed to remove item");
    }
    setIsUpdating(null);
  };

  const handleClearCart = async () => {
    const ok = await confirmAction({ title: "Clear the cart?", text: "All items will be removed.", confirmText: "Clear" });
    if (!ok) return;
    const res = await clearPosCart();
    if (res?.success) {
      refreshCart();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Current Order
        </h2>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" data-lenis-prevent>
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium">Cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors relative group">
              {/* Image */}
              <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 relative">
                {item.productImage ? (
                  <Image src={item.productImage} alt={item.productName} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-1 pr-6">{item.productName}</h4>
                  {item.combination && (
                    <p className="text-xs text-gray-500 mt-0.5">{item.combination}</p>
                  )}
                </div>
                <div className="flex justify-between items-end mt-2">
                  <span className="font-bold text-primary">৳{fmt(item.price * item.quantity)}</span>

                  {/* Qty Controls */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      disabled={item.quantity <= 1 || isUpdating === item.id}
                      className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-gray-600 hover:text-primary hover:shadow-sm disabled:opacity-50 transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      disabled={isUpdating === item.id}
                      className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-gray-600 hover:text-primary hover:shadow-sm transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Remove btn */}
              <button
                onClick={() => handleRemove(item.id)}
                disabled={isUpdating === item.id}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {cartItems.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">

          {/* Discount Row */}
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "flat" | "percentage")}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
            >
              <option value="flat">৳ Fixed</option>
              <option value="percentage">% Off</option>
            </select>
            <input
              type="number"
              min={0}
              max={discountType === "percentage" ? 100 : subtotal}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Discount"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-0"
            />
          </div>

          {/* VAT Row */}
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 flex-shrink-0">VAT %</span>
            <input
              type="number"
              min={0}
              max={100}
              value={vatPercent}
              onChange={(e) => setVatPercent(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="e.g. 5"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-0"
            />
          </div>

          {/* Shipping Row */}
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 flex-shrink-0">Shipping ৳</span>
            <input
              type="number"
              min={0}
              value={shippingValue}
              onChange={(e) => setShippingValue(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-0"
            />
          </div>

          {/* Summary Lines */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">৳{fmt(subtotal)}</span>
            </div>
            {discountCapped > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {discountType === "percentage" ? `(${discountValue}%)` : ""}</span>
                <span className="font-medium">-৳{fmt(discountCapped)}</span>
              </div>
            )}
            {vatAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT ({vatPercent}%)</span>
                <span className="font-medium text-gray-900">+৳{fmt(vatAmount)}</span>
              </div>
            )}
            {shippingCharge > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">+৳{fmt(shippingCharge)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-800">Total</span>
              <span className="text-2xl font-black text-primary">৳{fmt(total)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cartItems.length === 0}
            className="w-full py-3.5 mt-1 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Proceed to Pay
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <PosCheckoutModal
          subtotal={subtotal}
          discount={discountCapped}
          vatAmount={vatAmount}
          shippingCharge={shippingCharge}
          total={total}
          cartItems={cartItems}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setDiscountValue("");
            setVatPercent("");
            setShippingValue("");
            refreshCart();
          }}
        />
      )}
    </>
  );
}
