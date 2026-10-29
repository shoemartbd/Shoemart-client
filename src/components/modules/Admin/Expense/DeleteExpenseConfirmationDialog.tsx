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
import { deleteExpense } from "@/services/expense.services";
import { IExpense } from "@/types/expense.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteExpenseConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: IExpense | null;
}

const DeleteExpenseConfirmationDialog = ({
  open,
  onOpenChange,
  expense,
}: DeleteExpenseConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
  });

  const handleConfirmDelete = async () => {
    if (!expense) {
      toast.error("Expense not found");
      return;
    }

    try {
      const result = await mutateAsync(expense.id);

      if (!result.success) {
        toast.error(result.message || "Failed to delete expense");
        return;
      }

      toast.success(result.message || "Expense deleted successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
      void queryClient.invalidateQueries({ queryKey: ["expense-report-summary"] });
      router.refresh();
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || "Failed to delete expense");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Expense</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{expense?.name}</strong>?
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

export default DeleteExpenseConfirmationDialog;
