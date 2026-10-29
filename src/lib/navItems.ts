import { NavChild, NavSection } from "@/types/dashboard.types";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";
import { canAccessAdminPath, Permissions } from "./permissions";

export const getCommonNavItems = (role: UserRole): NavSection[] => {
  const defaultDashboard = getDefaultDashboardRoute(role);
  return [
    {
      items: [
        {
          title: "Home",
          href: "/",
          icon: "Home",
        },
        {
          title: "Dashboard",
          href: defaultDashboard,
          icon: "LayoutDashboard",
        },
      ],
    },
  ];
};

export const userNavItems: NavSection[] = [
  {
    title: "Shopping",
    items: [
      {
        title: "My Orders",
        href: "/dashboard/my-orders",
        icon: "ShoppingBag",
      },
      {
        title: "My Reviews",
        href: "/dashboard/my-reviews",
        icon: "Star",
      },
      // {
      //   title: "Wishlist",
      //   href: "/dashboard/wishlist",
      //   icon: "Heart",
      // },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/dashboard/my-profile",
        icon: "User",
      },
    ],
  },
];

// One sub-link per order status, each opening the list filtered to it
const ORDER_STATUS_LINKS = [
  { title: "Pending", status: "PENDING" },
  { title: "Confirmed", status: "CONFIRMED" },
  { title: "In Courier", status: "IN_COURIER" },
  { title: "Delivered", status: "DELIVERED" },
  { title: "Cancelled", status: "CANCELLED" },
];

const orderStatusChildren = (href: string): NavChild[] => [
  { title: "All Orders", href },
  ...ORDER_STATUS_LINKS.map(({ title, status }) => ({
    title,
    href: `${href}?orderStatus=${status}`,
  })),
];

