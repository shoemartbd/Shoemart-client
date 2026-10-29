import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CategoryCircleItem {
  id: string;
  name: string;
  image?: string | null;
}

interface CategoryCircleRowProps {
  categories: CategoryCircleItem[];
  isLoading?: boolean;
  activeId?: string;
  skeletonCount?: number;
}

// Round category images with the name underneath, as on the home page.
// Centered when few; grows out to both sides as more are added, and scrolls
// sideways once the row is wider than the screen. The inner w-max + mx-auto
// (instead of justify-center) keeps the first item reachable when it overflows.
export default function CategoryCircleRow({
  categories,
  isLoading,
  activeId,
  skeletonCount = 12,
}: CategoryCircleRowProps) {
  return (
    <div className="overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto flex w-max gap-4 md:gap-6 lg:gap-8">
        {isLoading
          ? [...Array(skeletonCount)].map((_, i) => (
              <div
                key={i}
                className="flex w-20 shrink-0 flex-col items-center gap-3 sm:w-24 lg:w-28"
              >
                <Skeleton className="aspect-square w-full rounded-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))
          : categories.map((category) => (
              <CategoryCircle
                key={category.id}
                category={category}
                isActive={category.id === activeId}
                className="snap-start"
              />
            ))}
      </div>
    </div>
  );
}

// One round image + name, linking to the category's products
export function CategoryCircle({
  category,
  isActive = false,
  className,
}: {
  category: CategoryCircleItem;
  isActive?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex w-20 shrink-0 flex-col items-center gap-3 sm:w-24 lg:w-28",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-full bg-muted ring-2 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-lg",
          isActive ? "ring-primary shadow-lg" : "ring-transparent",
        )}
      >
        <Image
          src={category.image || "/placeholder.png"}
          alt={category.name}
          fill
          sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 80px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <h3
        className={cn(
          "text-center text-[11px] font-bold uppercase leading-tight tracking-wide transition-colors line-clamp-2 group-hover:text-primary sm:text-xs lg:text-sm",
          isActive
            ? "text-primary"
            : "text-slate-800 dark:text-slate-200",
        )}
      >
        {category.name}
      </h3>
    </Link>
  );
}
