import { z } from "zod";
import { isSupportedVideoUrl } from "@/lib/productVideo";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().min(5, "Short description is required"),
  videoUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || isSupportedVideoUrl(v),
      "Enter a valid YouTube or Facebook video link",
    )
    .optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  
  // These are optional/defaulted for VARIABLE products
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative").default(0),
  purchasePrice: z.coerce.number().nonnegative("Purchase price must be positive").default(0),
  regularPrice: z.coerce.number().nonnegative("Regular price must be positive").default(0),
  sellPrice: z.coerce.number().nonnegative("Sell price must be positive").default(0),
  
  tags: z.string().optional(),
  
  type: z.enum(["SIMPLE", "VARIABLE"]).default("SIMPLE"),
  
  vatType: z.enum(["INCLUDED", "EXCLUDED"]).default("INCLUDED"),
  vatPercentage: z.coerce.number().nonnegative().default(0),
  freeShipping: z.boolean().default(false),
  
  attributes: z.array(z.any()).optional(),
  variants: z.array(z.any()).optional(),
});

export type CreateProductFormValues = z.infer<typeof createProductSchema>;
