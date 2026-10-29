export interface IPeriodSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
}

export interface IPlatformSummary {
  gmv: IPeriodSummary;
}

export type OrderTypeValue = "ONLINE" | "POS" | "LANDING_PAGE";
export type OrderStatusValue = "PENDING" | "CONFIRMED" | "IN_COURIER" | "DELIVERED" | "CANCELLED";

export interface IPlatformOverviewTotals {
  gmv: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface IPlatformOrderTypeBreakdown {
  orderType: OrderTypeValue;
  gmv: number;
  count: number;
}

export interface IPlatformOrderStatusBreakdown {
  orderStatus: OrderStatusValue;
  count: number;
}

export interface IPlatformTopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface IPlatformOverview {
  totals: IPlatformOverviewTotals;
  byOrderType: IPlatformOrderTypeBreakdown[];
  byOrderStatus: IPlatformOrderStatusBreakdown[];
  topProducts: IPlatformTopProduct[];
}

export interface IPlatformReportItem {
  id: string;
  product: { id: string; name: string };
  productVariant?: { id: string; combination: string } | null;
  price: number;
  quantity: number;
  returnedQuantity: number;
  lineTotal: number;
  order: {
    orderNumber: string;
    orderType: OrderTypeValue;
    createdAt: string;
  };
}

export interface IPlatformReportTotals {
  totalGmv: number;
  totalQuantity: number;
}
