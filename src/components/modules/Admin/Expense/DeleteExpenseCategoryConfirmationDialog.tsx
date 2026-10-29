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
import { deleteExpenseCategory } from "@/services/expense.services";
import { IExpenseCategory } from "@/types/expense.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteExpenseCategoryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: IExpenseCategory | null;
}

const DeleteExpenseCategoryConfirmationDialog = ({
  open,
  onOpenChange,
  category,
}: DeleteExpenseCategoryConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteExpenseCategory(id),
  });

  const handleConfirmDelete = async () => {
    if (!category) {
      toast.error("Expense category not found");
      return;
    }

    try {
      const result = await mutateAsync(category.id);

      if (!result.success) {
        toast.error(result.message || "Failed to delete expense category");
        return;
      }

      toast.success(result.message || "Expense category deleted successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      router.refresh();
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(message || "Failed to delete expense category");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Expense Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{category?.name}</strong>?
            This action cannot be undone. Categories with existing expenses
            cannot be deleted — deactivate them instead.
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

export default DeleteExpenseCategoryConfirmationDialog;
