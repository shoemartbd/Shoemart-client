/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserAnalytics } from "@/services/analytics.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Wallet, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function UserDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["user-analytics"],
    queryFn: () => getUserAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-[2.5rem]" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Orders",
      value: analytics?.summary?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      title: "Total Spent",
      value: `৳${analytics?.summary?.totalSpending?.toLocaleString() || 0}`,
      icon: Wallet,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-8 p-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          My Dashboard
        </h1>
        <p className="text-muted-foreground font-medium mt-1">
          Welcome back! Here&apos;s an overview of your shopping activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, i) => (
          <Card
            key={i}
            className="border-none shadow-md shadow-slate-200/50 rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-slate-50 text-slate-400 font-black border-none px-2 py-0.5 rounded-lg text-[10px]"
                >
                  ACTIVITY
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 px-8 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black text-slate-900">
              Recent Orders
            </CardTitle>
            <Link href="/dashboard/my-orders">
              <Button
                variant="link"
                className="font-black text-primary uppercase tracking-widest text-xs"
              >
                View All Orders <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {analytics?.recentOrders?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Order Details
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Amount
                    </th>
                    <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analytics.recentOrders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/30 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                            {order.items
                              .slice(0, 3)
                              .map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="relative h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm"
                                >
                                  <Image
                                    src={
                                      item.product.images[0] ||
                                      "/placeholder.png"
                                    }
                                    alt="Product"
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                          </div>
                          <p className="font-bold text-slate-800 text-sm">
                            Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-sm font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 font-black text-slate-900">
                        ৳{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Badge
                          className={`rounded-full font-black text-[10px] uppercase px-3 py-1 ${
                            order.orderStatus === "DELIVERED"
                              ? "bg-green-100 text-green-600 hover:bg-green-100"
                              : order.orderStatus === "CANCELLED"
                                ? "bg-red-100 text-red-600 hover:bg-red-100"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {order.orderStatus.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                <Package className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-muted-foreground font-medium">
                No orders yet. Start your shopping journey today!
              </p>
              <Link href="/products">
                <Button variant="outline" className="rounded-xl font-bold">
                  Browse Products
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
