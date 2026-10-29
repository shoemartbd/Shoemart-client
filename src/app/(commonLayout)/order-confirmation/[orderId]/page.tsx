import { getPublicOrder } from "@/services/order.services";
import { IPublicOrder } from "@/types/order.types";
import { Button } from "@/components/ui/button";
import PublicOrderDetails from "@/components/shared/PublicOrderDetails";
import GtmPurchaseTracker from "@/components/shared/GtmPurchaseTracker";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed | Shoe Mart",
  description: "Your order has been placed successfully",
};

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const res = await getPublicOrder(orderId);

  if (!res.success || !res.data) {
    notFound();
  }

  const order: IPublicOrder = res.data;

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16 max-w-3xl">
      {/* Success Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-3">Thank You{order.fullName ? `, ${order.fullName}` : ""}!</h1>
        <p className="text-muted-foreground max-w-md">
          Your order has been placed successfully. We&apos;ll contact you shortly
          to confirm delivery details.
        </p>
      </div>

      <PublicOrderDetails order={order} />
      <GtmPurchaseTracker order={order} />

      <div className="flex justify-center mt-10">
        <Button asChild size="lg" className="rounded-full h-12 px-8 font-bold">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
