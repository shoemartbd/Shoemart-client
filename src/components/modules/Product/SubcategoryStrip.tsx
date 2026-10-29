"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "@/services/category.services";
import { ICategory } from "@/types/category.types";
import CategoryCircleRow from "@/components/modules/Category/CategoryCircleRow";

interface SubcategoryStripProps {
  categoryId: string;
}

const activeOnly = (list?: ICategory[]) =>
  (list || []).filter((c) => c.isActive !== false);

// Shows the subcategories of the selected category as round images. When the
// selected category is itself a subcategory with no children, shows its
// siblings instead (with it highlighted) so the shopper can switch between them.
// The first item, "All", opens the parent with every subcategory's products.
export default function SubcategoryStrip({ categoryId }: SubcategoryStripProps) {
  const { data: categoryRes, isLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId),
    staleTime: 10 * 60 * 1000,
  });

  const category = categoryRes?.data;
  const children = activeOnly(category?.subcategories);
  const parentId =
    category && children.length === 0 ? category.parentId : undefined;

  const { data: parentRes, isLoading: isParentLoading } = useQuery({
    queryKey: ["category", parentId],
    queryFn: () => getCategoryById(parentId!),
    enabled: Boolean(parentId),
    staleTime: 10 * 60 * 1000,
  });

  const parent = children.length > 0 ? category : parentRes?.data;
  const subcategories =
    children.length > 0 ? children : activeOnly(parentRes?.data?.subcategories);
  const items =
    parent && subcategories.length > 0
      ? [{ ...parent, name: "All" }, ...subcategories]
      : [];

  if (isLoading || (parentId && isParentLoading)) {
    return (
      <div className="mb-8">
        <CategoryCircleRow categories={[]} isLoading skeletonCount={6} />
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <section aria-label="Subcategories" className="mb-8">
      <CategoryCircleRow categories={items} activeId={categoryId} />
    </section>
  );
}
