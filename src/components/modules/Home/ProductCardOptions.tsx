/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from "@/lib/utils";

const isColourAttr = (name: string) => /colou?r/i.test(name);

// A few shop colour names that aren't CSS colour keywords
const COLOUR_ALIASES: Record<string, string> = {
  "off white": "#f5f3ee",
  "off-white": "#f5f3ee",
  cream: "#f3ead3",
  "light brown": "#a47551",
  "dark brown": "#4b2e1e",
  tan: "#c19a6b",
  camel: "#b5835a",
  coffee: "#6f4e37",
  chocolate: "#5a3825",
  mustard: "#d4a017",
  wine: "#722f37",
  maroon: "#800000",
  "army green": "#4b5320",
  multicolor: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
  multicolour: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
};

// CSS background for a colour value like "Black" or "#7b3f00"
const swatchFor = (value: string) => {
  const key = value.trim().toLowerCase();
  return COLOUR_ALIASES[key] ?? key.replace(/\s+/g, "");
};

// Sizes and colours of a variable product, shown over the bottom of the card
// image on hover. Display only — choosing happens on the details page.
export default function ProductCardOptions({ product }: { product: any }) {
  if (product?.type !== "VARIABLE" || !Array.isArray(product.attributes)) return null;

  const attrs = (product.attributes as any[]).filter(
    (a) => a?.name && Array.isArray(a.values) && a.values.length > 0,
  );
  if (attrs.length === 0) return null;

  // Sizes (and anything else) as boxes first, colours as dots last
  const ordered = [
    ...attrs.filter((a) => !isColourAttr(a.name)),
    ...attrs.filter((a) => isColourAttr(a.name)),
  ];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden translate-y-2 flex-col items-center gap-1.5 bg-white/95 px-2 py-2.5 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex dark:bg-slate-900/95"
    >
      {ordered.map((attr) => {
        const values = (attr.values as unknown[]).map(String);
        const colour = isColourAttr(attr.name);
        return (
          <div
            key={attr.name}
            className={cn("flex flex-wrap justify-center", colour ? "gap-1.5" : "gap-1")}
          >
            {values.map((value) =>
              colour ? (
                <span
                  key={value}
                  title={value}
                  className="size-4 rounded-full ring-1 ring-black/15 ring-offset-1 ring-offset-white dark:ring-white/30 dark:ring-offset-slate-900"
                  style={{ background: swatchFor(value) }}
                />
              ) : (
                <span
                  key={value}
                  className="min-w-7 rounded border border-black/15 bg-white px-1.5 py-0.5 text-center text-[11px] font-medium leading-tight text-slate-800 dark:border-white/20 dark:bg-slate-800 dark:text-slate-100"
                >
                  {value}
                </span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}
