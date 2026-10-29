import { OrderStatus } from "@/types/order.types";
import { Check, Clock, Package, Truck, XCircle } from "lucide-react";

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", icon: Package },
  { status: "IN_COURIER", label: "In Courier", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Check },
];

export default function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <p className="font-bold text-destructive">Order Cancelled</p>
          <p className="text-sm text-muted-foreground">
            This order has been cancelled.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((step) => step.status === status);

  return (
    <div className="flex items-start">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isDone = isComplete || isCurrent;
        const Icon = step.icon;

        return (
          <div
            key={step.status}
            className={`flex flex-1 flex-col items-center text-center ${index === 0 ? "items-start text-left" : ""} ${index === STEPS.length - 1 ? "!items-end !text-right" : ""}`}
          >
            <div className="flex w-full items-center">
              {/* Incoming connector: filled once this step itself has been reached (isDone), not
                  just once it's fully behind us — otherwise the segment leading into the current
                  (or final) step renders half-colored. */}
              <div
                className={`h-1 flex-1 rounded-full ${index === 0 ? "invisible" : isDone ? "bg-primary" : "bg-muted"}`}
              />
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div
                className={`h-1 flex-1 rounded-full ${index === STEPS.length - 1 ? "invisible" : isComplete ? "bg-primary" : "bg-muted"}`}
              />
            </div>
            <span
              className={`mt-2 text-[11px] sm:text-xs font-semibold ${
                isDone ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
