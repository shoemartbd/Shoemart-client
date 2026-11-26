import ProductListing from "@/components/modules/Product/ProductListing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Shoes Online | Shoe Mart",
  description:
    "Browse men's, women's and kids' shoes, sneakers, sandals and more at Shoe Mart. Best prices and cash on delivery across Bangladesh.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop All Shoes Online | Shoe Mart",
    description:
      "Browse men's, women's and kids' shoes, sneakers, sandals and more at Shoe Mart.",
    url: "/products",
    type: "website",
  },
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <ProductListing />
    </div>
  );
}
