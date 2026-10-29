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
import { createExpense, getMyExpenseCategories } from "@/services/expense.services";
import { expenseZodSchema } from "@/zod/expense.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Plus, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const todayInput = () => new Date().toISOString().slice(0, 10);

const defaultValues = {
  categoryId: "",
  name: "",
  price: 0,
  note: "",
  date: todayInput(),
};

const CreateExpenseFormModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: categoryResponse } = useQuery({
    queryKey: ["expense-categories", "active"],
    queryFn: () => getMyExpenseCategories({ isActive: "true", limit: "100" }),
    enabled: open,
  });

  const categories = categoryResponse?.data ?? [];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createExpense,
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!value.categoryId) {
        toast.error("Please select an expense category");
        return;
      }

      try {
        const result = await mutateAsync({
          categoryId: value.categoryId,
          name: value.name,
          price: Number(value.price),
          note: value.note || undefined,
          date: value.date,
        });

        if (!result.success) {
          toast.error(result.message || "Failed to add expense");
          return;
        }

        toast.success(result.message || "Expense added successfully");
        setOpen(false);
        form.reset();

        void queryClient.invalidateQueries({ queryKey: ["expenses"] });
        void queryClient.invalidateQueries({ queryKey: ["expense-report-summary"] });
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
          Add Expense
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Wallet className="size-5 text-primary" />
            Add Expense
          </DialogTitle>
          <DialogDescription>Record a new expense for your shop.</DialogDescription>
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
                      {categories.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No active categories. Add one first.
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field
              name="name"
              validators={{ onChange: expenseZodSchema.shape.name }}
            >
              {(field) => (
                <AppField field={field} label="Expense Name" placeholder="e.g. Shop rent for July" />
              )}
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
                      placeholder="0.00"
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
                    placeholder="Any additional details..."
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
                pendingLabel="Adding..."
                className="w-auto"
              >
                Add Expense
              </AppSubmitButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExpenseFormModal;
