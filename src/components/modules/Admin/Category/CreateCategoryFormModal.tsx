"use client";

import { createCategoryAction } from "@/app/(dashboardLayout)/admin/dashboard/categories/_action";
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
import { Plus, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const defaultValues = {
  name: "",
  parentId: "none",
};

const CreateCategoryFormModal = ({ categories }: { categories: ICategory[] }) => {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createCategoryAction,
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      const data = {
        name: value.name,
        parentId: value.parentId === "none" ? null : value.parentId,
      };

      formData.append("data", JSON.stringify(data));
      if (imageFile) formData.append("image", imageFile);

      const result = await mutateAsync(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to create category");
        return;
      }

      toast.success(result.message || "Category created successfully");
      setOpen(false);
      form.reset();
      setImageFile(null);
      setImagePreview(null);

      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.refresh();
    },
  });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setImageFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      }
    },
    [],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        form.reset();
        setImageFile(null);
        setImagePreview(null);
      }
    },
    [form],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0">
          <Plus className="size-4" />
          Add New Category
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category or subcategory for your marketplace.
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
                  {(field) => (
                    <AppField
                      field={field}
                      label="Name"
                      placeholder="e.g. Electronics"
                    />
                  )}
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
                          <SelectValue placeholder="Select parent" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Root Category)</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                <div>
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <p className="text-xs text-muted-foreground">Size: 1200 × 640 px · Ratio 15:8</p>
                    {!imagePreview ? (
                      <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg upload-zone">
                        <span className="upload-icon mb-2"><Upload className="size-5" /></span>
                        <span className="text-xs font-semibold text-primary text-center px-4">
                          Upload Image
                        </span>
                        <Input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="relative h-32 w-full overflow-hidden rounded-lg border">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 size-6 rounded-full"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    )}
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
                  pendingLabel="Creating..."
                  className="w-auto"
                >
                  Create Category
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCategoryFormModal;
