export interface IPeriodSummary {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
}

export interface IProfitLossSummary {
  sales: IPeriodSummary;
  cost: IPeriodSummary;
  discount: IPeriodSummary;
  shipping: IPeriodSummary;
  profit: IPeriodSummary;
  expense: IPeriodSummary;
  netProfit: IPeriodSummary;
}

export interface IProfitLossItem {
  id: string;
  product: { id: string; name: string; purchasePrice: number };
  productVariant?: { id: string; combination: string; purchasePrice: number } | null;
  price: number;
  quantity: number;
  returnedQuantity: number;
  unitCost: number;
  lineTotal: number;
  lineCost: number;
  lineDiscount: number;
  lineProfit: number;
  order: {
    orderNumber: string;
    orderType: "ONLINE" | "POS" | "LANDING_PAGE";
    discountAmount: number;
    shippingFee: number;
    createdAt: string;
  };
}

export interface IProfitLossTotals {
  totalSales: number;
  totalCost: number;
  totalDiscount: number;
  totalShipping: number;
  totalProfit: number;
}
