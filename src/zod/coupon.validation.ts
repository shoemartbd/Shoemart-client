import { z } from "zod";

export const couponZodSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(30, "Coupon code must be at most 30 characters")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Only uppercase letters, numbers, hyphens, underscores allowed"
      ),
    discountType: z.enum(["FLAT", "PERCENTAGE"]),
    discountAmount: z
      .number({ message: "Discount amount must be a number" })
      .positive("Discount amount must be positive"),
    maxDiscountAmount: z.number().positive().optional(),
    minPurchaseAmount: z
      .number({ message: "Minimum purchase amount must be a number" })
      .min(0, "Must be 0 or more"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    productIds: z
      .array(z.string())
      .min(1, "Select at least one product"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.discountType !== "PERCENTAGE" || data.discountAmount <= 100,
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountAmount"],
    }
  );

export type ICouponFormData = z.infer<typeof couponZodSchema>;
