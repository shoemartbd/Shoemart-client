"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { createSizeChart, updateSizeChart } from "@/services/sizeChart.services";
import { ISizeChart } from "@/types/sizeChart.types";

interface SizeChartFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sizeChart?: ISizeChart | null; // present = edit mode
  onSuccess: () => void;
}

export default function SizeChartFormModal({
  open,
  onOpenChange,
  sizeChart,
  onSuccess,
}: SizeChartFormModalProps) {
  const isEdit = Boolean(sizeChart);
  // The parent mounts this fresh on every open, so state starts from `sizeChart`
  const [name, setName] = useState(sizeChart?.name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(sizeChart?.image ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Size chart name is required");
      return;
    }
    if (!isEdit && !file) {
      toast.error("Please choose the size chart image");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (file) formData.append("image", file);

      if (isEdit && sizeChart) {
        await updateSizeChart(sizeChart.id, formData);
        toast.success("Size chart updated");
      } else {
        await createSizeChart(formData);
        toast.success("Size chart added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save size chart");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Size Chart" : "Add Size Chart"}</DialogTitle>
          <DialogDescription>
            Upload a clear image of the measurement table (JPG or PNG).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="size-chart-name">Name *</Label>
            <Input
              id="size-chart-name"
              placeholder="e.g. Men's Shirt, Abaya, Kids Pant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Image {isEdit ? "(choose to replace)" : "*"}</Label>
            <label className="upload-zone flex min-h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Size chart preview"
                  className="max-h-72 w-full object-contain p-2"
                />
              ) : (
                <>
                  <span className="upload-icon mb-2">
                    <Upload className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    Upload Size Chart
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Size Chart"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
