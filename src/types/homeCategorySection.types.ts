import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { ICategory } from "@/types/category.types";

export type HomeSectionDisplayType = "BEST_SELLING" | "LATEST";

export interface IHomeCategorySection {
  id: string;
  categoryId: string;
  displayType: HomeSectionDisplayType;
  order: number;
  category: ICategory;
}

export interface IHomepageCategorySection {
  id: string;
  displayType: HomeSectionDisplayType;
  order: number;
  category: ICategory;
  products: IProduct[];
}

export interface IUpdateHomeCategorySectionsPayload {
  sections: {
    categoryId: string;
    displayType: HomeSectionDisplayType;
  }[];
}
