"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteSampleWork, getAllSampleWorks } from "@/services/sampleWork.services";
import {
  formatFileSize,
  pdfCoverUrl,
  sampleWorkDownloadUrl,
  sampleWorkViewUrl,
} from "@/lib/sampleWork";
import { ISampleWork } from "@/types/sampleWork.types";
import SampleWorkFormDialog from "./_components/SampleWorkFormDialog";
import { confirmAction } from "@/lib/confirmAction";

export default function SampleWorksPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ISampleWork | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["sample-works", "all"],
    queryFn: () => getAllSampleWorks(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["sample-works"] });

  const openForm = (item: ISampleWork | null) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleDelete = async (item: ISampleWork) => {
    const ok = await confirmAction({
      title: `Delete "${item.title}"?`,
      text: "The PDF will be removed.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteSampleWork(item.id);
      toast.success("Sample work deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Sample Works</h3>
          <p className="text-muted-foreground">
            PDFs shown on the homepage. Customers can view them or download a copy.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => openForm(null)}>
          <Plus className="mr-2 size-4" />
          Add PDF
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
          <FileText className="size-10 text-muted-foreground/50" />
          <p className="font-semibold">No sample works yet</p>
          <p className="text-sm text-muted-foreground">
            Upload a PDF and it appears on the homepage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const cover = pdfCoverUrl(item.fileUrl, 400);
            return (
              <div key={item.id} className="group overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover object-top" />
                  ) : (
                    <FileText className="size-12 text-red-500/60" />
                  )}
                  {!item.isActive && (
                    <Badge variant="secondary" className="absolute left-2 top-2">
                      Hidden
                    </Badge>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      PDF{formatFileSize(item.fileSize) ? ` · ${formatFileSize(item.fileSize)}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="icon" variant="outline" className="size-9" title="Open">
                      <a href={sampleWorkViewUrl(item)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                    <Button asChild size="icon" variant="outline" className="size-9" title="Download">
                      <a href={sampleWorkDownloadUrl(item)}>
                        <Download className="size-4" />
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-auto size-9"
                      onClick={() => openForm(item)}
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="size-9"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <SampleWorkFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          sampleWork={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
