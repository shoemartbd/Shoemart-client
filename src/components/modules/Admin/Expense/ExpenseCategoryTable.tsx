"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getMyExpenseCategories } from "@/services/expense.services";
import { PaginationMeta } from "@/types/api.types";
import { IExpenseCategory } from "@/types/expense.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import CreateExpenseCategoryFormModal from "./CreateExpenseCategoryFormModal";
import DeleteExpenseCategoryConfirmationDialog from "./DeleteExpenseCategoryConfirmationDialog";
import EditExpenseCategoryFormModal from "./EditExpenseCategoryFormModal";
import { expenseCategoryColumns } from "./expenseCategoryColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const ExpenseCategoryTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IExpenseCategory>({ enableView: false });

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
    queryKey: ["expense-categories", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getMyExpenseCategories(params);
    },
  });

  const categoryList = categoryResponse?.data ?? [];
  const meta: PaginationMeta | undefined = categoryResponse?.meta;

  return (
    <>
      <DataTable
        data={categoryList}
        columns={expenseCategoryColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No expense categories found."
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
          placeholder: "Search expense categories...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        toolbarAction={<CreateExpenseCategoryFormModal />}
        meta={meta}
        actions={tableActions}
      />

      <EditExpenseCategoryFormModal
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
        category={editingItem}
      />

      <DeleteExpenseCategoryConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        category={deletingItem}
      />
    </>
  );
};

export default ExpenseCategoryTable;
