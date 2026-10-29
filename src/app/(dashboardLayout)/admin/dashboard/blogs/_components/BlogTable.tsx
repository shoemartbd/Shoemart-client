"use client";

import DataTable from "@/components/shared/table/DataTable";
import { Button } from "@/components/ui/button";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAdminBlogs } from "@/services/blog.services";
import { PaginationMeta } from "@/types/api.types";
import { IBlog } from "@/types/blog.types";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteBlogConfirmationDialog from "./DeleteBlogConfirmationDialog";
import { blogColumns } from "./blogColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const BlogTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { deletingItem, isDeleteDialogOpen, onDeleteOpenChange, tableActions } =
    useRowActionModalState<IBlog>({ enableView: false, enableEdit: false });

  const {
    queryStringFromUrl,
    optimisticSortingState,
    optimisticPaginationState,
    isRouteRefreshPending,
    updateParams,
    handleSortingChange,
    handlePaginationChange,
  } = useServerManagedDataTable({
    searchParams,
    defaultPage: DEFAULT_PAGE,
    defaultLimit: DEFAULT_LIMIT,
  });

  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const {
    data: blogResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["blogs-admin", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getAdminBlogs(params);
    },
  });

  const blogList = blogResponse?.data ?? [];
  const meta: PaginationMeta | undefined = blogResponse?.meta;

  return (
    <>
      <DataTable
        data={blogList}
        columns={blogColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No blog posts found."
        sorting={{
          state: optimisticSortingState,
          onSortingChange: handleSortingChange,
        }}
        pagination={{
          state: optimisticPaginationState,
          onPaginationChange: handlePaginationChange,
        }}
        search={{
          initialValue: searchTermFromUrl,
          placeholder: "Search blog posts...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        toolbarAction={
          <Button asChild className="ml-auto shrink-0">
            <Link href="/admin/dashboard/blogs/add">
              <Plus className="size-4" />
              Add New Post
            </Link>
          </Button>
        }
        meta={meta}
        actions={{
          onEdit: (blog) => router.push(`/admin/dashboard/blogs/${blog.id}/edit`),
          onDelete: tableActions.onDelete,
        }}
      />

      <DeleteBlogConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        blog={deletingItem}
      />
    </>
  );
};

export default BlogTable;
