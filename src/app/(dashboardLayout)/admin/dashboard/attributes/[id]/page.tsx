import AttributeValuesManager from "@/components/modules/Dashboard/Attribute/AttributeValuesManager";
import { Metadata } from "next";
import {
  addAttributeValueAction,
  updateAttributeValueAction,
  deleteAttributeValueAction,
} from "../_action";

export const metadata: Metadata = {
  title: "Attribute Values | Admin Dashboard",
  description: "Manage values for a product attribute",
};

export default async function AttributeValuesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AttributeValuesManager
        attributeId={id}
        addValueAction={addAttributeValueAction}
        updateValueAction={updateAttributeValueAction}
        deleteValueAction={deleteAttributeValueAction}
      />
    </div>
  );
}
