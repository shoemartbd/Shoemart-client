export interface IDistrictReportSummary {
  totalOrders: number;
  totalRevenue: number;
  totalQuantity: number;
  totalDistricts: number;
}

export interface IDistrictReportProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface IDistrictReportDistrict {
  district: string;
  totalOrders: number;
  totalRevenue: number;
  totalQuantity: number;
  topProducts: IDistrictReportProduct[];
}

export type DistrictReportOrderType = "ONLINE" | "POS" | "LANDING_PAGE";

export interface IDistrictReportOrderItem {
  productName: string;
  quantity: number;
}

export interface IDistrictReportOrder {
  id: string;
  orderNumber: string | null;
  fullName: string | null;
  phone: string | null;
  district: string;
  orderType: DistrictReportOrderType;
  createdAt: string;
  totalAmount: number;
  items: IDistrictReportOrderItem[];
}

export interface IDistrictReportOverview {
  summary: IDistrictReportSummary;
  districts: IDistrictReportDistrict[];
  topProducts: IDistrictReportProduct[];
  orders: IDistrictReportOrder[];
}
