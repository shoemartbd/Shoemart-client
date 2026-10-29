"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Printer, Trash2, X, Loader2, Package } from "lucide-react";
import { getAllProducts } from "@/services/product.services";
import { getSiteSettings } from "@/services/siteSetting.services";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Barcode from "@/components/Barcode";

interface ProductVariant {
  id: string;
  productId: string;
  combination: string;
  sku: string | null;
  quantity: number;
  purchasePrice: number;
  regularPrice: number;
  sellPrice: number;
  image: string | null;
}

interface QueueRow {
  key: string;
  productId: string;
  variantId?: string;
  name: string;
  skuOrVariantLabel: string;
  sku: string | null;
  regularPrice: number;
  sellPrice: number;
  copies: number;
}

const fmt = (v: number) => `৳${v.toFixed(2)}`;

export default function PrintLabelsPage() {
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [variantPickerProduct, setVariantPickerProduct] =
    useState<IProduct | null>(null);

  const { data: siteSettingsRes } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
    staleTime: 10 * 60 * 1000,
  });
  const storeName = siteSettingsRes?.data?.siteName || "";

  const queuedKeys = new Set(queue.map((r) => r.key));

  const addSimpleProduct = (product: IProduct) => {
    const key = `${product.id}-base`;
    if (queuedKeys.has(key)) {
      toast.error("This product is already in the print queue");
      return;
    }

    setQueue((prev) => [
      ...prev,
      {
        key,
        productId: product.id,
        name: product.name,
        skuOrVariantLabel: product.sku || "No SKU",
        sku: product.sku ?? null,
        regularPrice: product.regularPrice,
        sellPrice: product.sellPrice,
        copies: 1,
      },
    ]);
    toast.success(`${product.name} added to print queue`);
  };

  const addVariants = (product: IProduct, variants: ProductVariant[]) => {
    setQueue((prev) => {
      const existingKeys = new Set(prev.map((r) => r.key));
      const newRows: QueueRow[] = variants
        .filter((v) => !existingKeys.has(`${product.id}-${v.id}`))
        .map((v) => ({
          key: `${product.id}-${v.id}`,
          productId: product.id,
          variantId: v.id,
          name: product.name,
          skuOrVariantLabel: v.sku ? `${v.sku} (${v.combination})` : v.combination,
          sku: v.sku ?? null,
          regularPrice: v.regularPrice,
          sellPrice: v.sellPrice,
          copies: 1,
        }));
      return [...prev, ...newRows];
    });
    toast.success(`${variants.length} variant(s) added to print queue`);
    setVariantPickerProduct(null);
  };

  const updateCopies = (key: string, copies: number) => {
    setQueue((prev) =>
      prev.map((r) => (r.key === key ? { ...r, copies: Math.max(1, copies) } : r))
    );
  };

  const removeRow = (key: string) => {
    setQueue((prev) => prev.filter((r) => r.key !== key));
  };

  const handleProductSelect = (product: IProduct) => {
    if (product.type === "VARIABLE" && (product.variants?.length ?? 0) > 0) {
      setVariantPickerProduct(product);
    } else {
      addSimpleProduct(product);
    }
  };

  const totalLabels = queue.reduce((sum, r) => sum + r.copies, 0);

  const handlePrint = () => window.print();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Barcode Label Printer</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Search for products, build a print queue, and print barcode labels
        </p>
      </div>

      <ProductSearchBox queuedKeys={queuedKeys} onSelect={handleProductSelect} />

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Products to Print</h3>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name (SKU &amp; Variant)</TableHead>
              <TableHead>Reg. Price</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Num of Copies</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No products added yet. Search above to add products.
                </TableCell>
              </TableRow>
            ) : (
              queue.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium text-sm">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.skuOrVariantLabel}</p>
                  </TableCell>
                  <TableCell>{fmt(row.regularPrice)}</TableCell>
                  <TableCell>{fmt(row.sellPrice)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={row.copies}
                      onChange={(e) =>
                        updateCopies(row.key, parseInt(e.target.value, 10) || 1)
                      }
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      onClick={() => removeRow(row.key)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-sm font-semibold">Total Labels: {totalLabels}</p>
          <Button
            type="button"
            onClick={handlePrint}
            disabled={queue.length === 0}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Printer />
            Generate &amp; Print Labels
          </Button>
        </div>
      </div>

      {variantPickerProduct && (
        <VariantPickerModal
          product={variantPickerProduct}
          queuedKeys={queuedKeys}
          onClose={() => setVariantPickerProduct(null)}
          onAdd={(variants) => addVariants(variantPickerProduct, variants)}
        />
      )}

      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div id="label-print-sheet" className="label-print-grid">
          {queue.flatMap((row) =>
            Array.from({ length: row.copies }).map((_, i) => (
              <div key={`${row.key}-${i}`} className="label-print-card">
                {storeName && (
                  <p className="text-[9px] font-bold uppercase tracking-wide leading-tight line-clamp-1">
                    {storeName}
                  </p>
                )}
                <p className="text-[10px] font-semibold leading-tight line-clamp-1">
                  {row.name}
                </p>
                <p className="text-[9px] text-gray-600 leading-tight line-clamp-1">
                  {row.skuOrVariantLabel}
                </p>
                {row.sku ? (
                  <Barcode value={row.sku} />
                ) : (
                  <span className="text-[9px] italic text-gray-500">No SKU</span>
                )}
                <p className="text-[10px] font-bold">
                  {fmt(row.sellPrice)}
                  {row.regularPrice !== row.sellPrice && (
                    <span className="ml-1 font-normal text-gray-500 line-through">
                      {fmt(row.regularPrice)}
                    </span>
                  )}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSearchBox({
  queuedKeys,
  onSelect,
}: {
  queuedKeys: Set<string>;
  onSelect: (product: IProduct) => void;
}) {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedTerm(term.trim()), 300);
    return () => clearTimeout(timeout);
  }, [term]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, isFetching } = useQuery({
    queryKey: ["print-labels-product-search", debouncedTerm],
    queryFn: () => getAllProducts({ searchTerm: debouncedTerm, limit: "10" }),
    enabled: debouncedTerm.length > 0,
  });

  const results: IProduct[] = data?.data ?? [];

  return (
    <div ref={containerRef} className="relative max-w-xl">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or code..."
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-8 h-10"
        />
      </div>

      {isOpen && debouncedTerm.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border border-border rounded-lg shadow-md max-h-80 overflow-y-auto">
          {isFetching ? (
            <div className="p-4 flex items-center justify-center text-muted-foreground text-sm gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No products found
            </div>
          ) : (
            results.map((product) => {
              const isSimpleQueued =
                product.type !== "VARIABLE" && queuedKeys.has(`${product.id}-base`);
              return (
                <button
                  type="button"
                  key={product.id}
                  disabled={isSimpleQueued}
                  onClick={() => {
                    onSelect(product);
                    if (product.type === "VARIABLE") {
                      setIsOpen(false);
                    } else {
                      setIsOpen(false);
                      setTerm("");
                      setDebouncedTerm("");
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {product.type === "VARIABLE"
                        ? `${product.variants?.length ?? 0} variant(s)`
                        : product.sku || "No SKU"}
                      {isSimpleQueued ? " — Already in queue" : ""}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{fmt(product.sellPrice)}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function VariantPickerModal({
  product,
  queuedKeys,
  onClose,
  onAdd,
}: {
  product: IProduct;
  queuedKeys: Set<string>;
  onClose: () => void;
  onAdd: (variants: ProductVariant[]) => void;
}) {
  const variants = (product.variants ?? []) as ProductVariant[];
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleVariant = (variantId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  const handleAdd = () => {
    const selected = variants.filter((v) => selectedIds.has(v.id));
    if (selected.length === 0) {
      toast.error("Please select at least one variant");
      return;
    }
    onAdd(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">
              Select Variants
            </p>
            <h3 className="font-bold text-base line-clamp-1">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-2">
          {variants.map((variant) => {
            const key = `${product.id}-${variant.id}`;
            const alreadyQueued = queuedKeys.has(key);
            const outOfStock = variant.quantity === 0;
            const disabled = alreadyQueued || outOfStock;
            const isSelected = selectedIds.has(variant.id);

            return (
              <div
                key={variant.id}
                onClick={() => !disabled && toggleVariant(variant.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all duration-150 ${
                  disabled
                    ? "border-border opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "border-primary bg-primary/5 shadow-sm cursor-pointer"
                    : "border-border hover:border-primary/40 hover:bg-muted cursor-pointer"
                }`}
              >
                <Checkbox checked={isSelected} disabled={disabled} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{variant.combination}</p>
                  <p className="text-xs mt-0.5">
                    <span className={variant.quantity > 0 ? "text-green-600" : "text-red-500"}>
                      {outOfStock
                        ? "Out of stock"
                        : alreadyQueued
                        ? "Already in queue"
                        : `Stock: ${variant.quantity}`}
                    </span>
                  </p>
                </div>

                <span className="text-sm font-bold flex-shrink-0">
                  {fmt(variant.sellPrice ?? product.sellPrice ?? 0)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border bg-muted/40 flex items-center gap-3">
          <p className="flex-1 text-sm text-muted-foreground">
            {selectedIds.size} variant(s) selected
          </p>
          <Button type="button" onClick={handleAdd} disabled={selectedIds.size === 0}>
            Add Selected to Print Queue
          </Button>
        </div>
      </div>
    </div>
  );
}
