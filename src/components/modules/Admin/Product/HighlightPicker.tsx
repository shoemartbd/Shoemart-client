"use client";

import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRODUCT_HIGHLIGHTS, ProductHighlight } from "@/lib/productHighlights";

interface HighlightPickerProps {
  value: ProductHighlight[];
  onChange: (value: ProductHighlight[]) => void;
}

// Toggle chips: a product can be e.g. both "New Arrival" and "Trending"
export default function HighlightPicker({ value, onChange }: HighlightPickerProps) {
  const toggle = (h: ProductHighlight) =>
    onChange(value.includes(h) ? value.filter((v) => v !== h) : [...value, h]);

  return (
    <div className="space-y-2">
      <Label>Highlights (Optional)</Label>
      <div className="flex flex-wrap gap-2">
        {PRODUCT_HIGHLIGHTS.map((h) => {
          const selected = value.includes(h.value);
          return (
            <button
              key={h.value}
              type="button"
              onClick={() => toggle(h.value)}
              aria-pressed={selected}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                selected
                  ? cn(h.className, "shadow-sm")
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
              {h.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Pick one or more. Products are grouped by these on the homepage.
      </p>
    </div>
  );
}
