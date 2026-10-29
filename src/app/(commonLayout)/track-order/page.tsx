"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrder } from "@/services/order.services";
import { IPublicOrder } from "@/types/order.types";
import PublicOrderDetails from "@/components/shared/PublicOrderDetails";
import { Loader2, PackageSearch, SearchX } from "lucide-react";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("orderNumber") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<IPublicOrder | null>(null);

  const runTrack = useCallback(async (orderNumberValue: string, phoneValue: string) => {
    setIsLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await trackOrder({ orderNumber: orderNumberValue, phone: phoneValue });
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || "Order not found. Please check your details.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Came from the navbar's "Track Order" popover with both fields already filled in —
  // run the lookup immediately instead of making the user submit the same form again.
  useEffect(() => {
    const initialOrderNumber = searchParams.get("orderNumber");
    const initialPhone = searchParams.get("phone");
    if (initialOrderNumber && initialPhone) {
      // Deferred to a microtask so the lookup's state updates don't run
      // synchronously inside the effect body itself.
      Promise.resolve().then(() => runTrack(initialOrderNumber.trim(), initialPhone.trim()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter both your order number and phone number");
      return;
    }
    await runTrack(orderNumber.trim(), phone.trim());
  };

  const handleTrackAnother = () => {
    setOrder(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:py-16 max-w-3xl">
      {order ? (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-black">Order Status</h1>
          <Button
            variant="outline"
            className="rounded-full font-bold"
            onClick={handleTrackAnother}
          >
            Track Another Order
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-primary/10 p-4 rounded-full mb-6">
              <PackageSearch className="h-14 w-14 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black mb-3">Track Your Order</h1>
            <p className="text-muted-foreground max-w-md">
              Enter your order number and phone number to see the latest status.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-3xl border shadow-sm p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. ONL-000123"
                className="h-12 rounded-xl font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="sm:col-span-2 h-12 rounded-full font-bold text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
                </>
              ) : (
                "Track Order"
              )}
            </Button>
          </form>

          {error && !isLoading && (
            <div className="flex flex-col items-center text-center gap-3 mt-10 text-muted-foreground">
              <SearchX className="h-12 w-12 opacity-40" />
              <p className="font-medium">{error}</p>
            </div>
          )}
        </>
      )}

      {order && <PublicOrderDetails order={order} />}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
