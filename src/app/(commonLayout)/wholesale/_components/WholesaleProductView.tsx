"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Images,
  LayoutGrid,
  Loader2,
  MapPin,
  Palette,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getWholesaleGallery,
  IWholesaleGalleryItem,
} from "@/services/wholesaleGallery.services";
import ColorDot from "@/components/shared/ColorDot";
import { DEFAULT_PAIRS, IWholesalePick, pickImage } from "./wholesaleOptions";

interface Category {
  id: string;
  name: string;
  image: string | null;
  items: IWholesaleGalleryItem[];
}

interface WholesaleProductViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Products the buyer picked for the wholesale request (held by the page)
  picked: IWholesalePick[];
  onPickedChange: (picked: IWholesalePick[]) => void;
  // "Add to request": close and jump to the form
  onDone: () => void;
}

const MAX_DOTS = 5;

// "Product View" on the wholesale hero: a card per category (with its image),
// each opening a gallery of shoe photos with name, code and colours.
// Photos can be added to the wholesale request; a product with colours is
// added per colour from its larger view, which also points to the showroom.
export default function WholesaleProductView({
  open,
  onOpenChange,
  picked,
  onPickedChange,
  onDone,
}: WholesaleProductViewProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selected, setSelected] = useState<IWholesaleGalleryItem | null>(null);
  // Colour whose photo the larger view shows
  const [viewColor, setViewColor] = useState<string | null>(null);
  // A photo picked from the thumbnails (overrides the colour photo)
  const [viewImage, setViewImage] = useState<string | null>(null);
  const showColor = (c: string) => {
    setViewColor(c);
    setViewImage(null);
  };

  const picksOf = (item: IWholesaleGalleryItem) => picked.filter((p) => p.id === item.id);
  const isPicked = (item: IWholesaleGalleryItem, color: string | null = null) =>
    picked.some((p) => p.id === item.id && (color === null || p.color === color));

  const togglePick = (item: IWholesaleGalleryItem, color: string | null = null) =>
    onPickedChange(
      picked.some((p) => p.id === item.id && p.color === color)
        ? picked.filter((p) => !(p.id === item.id && p.color === color))
        : [...picked, { ...item, quantity: DEFAULT_PAIRS, color }],
    );

  const openItem = (item: IWholesaleGalleryItem) => {
    setSelected(item);
    setViewColor(picksOf(item).find((p) => p.color)?.color ?? null);
    setViewImage(null);
  };

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["wholesale-gallery"],
    queryFn: () => getWholesaleGallery(),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const categories = useMemo<Category[]>(() => {
    const map = new Map<string, Category>();
    items.forEach((item) => {
      const category = map.get(item.categoryId) ?? {
        id: item.categoryId,
        name: item.categoryName,
        image: item.categoryImage ?? null,
        items: [],
      };
      category.items.push(item);
      map.set(item.categoryId, category);
    });
    return [...map.values()];
  }, [items]);

  const category = categories.find((c) => c.id === categoryId) ?? null;

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setCategoryId(null);
      setSelected(null);
    }
  };

  const hasColors = (item: IWholesaleGalleryItem) => (item.colors?.length ?? 0) > 0;

  // Larger view: step through the products of the open category
  const siblings = category?.items ?? [];
  const selectedIndex = selected ? siblings.findIndex((i) => i.id === selected.id) : -1;
  const step = (dir: 1 | -1) => {
    if (siblings.length < 2 || selectedIndex < 0) return;
    openItem(siblings[(selectedIndex + dir + siblings.length) % siblings.length]);
  };
  const toggleAllColors = (item: IWholesaleGalleryItem) => {
    const all = item.colors.every((c) => isPicked(item, c));
    const others = picked.filter((p) => p.id !== item.id);
    onPickedChange(
      all
        ? others
        : [
            ...others,
            ...item.colors.map(
              (c) =>
                picked.find((p) => p.id === item.id && p.color === c) ?? {
                  ...item,
                  quantity: DEFAULT_PAIRS,
                  color: c,
                },
            ),
          ],
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        data-lenis-prevent
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3 pr-12 sm:px-6">
          {category ? (
            <button
              type="button"
              onClick={() => {
                setCategoryId(null);
                setSelected(null);
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Categories
            </button>
          ) : (
            <LayoutGrid className="size-5 text-[#d7141f]" />
          )}
          <DialogTitle className="truncate text-base font-bold sm:text-lg">
            {category ? category.name : "Product View"}
          </DialogTitle>
          {category && (
            <span className="text-sm text-muted-foreground">({category.items.length})</span>
          )}
          <DialogDescription className="sr-only">
            Wholesale products by category. Each photo shows its product name, code and colours.
          </DialogDescription>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-[#d7141f]" />
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              Couldn&apos;t load products. Please try again.
            </p>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <Images className="mx-auto size-12 text-muted-foreground/40" />
              <p className="mt-3 font-semibold">No products here yet</p>
            </div>
          ) : !category ? (
            /* Category cards with the category image */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c) => {
                const count = picked.filter((p) => p.categoryId === c.id).length;
                const cover = c.image || c.items[0]?.image;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl border bg-muted text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {cover && (
                      <Image
                        src={cover}
                        alt={c.name}
                        fill
                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    {count > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-[#d7141f] px-2.5 py-1 text-xs font-bold text-white shadow">
                        {count} selected
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="line-clamp-1 text-base font-bold">{c.name}</p>
                      <p className="flex items-center gap-1 text-xs text-white/80">
                        {c.items.length} {c.items.length === 1 ? "item" : "items"}
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Gallery */
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {category.items.map((item) => {
                const picks = picksOf(item);
                const on = picks.length > 0;
                const colored = hasColors(item);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md",
                      on && "border-[#d7141f] ring-2 ring-[#d7141f]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={item.image}
                          alt={`${item.name} (${item.code})`}
                          fill
                          sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-1 px-3 py-2 text-center">
                        <p className="line-clamp-1 text-sm font-semibold" title={item.name}>
                          {item.name}
                        </p>
                        <p className="truncate font-mono text-xs font-bold tracking-wide text-muted-foreground">
                          {item.code}
                        </p>
                        {colored && (
                          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                            {item.colors.slice(0, MAX_DOTS).map((c) => (
                              <ColorDot key={c} name={c} />
                            ))}
                            <span className="truncate">
                              {item.colors.length} {item.colors.length === 1 ? "colour" : "colours"}
                            </span>
                          </p>
                        )}
                      </div>
                    </button>
                    {/* Add: simple products toggle here; coloured ones open to pick a colour */}
                    <button
                      type="button"
                      onClick={() => (colored ? openItem(item) : togglePick(item))}
                      aria-pressed={on}
                      aria-label={
                        colored
                          ? `Choose colours of ${item.code}`
                          : on
                            ? `Remove ${item.code} from request`
                            : `Add ${item.code} to request`
                      }
                      title={colored ? "Choose colour" : on ? "Remove from request" : "Add to request"}
                      className={cn(
                        "absolute right-2 top-2 flex h-8 min-w-8 items-center justify-center gap-1 rounded-full border-2 px-1.5 text-xs font-bold shadow transition-colors",
                        on
                          ? "border-[#d7141f] bg-[#d7141f] text-white"
                          : "border-white bg-black/40 text-white hover:bg-black/70",
                      )}
                    >
                      {on ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
                      {colored && picks.length > 0 && <span>{picks.length}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Picked products: send them to the request form */}
        {picked.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t bg-muted/40 px-4 py-3 sm:px-6">
            <p className="text-sm font-semibold">
              {picked.length} {picked.length === 1 ? "product" : "products"} selected
              <span className="ml-1 font-normal text-muted-foreground">
                &middot; set pairs (6, 12, 18, 24 or custom) in the form
              </span>
            </p>
            <button
              type="button"
              onClick={() => onPickedChange([])}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onDone}
              className="ml-auto inline-flex items-center gap-2 rounded-md bg-[#d7141f] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#b5121c]"
            >
              Add to wholesale request <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* Photo clicked: side-by-side view (photo | details) that fits the dialog */}
        {selected && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6"
            onClick={() => setSelected(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
          >
            <div
              className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl sm:grid sm:h-full sm:max-h-[560px] sm:grid-cols-[1.1fr_1fr] sm:grid-rows-[minmax(0,1fr)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-20 rounded-full bg-background/90 p-1.5 shadow hover:bg-muted"
              >
                <X className="size-4" />
              </button>

              {/* Photo side */}
              <div className="relative flex shrink-0 flex-col bg-gradient-to-br from-muted to-muted/40 sm:h-full sm:min-h-0">
                <div className="relative h-52 sm:h-auto sm:min-h-0 sm:flex-1">
                  <Image
                    key={viewImage ?? pickImage(selected, viewColor)}
                    src={viewImage ?? pickImage(selected, viewColor)}
                    alt={`${selected.name} (${selected.code})${viewColor ? ` - ${viewColor}` : ""}`}
                    fill
                    sizes="(min-width: 640px) 460px, 100vw"
                    className="object-contain p-4 animate-in fade-in duration-300"
                  />
                  {siblings.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous product"
                        className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow transition hover:scale-105"
                      >
                        <ChevronLeft className="size-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next product"
                        className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow transition hover:scale-105"
                      >
                        <ChevronRight className="size-5" />
                      </button>
                      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {selectedIndex + 1} / {siblings.length}
                      </span>
                    </>
                  )}
                </div>
                {selected.images?.length > 1 && (
                  <div className="flex shrink-0 gap-2 overflow-x-auto px-3 pb-3">
                    {selected.images.map((src) => {
                      const active = (viewImage ?? pickImage(selected, viewColor)) === src;
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setViewImage(src)}
                          aria-label="Show this photo"
                          className={cn(
                            "relative size-12 shrink-0 overflow-hidden rounded-md border-2 bg-background",
                            active ? "border-[#d7141f]" : "border-transparent opacity-70 hover:opacity-100",
                          )}
                        >
                          <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details side: scrolls on its own only if it ever has to */}
              <div className="flex min-h-0 flex-1 flex-col sm:h-full">
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">
                  <div className="pr-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d7141f]">
                      {selected.categoryName}
                      {selected.subcategoryName && ` · ${selected.subcategoryName}`}
                    </p>
                    <h3 className="mt-1 text-xl font-black leading-tight sm:text-2xl">{selected.name}</h3>
                    <span className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-bold tracking-wide">
                      {selected.code}
                    </span>
                  </div>

                  {hasColors(selected) && (
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <Palette className="size-3.5" /> Choose colours
                        </p>
                        {selected.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => toggleAllColors(selected)}
                            className="text-xs font-semibold text-[#d7141f] hover:underline"
                          >
                            {selected.colors.every((c) => isPicked(selected, c)) ? "Clear all" : "Select all"}
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selected.colors.map((c) => {
                          const active = isPicked(selected, c);
                          const thumb = selected.colorImages?.[c];
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                togglePick(selected, c);
                                showColor(c);
                              }}
                              onMouseEnter={() => showColor(c)}
                              aria-pressed={active}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border-2 p-1.5 pr-2 text-left text-sm font-semibold transition-colors",
                                active
                                  ? "border-[#d7141f] bg-[#d7141f]/5"
                                  : "border-border hover:border-foreground/40",
                              )}
                            >
                              <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                {thumb ? (
                                  <Image src={thumb} alt="" fill sizes="36px" className="object-cover" />
                                ) : (
                                  <ColorDot name={c} className="size-5" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate">{c}</span>
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                                  active ? "border-[#d7141f] bg-[#d7141f] text-white" : "border-muted-foreground/30",
                                )}
                              >
                                {active && <Check className="size-3" strokeWidth={3} />}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Each colour goes in as its own line, so you can set pairs per colour.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions, always in view. Adding keeps the buyer in the gallery so
                    they can pick as many products as they like; the request form
                    is one tap away with everything picked so far. */}
                <div className="grid shrink-0 grid-cols-2 gap-2 border-t bg-muted/30 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasColors(selected) && !isPicked(selected)) togglePick(selected);
                      const n = hasColors(selected) ? picksOf(selected).length : 1;
                      toast.success(
                        `${selected.code} added${hasColors(selected) ? ` in ${n} colour${n === 1 ? "" : "s"}` : ""}. Pick more or open the request form.`,
                      );
                      setSelected(null);
                    }}
                    disabled={hasColors(selected) && picksOf(selected).length === 0}
                    className="col-span-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#d7141f] px-4 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#b5121c] disabled:cursor-not-allowed disabled:bg-muted-foreground/40"
                  >
                    {hasColors(selected) && picksOf(selected).length === 0 ? (
                      <>Choose a colour first</>
                    ) : (
                      <>
                        <Plus className="size-4" strokeWidth={3} />
                        {!hasColors(selected) && isPicked(selected)
                          ? "Added · Continue browsing"
                          : `Add${hasColors(selected) ? ` (${picksOf(selected).length})` : ""} & continue`}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      onDone();
                    }}
                    disabled={picked.length === 0}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#d7141f] px-3 py-2 text-xs font-bold text-[#d7141f] transition-colors hover:bg-[#d7141f]/10 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent sm:text-sm"
                  >
                    Go to request{picked.length > 0 && ` (${picked.length})`}
                    <ArrowRight className="size-4" />
                  </button>
                  <Link
                    href="/our-stores"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-foreground/80 px-3 py-2 text-xs font-bold transition-colors hover:bg-foreground hover:text-background sm:text-sm"
                  >
                    <MapPin className="size-4" /> Showroom
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
