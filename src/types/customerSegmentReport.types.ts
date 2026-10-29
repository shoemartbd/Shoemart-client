export type CustomerSegmentType = "NEW" | "REGULAR" | "LOYAL";

export interface ICustomerSegmentSummary {
  totalCustomers: number;
  newCustomers: number;
  regularCustomers: number;
  loyalCustomers: number;
  highSpenderCount: number;
  totalRevenue: number;
  unidentifiedOrders: number;
}

export interface ICustomerSegmentBreakdown {
  segment: CustomerSegmentType;
  count: number;
  totalRevenue: number;
}

export interface ICustomerSegment {
  phone: string;
  fullName: string | null;
  district: string | null;
  totalOrders: number;
  totalRevenue: number;
  totalQuantity: number;
  firstOrderDate: string;
  lastOrderDate: string;
  segment: CustomerSegmentType;
  isHighSpender: boolean;
}

export interface ICustomerSegmentReportOverview {
  summary: ICustomerSegmentSummary;
  segmentBreakdown: ICustomerSegmentBreakdown[];
  highSpenderThreshold: number;
  customers: ICustomerSegment[];
}
