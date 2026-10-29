"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/shared/table/DataTable";
import { useRowActionModalState } from "@/hooks/useRowActionModalState";
import { getMyExpenses } from "@/services/expense.services";
import { IExpense } from "@/types/expense.types";
import { Download } from "lucide-react";
import CreateExpenseFormModal from "./CreateExpenseFormModal";
import DeleteExpenseConfirmationDialog from "./DeleteExpenseConfirmationDialog";
import EditExpenseFormModal from "./EditExpenseFormModal";
import { expenseColumns } from "./expenseColumns";

const ExpenseTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedRange, setAppliedRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const {
    editingItem,
    deletingItem,
    isEditModalOpen,
    isDeleteDialogOpen,
    onEditOpenChange,
    onDeleteOpenChange,
    tableActions,
  } = useRowActionModalState<IExpense>({ enableView: false });

  const {
    data: expenseResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "expenses",
      searchTerm,
      appliedRange.startDate,
      appliedRange.endDate,
    ],
    queryFn: () => {
      const params: Record<string, string> = { limit: "1000" };
      if (searchTerm) params.searchTerm = searchTerm;
      if (appliedRange.startDate) params.startDate = appliedRange.startDate;
      if (appliedRange.endDate) params.endDate = appliedRange.endDate;
      return getMyExpenses(params);
    },
  });

  const expenses: IExpense[] = expenseResponse?.data ?? [];

  const totalCost = useMemo(
    () =>
      (expenseResponse?.data ?? []).reduce(
        (sum: number, exp: IExpense) => sum + Number(exp.price || 0),
        0,
      ),
    [expenseResponse],
  );

  const handleApplyRange = () => {
    setAppliedRange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClearRange = () => {
    setStartDate("");
    setEndDate("");
    setAppliedRange({});
  };

  const exportToExcel = () => {
    const rows = expenses.map((exp) => ({
      Category: exp.category?.name || "-",
      Name: exp.name,
      Price: exp.price,
      Note: exp.note || "",
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expense-report.xlsx");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm font-semibold">
          Total Cost:{" "}
          <span className="text-lg font-bold text-primary">
            ৳{totalCost.toFixed(2)}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({expenses.length} {expenses.length === 1 ? "expense" : "expenses"})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-[140px]"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-[140px]"
          />
          <Button type="button" size="sm" onClick={handleApplyRange}>
            Filter
          </Button>
          {(appliedRange.startDate || appliedRange.endDate) && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearRange}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      <DataTable
        data={expenses}
        columns={expenseColumns}
        isLoading={isLoading || isFetching}
        emptyMessage="No expenses found."
        search={{
          initialValue: searchTerm,
          placeholder: "Search expenses by name or note...",
          debounceMs: 500,
          onDebouncedChange: setSearchTerm,
        }}
        toolbarAction={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={exportToExcel}
              disabled={expenses.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <CreateExpenseFormModal />
          </div>
        }
        actions={tableActions}
      />

      <EditExpenseFormModal
        open={isEditModalOpen}
        onOpenChange={onEditOpenChange}
        expense={editingItem}
      />

      <DeleteExpenseConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={onDeleteOpenChange}
        expense={deletingItem}
      />
    </div>
  );
};

export default ExpenseTable;
