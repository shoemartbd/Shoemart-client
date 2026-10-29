"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllCategories } from "@/services/category.services";
import { PaginationMeta } from "@/types/api.types";
import { ICategory } from "@/types/category.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import CreateCategoryFormModal from "./CreateCategoryFormModal";
import DeleteCategoryConfirmationDialog from "./DeleteCategoryConfirmationDialog";
import EditCategoryFormModal from "./EditCategoryFormModal";
import ViewCategoryDialog from "./ViewCategoryDialog";
import { categoryColumns } from "./categoryColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const CategoryTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
  const {
    viewingItem,
    editingItem,
    deletingItem,
    isViewDialogOpen,
    isEditModalOpen,
    isDeleteDialogOpen,
    onViewOpenChange,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<ICategory>();

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
    data: categoryResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["categories", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getAllCategories(params);
    },
  });

  const categoryList = categoryResponse?.data ?? [];
  const meta: PaginationMeta | undefined = categoryResponse?.meta;

  return (
    <>
      <DataTable
        data={categoryList}
        columns={categoryColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No categories found."
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
          placeholder: "Search categories...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        toolbarAction={<CreateCategoryFormModal categories={categoryList} />}
        meta={meta}
        actions={tableActions}
      />

      <EditCategoryFormModal
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
        category={editingItem}
        categories={categoryList}
      />

      <DeleteCategoryConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        category={deletingItem}
      />

      <ViewCategoryDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        category={viewingItem}
      />
    </>
  );
};

export default CategoryTable;
