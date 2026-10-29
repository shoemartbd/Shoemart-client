"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Boxes, Eye, Loader2, Phone, Search, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteWholesaleRequest,
  getWholesaleRequests,
  IWholesaleRequest,
  updateWholesaleRequest,
  WholesaleRequestStatus,
} from "@/services/wholesaleRequest.services";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/lib/confirmAction";

const STATUSES: { value: WholesaleRequestStatus; label: string; tone: string }[] = [
  { value: "NEW", label: "New", tone: "bg-red-500/10 text-red-700 dark:text-red-400" },
  {
    value: "CONTACTED",
    label: "Contacted",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    value: "CLOSED",
    label: "Closed",
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
];

const statusOf = (value: WholesaleRequestStatus) =>
  STATUSES.find((s) => s.value === value) ?? STATUSES[0];

// 017... -> 88017... for wa.me
const whatsappHref = (phone: string) => `https://wa.me/88${phone}`;

export default function WholesaleRequestsView() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WholesaleRequestStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<IWholesaleRequest | null>(null);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["wholesale-requests", tab, debounced],
    queryFn: () =>
      getWholesaleRequests({
        status: tab === "ALL" ? undefined : tab,
        searchTerm: debounced || undefined,
      }),
  });
  const rows = data?.data ?? [];
  const summary = data?.summary;
  const total = summary ? Object.values(summary).reduce((a, b) => a + b, 0) : 0;

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: ["wholesale-requests"] });

  const openDetails = (row: IWholesaleRequest) => {
    setViewing(row);
    setNote(row.adminNote ?? "");
  };

  const changeStatus = async (row: IWholesaleRequest, status: WholesaleRequestStatus) => {
    setBusyId(row.id);
    try {
      await updateWholesaleRequest(row.id, { status });
      toast.success(`Marked as ${statusOf(status).label}`);
      if (viewing?.id === row.id) setViewing({ ...row, status });
      refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to update");
    } finally {
      setBusyId(null);
    }
  };

  const saveNote = async () => {
    if (!viewing) return;
    setIsSavingNote(true);
    try {
      await updateWholesaleRequest(viewing.id, { adminNote: note });
      toast.success("Note saved");
      setViewing(null);
      refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async (row: IWholesaleRequest) => {
    const ok = await confirmAction({
      title: `Delete request from ${row.name}?`,
      text: "This can't be undone.",
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusyId(row.id);
    try {
      await deleteWholesaleRequest(row.id);
      toast.success("Request deleted");
      if (viewing?.id === row.id) setViewing(null);
      refresh();
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  const tabs: { value: WholesaleRequestStatus | "ALL"; label: string; count?: number }[] = [
    { value: "ALL", label: "All", count: summary ? total : undefined },
    ...STATUSES.map((s) => ({ value: s.value, label: s.label, count: summary?.[s.value] })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Wholesale Requests</h3>
          <p className="text-muted-foreground">
            Bulk order enquiries sent from the{" "}
            <Link href="/wholesale" target="_blank" className="font-medium text-primary underline">
              wholesale page
            </Link>
            . Call the buyer, then mark the request as contacted or closed.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                tab === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted",
              )}
            >
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 opacity-70">{t.count}</span>}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, business or location"
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <Boxes className="size-10 text-muted-foreground/50" />
            <p className="font-semibold">{debounced ? "No match" : "No wholesale requests yet"}</p>
            <p className="text-sm text-muted-foreground">
              {debounced
                ? "Try another search."
                : "Requests from the wholesale page will show up here."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Buyer</th>
                  <th className="px-4 py-3 font-semibold">Business</th>
                  <th className="px-4 py-3 font-semibold">Interested In</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b align-top last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <a href={`tel:${row.phone}`} className="flex items-center gap-1 font-mono hover:text-primary">
                          <Phone className="size-3" /> {row.phone}
                        </a>
                        <a
                          href={whatsappHref(row.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${row.name}`}
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          <FaWhatsapp className="size-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.businessName || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {[row.businessType, row.location].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {row.categories.length > 0
                          ? row.categories.map((c) => (
                              <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                                {c}
                              </span>
                            ))
                          : <span className="text-muted-foreground">—</span>}
                      </div>
                      {row.quantity && (
                        <p className="mt-1 text-xs font-semibold">{row.quantity}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(row.createdAt), "d MMM yyyy, h:mm a")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        value={row.status}
                        disabled={busyId === row.id}
                        onChange={(status) => changeStatus(row, status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetails(row)} className="gap-1.5">
                          <Eye className="size-3.5" /> View
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          disabled={busyId === row.id}
                          onClick={() => handleDelete(row)}
                          aria-label="Delete request"
                          className="size-8 text-destructive hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle>{viewing.name}</DialogTitle>
                <DialogDescription>
                  Received {format(new Date(viewing.createdAt), "d MMM yyyy, h:mm a")}
                </DialogDescription>
              </DialogHeader>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {[
                  ["Phone", viewing.phone],
                  ["Email", viewing.email],
                  ["Business", viewing.businessName],
                  ["Business Type", viewing.businessType],
                  ["Location", viewing.location],
                  ["Quantity", viewing.quantity],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium break-words">{value || "—"}</dd>
                  </div>
                ))}
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Interested In</dt>
                  <dd className="font-medium">
                    {viewing.categories.length ? viewing.categories.join(", ") : "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Requirements</dt>
                  <dd className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3">
                    {viewing.message || "—"}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-3">
                <Label className="shrink-0">Status</Label>
                <StatusSelect
                  value={viewing.status}
                  disabled={busyId === viewing.id}
                  onChange={(status) => changeStatus(viewing, status)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ws-note">Admin Note</Label>
                <Textarea
                  id="ws-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Call summary, quoted price, follow-up date..."
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2 sm:justify-between">
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={`tel:${viewing.phone}`}>
                      <Phone className="size-3.5" /> Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={whatsappHref(viewing.phone)} target="_blank" rel="noopener noreferrer">
                      <FaWhatsapp className="size-3.5" /> WhatsApp
                    </a>
                  </Button>
                </div>
                <Button onClick={saveNote} disabled={isSavingNote}>
                  {isSavingNote && <Loader2 className="size-4 animate-spin" />}
                  Save Note
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusSelect({
  value,
  disabled,
  onChange,
}: {
  value: WholesaleRequestStatus;
  disabled?: boolean;
  onChange: (status: WholesaleRequestStatus) => void;
}) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(v as WholesaleRequestStatus)}
    >
      <SelectTrigger
        className={cn("h-8 w-32 border-0 text-xs font-bold", statusOf(value).tone)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
