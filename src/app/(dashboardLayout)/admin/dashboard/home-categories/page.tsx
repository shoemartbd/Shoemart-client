"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { getAllCategories } from "@/services/category.services";
import {
  getHomeCategorySections,
  updateHomeCategorySections,
} from "@/services/homeCategorySection.services";
import { HomeSectionDisplayType } from "@/types/homeCategorySection.types";
import HomePromoSettings from "./_components/HomePromoSettings";
import TestimonialSettings from "./_components/TestimonialSettings";
import ClientLogoSettings from "./_components/ClientLogoSettings";

interface SectionRow {
  key: string;
  categoryId: string;
  displayType: HomeSectionDisplayType;
}

const createRow = (
  categoryId = "",
  displayType: HomeSectionDisplayType = "BEST_SELLING",
): SectionRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  categoryId,
  displayType,
});

export default function HomeCategoriesPage() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<SectionRow[]>([]);

  const { data: sectionsData, isLoading: isLoadingSections } = useQuery({
    queryKey: ["home-category-sections"],
    queryFn: () => getHomeCategorySections(),
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const categories = categoriesData?.data || [];

  useEffect(() => {
    if (sectionsData?.data) {
      setRows(
        sectionsData.data.map((section) =>
          createRow(section.categoryId, section.displayType),
        ),
      );
    }
  }, [sectionsData]);

  const { mutate: saveSections, isPending: isSaving } = useMutation({
    mutationFn: updateHomeCategorySections,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Homepage categories updated successfully");
        void queryClient.invalidateQueries({
          queryKey: ["home-category-sections"],
        });
      } else {
        toast.error(res.message || "Failed to update homepage categories");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const handleAddRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleRemoveRow = (key: string) => {
    setRows((prev) => prev.filter((row) => row.key !== key));
  };

  const handleCategoryChange = (key: string, categoryId: string) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, categoryId } : row)),
    );
  };

  const handleDisplayTypeChange = (
    key: string,
    displayType: HomeSectionDisplayType,
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, displayType } : row)),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const sections = rows
      .filter((row) => row.categoryId)
      .map((row) => ({
        categoryId: row.categoryId,
        displayType: row.displayType,
      }));
    saveSections({ sections });
  };

  const isLoading = isLoadingSections || isLoadingCategories;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Home Page</h3>
        <p className="text-muted-foreground">
          Manage the promo strip and the category sections on the storefront
          homepage.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <HomePromoSettings />
        <ClientLogoSettings />
        <TestimonialSettings />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Homepage Categories</h4>
          </div>

          <div className="space-y-4">
            {rows.length === 0 ? (
              <div className="flex h-32 items-center justify-center border border-dashed rounded-xl">
                <p className="text-muted-foreground">
                  No sections added yet. Add one to get started.
                </p>
              </div>
            ) : (
              rows.map((row) => {
                const chosenElsewhere = rows
                  .filter((r) => r.key !== row.key)
                  .map((r) => r.categoryId);

                return (
                  <div
                    key={row.key}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                  >
                    <Select
                      value={row.categoryId}
                      onValueChange={(value) =>
                        handleCategoryChange(row.key, value)
                      }
                    >
                      <SelectTrigger className="w-full sm:flex-1 h-11 rounded-xl">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            disabled={chosenElsewhere.includes(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={row.displayType}
                      onValueChange={(value) =>
                        handleDisplayTypeChange(
                          row.key,
                          value as HomeSectionDisplayType,
                        )
                      }
                    >
                      <SelectTrigger className="w-full sm:w-52 h-11 rounded-xl">
                        <SelectValue placeholder="Display Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEST_SELLING">
                          Best Selling
                        </SelectItem>
                        <SelectItem value="LATEST">Latest</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveRow(row.key)}
                      className="h-11 rounded-xl shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddRow}
            className="rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 px-8 rounded-full font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Homepage"
          )}
        </Button>
      </form>
    </div>
  );
}
