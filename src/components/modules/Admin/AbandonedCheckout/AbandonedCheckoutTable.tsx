"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAbandonedCheckouts } from "@/services/abandonedCheckout.services";
import { PaginationMeta } from "@/types/api.types";
import { IAbandonedCheckout } from "@/types/abandonedCheckout.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { abandonedCheckoutColumns } from "./abandonedCheckoutColumns";
import DeleteAbandonedCheckoutConfirmationDialog from "./DeleteAbandonedCheckoutConfirmationDialog";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const AbandonedCheckoutTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();

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
    deletingItem,
    isDeleteDialogOpen,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IAbandonedCheckout>({
    enableView: false,
    enableEdit: false,
  });

  const {
    data: abandonedCheckoutResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["abandoned-checkouts", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      params.sortBy = params.sortBy || "lastActivityAt";
      return getAbandonedCheckouts(params);
    },
  });

  const abandonedCheckoutList: IAbandonedCheckout[] =
    abandonedCheckoutResponse?.data ?? [];
  const meta: PaginationMeta | undefined = abandonedCheckoutResponse?.meta;

  return (
    <>
      <DataTable
        data={abandonedCheckoutList}
        columns={abandonedCheckoutColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No incomplete checkouts found."
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
          placeholder: "Search by name / phone / address...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        meta={meta}
        actions={tableActions}
      />

      <DeleteAbandonedCheckoutConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        abandonedCheckout={deletingItem}
      />
    </>
  );
};

export default AbandonedCheckoutTable;
