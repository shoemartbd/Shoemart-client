"use client";

import { toggleCouponStatus } from "@/services/coupon.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface CouponStatusToggleProps {
  id: string;
  initialStatus: boolean;
}

const CouponStatusToggle = ({ id, initialStatus }: CouponStatusToggleProps) => {
  const [checked, setChecked] = useState(initialStatus);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleCouponStatus(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        setChecked(!checked);
        void queryClient.invalidateQueries({ queryKey: ["coupons"] });
      } else {
        toast.error(res.message || "Failed to update status");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  return (
    <button
      disabled={isPending}
      onClick={() => mutate()}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default CouponStatusToggle;
