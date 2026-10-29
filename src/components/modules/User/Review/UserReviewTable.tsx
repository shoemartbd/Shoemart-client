/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DataTable from "@/components/shared/table/DataTable";
import { getMyReviews, deleteReview } from "@/services/review.services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userReviewColumns } from "./userReviewColumns";
import { toast } from "sonner";
import { confirmAction } from "@/lib/confirmAction";

const UserReviewTable = () => {
  const queryClient = useQueryClient();


  const {
    data: reviewResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => getMyReviews(),
  });

  const handleDelete = async (review: any) => {
    if (await confirmAction({ title: "Delete this review?", confirmText: "Delete" })) {
      try {
        const res = await deleteReview(review.id);
        if (res.success) {
          toast.success("Review deleted successfully");
          queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
        } else {
          toast.error(res.message || "Failed to delete review");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const reviewList = reviewResponse?.data ?? [];

  return (
    <DataTable
      data={reviewList}
      columns={userReviewColumns}
      isLoading={isLoading || isFetching}
      emptyMessage="You haven't reviewed any products yet."
      search={{
        placeholder: "Search reviews...",
        onDebouncedChange: () => {},
      }}
      actions={{
        onDelete: handleDelete,
      }}
    />
  );
};

export default UserReviewTable;
