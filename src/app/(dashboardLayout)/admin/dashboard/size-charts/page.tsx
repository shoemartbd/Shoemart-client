"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Plus, Ruler, Trash2 } from "lucide-react";
import { getSizeCharts, deleteSizeChart } from "@/services/sizeChart.services";
import { ISizeChart } from "@/types/sizeChart.types";
import SizeChartFormModal from "./_components/SizeChartFormModal";
import { confirmAction } from "@/lib/confirmAction";

export default function SizeChartsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ISizeChart | null>(null);

  const { data: sizeCharts = [], isLoading } = useQuery({
    queryKey: ["size-charts"],
    queryFn: () => getSizeCharts(),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["size-charts"] });

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (chart: ISizeChart) => {
    setEditing(chart);
    setModalOpen(true);
  };

  const handleDelete = async (chart: ISizeChart) => {
    const count = chart._count?.products ?? 0;
    const note = count
      ? `\n\n${count} product(s) use this size chart. They will stay, just without a size chart.`
      : "";
    const ok = await confirmAction({
      title: `Delete size chart "${chart.name}"?`,
      text: note.trim() || undefined,
      confirmText: "Delete",
    });
    if (!ok) return;

    try {
      await deleteSizeChart(chart.id);
      toast.success("Size chart deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete size chart");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">Size Charts</h3>
          <p className="text-muted-foreground">
            Add a size chart once, then pick it in any product&apos;s form.
            Customers see a &quot;View Size Chart&quot; button on that product.
          </p>
        </div>
        <Button className="rounded-full" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Size Chart
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sizeCharts.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 border border-dashed rounded-xl">
          <Ruler className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            No size charts yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sizeCharts.map((chart) => (
            <div
              key={chart.id}
              className="group relative rounded-xl border bg-card p-3 shadow-sm"
            >
              <a
                href={chart.image}
                target="_blank"
                rel="noopener noreferrer"
                className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chart.image}
                  alt={chart.name}
                  className="max-h-full max-w-full object-contain"
                />
              </a>
              <div className="mt-3 min-w-0">
                <p className="truncate text-sm font-semibold">{chart.name}</p>
                <p className="text-xs text-muted-foreground">
                  Used by {chart._count?.products ?? 0} products
                </p>
              </div>
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow"
                  onClick={() => openEdit(chart)}
                  aria-label={`Edit ${chart.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full shadow"
                  onClick={() => handleDelete(chart)}
                  aria-label={`Delete ${chart.name}`}
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
        <SizeChartFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          sizeChart={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
