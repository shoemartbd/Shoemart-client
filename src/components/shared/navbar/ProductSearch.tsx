"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Package, Search, X } from "lucide-react";
import { getAllProducts } from "@/services/product.services";
import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { cn } from "@/lib/utils";

const SUGGESTION_COUNT = 6;
const MIN_CHARS = 2;

const formatPrice = (value: number) =>
  `৳${Math.round(value).toLocaleString("en-US")}`;

const searchQuery = (term: string) => ({
  queryKey: ["product-search", term],
  queryFn: () =>
    getAllProducts({ searchTerm: term, limit: String(SUGGESTION_COUNT), view: "card" }),
  staleTime: 60 * 1000,
});

// A scanned barcode is an exact SKU, of the product or one of its variants
const findBarcodeMatch = (products: IProduct[], term: string) => {
  const code = term.trim().toLowerCase();
  return products.find(
    (p) =>
      p.sku?.toLowerCase() === code ||
      p.variants?.some((v: { sku?: string | null }) => v.sku?.toLowerCase() === code),
  );
};

interface ProductSearchProps {
  autoFocus?: boolean;
  className?: string;
  // Called after navigating away, e.g. to close the mobile search bar
  onDone?: () => void;
}

// Search by product name or barcode with live suggestions. Enter opens the
// highlighted suggestion, the product whose barcode matches exactly, or the
// full results page.
export default function ProductSearch({
  autoFocus,
  className,
  onDone,
}: ProductSearchProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const term = value.trim();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(timer);
  }, [term]);

  const { data, isFetching } = useQuery({
    ...searchQuery(debounced),
    enabled: debounced.length >= MIN_CHARS,
  });
  const suggestions: IProduct[] =
    debounced.length >= MIN_CHARS ? (data?.data ?? []) : [];
  const total: number = data?.meta?.total ?? suggestions.length;
  const showDropdown = open && term.length >= MIN_CHARS;

  const finish = (href: string) => {
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.blur();
    router.push(href);
    onDone?.();
  };

  const goToResults = () => {
    if (!term) return;
    finish(`/products?searchTerm=${encodeURIComponent(term)}`);
  };

  const handleSubmit = async () => {
    if (!term) return;
    if (highlighted >= 0 && suggestions[highlighted]) {
      finish(`/products/${suggestions[highlighted].slug}`);
      return;
    }

    // Barcode scanners type the code and press Enter faster than the
    // suggestions load, so look it up right away
    setIsSubmitting(true);
    try {
      const res = await queryClient.fetchQuery(searchQuery(term));
      const match = findBarcodeMatch(res?.data ?? [], term);
      if (match) {
        setValue("");
        finish(`/products/${match.slug}`);
        return;
      }
    } catch {
      // fall through to the results page
    } finally {
      setIsSubmitting(false);
    }
    goToResults();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSubmit();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex h-11 items-center rounded-full border border-primary/20 bg-background shadow-sm transition-colors hover:border-primary/40 focus-within:border-primary/60"
      >
        <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          placeholder="Search by product name or barcode"
          role="combobox"
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden"
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          // Delay so a click on a suggestion lands before the list closes
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
        {(isFetching || isSubmitting) && term.length >= MIN_CHARS ? (
          <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="mr-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        <button
          type="submit"
          className="mr-1 h-9 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl"
          onMouseDown={(e) => e.preventDefault()}
        >
          {debounced !== term || (isFetching && suggestions.length === 0) ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Searching...
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No products found for &quot;{term}&quot;
            </p>
          ) : (
            <ul id={listboxId} role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
              {suggestions.map((product, i) => (
                <li key={product.id} role="option" aria-selected={i === highlighted}>
                  <button
                    type="button"
                    onClick={() => finish(`/products/${product.slug}`)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                      i === highlighted ? "bg-muted" : "hover:bg-muted/60",
                    )}
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border bg-white">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <Package className="m-auto mt-3 h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {product.name}
                      </p>
                      {product.sku && (
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {product.sku}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {formatPrice(product.sellPrice)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {suggestions.length > 0 && debounced === term && (
            <button
              type="button"
              onClick={goToResults}
              className="flex w-full items-center justify-center gap-2 border-t px-4 py-3 text-sm font-semibold text-primary hover:bg-muted/60"
            >
              <Search className="h-4 w-4" />
              See all {total > suggestions.length ? `${total} ` : ""}results for
              &quot;{term}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
