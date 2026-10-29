"use client";

import { updateCategoryAction } from "@/app/(dashboardLayout)/admin/dashboard/categories/_action";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/types/category.types";
import { categoryZodSchema } from "@/zod/category.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditCategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: ICategory | null;
  categories: ICategory[];
}

const getInitialValues = (category: ICategory | null) => ({
  name: category?.name || "",
  parentId: category?.parentId || "none",
  isActive: category?.isActive !== undefined ? String(category.isActive) : "true",
});

const EditCategoryFormModal = ({
  open,
  onOpenChange,
  category,
  categories,
}: EditCategoryFormModalProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null,
  );

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateCategoryAction(id, formData),
  });

  const form = useForm({
    defaultValues: getInitialValues(category),
    onSubmit: async ({ value }) => {
      if (!category) return;

      const formData = new FormData();
      const data = {
        name: value.name,
        parentId: value.parentId === "none" ? null : value.parentId,
        isActive: value.isActive === "true",
      };

      formData.append("data", JSON.stringify(data));
      if (imageFile) formData.append("image", imageFile);

      const result = await mutateAsync({ id: category.id, formData });

      if (!result.success) {
        toast.error(result.message || "Failed to update category");
        return;
      }

      toast.success(result.message || "Category updated successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.refresh();
    },
  });

  useEffect(() => {
    if (open && category) {
      form.reset(getInitialValues(category));
      const timeoutId = setTimeout(() => {
        setImagePreview(category.image || null);
        setImageFile(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, category, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setImageFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category details. Leave files empty to keep current.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-5.5rem)]">
          <div className="px-6 py-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <form.Field
                  name="name"
                  validators={{ onChange: categoryZodSchema.shape.name }}
                >
                  {(field) => <AppField field={field} label="Name" />}
                </form.Field>

                <form.Field name="parentId">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Parent Category</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            None (Root Category)
                          </SelectItem>
                          {categories
                            .filter((c) => c.id !== category?.id)
                            .map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="isActive">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={field.handleChange}
                      >
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

                <div>
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <p className="text-xs text-muted-foreground">Size: 1200 × 640 px · Ratio 15:8</p>
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border bg-muted">
                      {imagePreview && (
                        <Image
                          src={imagePreview}
                          alt="Image Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      )}
                      <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                        <Upload className="size-8 text-white" />
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryFormModal;
