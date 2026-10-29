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
import { attributeZodSchema } from "@/zod/attribute.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface CreateAttributeFormModalProps {
  createAction: (payload: { name: string }) => Promise<any>;
}

const defaultValues = {
  name: "",
};

const CreateAttributeFormModal = ({ createAction }: CreateAttributeFormModalProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createAction,
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = await mutateAsync({ name: value.name });

      if (!result.success) {
        toast.error(result.message || "Failed to create attribute");
        return;
      }

      toast.success(result.message || "Attribute created successfully");
      setOpen(false);
      form.reset();

      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
      router.refresh();
    },
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        form.reset();
      }
    },
    [form]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-colors">
          <Plus className="size-4 mr-2" />
          Add New Attribute
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Add New Attribute</DialogTitle>
          <DialogDescription>
            Define a new attribute key (e.g. Size, Colour, Weight) for products.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="px-6 py-5 space-y-4">
            <form.Field
              name="name"
              validators={{ onChange: attributeZodSchema.shape.name }}
            >
              {(field) => (
                <AppField
                  field={field}
                  label="Attribute Name"
                  placeholder="e.g. Size"
                />
              )}
            </form.Field>
          </div>

          <DialogFooter className="border-t px-6 py-4 bg-muted/30">
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
              Create Attribute
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAttributeFormModal;
