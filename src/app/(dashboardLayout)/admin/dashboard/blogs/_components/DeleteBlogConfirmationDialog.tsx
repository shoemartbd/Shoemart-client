"use client";

import { deleteBlogAction } from "@/app/(dashboardLayout)/admin/dashboard/blogs/_action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IBlog } from "@/types/blog.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteBlogConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: IBlog | null;
}

const DeleteBlogConfirmationDialog = ({
  open,
  onOpenChange,
  blog,
}: DeleteBlogConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteBlogAction,
  });

  const handleConfirmDelete = async () => {
    if (!blog) {
      toast.error("Blog post not found");
      return;
    }

    const result = await mutateAsync(blog.id);

    if (!result.success) {
      toast.error(result.message || "Failed to delete blog post");
      return;
    }

    toast.success(result.message || "Blog post deleted successfully");
    onOpenChange(false);

    void queryClient.invalidateQueries({ queryKey: ["blogs-admin"] });
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{blog?.title}</strong>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event) => {
              event.preventDefault();
              void handleConfirmDelete();
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBlogConfirmationDialog;
