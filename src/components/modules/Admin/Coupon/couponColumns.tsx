import DateCell from "@/components/shared/cell/DateCell";
import { Badge } from "@/components/ui/badge";
import { ICoupon } from "@/types/coupon.types";
import { ColumnDef } from "@tanstack/react-table";
import CouponStatusToggle from "./CouponStatusToggle";

export const couponColumns: ColumnDef<ICoupon>[] = [
  {
    id: "code",
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold tracking-wider text-primary">{row.original.code}</span>
      </div>
    ),
  },
  {
    id: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const { discountType, discountAmount, maxDiscountAmount } = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {discountType === "PERCENTAGE"
              ? `${discountAmount}% Off`
              : `৳${discountAmount} Flat`}
          </span>
          {discountType === "PERCENTAGE" && maxDiscountAmount && (
            <span className="text-xs text-muted-foreground">
              Max Cap: ৳{maxDiscountAmount}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "minPurchase",
    accessorKey: "minPurchaseAmount",
    header: "Min Purchase",
    cell: ({ row }) => (
      <span className="font-medium">৳{row.original.minPurchaseAmount}</span>
    ),
  },
  {
    id: "validity",
    header: "Validity Period",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Start:</span>
          <DateCell date={row.original.startDate} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">End:</span>
          <DateCell date={row.original.endDate} />
        </div>
      </div>
    ),
  },
  {
    id: "products",
    header: "Applicable Products",
    cell: ({ row }) => {
      const count = row.original.products?.length || 0;
      return (
        <Badge variant="outline" className="font-semibold">
          {count} {count === 1 ? "Product" : "Products"}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <CouponStatusToggle
        id={row.original.id}
        initialStatus={row.original.isActive}
      />
    ),
  },
];
