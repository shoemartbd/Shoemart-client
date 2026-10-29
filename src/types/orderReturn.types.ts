export interface IOrderReturnItem {
  id: string;
  orderReturnId: string;
  orderItemId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  productVariantId?: string | null;
  productVariant?: {
    id: string;
    combination: string;
  } | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IOrderReturn {
  id: string;
  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    fullName: string;
    phone: string;
    district: string;
  };
  refundAmount: number;
  shippingFee: number;
  discountAmount: number;
  newTotalAmount: number;
  createdAt: string;
  items: IOrderReturnItem[];
}
