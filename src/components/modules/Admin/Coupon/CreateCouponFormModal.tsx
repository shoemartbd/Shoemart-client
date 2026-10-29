"use client";

import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon } from "@/services/coupon.services";
import { getAllProducts } from "@/services/product.services";
import { couponZodSchema } from "@/zod/coupon.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const defaultValues = {
  code: "",
  discountType: "FLAT" as "FLAT" | "PERCENTAGE",
  discountAmount: 0,
  maxDiscountAmount: undefined as number | undefined,
  minPurchaseAmount: 0,
  startDate: "",
  endDate: "",
  productIds: [] as string[],
};

const CreateCouponFormModal = () => {
  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch products for multi-select
  const { data: productResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-for-coupon"],
    queryFn: () => getAllProducts({ limit: "100" }),
    enabled: open,
  });

  const products = productResponse?.data ?? [];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createCoupon,
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      // Basic validation for dates
      if (new Date(value.endDate) <= new Date(value.startDate)) {
        toast.error("End date must be after start date");
        return;
      }

      const payload = {
        code: value.code.toUpperCase(),
        discountType: value.discountType,
        discountAmount: Number(value.discountAmount),
        maxDiscountAmount:
          value.discountType === "PERCENTAGE" && value.maxDiscountAmount
            ? Number(value.maxDiscountAmount)
            : undefined,
        minPurchaseAmount: Number(value.minPurchaseAmount),
        startDate: new Date(value.startDate).toISOString(),
        endDate: new Date(value.endDate).toISOString(),
        productIds: value.productIds,
      };

      try {
        const result = await mutateAsync(payload);

        if (!result.success) {
          toast.error(result.message || "Failed to create coupon");
          return;
        }

        toast.success(result.message || "Coupon created successfully");
        setOpen(false);
        form.reset();

        void queryClient.invalidateQueries({ queryKey: ["coupons"] });
        router.refresh();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error.message || "Something went wrong");
      }
    },
  });

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) {
        form.reset();
        setProductSearch("");
      }
    },
    [form],
  );

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" className="ml-auto shrink-0 gap-1.5 shadow-md">
          <Plus className="size-4" />
          Create Coupon
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] max-w-2xl gap-0 overflow-hidden p-0"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Tag className="size-5 text-primary animate-pulse" />
            Create Coupon
          </DialogTitle>
          <DialogDescription>
            Generate a coupon with flat or percentage discount for selected products.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-11rem)] px-6 py-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coupon Code */}
                <form.Field
                  name="code"
                  validators={{ onChange: couponZodSchema.shape.code }}
                >
                  {(field) => (
                    <AppField
                      field={field}
                      label="Coupon Code"
                      placeholder="e.g. SAVE20"
                      className="uppercase"
                    />
                  )}
                </form.Field>

                {/* Discount Type */}
                <form.Field name="discountType">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Discount Type</Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(val) => {
                          field.handleChange(val as "FLAT" | "PERCENTAGE");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FLAT">Flat Discount ($)</SelectItem>
                          <SelectItem value="PERCENTAGE">Percentage Discount (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                {/* Discount Amount */}
                <form.Field name="discountAmount">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Discount Amount / Percentage</Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 15"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive mt-1">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Max Discount Amount */}
                <form.Subscribe selector={(state) => state.values.discountType}>
                  {(discountType) =>
                    discountType === "PERCENTAGE" ? (
                      <form.Field name="maxDiscountAmount">
                        {(field) => (
                          <div className="space-y-1.5">
                            <Label>Max Discount Amount (Optional)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="e.g. 50"
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                            {field.state.meta.errors && (
                              <p className="text-xs text-destructive mt-1">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    ) : (
                      <div />
                    )
                  }
                </form.Subscribe>

                {/* Min Purchase Amount */}
                <form.Field name="minPurchaseAmount">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Min Purchase Amount ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 100"
                        value={field.state.value || 0}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive mt-1">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* Start Date */}
                <form.Field name="startDate">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>Start Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive mt-1">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {/* End Date */}
                <form.Field name="endDate">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label>End Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.errors && (
                        <p className="text-xs text-destructive mt-1">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              {/* Choose Multiple Products */}
              <form.Field name="productIds">
                {(field) => (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Select Products</Label>
                      <span className="text-xs text-muted-foreground">
                        {field.state.value.length} selected
                      </span>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-9 h-9"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    {isLoadingProducts ? (
                      <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/20">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : products.length === 0 ? (
                      <div className="flex h-40 items-center justify-center rounded-lg border bg-muted/20 text-sm text-muted-foreground">
                        No products found.
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-background/50">
                        <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/20">
                          <button
                            type="button"
                            className="text-xs font-semibold text-primary hover:underline"
                            onClick={() => {
                              field.handleChange(products.map((p: any) => p.id));
                            }}
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-muted-foreground hover:underline"
                            onClick={() => {
                              field.handleChange([]);
                            }}
                          >
                            Deselect All
                          </button>
                        </div>
                        <div className="h-44 overflow-y-auto p-3 space-y-2 border-t">
                            {filteredProducts.map((product: any) => {
                              const isChecked = field.state.value.includes(product.id);
                              return (
                                <div
                                  key={product.id}
                                  className="flex items-center space-x-2.5 rounded-md p-1.5 hover:bg-muted/50 transition-colors"
                                >
                                  <Checkbox
                                    id={product.id}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.handleChange([...field.state.value, product.id]);
                                      } else {
                                        field.handleChange(
                                          field.state.value.filter((id) => id !== product.id)
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={product.id}
                                    className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {product.name}
                                  </label>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                    {field.state.meta.errors && (
                      <p className="text-xs text-destructive mt-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex justify-end gap-2 border-t pt-5">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton
                  isPending={isPending}
                  pendingLabel="Creating..."
                  className="w-auto shadow-md"
                >
                  Create Coupon
                </AppSubmitButton>
              </div>
            </form>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCouponFormModal;
