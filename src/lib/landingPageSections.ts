export const LANDING_PAGE_SECTION_KEYS = [
  "price",
  "gallery",
  "about",
  "description",
  "reviews",
] as const;

export type LandingPageSectionKey = (typeof LANDING_PAGE_SECTION_KEYS)[number];

export const LANDING_PAGE_SECTION_LABELS: Record<LandingPageSectionKey, string> = {
  price: "Pricing",
  gallery: "Gallery",
  about: "About & Video",
  description: "Description",
  reviews: "Customer Reviews",
};

export const LANDING_PAGE_SECTION_EYEBROWS: Record<LandingPageSectionKey, string> = {
  price: "Offer",
  gallery: "Gallery",
  about: "About",
  description: "Details",
  reviews: "Reviews",
};

// Sections that are always shown and can only be reordered, not hidden.
export const NON_HIDEABLE_LANDING_PAGE_SECTIONS: LandingPageSectionKey[] = ["price"];

export const DEFAULT_LANDING_PAGE_SECTION_ORDER: LandingPageSectionKey[] = [
  ...LANDING_PAGE_SECTION_KEYS,
];

// Older landing pages may have a stored order from before "price" became
// reorderable — make sure it's always present so pricing never disappears.
export function resolveSectionOrder(
  order?: LandingPageSectionKey[] | null,
): LandingPageSectionKey[] {
  const base = order?.length ? order : DEFAULT_LANDING_PAGE_SECTION_ORDER;
  return base.includes("price") ? base : ["price", ...base];
}
