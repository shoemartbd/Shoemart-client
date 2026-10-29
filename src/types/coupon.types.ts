export type DiscountType = "FLAT" | "PERCENTAGE";

export interface ICoupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  maxDiscountAmount?: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  shopId: string;
  products?: ICouponProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface ICouponProduct {
  id: string;
  name: string;
  images?: string[];
}

export interface ICreateCouponPayload {
  code: string;
  discountType: DiscountType;
  discountAmount: number;
  maxDiscountAmount?: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  productIds: string[];
}
