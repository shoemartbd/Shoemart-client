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
import { deleteAbandonedCheckout } from "@/services/abandonedCheckout.services";
import { IAbandonedCheckout } from "@/types/abandonedCheckout.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteAbandonedCheckoutConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abandonedCheckout: IAbandonedCheckout | null;
}

const DeleteAbandonedCheckoutConfirmationDialog = ({
  open,
  onOpenChange,
  abandonedCheckout,
}: DeleteAbandonedCheckoutConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteAbandonedCheckout(id),
  });

  const handleConfirmDelete = async () => {
    if (!abandonedCheckout) return;

    try {
      const result = await mutateAsync(abandonedCheckout.id);

      if (!result.success) {
        toast.error(result.message || "Failed to delete record");
        return;
      }

      toast.success("Record deleted successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["abandoned-checkouts"] });
      router.refresh();
    } catch {
      toast.error("Failed to delete record");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Incomplete Checkout</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the record for{" "}
            <strong>{abandonedCheckout?.fullName || "this visitor"}</strong>?
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

export default DeleteAbandonedCheckoutConfirmationDialog;
