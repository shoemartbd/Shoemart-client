// Order sizes offered in the wholesale form
export const QUANTITY_TIERS = [
  { value: "50 – 100 pairs", tier: "Starter", perk: "Wholesale rate on every pair" },
  { value: "100 – 500 pairs", tier: "Business", perk: "A better rate, mix any styles & sizes" },
  { value: "500 – 1,000 pairs", tier: "Bulk", perk: "Bigger savings on your whole order" },
  { value: "1,000+ pairs", tier: "Partner", perk: "Our best rate — talk to our team" },
];

export const WHOLESALE_FORM_ID = "wholesale-form";

export const scrollToWholesaleForm = () =>
  document
    .getElementById(WHOLESALE_FORM_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
