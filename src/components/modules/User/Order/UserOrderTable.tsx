"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { getMyOrders } from "@/services/order.services";
import { IOrder } from "@/types/order.types";
import { useQuery } from "@tanstack/react-query";
import { userOrderColumns } from "./userOrderColumns";
import ViewOrderDialog from "../../Admin/Order/ViewOrderDialog";

const UserOrderTable = () => {
  const {
    viewingItem,
    isViewDialogOpen,
    onViewOpenChange,
    tableActions,
  } = useRowActionModalState<IOrder>();

  const {
    data: orderResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => getMyOrders(),
  });

  const orderList = orderResponse?.data ?? [];

  return (
    <>
      <DataTable
        data={orderList}
        columns={userOrderColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="You haven't placed any orders yet."
        search={{
          placeholder: "Search by Order ID...",
          onDebouncedChange: () => {}, // Not strictly needed for simple listing
        }}
        actions={{
          onView: tableActions.onView,
        }}
      />

      <ViewOrderDialog
        open={isViewDialogOpen}
        onOpenChange={onViewOpenChange}
        order={viewingItem}
        showReview={true}
      />
    </>
  );
};

export default UserOrderTable;
