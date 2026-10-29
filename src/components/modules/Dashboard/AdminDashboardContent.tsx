"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader,
  Package,
  PackageX,
  ShoppingCart,
  Sun,
  TrendingUp,
  Truck,
  Undo2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getAdminAnalytics } from "@/services/analytics.services";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ResponsiveChartContainer from "@/components/shared/ResponsiveChartContainer";
import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "CONFIRMED" | "IN_COURIER" | "DELIVERED" | "CANCELLED";

interface AdminAnalytics {
  summary: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
  today: { orders: number; revenue: number };
  thisMonth: { orders: number; revenue: number };
  orderStatus: {
    online: Record<OrderStatus, number>;
    landingPage: Record<OrderStatus, number>;
  };
  returns: { count: number; units: number; refundAmount: number };
  stock: { threshold: number; low: number; out: number; all: number };
  recentOrders: {
    id: string;
    orderNumber: string | null;
    orderType: "ONLINE" | "POS" | "LANDING_PAGE";
    fullName: string | null;
    totalAmount: number;
    orderStatus: OrderStatus;
    createdAt: string;
  }[];
  revenueTrend: { month: string; year: number; revenue: number; orders: number }[];
}

const taka = (value: number) =>
  `৳${Math.round(value || 0).toLocaleString("en-US")}`;

