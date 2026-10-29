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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getMyExpenseCategories, updateExpense } from "@/services/expense.services";
import { IExpense } from "@/types/expense.types";
import { expenseZodSchema } from "@/zod/expense.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: IExpense | null;
}

const getInitialValues = (expense: IExpense | null) => ({
  categoryId: expense?.categoryId || "",
  name: expense?.name || "",
  price: expense?.price || 0,
  note: expense?.note || "",
  date: expense?.date ? expense.date.slice(0, 10) : "",
});

const EditExpenseFormModal = ({ open, onOpenChange, expense }: EditExpenseFormModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: categoryResponse } = useQuery({
    queryKey: ["expense-categories", "active"],
    queryFn: () => getMyExpenseCategories({ isActive: "true", limit: "100" }),
    enabled: open,
  });

  const categories = categoryResponse?.data ?? [];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        categoryId: string;
        name: string;
        price: number;
        note?: string;
        date: string;
      };
    }) => updateExpense(id, payload),
  });

  const form = useForm({
    defaultValues: getInitialValues(expense),
    onSubmit: async ({ value }) => {
      if (!expense) return;

      try {
        const result = await mutateAsync({
          id: expense.id,
          payload: {
            categoryId: value.categoryId,
            name: value.name,
            price: Number(value.price),
            note: value.note || undefined,
            date: value.date,
          },
        });

        if (!result.success) {
          toast.error(result.message || "Failed to update expense");
          return;
        }

        toast.success(result.message || "Expense updated successfully");
        onOpenChange(false);

        void queryClient.invalidateQueries({ queryKey: ["expenses"] });
        void queryClient.invalidateQueries({ queryKey: ["expense-report-summary"] });
        router.refresh();
      } catch (error) {
        const message = isAxiosError(error) ? error.response?.data?.message : undefined;
        toast.error(message || "Something went wrong");
      }
    },
  });

  useEffect(() => {
    if (open && expense) {
      form.reset(getInitialValues(expense));
    }
  }, [open, expense, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit Expense</DialogTitle>
          <DialogDescription>Update this expense&apos;s details.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(95vh-11rem)] overflow-y-auto px-6 py-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field name="categoryId">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field
              name="name"
              validators={{ onChange: expenseZodSchema.shape.name }}
            >
              {(field) => <AppField field={field} label="Expense Name" />}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="price">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Amount (৳)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="date">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="note">
              {(field) => (
                <div className="space-y-1.5">
                  <Label>Note (optional)</Label>
                  <Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    rows={3}
                  />
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

export default EditExpenseFormModal;
