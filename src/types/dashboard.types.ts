export interface NavChild {
  title: string;
  href: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  // Sub-links shown under the item (e.g. order lists by status)
  children?: NavChild[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface PieChartData {
  status: string;
  count: number;
}

export interface BarChartData {
  month: Date | string;
  count: number;
}

export interface IAdminDashboardData {
  adminCount: number;
  superAdminCount: number;
  userCount: number;
}
