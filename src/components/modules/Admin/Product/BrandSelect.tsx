"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBrands } from "@/services/brand.services";

// Radix Select can't hold an empty value, so "no brand" uses this sentinel
const NO_BRAND = "none";

interface BrandSelectProps {
  value: string; // "" means no brand
  onChange: (brandId: string) => void;
}

export default function BrandSelect({ value, onChange }: BrandSelectProps) {
  const { data: brands = [] } = useQuery({
    queryKey: ["brands", "all"],
    queryFn: () => getBrands(true),
  });

  return (
    <div className="space-y-2">
      <Label>Brand (Optional)</Label>
      <Select
        value={value || NO_BRAND}
        onValueChange={(v) => onChange(v === NO_BRAND ? "" : v)}
      >
        <SelectTrigger className="w-full bg-background/50 focus-visible:ring-primary/20">
          <SelectValue placeholder="Select Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_BRAND}>No Brand</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt=""
                  className="h-5 w-5 rounded object-contain bg-white"
                />
                {brand.name}
                {!brand.isActive && (
                  <span className="text-xs text-muted-foreground">(hidden)</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {brands.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No brands yet. Add them from Dashboard → Brands.
        </p>
      )}
    </div>
  );
}