// Grouped by daily workflow: selling first, setup and settings last.
// Links must match the page paths in lib/permissions.ts (staff access).
export const adminNavItems: NavSection[] = [
  {
    title: "Sales & Orders",
    items: [
      {
        title: "POS (New Sale)",
        href: "/admin/dashboard/pos",
        icon: "Calculator",
      },
      {
        title: "Online Orders",
        href: "/admin/dashboard/orders",
        icon: "ShoppingCart",
        children: orderStatusChildren("/admin/dashboard/orders"),
      },
      {
        title: "Landing Page Orders",
        href: "/admin/dashboard/landing-page-orders",
        icon: "MousePointerClick",
        children: orderStatusChildren("/admin/dashboard/landing-page-orders"),
      },
      {
        title: "POS Orders",
        href: "/admin/dashboard/pos-orders",
        icon: "ReceiptText",
        children: orderStatusChildren("/admin/dashboard/pos-orders"),
      },
      {
        title: "Order Returns",
        href: "/admin/dashboard/order-returns",
        icon: "Undo2",
      },
      {
        title: "Incomplete Checkouts",
        href: "/admin/dashboard/abandoned-checkouts",
        icon: "Hourglass",
      },
      {
        title: "Wholesale Requests",
        href: "/admin/dashboard/wholesale-requests",
        icon: "Boxes",
      },
      {
        title: "Blocked Numbers",
        href: "/admin/dashboard/blocked-numbers",
        icon: "ShieldBan",
      },
    ],
  },
  {
    title: "Products",
    items: [
      {
        title: "All Products",
        href: "/admin/dashboard/products",
        icon: "Package",
      },
      {
        title: "Categories",
        href: "/admin/dashboard/categories",
        icon: "Layers",
      },
      {
        title: "Brands",
        href: "/admin/dashboard/brands",
        icon: "BadgeCheck",
      },
      {
        title: "Attributes",
        href: "/admin/dashboard/attributes",
        icon: "SlidersHorizontal",
      },
      {
        title: "Size Charts",
        href: "/admin/dashboard/size-charts",
        icon: "Ruler",
      },
      {
        title: "Low Stock",
        href: "/admin/dashboard/low-stock",
        icon: "PackageX",
      },
      {
        title: "Print Labels",
        href: "/admin/dashboard/products/print-labels",
        icon: "Barcode",
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Coupons",
        href: "/admin/dashboard/coupons",
        icon: "Ticket",
      },
      {
        title: "Flash Sale",
        href: "/admin/dashboard/flash-sale",
        icon: "Zap",
      },
      {
        title: "Landing Pages",
        href: "/admin/dashboard/landing-pages",
        icon: "Rocket",
      },
    ],
  },
  {
    title: "Website",
    items: [
      {
        title: "Homepage",
        href: "/admin/dashboard/home-categories",
        icon: "LayoutTemplate",
      },
      {
        title: "Slider & Banners",
        href: "/admin/dashboard/hero-sliders",
        icon: "Images",
      },
      {
        title: "Popup",
        href: "/admin/dashboard/popups",
        icon: "PictureInPicture2",
      },
      {
        title: "Sample Works",
        href: "/admin/dashboard/sample-works",
        icon: "FileDown",
      },
      {
        title: "Pages & FAQ",
        href: "/admin/dashboard/pages",
        icon: "FileText",
      },
      {
        title: "Blog",
        href: "/admin/dashboard/blogs",
        icon: "Newspaper",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        title: "Analytics",
        href: "/admin/dashboard/analytics",
        icon: "ChartLine",
      },
      {
        title: "Sales Report",
        href: "/admin/dashboard/sales-report",
        icon: "BarChart3",
      },
      {
        title: "Profit & Loss",
        href: "/admin/dashboard/profit-loss-report",
        icon: "TrendingUp",
      },
      {
        title: "Expense Report",
        href: "/admin/dashboard/expense-report",
        icon: "PieChart",
      },
      {
        title: "District Report",
        href: "/admin/dashboard/district-report",
        icon: "MapPin",
      },
      {
        title: "Customer Segments",
        href: "/admin/dashboard/customer-segment-report",
        icon: "UsersRound",
      },
    ],
  },
  {
    title: "Expenses",
    items: [
      {
        title: "Expenses",
        href: "/admin/dashboard/expenses",
        icon: "Wallet",
      },
      {
        title: "Expense Categories",
        href: "/admin/dashboard/expense-categories",
        icon: "Tags",
      },
    ],
  },
  {
    title: "Users & Access",
    items: [
      {
        title: "Users",
        href: "/admin/dashboard/users",
        icon: "Users",
      },
      {
        title: "Staff",
        href: "/admin/dashboard/staff",
        icon: "UserCog",
      },
      {
        title: "Roles & Access",
        href: "/admin/dashboard/roles",
        icon: "ShieldCheck",
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Site Settings",
        href: "/admin/dashboard/site-settings",
        icon: "Building2",
      },
      {
        title: "Payment Settings",
        href: "/admin/dashboard/payment-settings",
        icon: "CreditCard",
      },
      {
        title: "Shipping Settings",
        href: "/admin/dashboard/shipping-settings",
        icon: "PackageCheck",
      },
      {
        title: "GTM Settings",
        href: "/admin/dashboard/gtm-settings",
        icon: "Tags",
      },
      {
        title: "Courier Settings",
        href: "/admin/dashboard/courier-settings",
        icon: "Truck",
      },
      {
        title: "SMS Settings",
        href: "/admin/dashboard/sms-settings",
        icon: "MessageSquare",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "My Profile",
        href: "/admin/dashboard/my-profile",
        icon: "User",
      },
    ],
  },
];

// The menu item for the current page: an exact match, else the closest
// parent (so /admin/dashboard/products/add highlights "All Products")
export const getActiveNavHref = (pathname: string, sections: NavSection[]) => {
  const hrefs = sections.flatMap((s) => s.items.map((i) => i.href));
  if (hrefs.includes(pathname)) return pathname;
  return (
    hrefs
      .filter((href) => href !== "/" && pathname.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
};

// Staff only see the menu items their role can open; empty sections drop out
const filterAdminNav = (sections: NavSection[], permissions: Permissions) =>
  sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canAccessAdminPath(permissions, item.href),
      ),
    }))
    .filter((section) => section.items.length > 0);

export const getNavItemsByRole = (
  role: UserRole,
  permissions?: Permissions,
): NavSection[] => {
  const commonNavItems = getCommonNavItems(role);

  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return [
        ...commonNavItems,
        ...filterAdminNav(adminNavItems, permissions),
      ];

    case "USER":
      return [...commonNavItems, ...userNavItems];

    default:
      return commonNavItems;
  }
};