const STATUS_CARDS: {
  status: OrderStatus;
  label: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { status: "PENDING", label: "Pending", icon: Clock, tone: "bg-amber-500" },
  { status: "CONFIRMED", label: "Confirmed", icon: Loader, tone: "bg-sky-500" },
  { status: "IN_COURIER", label: "In Courier", icon: Truck, tone: "bg-indigo-500" },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle2, tone: "bg-emerald-500" },
  { status: "CANCELLED", label: "Cancelled", icon: Ban, tone: "bg-rose-500" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  CONFIRMED: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  IN_COURIER: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  DELIVERED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

const ORDER_TYPE_LABEL = { ONLINE: "Online", POS: "POS", LANDING_PAGE: "Landing" };

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  tone,
  href,
  highlight,
}: {
  title: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: LucideIcon;
  tone: string;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <Card
      className={cn(
        "h-full gap-0 rounded-2xl border p-5 shadow-sm transition-all duration-200",
        href && "group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:border-primary/30",
        highlight && "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
            tone,
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
      {sub && <div className="mt-2 text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );

  return href ? (
    <Link href={href} className="group block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {children}
      </h2>
      {action}
    </div>
  );
}

export default function AdminDashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAdminAnalytics(),
  });
  const analytics = data as AdminAnalytics | null | undefined;

  if (isLoading) {
    return (
      <div className="space-y-8 p-2 md:p-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {[4, 6, 4].map((count, row) => (
          <div key={row} className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {[...Array(count)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const online = analytics?.orderStatus?.online;
  const landing = analytics?.orderStatus?.landingPage;
  const stock = analytics?.stock;
  const pending = online?.PENDING ?? 0;
  const trend = analytics?.revenueTrend ?? [];
  const hasRevenue = trend.some((m) => m.revenue > 0);

  return (
    <div className="space-y-8 p-2 pb-20 md:p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 font-medium text-muted-foreground">
            {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Button asChild className="h-12 rounded-xl px-6 font-bold">
          <Link href="/admin/dashboard/analytics">
            Advanced Analytics <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {/* Needs attention */}
      {(pending > 0 || (stock?.out ?? 0) > 0) && (
        <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm sm:flex-row sm:items-center sm:gap-6">
          <span className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4" />
            Needs attention
          </span>
          {pending > 0 && (
            <Link href="/admin/dashboard/orders?orderStatus=PENDING" className="font-semibold text-foreground underline-offset-4 hover:underline">
              {pending} pending order{pending > 1 ? "s" : ""} to confirm →
            </Link>
          )}
          {(stock?.out ?? 0) > 0 && (
            <Link href="/admin/dashboard/low-stock?type=out" className="font-semibold text-foreground underline-offset-4 hover:underline">
              {stock?.out} product{stock!.out > 1 ? "s" : ""} out of stock →
            </Link>
          )}
        </div>
      )}

      {/* Sales */}
      <section className="space-y-3">
        <SectionTitle>Sales</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Today's Sales"
            value={taka(analytics?.today?.revenue ?? 0)}
            sub={`${analytics?.today?.orders ?? 0} orders today`}
            icon={Sun}
            tone="bg-orange-500"
          />
          <StatCard
            title="This Month"
            value={taka(analytics?.thisMonth?.revenue ?? 0)}
            sub={`${analytics?.thisMonth?.orders ?? 0} orders this month`}
            icon={CalendarDays}
            tone="bg-violet-500"
          />
          <StatCard
            title="Total Revenue"
            value={taka(analytics?.summary?.totalRevenue ?? 0)}
            sub="All time, cancelled orders and returns excluded"
            icon={Wallet}
            tone="bg-emerald-500"
          />
          <StatCard
            title="Total Orders"
            value={(analytics?.summary?.totalOrders ?? 0).toLocaleString()}
            sub="Online, POS and landing page"
            icon={ShoppingCart}
            tone="bg-blue-500"
          />
        </div>
      </section>

      {/* Order status */}
      <section className="space-y-3">
        <SectionTitle
          action={
            <Link href="/admin/dashboard/orders" className="text-xs font-semibold text-primary hover:underline">
              All online orders →
            </Link>
          }
        >
          Online Order Status
        </SectionTitle>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {STATUS_CARDS.map(({ status, label, icon, tone }) => {
            const landingCount = landing?.[status] ?? 0;
            return (
              <StatCard
                key={status}
                title={label}
                value={online?.[status] ?? 0}
                icon={icon}
                tone={tone}
                href={`/admin/dashboard/orders?orderStatus=${status}`}
                highlight={status === "PENDING" && pending > 0}
                sub={
                  landingCount > 0 ? `+${landingCount} landing page` : undefined
                }
              />
            );
          })}
          <StatCard
            title="Returns"
            value={analytics?.returns?.count ?? 0}
            sub={`${analytics?.returns?.units ?? 0} items · ${taka(analytics?.returns?.refundAmount ?? 0)} refunded`}
            icon={Undo2}
            tone="bg-pink-500"
            href="/admin/dashboard/order-returns"
          />
        </div>
      </section>

      {/* Store */}
      <section className="space-y-3">
        <SectionTitle>Store</SectionTitle>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard
            title="Customers"
            value={(analytics?.summary?.totalUsers ?? 0).toLocaleString()}
            icon={Users}
            tone="bg-cyan-500"
            href="/admin/dashboard/users"
          />
          <StatCard
            title="Products"
            value={(analytics?.summary?.totalProducts ?? 0).toLocaleString()}
            icon={Package}
            tone="bg-slate-600"
            href="/admin/dashboard/products"
          />
          <StatCard
            title="Low Stock"
            value={stock?.low ?? 0}
            sub={`${stock?.threshold ?? 5} or fewer left`}
            icon={AlertTriangle}
            tone="bg-amber-500"
            href="/admin/dashboard/low-stock?type=low"
          />
          <StatCard
            title="Out of Stock"
            value={stock?.out ?? 0}
            sub="Can't be ordered"
            icon={PackageX}
            tone="bg-red-500"
            href="/admin/dashboard/low-stock?type=out"
          />
        </div>
      </section>

      {/* Revenue trend + recent orders */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="gap-0 rounded-2xl border p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
              <TrendingUp className="size-5 text-primary" /> Revenue Trend
            </h3>
            <Badge variant="outline" className="rounded-full border-primary/20 px-3 font-semibold text-primary">
              Last 6 months
            </Badge>
          </div>
          <div className="relative h-[300px] w-full">
            <ResponsiveChartContainer>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`
                  }
                />
                <Tooltip
                  formatter={(value, _name, item) => [
                    `${taka(Number(value))} · ${item.payload.orders} orders`,
                    "Revenue",
                  ]}
                  labelFormatter={(label, payload) =>
                    `${label} ${payload?.[0]?.payload?.year ?? ""}`
                  }
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveChartContainer>
            {!hasRevenue && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                No sales in the last 6 months yet
              </p>
            )}
          </div>
        </Card>

        <Card className="gap-0 rounded-2xl border p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground">Recent Orders</h3>
            <Link href="/admin/dashboard/orders" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {(analytics?.recentOrders ?? []).length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <ul className="divide-y">
              {analytics!.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {order.fullName || "Customer"}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {order.orderNumber} · {ORDER_TYPE_LABEL[order.orderType]} ·{" "}
                      {format(new Date(order.createdAt), "d MMM, h:mm a")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-bold">{taka(order.totalAmount)}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        STATUS_BADGE[order.orderStatus],
                      )}
                    >
                      {order.orderStatus.replace("_", " ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
