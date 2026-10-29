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
import { IAttribute } from "@/types/attribute.types";
import { attributeZodSchema } from "@/zod/attribute.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface EditAttributeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: IAttribute | null;
  updateAction: (id: string, payload: { name: string }) => Promise<any>;
}

const EditAttributeFormModal = ({
  open,
  onOpenChange,
  attribute,
  updateAction,
}: EditAttributeFormModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string } }) =>
      updateAction(id, payload),
  });

  const form = useForm({
    defaultValues: {
      name: attribute?.name || "",
    },
    onSubmit: async ({ value }) => {
      if (!attribute) return;

      const result = await mutateAsync({
        id: attribute.id,
        payload: { name: value.name },
      });

      if (!result.success) {
        toast.error(result.message || "Failed to update attribute");
        return;
      }

      toast.success(result.message || "Attribute updated successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
      router.refresh();
    },
  });

  // Reset form values when attribute changes
  useEffect(() => {
    if (attribute) {
      form.reset({ name: attribute.name });
    }
  }, [attribute, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Edit Attribute</DialogTitle>
          <DialogDescription>
            Modify the name of the attribute.
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
              pendingLabel="Updating..."
              className="w-auto"
            >
              Update Attribute
            </AppSubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAttributeFormModal;
