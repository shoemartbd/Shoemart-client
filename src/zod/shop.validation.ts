import { z } from "zod";

export const shopZodSchema = z.object({
  name: z
    .string()
    .min(3, "Shop name must be at least 3 characters")
    .max(50, "Shop name must be at most 50 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .refine((val) => val === "" || val.length >= 10, {
      message: "Description must be at least 10 characters",
    }),

});
