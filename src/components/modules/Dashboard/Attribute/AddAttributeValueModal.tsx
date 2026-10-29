"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { IAttribute } from "@/types/attribute.types";
import { attributeValueZodSchema } from "@/zod/attribute.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface AddAttributeValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attribute: IAttribute | null;
  addValueAction: (attributeId: string, payload: { value: string }) => Promise<any>;
  deleteValueAction: (valueId: string) => Promise<any>;
}

const AddAttributeValueModal = ({
  open,
  onOpenChange,
  attribute,
  addValueAction,
  deleteValueAction,
}: AddAttributeValueModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync: addValue, isPending } = useMutation({
    mutationFn: (payload: { value: string }) =>
      addValueAction(attribute!.id, payload),
  });

  const { mutateAsync: deleteValue } = useMutation({
    mutationFn: deleteValueAction,
  });

  const form = useForm({
    defaultValues: {
      value: "",
    },
    onSubmit: async ({ value }) => {
      if (!attribute) return;

      const result = await addValue({ value: value.value });

      if (!result.success) {
        toast.error(result.message || "Failed to add attribute value");
        return;
      }

      toast.success(result.message || "Value added successfully");
      form.reset();

      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
      router.refresh();
    },
  });

  const handleDeleteValue = async (valueId: string) => {
    const result = await deleteValue(valueId);
    if (!result.success) {
      toast.error(result.message || "Failed to delete value");
      return;
    }
    toast.success(result.message || "Value deleted successfully");
    void queryClient.invalidateQueries({ queryKey: ["attributes"] });
    router.refresh();
  };

  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const currentValues = attribute?.values || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100vw-1.5rem)] max-w-lg gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Manage Values for &ldquo;{attribute?.name}&rdquo;</DialogTitle>
          <DialogDescription>
            Add new values or delete existing ones for this attribute.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
          {/* Add value form */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              form.handleSubmit();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1">
              <form.Field
                name="value"
                validators={{ onChange: attributeValueZodSchema.shape.value }}
              >
                {(field) => (
                  <AppField
                    field={field}
                    label="New Value"
                    placeholder="e.g. XL or Red"
                  />
                )}
              </form.Field>
            </div>
            <AppSubmitButton
              isPending={isPending}
              pendingLabel="Adding..."
              className="w-auto h-10 px-4 py-2"
            >
              Add
            </AppSubmitButton>
          </form>

          {/* Current values list */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Values
            </h4>
            <ScrollArea className="h-44 border rounded-md p-3">
              <div className="flex flex-wrap gap-2">
                {currentValues.length > 0 ? (
                  currentValues.map((v) => (
                    <Badge
                      key={v.id}
                      variant="secondary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-0.5 rounded flex items-center gap-1.5 border-none"
                    >
                      <span>{v.value}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(v.id)}
                        className="hover:bg-emerald-800 rounded-full p-0.5 transition-colors focus-visible:outline-none"
                        title={`Delete ${v.value}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    No values defined yet. Add one above!
                  </span>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4 bg-muted/30">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAttributeValueModal;
