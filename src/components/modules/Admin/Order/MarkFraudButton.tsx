"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, ShieldBan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { blockPhone } from "@/services/blockedPhone.services";
import { usePermissions } from "@/providers/PermissionProvider";
import { IOrder } from "@/types/order.types";
import { cn } from "@/lib/utils";

interface MarkFraudButtonProps {
  order: IOrder;
  size?: "sm" | "lg";
  className?: string;
}

// Blocks the order's phone number so it can't place orders again
export default function MarkFraudButton({ order, size = "sm", className }: MarkFraudButtonProps) {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!can("order.update") || !order.phone || order.orderType === "POS") return null;

  if (order.isPhoneBlocked) {
    return (
      <Link
        href={`/admin/dashboard/blocked-numbers?search=${encodeURIComponent(order.phone)}`}
        title="This number is blocked. Manage it in Blocked Numbers."
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 font-semibold text-red-600 dark:text-red-400",
          size === "lg" ? "h-12 px-5 text-base" : "h-8 px-2.5 text-xs",
          className,
        )}
      >
        <Ban className={size === "lg" ? "size-5" : "size-3.5"} />
        Blocked
      </Link>
    );
  }

  const handleBlock = async () => {
    setIsSaving(true);
    try {
      await blockPhone({ orderId: order.id, reason: reason.trim() || "Fraud / fake order" });
      toast.success(`${order.phone} is blocked from ordering`);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["blocked-phones"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to block number");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={() => setOpen(true)}
        title="Mark as fraud and block this phone number"
        className={cn(
          "gap-1.5 border-red-500/40 font-semibold text-red-600 hover:bg-red-600 hover:text-white dark:text-red-400",
          size === "lg" ? "h-12 rounded-xl px-5 text-base" : "h-8 rounded-lg px-2.5 text-xs",
          className,
        )}
      >
        <ShieldBan className={size === "lg" ? "size-5" : "size-3.5"} />
        Fraud
      </Button>

      <Dialog open={open} onOpenChange={(next) => !isSaving && setOpen(next)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldBan className="size-5" />
              Mark as Fraud
            </DialogTitle>
            <DialogDescription>
              <span className="font-mono font-semibold text-foreground">{order.phone}</span>{" "}
              won&apos;t be able to place orders from checkout or landing pages.
              You can unblock it any time from Blocked Numbers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor={`fraud-reason-${order.id}`}>Reason (optional)</Label>
            <Input
              id={`fraud-reason-${order.id}`}
              placeholder="e.g. Fake order, didn't receive parcel"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleBlock}
              disabled={isSaving}
              className="gap-2 bg-red-600 text-white hover:bg-red-700"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
              Block Number
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
