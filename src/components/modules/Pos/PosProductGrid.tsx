"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { addToPosCart } from "@/services/pos.services";

export default function PosProductGrid({ products, refreshCart }: { products: any[], refreshCart: () => void }) {
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const handleAddSimple = async (product: any) => {
    setAddingId(product.id);
    const payload = {
      productId: product.id,
      productName: product.name,
      price: product.sellPrice,
      quantity: 1,
      productImage: product.images?.[0] || null,
    };
    
    const res = await addToPosCart(payload);
    if (res?.success) {
      toast.success("Added to cart");
      refreshCart();
    } else {
      toast.error(res?.message || "Failed to add to cart");
    }
    setAddingId(null);
  };

  const handleProductClick = (product: any) => {
    if (product.type === "VARIABLE" && product.variants?.length > 0) {
      setSelectedProduct(product);
    } else {
      handleAddSimple(product);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
          >
            <div className="aspect-square relative overflow-hidden bg-gray-50">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Image
                </div>
              )}
              {/* Type Badge */}
              {product.type === "VARIABLE" && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                  Options
                </div>
              )}
            </div>

            <div className="p-3 flex flex-col flex-grow">
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="mt-auto flex justify-between items-end">
                <span className="font-bold text-gray-900">
                  ৳{product.sellPrice?.toFixed(2) || "0.00"}
                </span>
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    addingId === product.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white"
                  }`}
                  disabled={addingId === product.id}
                >
                  {addingId === product.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
            <p className="text-lg font-medium">No products found</p>
          </div>
        )}
      </div>

      {/* Variant Selection Modal */}
      {selectedProduct && (
        <VariantModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdded={() => {
            setSelectedProduct(null);
            refreshCart();
          }}
        />
      )}
    </>
  );
}

function VariantModal({ product, onClose, onAdded }: { product: any, onClose: () => void, onAdded: () => void }) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!selectedVariant) return toast.error("Please select a variant");
    
    setIsAdding(true);
    const payload = {
      productId: product.id,
      productVariantId: selectedVariant.id,
      productName: product.name,
      price: selectedVariant.sellPrice ?? product.sellPrice ?? 0,
      quantity: 1,
      combination: selectedVariant.combination || null,
      productImage: selectedVariant.image || product.images?.[0] || null,
    };
    
    const res = await addToPosCart(payload);
    setIsAdding(false);
    
    if (res?.success) {
      toast.success("Added to cart");
      onAdded();
    } else {
      toast.error(res?.message || "Failed to add to cart");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Select Variant</p>
            <h3 className="font-bold text-gray-800 text-base line-clamp-1">{product.name}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: split layout */}
        <div className="flex">
          {/* Left: image preview */}
          <div className="w-44 flex-shrink-0 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-center p-4 gap-3">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100">
              {(selectedVariant?.image || product.images?.[0]) ? (
                <Image
                  src={selectedVariant?.image || product.images[0]}
                  alt={selectedVariant?.combination || product.name}
                  fill
                  className="object-cover transition-all duration-300"
                  sizes="176px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
              )}
            </div>
            {selectedVariant ? (
              <div className="text-center">
                <p className="text-xs font-semibold text-primary line-clamp-2">{selectedVariant.combination}</p>
                <p className="text-base font-black text-gray-800 mt-1">৳{(selectedVariant.sellPrice ?? 0).toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center leading-relaxed">Select a variant to see preview</p>
            )}
          </div>

          {/* Right: variant list */}
          <div className="flex-1 max-h-72 overflow-y-auto p-3 space-y-2" data-lenis-prevent>
            {product.variants.map((variant: any) => {
              const isSelected = selectedVariant?.id === variant.id;
              const variantImg = variant.image || product.images?.[0];
              const outOfStock = variant.quantity === 0;
              return (
                <div
                  key={variant.id}
                  onClick={() => !outOfStock && setSelectedVariant(variant)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-150 ${
                    outOfStock
                      ? "border-gray-100 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                      : "border-gray-100 hover:border-primary/40 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className={`relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${isSelected ? "border-primary/50" : "border-gray-100"}`}>
                    {variantImg ? (
                      <Image src={variantImg} alt={variant.combination} fill className="object-cover" sizes="44px" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-gray-800"}`}>
                      {variant.combination}
                    </p>
                    <p className="text-xs mt-0.5">
                      <span className={`font-medium ${variant.quantity > 0 ? "text-green-600" : "text-red-500"}`}>
                        {outOfStock ? "Out of stock" : `Stock: ${variant.quantity}`}
                      </span>
                    </p>
                  </div>

                  {/* Price + check */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-sm font-bold ${isSelected ? "text-primary" : "text-gray-700"}`}>
                      ৳{(variant.sellPrice ?? product.sellPrice ?? 0).toFixed(2)}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-3">
          {selectedVariant ? (
            <p className="flex-1 text-sm text-gray-500 truncate">
              Selected: <span className="font-semibold text-gray-800">{selectedVariant.combination}</span>
            </p>
          ) : (
            <p className="flex-1 text-sm text-gray-400 italic">No variant selected</p>
          )}
          <button
            onClick={handleAdd}
            disabled={!selectedVariant || isAdding}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-primary-dark hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2 text-sm"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

