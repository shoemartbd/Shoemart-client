import AttributeTable from "@/components/modules/Dashboard/Attribute/AttributeTable";
import { Metadata } from "next";
import {
  createAttributeAction,
  updateAttributeAction,
  deleteAttributeAction,
} from "./_action";

export const metadata: Metadata = {
  title: "Attribute Management | Admin Dashboard",
  description: "Manage product attributes for your platform",
};

export default async function AttributeManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-top-4 duration-500">
          Attribute Management
        </h2>
      </div>

      <div className="h-full flex-1 flex-col space-y-8 md:flex">
        <AttributeTable
          createAction={createAttributeAction}
          updateAction={updateAttributeAction}
          deleteAction={deleteAttributeAction}
        />
      </div>
    </div>
  );
}
