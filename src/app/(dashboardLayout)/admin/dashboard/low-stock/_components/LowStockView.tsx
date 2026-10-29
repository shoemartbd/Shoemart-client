"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  PackageCheck,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLowStock, updateStock } from "@/services/lowStock.services";
import { ILowStockRow } from "@/types/lowStock.types";
import { cn } from "@/lib/utils";

type StockTab = "all" | "low" | "out";
const PAGE_SIZE = 20;

function StockBadge({ stock }: { stock: number }) {
  return stock <= 0 ? (
    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
      Out of stock
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
      Low stock
    </span>
  );
}

// Quantity box + Save for one row
function RestockCell({ row, onSaved }: { row: ILowStockRow; onSaved: () => void }) {
  const [value, setValue] = useState(String(row.stock));
  const [isSaving, setIsSaving] = useState(false);
  const parsed = Number(value);
  const isValid = value !== "" && Number.isInteger(parsed) && parsed >= 0;
  const changed = isValid && parsed !== row.stock;

  const handleSave = async () => {
    if (!changed) return;
    setIsSaving(true);
    try {
      await updateStock({
        productId: row.productId,
        variantId: row.variantId,
        stock: parsed,
      });
      toast.success(`Stock updated to ${parsed}`);
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Failed to update stock");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      className="flex items-center justify-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
    >
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={`New stock for ${row.name}`}
        className="h-9 w-20 rounded-lg text-center"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!changed || isSaving}
        className="h-9 rounded-lg"
      >
        {isSaving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
      </Button>
    </form>
  );
}

export default function LowStockView({ initialType }: { initialType: StockTab }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<StockTab>(initialType);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading, isFetching } = useQuery({
    queryKey: ["low-stock", tab, debounced, page],
    queryFn: () =>
      getLowStock({
        type: tab,
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(debounced && { searchTerm: debounced }),
      }),
  });

  const rows = response?.data?.rows ?? [];
  const counts = response?.data?.counts ?? { all: 0, low: 0, out: 0 };
  const threshold = response?.data?.threshold;
  const totalPages = response?.meta?.totalPages ?? 1;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["low-stock"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
  };

  const tabs: { id: StockTab; label: string; count: number; tone: string }[] = [
    { id: "all", label: "All", count: counts.all, tone: "text-foreground" },
    { id: "low", label: "Low Stock", count: counts.low, tone: "text-amber-600" },
    { id: "out", label: "Out of Stock", count: counts.out, tone: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Low Stock</h3>
          <p className="text-muted-foreground">
            Products with {threshold ?? "…"} or fewer left. Each size/color is
            checked on its own.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/dashboard/site-settings">
            <Settings className="mr-2 size-4" />
            Change alert level
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  tab === t.id ? "bg-primary-foreground/20" : cn("bg-muted", t.tone),
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU or size/color"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
            <PackageCheck className="size-10 text-emerald-500" />
            <p className="font-semibold">
              {debounced ? "Nothing matches your search" : "All stocked up"}
            </p>
            <p className="text-sm text-muted-foreground">
              {debounced
                ? "Try another name or SKU."
                : "No product is at or below the alert level."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Variant</th>
                  <th className="px-4 py-3 text-center font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {row.image ? (
                            <Image src={row.image} alt="" fill sizes="44px" className="object-cover" />
                          ) : (
                            <Package className="m-auto mt-3 size-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${row.slug}`}
                            target="_blank"
                            className="line-clamp-1 font-medium hover:text-primary"
                          >
                            {row.name}
                          </Link>
                          {row.category && (
                            <p className="text-xs text-muted-foreground">{row.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {row.sku || "—"}
                    </td>
                    <td className="px-4 py-3">{row.combination || "—"}</td>
                    <td
                      className={cn(
                        "px-4 py-3 text-center text-base font-black",
                        row.stock <= 0 ? "text-red-600" : "text-amber-600",
                      )}
                    >
                      {row.stock}
                    </td>
                    <td className="px-4 py-3">
                      <StockBadge stock={row.stock} />
                    </td>
                    <td className="px-4 py-3">
                      {/* Keyed so the box resets to the new stock after saving */}
                      <RestockCell key={`${row.key}-${row.stock}`} row={row} onSaved={refresh} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
