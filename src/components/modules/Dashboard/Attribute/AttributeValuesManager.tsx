"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAttributeById } from "@/services/attribute.services";
import { IAttributeValue } from "@/types/attribute.types";
import { attributeValueZodSchema } from "@/zod/attribute.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return String(error);
};

interface AttributeValuesManagerProps {
  attributeId: string;
  addValueAction: (
    attributeId: string,
    payload: { value: string }
  ) => Promise<any>;
  updateValueAction: (
    valueId: string,
    payload: { value: string }
  ) => Promise<any>;
  deleteValueAction: (valueId: string) => Promise<any>;
}

const AttributeValuesManager = ({
  attributeId,
  addValueAction,
  updateValueAction,
  deleteValueAction,
}: AttributeValuesManagerProps) => {
  const queryClient = useQueryClient();

  const [editingValue, setEditingValue] = useState<IAttributeValue | null>(null);
  const [deletingValue, setDeletingValue] = useState<IAttributeValue | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const basePath = "/admin/dashboard/attributes";

  // Fetch attribute data
  const {
    data: attributeResponse,
    isLoading,
  } = useQuery({
    queryKey: ["attribute", attributeId],
    queryFn: () => getAttributeById(attributeId),
  });

  const attribute = attributeResponse?.data;
  const values = attribute?.values || [];

  // Add value mutation
  const { mutateAsync: addValue, isPending: isAdding } = useMutation({
    mutationFn: (payload: { value: string }) =>
      addValueAction(attributeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["attribute", attributeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  // Update value mutation
  const { mutateAsync: updateValue, isPending: isUpdating } = useMutation({
    mutationFn: ({ valueId, payload }: { valueId: string; payload: { value: string } }) =>
      updateValueAction(valueId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["attribute", attributeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  // Delete value mutation
  const { mutateAsync: deleteValue, isPending: isDeleting } = useMutation({
    mutationFn: deleteValueAction,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["attribute", attributeId],
      });
      void queryClient.invalidateQueries({ queryKey: ["attributes"] });
    },
  });

  // Form for either adding or editing
  const form = useForm({
    defaultValues: { value: "" },
    onSubmit: async ({ value }) => {
      if (editingValue) {
        // Edit mode
        const result = await updateValue({
          valueId: editingValue.id,
          payload: { value: value.value },
        });
        if (!result.success) {
          toast.error(result.message || "Failed to update value");
          return;
        }
        toast.success(result.message || "Value updated successfully");
        setEditingValue(null);
        form.reset({ value: "" });
      } else {
        // Add mode
        const result = await addValue({ value: value.value });
        if (!result.success) {
          toast.error(result.message || "Failed to add value");
          return;
        }
        toast.success(result.message || "Value added successfully");
        form.reset({ value: "" });
      }
    },
  });

  const handleEditTrigger = useCallback((item: IAttributeValue) => {
    setEditingValue(item);
    form.reset({ value: item.value });
  }, [form]);

  const handleCancelEdit = useCallback(() => {
    setEditingValue(null);
    form.reset({ value: "" });
  }, [form]);

  const handleDeleteTrigger = useCallback((item: IAttributeValue) => {
    setDeletingValue(item);
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingValue) return;
    const result = await deleteValue(deletingValue.id);
    if (!result.success) {
      toast.error(result.message || "Failed to delete value");
      return;
    }
    toast.success(result.message || "Value deleted successfully");
    setIsDeleteOpen(false);
    setDeletingValue(null);
    
    // If deleting the value that is currently being edited, cancel the edit state
    if (editingValue && editingValue.id === deletingValue.id) {
      handleCancelEdit();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground animate-in fade-in" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with breadcrumb */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          {attribute?.name} values
        </h2>
        <nav className="text-sm font-medium flex items-center gap-1.5">
          <Link
            href={basePath}
            className="text-[#82D03D] hover:underline transition-colors"
          >
            Attributes
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-400 font-semibold">{attribute?.name}</span>
        </nav>
      </div>

      {/* Main layout: Table + Form side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Values Table */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border border-slate-200 rounded-md overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#F8F9FA] border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-bold text-slate-800 text-[14px] px-6 py-4">Value</TableHead>
                    <TableHead className="font-bold text-slate-800 text-[14px] text-center w-[160px] px-6 py-4">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values.length > 0 ? (
                    values.map((v, index) => (
                      <TableRow 
                        key={v.id} 
                        className={`transition-colors border-b border-slate-100 last:border-b-0 ${
                          index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                        } hover:bg-slate-50`}
                      >
                        <TableCell className="font-medium text-slate-700 px-6 py-4 text-[14px]">
                          {v.value}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {/* Seamless pill style buttons */}
                            <div className="inline-flex rounded-[4px] overflow-hidden shadow-sm">
                              {/* Edit Button */}
                              <Button
                                type="button"
                                size="icon"
                                className="h-8 w-11 bg-[#82D03D] hover:bg-[#72b735] text-white rounded-l-[4px] rounded-r-none transition-colors border-none flex items-center justify-center"
                                onClick={() => handleEditTrigger(v)}
                                title="Edit Value"
                              >
                                <Pencil className="size-4 stroke-[2.5]" />
                              </Button>

                              {/* Delete Button */}
                              <Button
                                type="button"
                                size="icon"
                                className="h-8 w-11 bg-[#E13033] hover:bg-[#cb2326] text-white rounded-r-[4px] rounded-l-none transition-colors border-none flex items-center justify-center"
                                onClick={() => handleDeleteTrigger(v)}
                                title="Delete Value"
                              >
                                <Trash className="size-4 stroke-[2.5]" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-slate-400 italic py-12"
                      >
                        No values added yet. Add one using the form on the right.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Value Form */}
        <div className="lg:col-span-1">
          <Card className="border-t-4 border-t-[#82D03D] shadow-sm border border-slate-200 rounded-md overflow-hidden bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              {/* Card Body */}
              <div className="p-6">
                <form.Field
                  name="value"
                  validators={{
                    onChange: attributeValueZodSchema.shape.value,
                  }}
                >
                  {(field) => {
                    const firstError =
                      field.state.meta.isTouched && field.state.meta.errors.length > 0
                        ? getErrorMessage(field.state.meta.errors[0])
                        : null;
                    const hasError = firstError !== null;

                    return (
                      <div className="space-y-3">
                        <label
                          htmlFor={field.name}
                          className="font-bold text-slate-800 text-[14px] block"
                        >
                          {editingValue
                            ? `Edit ${attribute?.name} Value`
                            : `${attribute?.name} Value`}
                        </label>
                        <div className="relative">
                          <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={field.state.value}
                            placeholder=""
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isAdding || isUpdating}
                            aria-invalid={hasError}
                            className={`w-full px-3 py-2 text-slate-800 text-sm bg-white border ${
                              hasError
                                ? "border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                : "border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#82D03D] focus:border-[#82D03D]"
                            } rounded-[4px] shadow-sm transition-colors`}
                          />
                          {hasError && (
                            <p
                              id={`${field.name}-error`}
                              role="alert"
                              className="text-xs text-red-500 mt-1.5"
                            >
                              {firstError}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                </form.Field>
              </div>

              {/* Card Footer */}
              <div className="bg-[#F8F9FA] px-6 py-4 border-t border-slate-100 flex items-center gap-2">
                <AppSubmitButton
                  isPending={isAdding || isUpdating}
                  pendingLabel={editingValue ? "Updating..." : "Saving..."}
                  className="w-auto bg-[#82D03D] hover:bg-[#72b735] text-white px-5 h-9 text-sm font-semibold rounded-[4px] border-none shadow-sm transition-colors cursor-pointer"
                >
                  {editingValue ? "Save" : "Save"}
                </AppSubmitButton>
                
                {editingValue && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-9 px-4 text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-[4px] transition-colors"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeletingValue(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Value</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deletingValue?.value}
              &rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttributeValuesManager;
