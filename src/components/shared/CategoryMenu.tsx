"use client";

import { useState, useEffect } from "react";
import { getAllCategories } from "@/services/category.services";
import { ICategory } from "@/types/category.types";
import { Menu, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const CategoryMenu = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        if (res && res.data) {
          const allCats = res.data.filter(c => c.isActive !== false);
          
          const hasNested = allCats.some(c => c.subcategories && c.subcategories.length > 0);
          
          if (hasNested) {
             setCategories(
               allCats
                 .filter(c => !c.parentId)
                 .map(c => ({
                   ...c,
                   subcategories: c.subcategories?.filter(sub => sub.isActive !== false) || []
                 }))
             );
          } else {
             const map = new Map<string, ICategory>();
             allCats.forEach(c => map.set(c.id, { ...c, subcategories: [] }));
             
             const roots: ICategory[] = [];
             allCats.forEach(c => {
               if (c.parentId && map.has(c.parentId)) {
                 map.get(c.parentId)!.subcategories!.push(map.get(c.id)!);
               } else {
                 roots.push(map.get(c.id)!);
               }
             });
             setCategories(roots);
          }
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div 
      className="relative z-50 h-full"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => {
        setIsOpen(false);
        setActiveCategory(null);
      }}
    >
      <div className="flex h-full cursor-pointer items-center gap-2 rounded-l-full bg-primary px-5 text-primary-foreground transition-colors hover:bg-primary/90">
        <Menu className="h-4 w-4" />
        <span className="text-sm font-bold whitespace-nowrap">Shop By Category</span>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full pt-2">
          <div className="flex min-h-[400px] w-[600px] rounded-b-md rounded-tr-md border bg-background shadow-2xl overflow-hidden">
            {/* Left Panel */}
            <div className="w-[260px] border-r py-2 overflow-y-auto max-h-[500px] bg-muted/20" data-lenis-prevent>
              {categories.map((cat, idx) => (
                <Link
                  key={cat.id || idx}
                  href={`/products?categoryId=${cat.id}`}
                  onMouseEnter={() => setActiveCategory(cat)}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-background text-foreground/80 hover:text-foreground",
                    activeCategory?.id === cat.id && "bg-background text-foreground font-medium shadow-sm border-l-2 border-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {cat.image || cat.icon ? (
                      <div className="relative h-6 w-6 flex-shrink-0">
                        <Image 
                          src={cat.image || cat.icon || ""} 
                          alt={cat.name} 
                          fill 
                          sizes="24px"
                          className="object-contain" 
                        />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded flex-shrink-0 bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  {(cat.subcategories && cat.subcategories.length > 0) && (
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  )}
                </Link>
              ))}
              {categories.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">Loading categories...</div>
              )}
            </div>

            {/* Right Panel */}
            <div className="flex-1 p-6 bg-background rounded-r-md">
              {activeCategory ? (
                <div>
                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-primary border-b pb-2">
                    {activeCategory.name}
                  </h3>
                  {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                    <div className="flex flex-col gap-4 mt-4">
                      {activeCategory.subcategories.map((sub, idx) => (
                        <Link
                          key={sub.id || idx}
                          href={`/products?categoryId=${sub.id}`}
                          onClick={() => setIsOpen(false)}
                          className="text-sm text-foreground/70 hover:text-primary transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">No subcategories.</p>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Hover over a category to view subcategories
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
