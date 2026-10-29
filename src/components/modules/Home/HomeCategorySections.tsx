"use client";

import { useQuery } from "@tanstack/react-query";
import { getHomepageCategorySections } from "@/services/homeCategorySection.services";
import { ProductSlider } from "./HighlightProductSlider";

// One product row per category the admin picked, in the New Arrivals style
export default function HomeCategorySections() {
  const { data } = useQuery({
    queryKey: ["homepage-category-sections"],
    queryFn: () => getHomepageCategorySections(),
    staleTime: 10 * 60 * 1000,
  });

  const sections = (data?.data || []).filter(
    (section) => section.products && section.products.length > 0,
  );

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <ProductSlider
          key={section.id}
          title={section.category.name}
          moreHref={`/products?categoryId=${section.category.id}`}
          products={section.products}
        />
      ))}
    </>
  );
}
