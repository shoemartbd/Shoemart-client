"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy, Loader2, Phone, Plus, Printer, Save, Search, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IWholesaleRequest,
  IWholesaleRequestProduct,
  searchWholesaleProducts,
  updateWholesaleRequest,
  WholesaleRequestStatus,
} from "@/services/wholesaleRequest.services";
import { getSiteSettings } from "@/services/siteSetting.services";
import { printWholesaleInvoice, wholesaleInvoiceNo } from "@/lib/printWholesaleInvoice";
import { cn } from "@/lib/utils";
import { StatusSelect, statusOf, whatsappHref } from "./wholesaleStatus";

const PAIR_PRESETS = [6, 12, 18, 24];

// An order line in the editor, with a local id so the same product can sit
// on several lines (one per colour)
type EditorLine = IWholesaleRequestProduct & { uid: string };

let uidSeq = 0;
const nextUid = () => `l${++uidSeq}`;
const withUid = (l: IWholesaleRequestProduct): EditorLine => ({ ...l, uid: nextUid() });

const lineKey = (l: IWholesaleRequestProduct) =>
  `${l.productId}|${l.color?.trim().toLowerCase() ?? ""}`;

const taka = (n: number) =>
  `৳${(Number(n) || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

// Number input that keeps 0 as an empty box with a "0" placeholder
function NumberInput({
  value,
  onChange,
  className,
  invalid,
  ...rest
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
  invalid?: boolean;
  "aria-label"?: string;
  id?: string;
}) {
  return (
    <Input
      {...rest}
      type="number"
      inputMode="decimal"
      min={0}
      value={value || ""}
      placeholder="0"
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) && n > 0 ? n : 0);
      }}
      aria-invalid={invalid}
      className={cn("h-8 px-2 text-right tabular-nums", invalid && "border-destructive", className)}
    />
  );
}

export default function WholesaleRequestEditor({
  request,
  onClose,
  onSaved,
}: {
  request: IWholesaleRequest;
  onClose: () => void;
  onSaved: (updated: IWholesaleRequest) => void;
}) {
  // The parent remounts this (key) for each request / saved version
  const [lines, setLines] = useState<EditorLine[]>(() => (request.products ?? []).map(withUid));
  const [deliveryCharge, setDeliveryCharge] = useState(request.deliveryCharge ?? 0);
  const [paidAmount, setPaidAmount] = useState(request.paidAmount ?? 0);
  const [note, setNote] = useState(request.adminNote ?? "");
  const [status, setStatus] = useState<WholesaleRequestStatus>(request.status);
  const [saving, setSaving] = useState<"save" | "complete" | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: results = [], isFetching: isSearching } = useQuery({
    queryKey: ["wholesale-product-search", debounced],
    queryFn: () => searchWholesaleProducts(debounced),
    enabled: debounced.length > 0,
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings().then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  const totals = useMemo(() => {
    const pairs = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const cost = lines.reduce((s, l) => s + l.quantity * l.costPrice, 0);
    const total = subtotal + deliveryCharge;
    return { pairs, subtotal, cost, total, profit: subtotal - cost, due: total - paidAmount };
  }, [lines, deliveryCharge, paidAmount]);

  const updateLine = (uid: string, patch: Partial<IWholesaleRequestProduct>) =>
    setLines((list) => list.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));

  const removeLine = (uid: string) => setLines((list) => list.filter((l) => l.uid !== uid));

  // The first of the product's colours not yet on the order
  const freeColour = (productId: string, options: string[] = []) => {
    const used = new Set(
      lines.filter((l) => l.productId === productId).map((l) => l.color?.trim().toLowerCase()),
    );
    return options.find((c) => !used.has(c.toLowerCase())) ?? null;
  };

  // Same product in another colour, right below the line
  const addColourLine = (line: EditorLine) => {
    const copy: EditorLine = {
      ...line,
      uid: nextUid(),
      color: freeColour(line.productId, line.colorOptions),
      quantity: PAIR_PRESETS[0],
    };
    setLines((list) => {
      const i = list.findIndex((l) => l.uid === line.uid);
      return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
    });
  };

  const addProduct = (p: (typeof results)[number]) => {
    const colorOptions = p.colorOptions ?? [];
    if (colorOptions.length === 0 && lines.some((l) => l.productId === p.id)) {
      toast.info(`${p.code} is already on this order`);
      return;
    }
    setLines((list) => [
      ...list,
      withUid({
        productId: p.id,
        code: p.code,
        name: p.name,
        image: p.image,
        color: freeColour(p.id, colorOptions),
        colorOptions,
        quantity: PAIR_PRESETS[0],
        unitPrice: 0,
        costPrice: 0,
      }),
    ]);
    setSearch("");
  };

  // Product + colour on more than one line
  const duplicate = new Set(lines.map(lineKey).filter((k, i, all) => all.indexOf(k) !== i));

  const missingPrice = lines.some((l) => !l.unitPrice);
  const badQty = lines.some((l) => !l.quantity || l.quantity < 1);

  const save = async (nextStatus: WholesaleRequestStatus, mode: "save" | "complete") => {
    if (badQty) {
      toast.error("Every product needs at least 1 pair");
      return;
    }
    if (duplicate.size > 0) {
      toast.error("The same product and colour is on two lines. Change the colour or remove one.");
      return;
    }
    if (nextStatus === "COMPLETED") {
      if (lines.length === 0) {
        toast.error("Add at least one product before completing the sale");
        return;
      }
      if (missingPrice) {
        toast.error("Set the price for every product before completing the sale");
        return;
      }
    }
    setSaving(mode);
    try {
      const updated = await updateWholesaleRequest(request.id, {
        status: nextStatus,
        adminNote: note,
        items: lines.map((l) => ({
          productId: l.productId,
          ...(l.color?.trim() && { color: l.color.trim() }),
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          costPrice: l.costPrice,
        })),
        deliveryCharge,
        paidAmount,
      });
      setStatus(nextStatus);
      toast.success(mode === "complete" ? "Sale completed" : "Saved");
      onSaved(updated);
    } catch (error) {
      toast.error((error as Error).message || "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const print = () => {
    if (lines.length === 0) {
      toast.error("Add products before printing the invoice");
      return;
    }
    printWholesaleInvoice(
      {
        invoiceNo: request.invoiceNo,
        date: request.completedAt ?? new Date().toISOString(),
        name: request.name,
        phone: request.phone,
        email: request.email,
        businessName: request.businessName,
        location: request.location,
        lines,
        deliveryCharge,
        paidAmount,
        completed: status === "COMPLETED",
      },
      siteSettings,
    );
  };

  const isCompleted = status === "COMPLETED";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-7xl overflow-y-auto sm:max-w-7xl"
        data-lenis-prevent
      >
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {request.businessName || request.name}
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
              {wholesaleInvoiceNo(request.invoiceNo)}
            </span>
            <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", statusOf(status).tone)}>
              {statusOf(status).label}
            </span>
          </DialogTitle>
          <DialogDescription>
            Received {format(new Date(request.createdAt), "d MMM yyyy, h:mm a")}
            {request.completedAt &&
              ` · Sale completed ${format(new Date(request.completedAt), "d MMM yyyy")}`}
          </DialogDescription>
        </DialogHeader>

        {/* Buyer */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border p-4 text-sm sm:grid-cols-4">
          {[
            ["Name", request.name],
            ["Phone", request.phone],
            ["Business", request.businessName],
            ["Business Type", request.businessType],
            ["Location", request.location],
            ["Email", request.email],
            ["Interested In", request.categories.join(", ")],
            ...(request.quantity ? [["Est. Quantity (old form)", request.quantity]] : []),
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="break-words font-medium">{value || "—"}</dd>
            </div>
          ))}
          {request.message && (
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-xs text-muted-foreground">Requirements</dt>
              <dd className="whitespace-pre-wrap rounded-lg bg-muted/50 p-2.5">{request.message}</dd>
            </div>
          )}
        </dl>

        {/* Order lines */}
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="font-bold">
              Products{" "}
              <span className="font-normal text-muted-foreground">
                ({lines.length} · {totals.pairs} pairs)
              </span>
            </h4>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Add product: search name or code"
                className="h-9 pl-9"
              />
              {debounced && search && (
                <div className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover shadow-lg">
                  {isSearching ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  ) : results.length === 0 ? (
                    <p className="p-3 text-center text-sm text-muted-foreground">No product found</p>
                  ) : (
                    results.map((p) => {
                      const added =
                        !p.colorOptions?.length && lines.some((l) => l.productId === p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p)}
                          disabled={added}
                          className="flex w-full items-center gap-2 border-b px-2 py-1.5 text-left last:border-0 hover:bg-muted disabled:opacity-50"
                        >
                          <div className="size-9 shrink-0 overflow-hidden rounded bg-muted">
                            {p.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {p.code}
                              {p.colorOptions?.length > 0 && ` · ${p.colorOptions.length} colours`}
                            </p>
                          </div>
                          {added ? (
                            <span className="text-xs text-muted-foreground">Added</span>
                          ) : (
                            <Plus className="size-4 text-primary" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Colour</th>
                  <th className="px-3 py-2 font-semibold">Pairs</th>
                  <th className="px-3 py-2 text-right font-semibold">Price / Pair</th>
                  <th className="px-3 py-2 text-right font-semibold">Cost / Pair</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                  <th className="px-3 py-2 text-right font-semibold">Profit</th>
                  <th className="w-20 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                      No products yet. Search above to add one.
                    </td>
                  </tr>
                ) : (
                  lines.map((l) => {
                    const lineTotal = l.quantity * l.unitPrice;
                    const lineProfit = lineTotal - l.quantity * l.costPrice;
                    return (
                      <tr key={l.uid} className="border-b align-middle last:border-0">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                              {l.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={l.image} alt="" className="h-full w-full object-cover" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate font-medium" title={l.name}>
                                {l.name}
                              </p>
                              <p className="font-mono text-[11px] text-muted-foreground">{l.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {/* One of the product's colours, or type a new one */}
                          <Input
                            value={l.color ?? ""}
                            onChange={(e) => updateLine(l.uid, { color: e.target.value || null })}
                            list={l.colorOptions?.length ? `ws-colours-${l.uid}` : undefined}
                            placeholder={l.colorOptions?.length ? "Choose colour" : "Colour (optional)"}
                            aria-label={`Colour of ${l.code}`}
                            aria-invalid={duplicate.has(lineKey(l))}
                            className={cn(
                              "h-8 w-32 px-2 text-xs",
                              duplicate.has(lineKey(l)) && "border-destructive",
                            )}
                          />
                          {l.colorOptions && l.colorOptions.length > 0 && (
                            <datalist id={`ws-colours-${l.uid}`}>
                              {l.colorOptions.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            {PAIR_PRESETS.map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => updateLine(l.uid, { quantity: n })}
                                className={cn(
                                  "h-8 min-w-8 rounded-md border px-1.5 text-xs font-bold",
                                  l.quantity === n
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "hover:bg-muted",
                                )}
                              >
                                {n}
                              </button>
                            ))}
                            <Input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={l.quantity || ""}
                              onChange={(e) =>
                                updateLine(l.uid, {
                                  quantity: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                              aria-label={`Pairs of ${l.code}`}
                              aria-invalid={!l.quantity}
                              className={cn(
                                "h-8 w-16 px-1.5 text-center text-xs font-bold",
                                !l.quantity && "border-destructive",
                              )}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <NumberInput
                            value={l.unitPrice}
                            onChange={(n) => updateLine(l.uid, { unitPrice: n })}
                            invalid={!l.unitPrice}
                            aria-label={`Price per pair of ${l.code}`}
                            className="ml-auto w-24"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <NumberInput
                            value={l.costPrice}
                            onChange={(n) => updateLine(l.uid, { costPrice: n })}
                            aria-label={`Cost per pair of ${l.code}`}
                            className="ml-auto w-24"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">
                          {taka(lineTotal)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right font-semibold tabular-nums",
                            lineProfit >= 0 ? "text-emerald-600" : "text-red-600",
                          )}
                        >
                          {taka(lineProfit)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => addColourLine(l)}
                              aria-label={`Add another colour of ${l.code}`}
                              title="Add another colour"
                              className="size-8"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeLine(l.uid)}
                              aria-label={`Remove ${l.code}`}
                              className="size-8 text-destructive hover:bg-destructive hover:text-white"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {duplicate.size > 0 && (
            <p className="text-xs font-medium text-destructive">
              The same product and colour is on two lines (red boxes). Change the colour or remove one.
            </p>
          )}
          {missingPrice && lines.length > 0 && (
            <p className="text-xs font-medium text-destructive">
              Set the price per pair for every product (red boxes).
            </p>
          )}
        </div>

        {/* Charges + totals */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ws-delivery" className="text-xs">Delivery Charge</Label>
                <NumberInput id="ws-delivery" value={deliveryCharge} onChange={setDeliveryCharge} className="h-9 w-full" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ws-paid" className="text-xs">Paid Amount</Label>
                <NumberInput id="ws-paid" value={paidAmount} onChange={setPaidAmount} className="h-9 w-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label className="shrink-0">Status</Label>
              <StatusSelect value={status} onChange={setStatus} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-note">Admin Note</Label>
              <Textarea
                id="ws-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Call summary, payment terms, follow-up date..."
                rows={3}
              />
            </div>
          </div>

          <dl className="space-y-1.5 rounded-xl border bg-muted/30 p-4 text-sm tabular-nums">
            {[
              ["Total Pairs", String(totals.pairs)],
              ["Subtotal", taka(totals.subtotal)],
              ["Delivery Charge", taka(deliveryCharge)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t pt-1.5 text-base font-bold">
              <dt>Grand Total</dt>
              <dd>{taka(totals.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Paid</dt>
              <dd>{taka(paidAmount)}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Due</dt>
              <dd className={totals.due > 0 ? "text-red-600" : ""}>{taka(totals.due)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-xs">
              <dt className="text-muted-foreground">Cost (internal)</dt>
              <dd>{taka(totals.cost)}</dd>
            </div>
            <div className="flex justify-between font-bold">
              <dt>Profit / Loss</dt>
              <dd className={totals.profit >= 0 ? "text-emerald-600" : "text-red-600"}>
                {taka(totals.profit)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${request.phone}`}>
                <Phone className="size-3.5" /> Call
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={whatsappHref(request.phone)} target="_blank" rel="noopener noreferrer">
                <FaWhatsapp className="size-3.5" /> WhatsApp
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={print} className="gap-1.5">
              <Printer className="size-4" /> Print Invoice
            </Button>
            <Button variant="outline" onClick={() => save(status, "save")} disabled={Boolean(saving)}>
              {saving === "save" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
            {!isCompleted && (
              <Button
                onClick={() => save("COMPLETED", "complete")}
                disabled={Boolean(saving)}
                className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {saving === "complete" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Sale Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
