"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Loader2, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ColorDot from "@/components/shared/ColorDot";
import { cn } from "@/lib/utils";
import { getCategoryOptions } from "@/services/category.services";
import {
  createWholesaleProduct,
  IWholesaleProduct,
  updateWholesaleProduct,
} from "@/services/wholesaleProduct.services";
import { ICategory } from "@/types/category.types";

const MAX_IMAGES = 8;
const MAX_FILE = 5 * 1024 * 1024;
const NO_SUB = "__none";
const COMMON_COLOURS = ["Black", "White", "Brown", "Tan", "Navy", "Grey", "Red", "Blue", "Maroon", "Beige"];

// A photo already saved (url) or a new file (with a blob preview)
type Photo = { key: string; url: string; file?: File };
type Colour = { key: string; name: string; image: string | null; file?: File; preview?: string };

let seq = 0;
const nextKey = () => `k${++seq}`;

const checkImage = (file: File) => {
  if (!file.type.startsWith("image/")) {
    toast.error("Please choose an image");
    return false;
  }
  if (file.size > MAX_FILE) {
    toast.error("Each image must be under 5 MB");
    return false;
  }
  return true;
};

export default function WholesaleProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IWholesaleProduct | null; // present = edit mode
  onSuccess: () => void;
}) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name ?? "");
  const [mainId, setMainId] = useState(
    product ? (product.category.parentId ?? product.categoryId) : "",
  );
  const [subId, setSubId] = useState(product?.category.parentId ? product.categoryId : "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [photos, setPhotos] = useState<Photo[]>(
    () => product?.images.map((url) => ({ key: nextKey(), url })) ?? [],
  );
  const [colours, setColours] = useState<Colour[]>(
    () => product?.colors.map((c) => ({ key: nextKey(), name: c.name, image: c.image })) ?? [],
  );
  const [newColour, setNewColour] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  // Free blob previews when the dialog goes away
  const blobs = useRef<string[]>([]);
  useEffect(() => () => blobs.current.forEach((u) => URL.revokeObjectURL(u)), []);
  const preview = (file: File) => {
    const url = URL.createObjectURL(file);
    blobs.current.push(url);
    return url;
  };

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories", "options"],
    queryFn: () => getCategoryOptions(),
    staleTime: 5 * 60 * 1000,
  });
  const allCategories: ICategory[] = useMemo(() => categoryRes?.data ?? [], [categoryRes]);
  const mainCategories = allCategories.filter((c) => !c.parentId);
  const subCategories = allCategories.filter((c) => c.parentId && c.parentId === mainId);

  const addPhotos = (files: FileList | null) => {
    const picked = [...(files ?? [])].filter(checkImage);
    const room = MAX_IMAGES - photos.length;
    if (picked.length > room) toast.error(`Up to ${MAX_IMAGES} photos`);
    setPhotos((list) => [
      ...list,
      ...picked.slice(0, Math.max(room, 0)).map((file) => ({ key: nextKey(), url: preview(file), file })),
    ]);
  };

  const addColour = (raw: string) => {
    const colour = raw.trim();
    if (!colour) return;
    if (colours.some((c) => c.name.toLowerCase() === colour.toLowerCase())) {
      toast.info(`${colour} is already added`);
      return;
    }
    setColours((list) => [...list, { key: nextKey(), name: colour, image: null }]);
    setNewColour("");
  };

  const updateColour = (key: string, patch: Partial<Colour>) =>
    setColours((list) => list.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Product name is required");
    if (!mainId) return toast.error("Choose a category");
    if (photos.length === 0) return toast.error("Add at least one photo");
    const names = colours.map((c) => c.name.trim().toLowerCase());
    if (names.some((n) => !n)) return toast.error("A colour has no name");
    if (new Set(names).size !== names.length) return toast.error("A colour is added twice");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("categoryId", subId || mainId);
    formData.append("isActive", String(isActive));
    // Saved photos first (in order), then the new files
    formData.append("keepImages", JSON.stringify(photos.filter((p) => !p.file).map((p) => p.url)));
    photos.forEach((p) => p.file && formData.append("images", p.file));

    let upload = 0;
    const colourJson = colours.map((c) => {
      if (c.file) {
        formData.append("colorImages", c.file);
        return { name: c.name.trim(), upload: upload++ };
      }
      return { name: c.name.trim(), image: c.image };
    });
    formData.append("colors", JSON.stringify(colourJson));

    setIsSaving(true);
    try {
      if (product) await updateWholesaleProduct(product.id, formData);
      else await createWholesaleProduct(formData);
      toast.success(isEdit ? "Product updated" : "Product added");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Edit ${product?.code}` : "Add Wholesale Product"}
          </DialogTitle>
          <DialogDescription>
            Shown in Product View on the wholesale page. The code (WP-0001) is given automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="wp-name">Product Name *</Label>
            <Input
              id="wp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Men's Leather Loafer"
              maxLength={150}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={mainId}
                onValueChange={(v) => {
                  setMainId(v);
                  setSubId("");
                }}
                disabled={loadingCategories}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Choose category"} />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Select
                value={subId || NO_SUB}
                onValueChange={(v) => setSubId(v === NO_SUB ? "" : v)}
                disabled={!mainId || subCategories.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={!mainId ? "Choose a category first" : "None"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SUB}>None</SelectItem>
                  {subCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mainId && subCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">This category has no subcategories.</p>
              )}
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Photos * <span className="font-normal text-muted-foreground">(first one is the cover, up to {MAX_IMAGES})</span></Label>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {photos.map((p, i) => (
                <div key={p.key} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Cover
                    </span>
                  )}
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhotos((list) => [p, ...list.filter((x) => x.key !== p.key)])}
                      className="absolute bottom-1 left-1 hidden rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white group-hover:block"
                    >
                      Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos((list) => list.filter((x) => x.key !== p.key))}
                    aria-label="Remove photo"
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => photoInput.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="size-5" />
                  Add photo
                </button>
              )}
            </div>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            {photos.some((p) => p.file) && photos.some((p) => !p.file) && (
              <p className="text-xs text-muted-foreground">New photos are saved after the existing ones.</p>
            )}
          </div>

          {/* Colours */}
          <div className="space-y-2">
            <Label>
              Colours <span className="font-normal text-muted-foreground">(optional; buyers pick from these. Add a photo per colour if you have one)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={newColour}
                onChange={(e) => setNewColour(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addColour(newColour);
                  }
                }}
                placeholder="Type a colour and press Enter"
                maxLength={60}
              />
              <Button type="button" variant="outline" onClick={() => addColour(newColour)}>
                <Plus className="size-4" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COLOURS.filter(
                (c) => !colours.some((x) => x.name.toLowerCase() === c.toLowerCase()),
              ).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => addColour(c)}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
                >
                  <ColorDot name={c} /> {c}
                </button>
              ))}
            </div>

            {colours.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2">
                {colours.map((c) => {
                  const src = c.preview ?? c.image;
                  return (
                    <li key={c.key} className="flex items-center gap-2 rounded-lg border p-1.5">
                      <label
                        className={cn(
                          "relative flex size-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground hover:border-primary",
                        )}
                        title="Colour photo (optional)"
                      >
                        {src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Upload className="size-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file && checkImage(file)) {
                              updateColour(c.key, { file, preview: preview(file) });
                            }
                          }}
                        />
                      </label>
                      <ColorDot name={c.name} />
                      <Input
                        value={c.name}
                        onChange={(e) => updateColour(c.key, { name: e.target.value })}
                        aria-label="Colour name"
                        className="h-8 flex-1 px-2 text-sm"
                        maxLength={60}
                      />
                      {src && (
                        <button
                          type="button"
                          onClick={() => updateColour(c.key, { file: undefined, preview: undefined, image: null })}
                          className="text-[11px] text-muted-foreground hover:text-destructive"
                          title="Remove colour photo"
                        >
                          No photo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setColours((list) => list.filter((x) => x.key !== c.key))}
                        aria-label={`Remove ${c.name}`}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
            Show on the wholesale page
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
