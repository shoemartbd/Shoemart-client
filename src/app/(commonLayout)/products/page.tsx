import ProductListing from "@/components/modules/Product/ProductListing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Products | Shoe Mart",
  description: "Find the best deals on electronics, fashion, and more at Shoe Mart.",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <ProductListing />
    </div>
  );
}
