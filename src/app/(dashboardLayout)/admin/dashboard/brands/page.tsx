"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { getBrands, deleteBrand } from "@/services/brand.services";
import { IBrand } from "@/types/brand.types";
import BrandFormModal from "./_components/BrandFormModal";
import { confirmAction } from "@/lib/confirmAction";

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IBrand | null>(null);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["brands", "all"],
    queryFn: () => getBrands(true),
  });

  // Refresh both the admin list and the public (homepage) list
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["brands"] });

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (brand: IBrand) => {
    setEditing(brand);
    setModalOpen(true);
  };

  const handleDelete = async (brand: IBrand) => {
    const count = brand._count?.products ?? 0;
    const note = count
      ? `\n\n${count} product(s) use this brand. They will stay, just without a brand.`
      : "";
    const ok = await confirmAction({
      title: `Delete brand "${brand.name}"?`,
      text: note.trim() || undefined,
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteBrand(brand.id);
      toast.success("Brand deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete brand");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Brands</h3>
          <p className="text-muted-foreground">
            Brand logos scroll across the homepage under the slider. Assign a
            brand to a product from the product form.
          </p>
          <p className="text-sm font-medium text-primary">
            Logo: square, 400 × 400 px (ratio 1:1) · transparent PNG/SVG works best
          </p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : brands.length === 0 ? (
        <div className="flex h-64 items-center justify-center border border-dashed rounded-xl">
          <p className="text-muted-foreground">No brands yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="group relative rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="flex aspect-square items-center justify-center rounded-lg bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{brand.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {brand._count?.products ?? 0} products
                  </p>
                </div>
                {!brand.isActive && <Badge variant="secondary">Hidden</Badge>}
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow"
                  onClick={() => openEdit(brand)}
                  aria-label={`Edit ${brand.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full shadow"
                  onClick={() => handleDelete(brand)}
                  aria-label={`Delete ${brand.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mounted only while open so the form starts fresh each time */}
      {modalOpen && (
        <BrandFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          brand={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
