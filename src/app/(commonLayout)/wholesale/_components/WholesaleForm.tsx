"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { CheckCircle2, Images, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createWholesaleRequest } from "@/services/wholesaleRequest.services";
import { IWholesaleGalleryItem } from "@/services/wholesaleGallery.services";
import { QUANTITY_TIERS } from "./wholesaleOptions";

const BUSINESS_TYPES = [
  "Retail Shop",
  "Online Seller",
  "Corporate / Uniform",
  "Distributor",
  "Other",
];


const EMPTY = {
  name: "",
  phone: "",
  email: "",
  businessName: "",
  businessType: "",
  location: "",
  message: "",
};

type Field = keyof typeof EMPTY;

// Quantity and picked products are held by the page, so the hero card and
// the Product View gallery can fill them in
export default function WholesaleForm({
  categories,
  quantity,
  onQuantityChange,
  products,
  onProductsChange,
  onBrowseProducts,
}: {
  categories: string[];
  quantity: string;
  onQuantityChange: (quantity: string) => void;
  products: IWholesaleGalleryItem[];
  onProductsChange: (products: IWholesaleGalleryItem[]) => void;
  onBrowseProducts: () => void;
}) {
  const [values, setValues] = useState(EMPTY);
  const [picked, setPicked] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (field: Field) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleCategory = (name: string) =>
    setPicked((list) =>
      list.includes(name) ? list.filter((c) => c !== name) : [...list, name],
    );

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = "Name is required";
    const digits = values.phone.replace(/\D/g, "").replace(/^88/, "");
    if (!/^01\d{9}$/.test(digits)) next.phone = "Enter a valid 11-digit mobile number";
    if (values.email.trim() && !/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      next.email = "Enter a valid email";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await createWholesaleRequest({
        ...values,
        quantity,
        categories: picked,
        productIds: products.map((p) => p.id),
      });
      setSent(true);
      setValues(EMPTY);
      onQuantityChange("");
      onProductsChange([]);
      setPicked([]);
    } catch (error) {
      toast.error((error as Error).message || "Failed to send your request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted/60 px-6 py-12 text-center">
        <CheckCircle2 className="size-14 text-brand-red" />
        <h3 className="text-xl font-black">Request received!</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thank you. Our wholesale team will call you soon with a quotation.
        </p>
        <Button variant="outline" className="mt-2" onClick={() => setSent(false)}>
          Send another request
        </Button>
      </div>
    );
  }

  const error = (field: Field) =>
    errors[field] && <p className="text-xs font-medium text-destructive">{errors[field]}</p>;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name">Your Name *</Label>
          <Input
            id="ws-name"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            placeholder="Full name"
            aria-invalid={Boolean(errors.name)}
          />
          {error("name")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ws-phone">Phone / WhatsApp *</Label>
          <Input
            id="ws-phone"
            type="tel"
            value={values.phone}
            onChange={(e) => set("phone")(e.target.value)}
            placeholder="01XXXXXXXXX"
            aria-invalid={Boolean(errors.phone)}
          />
          {error("phone")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ws-business">Business / Shop Name</Label>
          <Input
            id="ws-business"
            value={values.businessName}
            onChange={(e) => set("businessName")(e.target.value)}
            placeholder="e.g. Rahim Shoe Store"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Business Type</Label>
          <Select value={values.businessType} onValueChange={set("businessType")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ws-location">Location / District</Label>
          <Input
            id="ws-location"
            value={values.location}
            onChange={(e) => set("location")(e.target.value)}
            placeholder="e.g. Chattogram"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Estimated Quantity</Label>
          <Select value={quantity} onValueChange={onQuantityChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select quantity" />
            </SelectTrigger>
            <SelectContent>
              {QUANTITY_TIERS.map((q) => (
                <SelectItem key={q.value} value={q.value}>
                  {q.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="ws-email">Email (optional)</Label>
          <Input
            id="ws-email"
            type="email"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {error("email")}
        </div>
      </div>

      {categories.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Interested In</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((name) => {
              const active = picked.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCategory(name)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                    active
                      ? "border-brand-red bg-brand-red text-white"
                      : "hover:border-brand-red hover:text-brand-red",
                  )}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Products picked in the Product View gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">
            Selected Products{products.length > 0 && ` (${products.length})`}
          </p>
          <button
            type="button"
            onClick={onBrowseProducts}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red hover:underline"
          >
            <Images className="size-4" />
            {products.length > 0 ? "Add more" : "Choose from Product View"}
          </button>
        </div>
        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((p) => (
              <li key={p.id} className="relative flex items-center gap-2 rounded-lg border p-1.5 pr-7">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold" title={p.name}>{p.name}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">{p.code}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onProductsChange(products.filter((x) => x.id !== p.id))}
                  aria-label={`Remove ${p.code}`}
                  className="absolute right-1 top-1 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
            Optional: pick the exact shoes you want from Product View.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ws-message">Requirements (optional)</Label>
        <Textarea
          id="ws-message"
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Styles, sizes, colours or anything else we should know"
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full gap-2 rounded-full bg-brand-red text-base font-bold text-white hover:bg-brand-red/90"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send Wholesale Request
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        We only use your details to contact you about this request.
      </p>
    </form>
  );
}
