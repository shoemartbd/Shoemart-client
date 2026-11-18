"use client";

import DataTable from "@/components/shared/table/DataTable";
import {
  DataTableFilterConfig,
  DataTableFilterValue,
} from "@/components/shared/table/DataTableFilters";
import { cn } from "@/lib/utils";
import { useServerManagedDataTable } from "@/hooks/useServerManagedDataTable";
import { useServerManagedDataTableSearch } from "@/hooks/useServerManagedDatatableSearch";
import { getAllUsers } from "@/services/user.services";
import { PaginationMeta } from "@/types/api.types";
import { IUser } from "@/types/user.types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import UserActions from "./UserActions";
import { userColumns } from "./userColumns";

// Role tabs above the table (role=ADMIN also lists super admins)
const ROLE_TABS = [
  { value: "", label: "All", countKey: "all" },
  { value: "ADMIN", label: "Admins", countKey: "ADMIN" },
  { value: "USER", label: "Customers", countKey: "USER" },
  { value: "WHOLESALER", label: "Wholesalers", countKey: "WHOLESALER" },
] as const;

const USER_FILTERS: DataTableFilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "single-select",
    options: [
      { label: "Active", value: "ACTIVE" },
      { label: "Blocked", value: "BLOCKED" },
    ],
  },
];

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
  const roleCounts = (userResponse?.meta as { roleCounts?: Record<string, number> } | undefined)
    ?.roleCounts;
  const activeRole = searchParams.get("role") ?? "";

  const setParam = (key: string, value: string | undefined) =>
    updateParams(
      (params) => {
        if (value) params.set(key, value);
        else params.delete(key);
      },
      { resetPage: true },
    );

  const handleFilterChange = (filterId: string, value: DataTableFilterValue | undefined) =>
    setParam(filterId, typeof value === "string" ? value : undefined);

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
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
        {ROLE_TABS.map((tab) => {
          const active = activeRole === tab.value;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setParam("role", tab.value || undefined)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              {tab.label}
              {roleCounts && (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground",
                  )}
                >
                  {roleCounts[tab.countKey] ?? 0}
                </span>
              )}
            </button>
          );
        })}
      </div>
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
      filters={{
        configs: USER_FILTERS,
        values: { status: searchParams.get("status") ?? undefined },
        onFilterChange: handleFilterChange,
        onClearAll: () => setParam("status", undefined),
      }}
      meta={meta}
    />
    </div>
  );
};

export default UserTable;

