"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TrackOrderFormProps {
  onSubmitted?: () => void;
}

// Order number + phone, then opens /track-order with both filled in
export function TrackOrderForm({ onSubmitted }: TrackOrderFormProps) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const canSubmit = Boolean(orderNumber.trim() && phone.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmitted?.();
    router.push(
      `/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="font-bold text-sm">Track Your Order</p>
        <p className="text-xs text-muted-foreground">
          Enter your order number and phone number
        </p>
      </div>
      <Input
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
        placeholder="Order Number (e.g. ONL-000123)"
        className="h-10 rounded-lg font-mono text-sm"
      />
      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        type="tel"
        placeholder="Phone Number"
        className="h-10 rounded-lg text-sm"
      />
      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-10 rounded-lg font-bold"
      >
        Track Order
      </Button>
    </form>
  );
}

export default function TrackOrderPopover({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full text-muted-foreground hover:text-primary transition-colors",
            triggerClassName,
          )}
          title="Track Order"
          aria-label="Track Order"
        >
          <PackageSearch className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
        <TrackOrderForm onSubmitted={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
