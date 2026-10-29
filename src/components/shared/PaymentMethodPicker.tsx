"use client";

import { CreditCard, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { IPaymentMethods } from "@/types/paymentSetting.types";

export type PaymentMethod = "COD" | "BKASH" | "SSLCOMMERZ";

interface MethodOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const OPTIONS: MethodOption[] = [
  {
    id: "COD",
    label: "Cash on Delivery",
    description: "Pay when you receive the product",
    icon: (
      <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
        <Truck className="size-5" />
      </span>
    ),
  },
  {
    id: "BKASH",
    label: "bKash",
    description: "Pay now from your bKash account",
    icon: (
      <span className="flex size-10 items-center justify-center rounded-lg bg-[#E2136E] text-lg font-black italic text-white">
        b
      </span>
    ),
  },
  {
    id: "SSLCOMMERZ",
    label: "Card / Mobile Banking",
    description: "Visa, Mastercard, Nagad, Rocket & more",
    icon: (
      <span className="flex size-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
        <CreditCard className="size-5" />
      </span>
    ),
  },
];

// Methods the admin turned on. COD is always available and listed first.
export const availablePaymentMethods = (
  settings: IPaymentMethods | null | undefined,
  { allowSslcommerz = true }: { allowSslcommerz?: boolean } = {},
): PaymentMethod[] => [
  "COD",
  ...(settings?.bkashEnabled ? (["BKASH"] as const) : []),
  ...(allowSslcommerz && settings?.sslcommerzEnabled ? (["SSLCOMMERZ"] as const) : []),
];

interface PaymentMethodPickerProps {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodPicker({
  methods,
  value,
  onChange,
}: PaymentMethodPickerProps) {
  const options = OPTIONS.filter((o) => methods.includes(o.id));

  return (
    <div role="radiogroup" aria-label="Payment method" className="space-y-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
              selected
                ? option.id === "BKASH"
                  ? "border-[#E2136E] bg-[#E2136E]/5"
                  : "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {option.icon}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">{option.label}</span>
              <span className="block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected
                  ? option.id === "BKASH"
                    ? "border-[#E2136E]"
                    : "border-primary"
                  : "border-muted-foreground/30",
              )}
            >
              {selected && (
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    option.id === "BKASH" ? "bg-[#E2136E]" : "bg-primary",
                  )}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
