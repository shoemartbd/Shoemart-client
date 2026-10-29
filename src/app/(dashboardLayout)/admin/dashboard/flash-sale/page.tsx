"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Zap } from "lucide-react";
import { getAllProducts } from "@/services/product.services";
import {
  getFlashSaleConfig,
  updateFlashSale,
} from "@/services/flashSale.services";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";

const toDatetimeLocal = (iso: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const toISOString = (localValue: string): string | null => {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export default function FlashSalePage() {
  const queryClient = useQueryClient();

  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const { data: configData, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["flash-sale-config"],
    queryFn: () => getFlashSaleConfig(),
  });

  const { data: productResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-for-flash-sale"],
    queryFn: () => getAllProducts({ limit: "100" }),
  });

  const products: IProduct[] = productResponse?.data ?? [];

  useEffect(() => {
    const config = configData?.data;
    if (config) {
      setIsActive(config.isActive);
      setStartTime(toDatetimeLocal(config.startTime));
      setEndTime(toDatetimeLocal(config.endTime));
      setSelectedProductIds(
        [...config.products]
          .sort((a, b) => a.order - b.order)
          .map((entry) => entry.productId),
      );
    }
  }, [configData]);

  const { mutate: saveFlashSale, isPending: isSaving } = useMutation({
    mutationFn: updateFlashSale,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Flash sale updated successfully");
        void queryClient.invalidateQueries({ queryKey: ["flash-sale-config"] });
      } else {
        toast.error(res.message || "Failed to update flash sale");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const startISO = toISOString(startTime);
    const endISO = toISOString(endTime);

    if (startISO && endISO && new Date(endISO) <= new Date(startISO)) {
      toast.error("End time must be after start time");
      return;
    }

    saveFlashSale({
      isActive,
      startTime: startISO,
      endTime: endISO,
      productIds: selectedProductIds,
    });
  };

  const toggleProduct = (productId: string, checked: boolean) => {
    setSelectedProductIds((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId),
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  const isLoading = isLoadingConfig || isLoadingProducts;

  // Same rule the homepage uses (saved settings, not unsaved form edits)
  const saved = configData?.data;
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const now = Date.now();
  const status: { tone: "live" | "wait" | "off"; text: string } = !saved
    ? { tone: "off", text: "Not set up yet." }
    : !saved.isActive
      ? { tone: "off", text: "Off. Tick Active and save to show it on the homepage." }
      : !saved.startTime || !saved.endTime
        ? { tone: "off", text: "Hidden: set both a start and an end time." }
        : saved.products.length === 0
          ? { tone: "off", text: "Hidden: no products selected." }
          : now < new Date(saved.startTime).getTime()
            ? {
                tone: "wait",
                text: `Scheduled: shows on the homepage from ${fmtTime(saved.startTime)}.`,
              }
            : now > new Date(saved.endTime).getTime()
              ? { tone: "off", text: `Ended on ${fmtTime(saved.endTime)}. Set a new end time to show it again.` }
              : { tone: "live", text: `Live on the homepage until ${fmtTime(saved.endTime)}.` };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Flash Sale</h3>
        <p className="text-muted-foreground">
          Choose which products appear in the homepage flash sale, set a real
          start/end window, and toggle the whole section on or off.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Flash Sale Settings</h4>
          </div>

          <div
            role="status"
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
              status.tone === "live"
                ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                : status.tone === "wait"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "border-border bg-muted/50 text-muted-foreground"
            }`}
          >
            <span
              className={`size-2 shrink-0 rounded-full ${
                status.tone === "live"
                  ? "bg-green-500"
                  : status.tone === "wait"
                    ? "bg-amber-500"
                    : "bg-muted-foreground/50"
              }`}
            />
            {status.text}
          </div>

          <div className="flex items-center gap-2.5">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="isActive" className="cursor-pointer font-medium">
              Active
            </Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Select Products</Label>
              <span className="text-xs text-muted-foreground">
                {selectedProductIds.length} selected
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9 h-9"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            {products.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground">
                No products found.
              </div>
            ) : (
              <div className="rounded-lg border bg-background/50">
                <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/20">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline"
                    onClick={() =>
                      setSelectedProductIds(products.map((p) => p.id))
                    }
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold text-muted-foreground hover:underline"
                    onClick={() => setSelectedProductIds([])}
                  >
                    Deselect All
                  </button>
                </div>
                <div className="h-64 overflow-y-auto p-3 space-y-2 border-t">
                  {filteredProducts.map((product) => {
                    const isChecked = selectedProductIds.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2.5 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={`flash-sale-${product.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            toggleProduct(product.id, checked === true)
                          }
                        />
                        <label
                          htmlFor={`flash-sale-${product.id}`}
                          className="flex-1 text-sm font-medium leading-none cursor-pointer"
                        >
                          {product.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 px-8 rounded-full font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Flash Sale"
          )}
        </Button>
      </form>
    </div>
  );
}
