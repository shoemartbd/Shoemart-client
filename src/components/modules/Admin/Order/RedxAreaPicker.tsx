"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRedxAreas } from "@/services/order.services";
import { cn } from "@/lib/utils";

interface RedxArea {
  id: number;
  name: string;
  post_code?: number | string | null;
}

interface RedxAreaPickerProps {
  district: string;
  assigning: boolean;
  onAssign: (area: { id: number; name: string }) => void;
  onCancel: () => void;
}

// RedX delivers by area (thana / zone): pick one from the order's district
export default function RedxAreaPicker({ district, assigning, onAssign, onCancel }: RedxAreaPickerProps) {
  const [districtQuery, setDistrictQuery] = useState(district);
  const [debouncedDistrict, setDebouncedDistrict] = useState(district);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<RedxArea | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDistrict(districtQuery.trim()), 500);
    return () => clearTimeout(timer);
  }, [districtQuery]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["redx-areas", debouncedDistrict.toLowerCase()],
    queryFn: () => getRedxAreas(debouncedDistrict),
    enabled: debouncedDistrict.length > 1,
    staleTime: 60 * 60 * 1000,
  });

  const areas: RedxArea[] = data?.data ?? [];
  const term = filter.trim().toLowerCase();
  const shown = term
    ? areas.filter((a) => a.name.toLowerCase().includes(term) || String(a.post_code ?? "").includes(term))
    : areas;

  return (
    <div className="space-y-3 rounded-xl border border-[#e11d2a]/30 bg-[#e11d2a]/5 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <MapPin className="size-3.5 text-[#e11d2a]" />
        RedX needs the delivery area. Customer address shows the area to pick.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Input
          value={districtQuery}
          onChange={(e) => {
            setDistrictQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="District"
          aria-label="District"
          className="h-9"
        />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search area"
            aria-label="Search area"
            className="h-9 pl-8"
          />
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg border bg-background" data-lenis-prevent>
        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : isError || data?.success === false ? (
          <p className="p-3 text-xs text-destructive">
            {data?.message || "Could not load RedX areas. Check the RedX token in Courier Settings."}
          </p>
        ) : shown.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">
            No RedX area found. Check the district spelling (e.g. Dhaka, Chattogram).
          </p>
        ) : (
          <ul role="listbox" aria-label="RedX areas">
            {shown.map((area) => (
              <li key={area.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected?.id === area.id}
                  onClick={() => setSelected(area)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted",
                    selected?.id === area.id && "bg-[#e11d2a]/10 font-semibold",
                  )}
                >
                  <span>
                    {area.name}
                    {area.post_code ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">({area.post_code})</span>
                    ) : null}
                  </span>
                  {selected?.id === area.id && <Check className="size-4 text-[#e11d2a]" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onCancel} disabled={assigning}>
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1 rounded-xl bg-[#e11d2a] font-semibold text-white hover:bg-[#c41823]"
          disabled={!selected || assigning}
          onClick={() => selected && onAssign({ id: selected.id, name: selected.name })}
        >
          {assigning ? <Loader2 className="size-4 animate-spin" /> : "Send to RedX"}
        </Button>
      </div>
    </div>
  );
}
