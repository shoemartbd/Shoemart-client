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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createExpenseCategory } from "@/services/expense.services";
import { expenseCategoryZodSchema } from "@/zod/expense.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Plus, Tags } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const defaultValues = { name: "" };

const CreateExpenseCategoryFormModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createExpenseCategory,
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync({ name: value.name });

        if (!result.success) {
          toast.error(result.message || "Failed to create expense category");
          return;
        }

        toast.success(result.message || "Expense category created successfully");
        setOpen(false);
        form.reset();

        void queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
        router.refresh();
      } catch (error) {
        const message = isAxiosError(error) ? error.response?.data?.message : undefined;
        toast.error(message || "Something went wrong");
      }
    },
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) form.reset();
    },
    [form],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0 gap-1.5 shadow-md">
          <Plus className="size-4" />
          Add Category
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-md gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Tags className="size-5 text-primary" />
            Add Expense Category
          </DialogTitle>
          <DialogDescription>
            Create a category to organize your shop expenses.
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
              {(field) => (
                <AppField
                  field={field}
                  label="Category Name"
                  placeholder="e.g. Rent, Packaging, Ads"
                />
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
                pendingLabel="Creating..."
                className="w-auto"
              >
                Add Category
              </AppSubmitButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExpenseCategoryFormModal;
