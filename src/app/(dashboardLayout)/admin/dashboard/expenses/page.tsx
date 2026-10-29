import ExpenseTable from "@/components/modules/Admin/Expense/ExpenseTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses | Admin Dashboard",
  description: "Track and manage store expenses",
};

export default function ExpensesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-black tracking-tight uppercase">
          Expenses
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <ExpenseTable />
      </div>
    </div>
  );
}
