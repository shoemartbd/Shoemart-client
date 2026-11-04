"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Folder, FolderOpen, Loader2, MapPin, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getWholesaleGallery,
  IWholesaleGalleryItem,
} from "@/services/wholesaleGallery.services";

interface Folder {
  id: string;
  name: string;
  items: IWholesaleGalleryItem[];
}

interface WholesaleProductViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Products the buyer picked for the wholesale request (held by the page)
  picked: IWholesaleGalleryItem[];
  onPickedChange: (picked: IWholesaleGalleryItem[]) => void;
  // "Add to request": close and jump to the form
  onDone: () => void;
}

// "Product View" on the wholesale hero: a folder per category, each opening a
// gallery of shoe photos labelled with their name and code. Photos can be
// ticked to add them to the wholesale request; tapping one shows it larger
// with a pointer to the nearest showroom.
export default function WholesaleProductView({
  open,
  onOpenChange,
  picked,
  onPickedChange,
  onDone,
}: WholesaleProductViewProps) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [selected, setSelected] = useState<IWholesaleGalleryItem | null>(null);

  const isPicked = (item: IWholesaleGalleryItem) => picked.some((p) => p.id === item.id);
  const togglePick = (item: IWholesaleGalleryItem) =>
    onPickedChange(
      isPicked(item) ? picked.filter((p) => p.id !== item.id) : [...picked, item],
    );

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["wholesale-gallery"],
    queryFn: () => getWholesaleGallery(),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const folders = useMemo<Folder[]>(() => {
    const map = new Map<string, Folder>();
    items.forEach((item) => {
      const folder = map.get(item.categoryId) ?? {
        id: item.categoryId,
        name: item.categoryName,
        items: [],
      };
      folder.items.push(item);
      map.set(item.categoryId, folder);
    });
    return [...map.values()];
  }, [items]);

  const folder = folders.find((f) => f.id === folderId) ?? null;

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) {
      setFolderId(null);
      setSelected(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
          data-lenis-prevent
        >
          {/* Header: breadcrumb-style path */}
          <div className="flex items-center gap-2 border-b px-4 py-3 pr-12 sm:px-6">
            {folder ? (
              <button
                type="button"
                onClick={() => {
                  setFolderId(null);
                  setSelected(null);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Folders
              </button>
            ) : (
              <FolderOpen className="size-5 text-amber-500" />
            )}
            <DialogTitle className="truncate text-base font-bold sm:text-lg">
              {folder ? folder.name : "Product View"}
            </DialogTitle>
            {folder && (
              <span className="text-sm text-muted-foreground">
                ({folder.items.length})
              </span>
            )}
            <DialogDescription className="sr-only">
              Wholesale products by category. Each photo shows its product name and code.
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
            ) : folders.length === 0 ? (
              <div className="py-16 text-center">
                <Folder className="mx-auto size-12 text-muted-foreground/40" />
                <p className="mt-3 font-semibold">No products here yet</p>
              </div>
            ) : !folder ? (
              /* Folder grid */
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {folders.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFolderId(f.id)}
                    className="group rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3]">
                      {/* Folder shape with the first photos peeking out */}
                      <div className="absolute left-0 top-0 h-4 w-2/5 rounded-t-md bg-amber-400" />
                      <div className="absolute inset-x-0 bottom-0 top-3 overflow-hidden rounded-md rounded-tl-none bg-amber-300">
                        <div className="absolute inset-2 grid grid-cols-2 gap-1">
                          {f.items.slice(0, 4).map((item) => (
                            <div key={item.id} className="relative overflow-hidden rounded bg-white">
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="100px"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-1 font-semibold group-hover:text-[#d7141f]">
                      {f.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {f.items.length} {f.items.length === 1 ? "item" : "items"}
                      {f.items.some(isPicked) && (
                        <span className="ml-1.5 font-semibold text-[#d7141f]">
                          &middot; {f.items.filter(isPicked).length} selected
                        </span>
                      )}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              /* Gallery: photo + code only */
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {folder.items.map((item) => {
                  const on = isPicked(item);
                  return (
                    <div
                      key={item.id}
                      className={`group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md ${
                        on ? "border-[#d7141f] ring-2 ring-[#d7141f]" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
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
                        <div className="px-3 py-2 text-center">
                          <p className="line-clamp-1 text-sm font-semibold" title={item.name}>
                            {item.name}
                          </p>
                          <p className="truncate font-mono text-xs font-bold tracking-wide text-muted-foreground">
                            {item.code}
                          </p>
                        </div>
                      </button>
                      {/* Tick to add to the wholesale request */}
                      <button
                        type="button"
                        onClick={() => togglePick(item)}
                        aria-pressed={on}
                        aria-label={on ? `Remove ${item.code} from request` : `Add ${item.code} to request`}
                        title={on ? "Remove from request" : "Add to request"}
                        className={`absolute right-2 top-2 flex size-8 items-center justify-center rounded-full border-2 shadow transition-colors ${
                          on
                            ? "border-[#d7141f] bg-[#d7141f] text-white"
                            : "border-white bg-black/40 text-white hover:bg-black/70"
                        }`}
                      >
                        {on ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
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

          {/* Photo clicked: larger view + showroom prompt (over the whole dialog) */}
            {selected && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setSelected(null)}
              >
                <div
                  className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Close photo"
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black"
                  >
                    <X className="size-4" />
                  </button>
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={selected.image}
                      alt={`${selected.name} (${selected.code})`}
                      fill
                      sizes="448px"
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-3 p-5 text-center">
                    <div>
                      <p className="text-lg font-bold">{selected.name}</p>
                      <p className="font-mono text-sm font-bold tracking-wide text-muted-foreground">
                        Code: {selected.code}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePick(selected)}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-md border-2 px-5 py-2.5 font-bold uppercase tracking-wide transition-colors ${
                        isPicked(selected)
                          ? "border-[#d7141f] bg-[#d7141f]/10 text-[#d7141f]"
                          : "border-foreground/80 hover:bg-foreground hover:text-background"
                      }`}
                    >
                      {isPicked(selected) ? (
                        <>
                          <Check className="size-5" /> Added to request
                        </>
                      ) : (
                        <>
                          <Plus className="size-5" /> Add to wholesale request
                        </>
                      )}
                    </button>
                    <Link
                      href="/our-stores"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#d7141f] px-5 py-3 font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#b5121c]"
                    >
                      <MapPin className="size-5" />
                      Find our nearest showroom
                    </Link>
                  </div>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
