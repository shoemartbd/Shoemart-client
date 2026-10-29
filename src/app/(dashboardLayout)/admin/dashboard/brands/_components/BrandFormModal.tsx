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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload } from "lucide-react";
import { createBrand, updateBrand } from "@/services/brand.services";
import { IBrand } from "@/types/brand.types";

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: IBrand | null; // present = edit mode
  onSuccess: () => void;
}

export default function BrandFormModal({
  open,
  onOpenChange,
  brand,
  onSuccess,
}: BrandFormModalProps) {
  const isEdit = Boolean(brand);
  // The parent mounts this fresh on every open, so state starts from `brand`
  const [name, setName] = useState(brand?.name ?? "");
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(brand?.logo ?? null);
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
      toast.error("Brand name is required");
      return;
    }
    if (!isEdit && !file) {
      toast.error("Please choose a logo");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("isActive", String(isActive));
      if (file) formData.append("logo", file);

      if (isEdit && brand) {
        await updateBrand(brand.id, formData);
        toast.success("Brand updated");
      } else {
        await createBrand(formData);
        toast.success("Brand added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save brand");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Brand" : "Add Brand"}</DialogTitle>
          <DialogDescription>
            Logo: square, 400 × 400 px (ratio 1:1). Transparent PNG or SVG works best.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="brand-name">Brand Name *</Label>
            <Input
              id="brand-name"
              placeholder="e.g. Samsung"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Logo {isEdit ? "(choose to replace)" : "*"}</Label>
            <label className="upload-zone flex aspect-square w-40 mx-auto cursor-pointer flex-col items-center justify-center rounded-xl overflow-hidden">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Logo preview"
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <>
                  <span className="upload-icon mb-2">
                    <Upload className="size-5" />
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    Upload Logo
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

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
            />
            Show on homepage
          </label>

          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Brand"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
