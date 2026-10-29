"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Loader2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkDeleteProducts } from "@/services/product.services";
import { confirmAction } from "@/lib/confirmAction";

// Shown above the product list while products are selected
export default function ProductBulkActions({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const count = selectedIds.length;
  if (count === 0) return null;

  const plural = count === 1 ? "product" : "products";

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: `Delete ${count} ${plural}?`,
      text: "They will be removed from the shop.",
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const result = await bulkDeleteProducts(selectedIds);
      if (!result.success) {
        toast.error(result.message || "Something went wrong");
        return;
      }
      toast.success(result.message);
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      onClear();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 font-semibold">
        <CheckSquare className="size-4 text-primary" />
        {count} {plural} selected
        {busy && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <Button
          size="sm"
          variant="destructive"
          disabled={busy}
          onClick={handleDelete}
          className="h-9 gap-1.5"
        >
          <Trash2 className="size-4" /> Delete
        </Button>

        <Button size="sm" variant="ghost" onClick={onClear} disabled={busy} className="h-9 gap-1.5">
          <X className="size-4" /> Clear
        </Button>
      </div>
    </div>
  );
}
