// Staff access on the client. `permissions` comes from /auth/me:
//   null      -> full access (super admin / admin)
//   string[]  -> a staff account limited to these keys
// The server enforces the same keys (module/staff/staffPermissions.ts);
// this file only decides what to show.

export type Permissions = string[] | null | undefined;

// Only the server's absence of a staff role means full access
export const isStaff = (permissions: Permissions): permissions is string[] =>
  Array.isArray(permissions);

export const hasPermission = (
  permissions: Permissions,
  needed: string | string[],
) => {
  if (!isStaff(permissions)) return true;
  const list = Array.isArray(needed) ? needed : [needed];
  return list.some((p) => permissions.includes(p));
};

const PRODUCT_ANY = ["product.view", "product.create", "product.update", "product.delete"];

// "FULL" = full admins only (managing staff and roles)
type PageRule = string | string[] | "FULL" | null;

// Longest matching prefix wins. A trailing "/" entry only matches sub-pages.
const PAGE_RULES: [string, PageRule][] = [
  ["/admin/dashboard/my-profile", null],
  ["/admin/dashboard/staff", "FULL"],
  ["/admin/dashboard/roles", "FULL"],

  ["/admin/dashboard/products/add", "product.create"],
  ["/admin/dashboard/products/print-labels", PRODUCT_ANY],
  ["/admin/dashboard/products", PRODUCT_ANY],
  ["/admin/dashboard/categories", "category.manage"],
  ["/admin/dashboard/brands", "brand.manage"],
  ["/admin/dashboard/attributes", "attribute.manage"],
  ["/admin/dashboard/size-charts", "sizeChart.manage"],
  ["/admin/dashboard/low-stock", "stock.manage"],

  ["/admin/dashboard/orders", "order.view"],
  ["/admin/dashboard/landing-page-orders", "order.view"],
  ["/admin/dashboard/abandoned-checkouts", "order.view"],
  ["/admin/dashboard/order-returns", "return.manage"],
  ["/admin/dashboard/blocked-numbers", "order.update"],
  ["/admin/dashboard/wholesale-requests", "order.view"],
  ["/admin/dashboard/pos-orders", "pos.use"],
  ["/admin/dashboard/pos", "pos.use"],

  ["/admin/dashboard/coupons", "coupon.manage"],
  ["/admin/dashboard/flash-sale", "flashSale.manage"],
  ["/admin/dashboard/landing-pages", "landingPage.manage"],

  ["/admin/dashboard/hero-sliders", "homepage.manage"],
  ["/admin/dashboard/popups", "homepage.manage"],
  ["/admin/dashboard/home-categories", "homepage.manage"],
  ["/admin/dashboard/sample-works", "homepage.manage"],
  ["/admin/dashboard/pages/", "page.manage"],
  ["/admin/dashboard/pages", ["page.manage", "homepage.manage"]],
  ["/admin/dashboard/blogs", "blog.manage"],

  ["/admin/dashboard/sales-report", "report.view"],
  ["/admin/dashboard/profit-loss-report", "report.view"],
  ["/admin/dashboard/analytics", "report.view"],
  ["/admin/dashboard/district-report", "report.view"],
  ["/admin/dashboard/customer-segment-report", "report.view"],
  ["/admin/dashboard/expense-report", "expense.manage"],
  ["/admin/dashboard/expense-categories", "expense.manage"],
  ["/admin/dashboard/expenses", "expense.manage"],

  ["/admin/dashboard/users", "customer.manage"],

  ["/admin/dashboard/site-settings", "setting.manage"],
  ["/admin/dashboard/shipping-settings", "setting.manage"],
  ["/admin/dashboard/gtm-settings", "setting.manage"],
  ["/admin/dashboard/courier-settings", "setting.manage"],
  ["/admin/dashboard/payment-settings", "setting.manage"],
  ["/admin/dashboard/sms-settings", "setting.manage"],
];

const SORTED_RULES = [...PAGE_RULES].sort((a, b) => b[0].length - a[0].length);

const findRule = (pathname: string): PageRule | undefined => {
  if (pathname === "/admin/dashboard") return "dashboard.view";
  const match = SORTED_RULES.find(([prefix]) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : undefined;
};

export const canAccessAdminPath = (permissions: Permissions, pathname: string) => {
  if (!isStaff(permissions)) return true;
  const rule = findRule(pathname);
  if (rule === null) return true;
  // Unknown pages and full-admin pages are closed to staff
  if (rule === undefined || rule === "FULL") return false;
  return hasPermission(permissions, rule);
};
