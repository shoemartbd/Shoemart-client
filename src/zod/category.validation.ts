import { z } from "zod";

export const categoryZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export type ICategoryFormData = z.infer<typeof categoryZodSchema>;
