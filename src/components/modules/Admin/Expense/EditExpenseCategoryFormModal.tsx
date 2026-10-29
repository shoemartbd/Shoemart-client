"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateExpenseCategory } from "@/services/expense.services";
import { IExpenseCategory } from "@/types/expense.types";
import { expenseCategoryZodSchema } from "@/zod/expense.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditExpenseCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: IExpenseCategory | null;
}

const getInitialValues = (category: IExpenseCategory | null) => ({
  name: category?.name || "",
  isActive: category?.isActive !== undefined ? String(category.isActive) : "true",
});

const EditExpenseCategoryFormModal = ({
  open,
  onOpenChange,
  category,
}: EditExpenseCategoryFormModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; isActive: boolean };
    }) => updateExpenseCategory(id, payload),
  });

  const form = useForm({
    defaultValues: getInitialValues(category),
    onSubmit: async ({ value }) => {
      if (!category) return;

      try {
        const result = await mutateAsync({
          id: category.id,
          payload: { name: value.name, isActive: value.isActive === "true" },
        });

        if (!result.success) {
          toast.error(result.message || "Failed to update expense category");
          return;
        }

        toast.success(result.message || "Expense category updated successfully");
        onOpenChange(false);

        void queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
        router.refresh();
      } catch (error) {
        const message = isAxiosError(error) ? error.response?.data?.message : undefined;
        toast.error(message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    if (open && category) {
      form.reset(getInitialValues(category));
    }
  }, [open, category, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-md gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit Expense Category</DialogTitle>
          <DialogDescription>
            Update the category name or status.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field
              name="name"
              validators={{ onChange: expenseCategoryZodSchema.shape.name }}
            >
              {(field) => <AppField field={field} label="Category Name" />}
            </form.Field>

            <form.Field name="isActive">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <DialogFooter className="border-t pt-5">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <AppSubmitButton
                isPending={isPending}
                pendingLabel="Updating..."
                className="w-auto"
              >
                Save Changes
              </AppSubmitButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseCategoryFormModal;
