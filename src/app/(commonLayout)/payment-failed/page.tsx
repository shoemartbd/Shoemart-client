"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import {
  initiateBkashGuestPayment,
  initiateBkashPayment,
} from "@/services/payment.services";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id");
  const isCancelled = searchParams.get("reason") === "cancelled";
  // Set by the bKash callback so the same order can be paid again
  const isBkash = searchParams.get("method") === "bkash";
  const orderId = searchParams.get("order");
  const isGuest = searchParams.get("guest") === "1";
  const [isRetrying, setIsRetrying] = useState(false);

  const retryBkash = async () => {
    if (!orderId) return;
    setIsRetrying(true);
    try {
      const res = isGuest
        ? await initiateBkashGuestPayment(orderId)
        : await initiateBkashPayment(orderId);
      if (res.data?.bkashURL) {
        window.location.href = res.data.bkashURL;
        return;
      }
      throw new Error("Could not open bKash");
    } catch (error: any) {
      toast.error(error.message || "Could not open bKash. Please try again.");
      setIsRetrying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16 max-w-lg text-center">
      <div className="flex flex-col items-center">
        <div className="bg-destructive/10 p-4 rounded-full mb-6">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black mb-3">
          {isCancelled ? "Payment Cancelled" : "Payment Failed"}
        </h1>
        <p className="text-muted-foreground max-w-md mb-2">
          {isCancelled
            ? "You cancelled the payment before it was completed. Your order has not been paid for."
            : "We couldn't complete your payment. Your order has not been paid for."}
        </p>
        {isBkash && orderId && (
          <p className="text-sm text-muted-foreground max-w-md">
            Your order is saved. You can try bKash again, or keep it and pay on
            delivery.
          </p>
        )}
        {tranId && (
          <p className="text-xs text-muted-foreground font-mono mb-8">
            Reference: {tranId}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {isBkash && orderId ? (
            <>
              <Button
                size="lg"
                onClick={retryBkash}
                disabled={isRetrying}
                className="rounded-full h-12 px-8 font-bold bg-[#E2136E] text-white hover:bg-[#c80f5f]"
              >
                {isRetrying ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Try bKash again"
                )}
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 font-bold"
              >
                <Link href={`/order-confirmation/${orderId}`}>View order</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="rounded-full h-12 px-8 font-bold">
                <Link href="/cart">Back to Cart</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full h-12 px-8 font-bold"
              >
                <Link href="/track-order">Track an Order</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}
