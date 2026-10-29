// Product showcase labels. Keep in sync with the ProductHighlight enum on the
// server. Used by the admin product form now and homepage sections later.
export const PRODUCT_HIGHLIGHTS = [
  {
    value: "NEW_ARRIVAL",
    label: "New Arrival",
    // chip colours when selected
    className: "bg-emerald-500 text-white border-emerald-500",
  },
  {
    value: "TRENDING",
    label: "Trending",
    className: "bg-sky-500 text-white border-sky-500",
  },
  {
    value: "TOP_SELLING",
    label: "Top Selling",
    className: "bg-orange-500 text-white border-orange-500",
  },
] as const;

export type ProductHighlight = (typeof PRODUCT_HIGHLIGHTS)[number]["value"];
