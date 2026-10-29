"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllCoupons } from "@/services/coupon.services";
import { PaginationMeta } from "@/types/api.types";
import { ICoupon } from "@/types/coupon.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import CreateCouponFormModal from "./CreateCouponFormModal";
import DeleteCouponConfirmationDialog from "./DeleteCouponConfirmationDialog";
import ViewCouponDialog from "./ViewCouponDialog";
import { couponColumns } from "./couponColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const CouponTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
}) => {
  const searchParams = useSearchParams();
  const {
    viewingItem,
    deletingItem,
    isViewDialogOpen,
    isDeleteDialogOpen,
    onViewOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<ICoupon>();

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
    data: couponResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["coupons", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getAllCoupons(params);
    },
  });

  const couponList = couponResponse?.data ?? [];
  const meta: PaginationMeta | undefined = couponResponse?.meta;

  return (
    <>
      <DataTable
        data={couponList}
        columns={couponColumns}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage="No coupons found."
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
          placeholder: "Search coupons by code...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        toolbarAction={<CreateCouponFormModal />}
        meta={meta}
        actions={tableActions}
      />

      <DeleteCouponConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        coupon={deletingItem}
      />

      <ViewCouponDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        coupon={viewingItem}
      />
    </>
  );
};

export default CouponTable;
