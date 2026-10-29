"use client";

import DataTable from "@/components/shared/table/DataTable";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllUsers } from "@/services/user.services";
import { PaginationMeta } from "@/types/api.types";
import { IUser } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import UserActions from "./UserActions";
import { userColumns } from "./userColumns";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const UserTable = ({ initialQueryString }: { initialQueryString: string }) => {
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
    data: userResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["users", queryString],
    queryFn: () => {
      const params = Object.fromEntries(new URLSearchParams(queryString));
      return getAllUsers(params);
    },
  });

  const users = userResponse?.data ?? [];
  const meta: PaginationMeta | undefined = userResponse?.meta;

  // Add actions column manually since UserActions has custom logic beyond standard CRUD
  const columnsWithActions = [
    ...userColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: IUser } }) => (
        <UserActions user={row.original} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columnsWithActions}
      data={users}
      isLoading={isLoading || isFetching || isRouteRefreshPending}
      emptyMessage="No users found."
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
        placeholder: "Search users by name or email...",
        debounceMs: 700,
        onDebouncedChange: handleDebouncedSearchChange,
      }}
      meta={meta}
    />
  );
};

export default UserTable;

