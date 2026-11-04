"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Images, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColorDot from "@/components/shared/ColorDot";
import { confirmAction } from "@/lib/confirmAction";
import { getCategoryOptions } from "@/services/category.services";
import {
  deleteWholesaleProduct,
  getWholesaleProducts,
  IWholesaleProduct,
} from "@/services/wholesaleProduct.services";
import { ICategory } from "@/types/category.types";
import WholesaleProductFormDialog from "./_components/WholesaleProductFormDialog";

const ALL = "__all";
// Colour chips shown per row before "+N"
const MAX_DOTS = 4;

export default function WholesaleProductsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IWholesaleProduct | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState(ALL);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: products = [], isLoading, isFetching } = useQuery({
    queryKey: ["wholesale-products", debounced, categoryId],
    queryFn: () =>
      getWholesaleProducts({
        searchTerm: debounced || undefined,
        categoryId: categoryId === ALL ? undefined : categoryId,
      }),
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["categories", "options"],
    queryFn: () => getCategoryOptions(),
    staleTime: 5 * 60 * 1000,
  });
  const mainCategories = useMemo(
    () => ((categoryRes?.data ?? []) as ICategory[]).filter((c) => !c.parentId),
    [categoryRes],
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["wholesale-products"] });
    queryClient.invalidateQueries({ queryKey: ["wholesale-gallery"] });
  };

  const openForm = (product: IWholesaleProduct | null) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleDelete = async (product: IWholesaleProduct) => {
    const ok = await confirmAction({
      title: `Delete ${product.code}?`,
      text: `"${product.name}" will be removed from the wholesale page. Requests that already have it are not changed.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteWholesaleProduct(product.id);
      toast.success("Product deleted");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const filtering = Boolean(debounced) || categoryId !== ALL;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Wholesale Products</h3>
          <p className="text-muted-foreground">
            Products shown in Product View on the{" "}
            <a href="/wholesale" target="_blank" className="text-primary underline-offset-4 hover:underline">
              wholesale page <ExternalLink className="inline size-3" />
            </a>
            . Buyers pick them in their request, and you add them to orders from here.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => openForm(null)}>
          <Plus className="mr-2 size-4" />
          Add Wholesale Product
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or code (WP-0001)"
            className="pl-9"
          />
        </div>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {mainCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching && !isLoading && <Loader2 className="size-5 animate-spin self-center text-primary" />}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
          <Images className="size-10 text-muted-foreground/50" />
          <p className="font-semibold">{filtering ? "No product matches" : "No wholesale products yet"}</p>
          {!filtering && (
            <p className="text-sm text-muted-foreground">
              Add a product with its name, category, photos and colours.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-12 px-3 py-2.5 font-semibold">#</th>
                <th className="px-3 py-2.5 font-semibold">Product</th>
                <th className="px-3 py-2.5 font-semibold">Category</th>
                <th className="px-3 py-2.5 font-semibold">Subcategory</th>
                <th className="px-3 py-2.5 font-semibold">Colours</th>
                <th className="px-3 py-2.5 text-center font-semibold">Photos</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-b align-middle last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate font-medium" title={p.name}>
                          {p.name}
                        </p>
                        <p className="font-mono text-xs font-semibold text-muted-foreground">{p.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{p.category.parent?.name ?? p.category.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {p.category.parent ? p.category.name : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {p.colors.length > 0 ? (
                      <div className="flex max-w-[260px] flex-wrap gap-1">
                        {p.colors.slice(0, MAX_DOTS).map((c) => (
                          <span
                            key={c.name}
                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                          >
                            <ColorDot name={c.name} /> {c.name}
                          </span>
                        ))}
                        {p.colors.length > MAX_DOTS && (
                          <span
                            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            title={p.colors.slice(MAX_DOTS).map((c) => c.name).join(", ")}
                          >
                            +{p.colors.length - MAX_DOTS}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center tabular-nums">{p.images.length}</td>
                  <td className="px-3 py-2">
                    {p.isActive ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Visible</Badge>
                    ) : (
                      <Badge variant="secondary">Hidden</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        onClick={() => openForm(p)}
                        aria-label={`Edit ${p.code}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="size-8"
                        onClick={() => handleDelete(p)}
                        aria-label={`Delete ${p.code}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <WholesaleProductFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          product={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
