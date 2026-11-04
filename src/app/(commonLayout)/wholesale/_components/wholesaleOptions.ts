import { IWholesaleGalleryItem } from "@/services/wholesaleGallery.services";

// Quick pair counts offered per product (a buyer can also type their own)
export const PAIR_PRESETS = [6, 12, 18, 24];
export const DEFAULT_PAIRS = PAIR_PRESETS[0];
export const MAX_PAIRS = 100000;

// A gallery product the buyer picked, with the pairs they want. A product
// with colours gets one pick per colour.
export type IWholesalePick = IWholesaleGalleryItem & { quantity: number; color: string | null };

export const pickKey = (p: { id: string; color: string | null }) => `${p.id}|${p.color ?? ""}`;

// The colour's own photo when it has one
export const pickImage = (p: IWholesaleGalleryItem, color: string | null) =>
  (color && p.colorImages?.[color]) || p.image;

export const WHOLESALE_FORM_ID = "wholesale-form";

export const scrollToWholesaleForm = () =>
  document
    .getElementById(WHOLESALE_FORM_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
