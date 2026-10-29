import { IProduct } from "@/components/modules/Admin/Product/productColumns";

export interface IFlashSaleProductEntry {
  productId: string;
  order: number;
  product: IProduct;
}

export interface IFlashSaleConfig {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  products: IFlashSaleProductEntry[];
}

export interface IFlashSalePublic {
  isVisible: boolean;
  startTime: string | null;
  endTime: string | null;
  products: IProduct[];
}

export interface IUpdateFlashSalePayload {
  isActive: boolean;
  startTime: string | null;
  endTime: string | null;
  productIds: string[];
}
