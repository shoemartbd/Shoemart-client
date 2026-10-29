import AddProductForm from "@/components/modules/Admin/Product/AddProductForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product | Admin Dashboard",
  description: "Add a new product to the store",
};

export default function AddProductPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add Product</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create a new product listing for the store
          </p>
        </div>
      </div>

      <AddProductForm />
    </div>
  );
}
