import { IUser } from "./user.types";

export type OrderStatus = "PENDING" | "CONFIRMED" | "IN_COURIER" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderType = "ONLINE" | "POS" | "LANDING_PAGE";
export type CourierProvider = "PATHAO" | "STEADFAST" | "REDX";

export const COURIER_LABEL: Record<CourierProvider, string> = {
  PATHAO: "Pathao",
  STEADFAST: "Steadfast",
  REDX: "RedX",
};

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string | null;
  quantity: number;
  returnedQuantity: number;
  price: number;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  productVariant?: {
    id: string;
    combination: string;
    image?: string | null;
  } | null;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  userId: string;
  orderType: OrderType;
  totalAmount: number;
  fullName: string;
  phone: string;
  email?: string | null;
  address: string;
  district: string;
  notes?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  discountAmount: number;
  shippingFee: number;
  vatAmount: number;
  couponId?: string | null;
  courierProvider?: CourierProvider | null;
  courierConsignmentId?: string | null;
  courierTrackingCode?: string | null;
  courierStatus?: string | null;
  courierAssignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: IOrderItem[];
  user?: Pick<IUser, "id" | "name" | "email"> | null; // null for guest / POS orders
  // Set by the admin order list: this phone number is blocked as fraud
  isPhoneBlocked?: boolean;
}

// Subset of IOrder returned by the public, unauthenticated order-confirmation endpoint
// (GET /orders/:id/public) — no userId/user/shop/couponId, no internal item fields.
export interface IPublicOrderItem {
  id: string;
  quantity: number;
  returnedQuantity: number;
  price: number;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  productVariant?: {
    id: string;
    combination: string;
  } | null;
}

export interface IPublicOrder {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  vatAmount: number;
  fullName: string;
  phone: string;
  email?: string | null;
  address: string;
  district: string;
  notes?: string | null;
  createdAt: string;
  items: IPublicOrderItem[];
}
