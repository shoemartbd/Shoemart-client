export interface ISalesReportItem {
  id: string;
  price: number;
  quantity: number;
  returnedQuantity: number;
  lineTotal: number;
  productId: string;
  product: { name: string };
  productVariant?: { combination: string } | null;
  order: {
    orderNumber: string;
    orderType: "ONLINE" | "POS" | "LANDING_PAGE";
    createdAt: string;
  };
}

export interface ISalesReportProductSummary {
  name: string;
  quantity: number;
  total: number;
}

export interface ISalesReportTotals {
  totalSales: number;
  totalQuantity: number;
}

export interface ISalesSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
}

export type PeriodFilter = "all" | "today" | "week" | "month" | "range";
