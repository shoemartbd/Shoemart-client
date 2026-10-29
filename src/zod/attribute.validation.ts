import { z } from "zod";

export const attributeZodSchema = z.object({
  name: z.string().min(1, "Attribute name is required"),
  shopId: z.string().optional().nullable(),
});

export type IAttributeFormData = z.infer<typeof attributeZodSchema>;

export const attributeValueZodSchema = z.object({
  value: z.string().min(1, "Value is required"),
});

export type IAttributeValueFormData = z.infer<typeof attributeValueZodSchema>;
