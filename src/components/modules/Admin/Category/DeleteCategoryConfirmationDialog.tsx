"use client";

import { deleteCategoryAction } from "@/app/(dashboardLayout)/admin/dashboard/categories/_action";
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
import { ICategory } from "@/types/category.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCategoryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ICategory | null;
}

const DeleteCategoryConfirmationDialog = ({
  open,
  onOpenChange,
  category,
}: DeleteCategoryConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteCategoryAction,
  });

  const handleConfirmDelete = async () => {
    if (!category) {
      toast.error("Category not found");
      return;
    }

    const result = await mutateAsync(category.id);

    if (!result.success) {
      toast.error(result.message || "Failed to delete category");
      return;
    }

    toast.success(result.message || "Category deleted successfully");
    onOpenChange(false);

    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{category?.name}</strong>?
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

export default DeleteCategoryConfirmationDialog;
