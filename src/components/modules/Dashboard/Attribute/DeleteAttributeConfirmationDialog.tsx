"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IAttribute } from "@/types/attribute.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteAttributeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: IAttribute | null;
  deleteAction: (id: string) => Promise<any>;
}

const DeleteAttributeConfirmationDialog = ({
  open,
  onOpenChange,
  attribute,
  deleteAction,
}: DeleteAttributeConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteAction,
    onSuccess: (result: any) => {
      if (!result.success) {
        toast.error(result.message || "Failed to delete attribute");
        return;
      }

      toast.success(result.message || "Attribute deleted successfully");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "An error occurred while deleting the attribute");
    },
  });

  const handleDelete = () => {
    if (attribute) {
      mutate(attribute.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Attribute</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the attribute{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{attribute?.name}&rdquo;
            </span>
            ? This action will permanently remove it and all of its associated values.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAttributeConfirmationDialog;
