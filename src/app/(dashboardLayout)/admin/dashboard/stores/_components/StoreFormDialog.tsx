"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createStore, updateStore } from "@/services/store.services";
import { IStore } from "@/types/store.types";

interface StoreFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: IStore | null; // present = edit mode
  // Existing locations, suggested while typing
  cities: string[];
  onSuccess: () => void;
}

// Pull the src out of a pasted <iframe> so the preview can show it
const embedSrc = (value: string) =>
  (value.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? value).replace(/&amp;/g, "&").trim();

const isMapsEmbed = (value: string) => {
  try {
    const url = new URL(embedSrc(value));
    return url.protocol === "https:" && url.pathname.startsWith("/maps/embed");
  } catch {
    return false;
  }
};

export default function StoreFormDialog({
  open,
  onOpenChange,
  store,
  cities,
  onSuccess,
}: StoreFormDialogProps) {
  const isEdit = Boolean(store);
  const [name, setName] = useState(store?.name ?? "");
  const [city, setCity] = useState(store?.city ?? "");
  const [address, setAddress] = useState(store?.address ?? "");
  const [openingHours, setOpeningHours] = useState(store?.openingHours ?? "");
  const [mapEmbed, setMapEmbed] = useState(store?.mapEmbedUrl ?? "");
  const [directionUrl, setDirectionUrl] = useState(store?.directionUrl ?? "");
  const [order, setOrder] = useState(String(store?.order ?? 0));
  const [isActive, setIsActive] = useState(store?.isActive ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(store?.image ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Free the object URL of a picked file
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Store name is required");
    if (!city.trim()) return toast.error("City / location is required");
    if (!address.trim()) return toast.error("Address is required");
    if (mapEmbed.trim() && !isMapsEmbed(mapEmbed)) {
      return toast.error("Paste the embed code from Google Maps (Share → Embed a map)");
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("city", city.trim());
    formData.append("address", address.trim());
    formData.append("openingHours", openingHours.trim());
    formData.append("mapEmbed", mapEmbed.trim());
    formData.append("directionUrl", directionUrl.trim());
    formData.append("order", order.trim() || "0");
    formData.append("isActive", String(isActive));
    if (imageFile) formData.append("image", imageFile);
    else if (removeImage) formData.append("removeImage", "true");

    setIsSaving(true);
    try {
      if (store) await updateStore(store.id, formData);
      else await createStore(formData);
      toast.success(isEdit ? "Store updated" : "Store added");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save store");
    } finally {
      setIsSaving(false);
    }
  };

  const previewSrc = mapEmbed.trim() && isMapsEmbed(mapEmbed) ? embedSrc(mapEmbed) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" data-lenis-prevent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Store" : "Add Store"}</DialogTitle>
          <DialogDescription>
            Photo shows on the left, address and map on the right.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="store-name">Store name *</Label>
            <Input
              id="store-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jamuna Future Park"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-city">City / location *</Label>
            <Input
              id="store-city"
              list="store-city-options"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Dhaka"
            />
            <datalist id="store-city-options">
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">
              Used for the location filter. Use the same spelling for stores in one city.
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="store-address">Address *</Label>
            <Textarea
              id="store-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop no, building, road, area"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-hours">Opening hours</Label>
            <Input
              id="store-hours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              placeholder="Open: 9.30 AM · Holiday: Friday"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="store-direction">Get directions link</Label>
            <Input
              id="store-direction"
              value={directionUrl}
              onChange={(e) => setDirectionUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="store-map">Google Map embed code</Label>
            <Textarea
              id="store-map"
              rows={3}
              value={mapEmbed}
              onChange={(e) => setMapEmbed(e.target.value)}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Google Maps → search the store → Share → Embed a map → Copy HTML, then paste it here.
            </p>
            {previewSrc && (
              <iframe
                src={previewSrc}
                title="Map preview"
                className="h-48 w-full rounded-lg border"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label>Store photo</Label>
            {imagePreview ? (
              <div className="relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-lg border">
                <Image src={imagePreview} alt="" fill sizes="384px" className="object-cover" unoptimized={imagePreview.startsWith("blob:")} />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 size-7"
                  onClick={clearImage}
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="upload-zone flex h-32 w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-lg">
                <span className="upload-icon mb-2">
                  <Upload className="size-5" />
                </span>
                <span className="text-xs font-semibold text-primary">Upload photo</span>
                <span className="text-[11px] text-muted-foreground">Landscape, up to 5 MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </label>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="store-order">Display order</Label>
            <Input
              id="store-order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Lower shows first.</p>
          </div>
          <label className="flex items-center gap-2 self-center text-sm font-medium">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
            Show on website
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add store"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
