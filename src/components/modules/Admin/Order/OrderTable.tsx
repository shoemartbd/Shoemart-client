"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllOrders } from "@/services/order.services";
import { PaginationMeta } from "@/types/api.types";
import { IOrder } from "@/types/order.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePermissions } from "@/providers/PermissionProvider";
import { orderColumns } from "./orderColumns";
import ViewOrderDialog from "./ViewOrderDialog";
import EditOrderModal from "./EditOrderModal";
import DeleteOrderDialog from "./DeleteOrderDialog";
import OrderToolbar from "./OrderToolbar";
import OrderBulkActions from "./OrderBulkActions";
import {
  DataTableFilterConfig,
  DataTableFilterValue,
} from "@/components/shared/table/DataTableFilters";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const ORDER_FILTERS: DataTableFilterConfig[] = [
  {
    id: "orderStatus",
    label: "Order Status",
    type: "single-select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Confirmed", value: "CONFIRMED" },
      { label: "In Courier", value: "IN_COURIER" },
      { label: "Delivered", value: "DELIVERED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    id: "paymentStatus",
    label: "Payment",
    type: "single-select",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Paid", value: "PAID" },
      { label: "Failed", value: "FAILED" },
      { label: "Refunded", value: "REFUNDED" },
    ],
  },
];

const OrderTable = ({
  initialQueryString,
  orderType,
  emptyMessage,
  searchPlaceholder,
}: {
  initialQueryString: string;
  orderType?: "ONLINE" | "POS" | "LANDING_PAGE";
  emptyMessage?: string;
  searchPlaceholder?: string;
}) => {
  const searchParams = useSearchParams();
  const { can } = usePermissions();
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
  } = useRowActionModalState<IOrder>({
    enableEdit: can("order.update"),
    enableDelete: can("order.delete"),
  });

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
    refreshServer: false,
  });

  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const {
    data: orderResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["orders", orderType, queryString],
    // Keep the current rows on screen while the next page / filter loads
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      if (orderType) params.orderType = orderType;
      return getAllOrders(params);
    },
  });

  // Status / payment filters live in the URL, so dashboard cards can link
  // straight to e.g. ?orderStatus=PENDING
  const filterValues = {
    orderStatus: searchParams.get("orderStatus") ?? undefined,
    paymentStatus: searchParams.get("paymentStatus") ?? undefined,
  };

  const handleFilterChange = (
    filterId: string,
    value: DataTableFilterValue | undefined,
  ) => {
    updateParams(
      (params) => {
        if (typeof value === "string" && value) params.set(filterId, value);
        else params.delete(filterId);
      },
      { resetPage: true },
    );
  };

  const handleDateChange = (from: string, to: string) => {
    updateParams(
      (params) => {
        if (from) params.set("from", from);
        else params.delete("from");
        if (to) params.set("to", to);
        else params.delete("to");
      },
      { resetPage: true },
    );
  };

  const exportParams = {
    ...Object.fromEntries(new URLSearchParams(queryString)),
    ...(orderType && { orderType }),
  };

  // Ticked orders. Tied to the query, so a new page / filter / search starts
  // with nothing selected and a bulk action never hits rows that aren't shown.
  const [selection, setSelection] = useState<{ query: string; rows: RowSelectionState }>({
    query: "",
    rows: {},
  });
  const selectedRows = selection.query === queryString ? selection.rows : {};
  const orderList = orderResponse?.data ?? [];
  const selectedOrders = orderList.filter((order: IOrder) => selectedRows[order.id]);
  const meta: PaginationMeta | undefined = orderResponse?.meta;

  return (
    <>
      <OrderBulkActions
        selectedOrders={selectedOrders}
        onClear={() => setSelection({ query: queryString, rows: {} })}
      />

      <DataTable
        data={orderList}
        columns={orderColumns}
        rowSelection={{
          state: selectedRows,
          onRowSelectionChange: (rows) => setSelection({ query: queryString, rows }),
          getRowId: (order) => order.id,
        }}
        isLoading={isLoading || isFetching || isRouteRefreshPending}
        emptyMessage={emptyMessage || "No orders found."}
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
          placeholder: searchPlaceholder || "Search orders (Order No, Name, Phone)...",
          debounceMs: 700,
          onDebouncedChange: handleDebouncedSearchChange,
        }}
        filters={{
          configs: ORDER_FILTERS,
          values: filterValues,
          onFilterChange: handleFilterChange,
          onClearAll: () =>
            updateParams(
              (params) => {
                params.delete("orderStatus");
                params.delete("paymentStatus");
              },
              { resetPage: true },
            ),
        }}
        toolbarAction={
          <OrderToolbar
            from={searchParams.get("from") ?? ""}
            to={searchParams.get("to") ?? ""}
            onDateChange={handleDateChange}
            exportParams={exportParams}
            fileLabel={
              orderType === "POS"
                ? "pos-orders"
                : orderType === "LANDING_PAGE"
                  ? "landing-page-orders"
                  : "online-orders"
            }
          />
        }
        meta={meta}
        actions={tableActions}
      />

      <ViewOrderDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        order={viewingItem}
      />

      <EditOrderModal
        key={editingItem?.id ?? "none"}
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
        order={editingItem}
      />

      <DeleteOrderDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        order={deletingItem}
      />
    </>
  );
};

export default OrderTable;
