"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Clock,
  Map as MapIcon,
  MapPin,
  Navigation,
  Phone,
  Search,
  Store as StoreIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IStore } from "@/types/store.types";

interface StoreListProps {
  stores: IStore[];
  // Site Settings hotline, shown on every store
  phone: string | null;
}

const ALL = "__all__";

export default function StoreList({ stores, phone }: StoreListProps) {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(ALL);

  // Cities in the order their first store appears (admin "order" field)
  const cities = useMemo(() => {
    const counts = new Map<string, number>();
    stores.forEach((s) => counts.set(s.city, (counts.get(s.city) ?? 0) + 1));
    return [...counts.entries()];
  }, [stores]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter(
      (s) =>
        (city === ALL || s.city === city) &&
        (!q ||
          [s.name, s.address, s.city].some((v) => v.toLowerCase().includes(q))),
    );
  }, [stores, search, city]);

  // Grouped by city, like the location headings on the page
  const groups = useMemo(() => {
    const map = new Map<string, IStore[]>();
    filtered.forEach((s) => map.set(s.city, [...(map.get(s.city) ?? []), s]));
    return [...map.entries()];
  }, [filtered]);

  if (stores.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center md:px-8">
        <StoreIcon className="mx-auto size-12 text-muted-foreground/40" />
        <p className="mt-3 font-semibold">No stores listed yet</p>
        {phone && (
          <p className="mt-1 text-sm text-muted-foreground">
            Call our hotline: {phone}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:py-12">
      {/* Search + location filter */}
      <div className="mx-auto mb-8 max-w-4xl space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name, area or address..."
            className="h-12 rounded-full bg-background pl-11 pr-11"
            aria-label="Search stores"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {cities.length > 1 && (
          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Filter by location"
          >
            {[[ALL, stores.length] as const, ...cities].map(([value, count]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCity(value)}
                aria-pressed={city === value}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  city === value
                    ? "border-brand-red bg-brand-red text-white"
                    : "bg-background hover:border-brand-red/50 hover:text-brand-red",
                )}
              >
                {value === ALL ? "All locations" : value}
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-semibold">No store matches your search</p>
          <Button
            variant="link"
            onClick={() => {
              setSearch("");
              setCity(ALL);
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-10">
          {groups.map(([groupCity, items]) => (
            <section key={groupCity}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold uppercase tracking-wide">
                <MapPin className="size-5 text-brand-red" />
                {groupCity}
                <span className="text-sm font-medium normal-case text-muted-foreground">
                  ({items.length} {items.length === 1 ? "store" : "stores"})
                </span>
              </h2>
              <div className="space-y-5">
                {items.map((store) => (
                  <StoreCard key={store.id} store={store} phone={phone} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCard({ store, phone }: { store: IStore; phone: string | null }) {
  // Maps load only when asked for, so a long list stays fast
  const [showMap, setShowMap] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col md:flex-row">
        {/* Left: photo */}
        <div className="relative aspect-[16/10] w-full shrink-0 bg-muted md:aspect-auto md:min-h-60 md:w-2/5">
          {store.image ? (
            <Image
              src={store.image}
              alt={store.name}
              fill
              sizes="(min-width: 768px) 400px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <StoreIcon className="size-14 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Right: address */}
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <h3 className="text-lg font-bold uppercase tracking-wide">{store.name}</h3>
          <p className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" />
            <span className="whitespace-pre-line">{store.address}</span>
          </p>
          {store.openingHours && (
            <p className="flex gap-2 text-sm text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-red" />
              {store.openingHours}
            </p>
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="flex w-fit gap-2 text-sm font-medium hover:text-brand-red"
            >
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-red" />
              Hotline: {phone}
            </a>
          )}

          {(store.mapEmbedUrl || store.directionUrl) && (
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {store.mapEmbedUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setShowMap((v) => !v)}
                  aria-expanded={showMap}
                >
                  <MapIcon className="mr-1.5 size-4" />
                  {showMap ? "Hide map" : "Show map"}
                </Button>
              )}
              {store.directionUrl && (
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-brand-red text-white hover:bg-brand-red/90"
                >
                  <a href={store.directionUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-1.5 size-4" />
                    Get directions
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {showMap && store.mapEmbedUrl && (
        <iframe
          src={store.mapEmbedUrl}
          title={`${store.name} on Google Maps`}
          className="h-72 w-full border-t md:h-96"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </article>
  );
}
