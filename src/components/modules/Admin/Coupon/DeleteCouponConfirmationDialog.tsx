"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCoupon } from "@/services/coupon.services";
import { ICoupon } from "@/types/coupon.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCouponConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: ICoupon | null;
}

const DeleteCouponConfirmationDialog = ({
  open,
  onOpenChange,
  coupon,
}: DeleteCouponConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
  });

  const handleConfirmDelete = async () => {
    if (!coupon) {
      toast.error("Coupon not found");
      return;
    }

    try {
      const result = await mutateAsync(coupon.id);

      if (!result.success) {
        toast.error(result.message || "Failed to delete coupon");
        return;
      }

      toast.success(result.message || "Coupon deleted successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["coupons"] });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete coupon <strong>{coupon?.code}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event) => {
              event.preventDefault();
              void handleConfirmDelete();
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCouponConfirmationDialog;
