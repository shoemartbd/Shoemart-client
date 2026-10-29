"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllProducts } from "@/services/product.services";
import { PaginationMeta } from "@/types/api.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import { usePermissions } from "@/providers/PermissionProvider";
import { productColumns, IProduct } from "./productColumns";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import ViewProductDialog from "./ViewProductDialog";
import DeleteProductConfirmationDialog from "./DeleteProductConfirmationDialog";
import EditProductFormModal from "./EditProductFormModal";
import ProductBulkActions from "./ProductBulkActions";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const ProductTable = ({
  initialQueryString,
}: {
  initialQueryString: string;
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
  } = useRowActionModalState<IProduct>({
    enableEdit: can("product.update"),
    enableDelete: can("product.delete"),
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
  });

  const queryString = queryStringFromUrl || initialQueryString;

  const { searchTermFromUrl, handleDebouncedSearchChange } =
    useServerManagedDataTableSearch({
      searchParams,
      updateParams,
    });

  const {
    data: productResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getAllProducts(params);
    },
  });

  const products = productResponse?.data ?? [];
  const meta: PaginationMeta | undefined = productResponse?.meta;

  // Ticked products. Tied to the query, so a new page / search starts with
  // nothing selected and a bulk delete never hits rows that aren't shown.
  const [selection, setSelection] = useState<{ query: string; rows: RowSelectionState }>({
    query: "",
    rows: {},
  });
  const selectedRows = selection.query === queryString ? selection.rows : {};
  const selectedIds = products
    .filter((product: IProduct) => selectedRows[product.id])
    .map((product: IProduct) => product.id);
  const canBulkDelete = can("product.delete");

  return (
    <>
    {canBulkDelete && (
      <ProductBulkActions
        selectedIds={selectedIds}
        onClear={() => setSelection({ query: queryString, rows: {} })}
      />
    )}

    <DataTable
      columns={productColumns}
      data={products}
      isLoading={isLoading || isFetching || isRouteRefreshPending}
      emptyMessage="No products found."
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
        placeholder: "Search products by name...",
        debounceMs: 700,
        onDebouncedChange: handleDebouncedSearchChange,
      }}
      meta={meta}
      actions={tableActions}
      rowSelection={
        canBulkDelete
          ? {
              state: selectedRows,
              onRowSelectionChange: (rows) => setSelection({ query: queryString, rows }),
              getRowId: (product) => product.id,
            }
          : undefined
      }
    />

    <EditProductFormModal
      open={isEditModalOpen}
      onOpenChange={onEditOpenChange}
      product={editingItem}
    />

    <DeleteProductConfirmationDialog
      open={isDeleteDialogOpen}
      onOpenChange={onDeleteOpenChange}
      product={deletingItem}
    />

    <ViewProductDialog
      open={isViewDialogOpen}
      onOpenChange={onViewOpenChange}
      product={viewingItem}
    />
    </>
  );
};

export default ProductTable;
