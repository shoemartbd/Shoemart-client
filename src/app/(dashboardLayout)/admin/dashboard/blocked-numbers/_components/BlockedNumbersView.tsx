"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, Search, ShieldBan, ShieldCheck, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  blockPhone,
  getBlockedPhones,
  IBlockedPhone,
  unblockPhone,
} from "@/services/blockedPhone.services";
import { cn } from "@/lib/utils";
import { confirmAction } from "@/lib/confirmAction";

export default function BlockedNumbersView({ initialSearch }: { initialSearch: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState(initialSearch);
  const [debounced, setDebounced] = useState(initialSearch.trim());
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [isBlocking, setIsBlocking] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: rows = [], isLoading, isFetching } = useQuery({
    queryKey: ["blocked-phones", debounced],
    queryFn: () => getBlockedPhones(debounced || undefined),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["blocked-phones"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Enter a phone number");
    setIsBlocking(true);
    try {
      const blocked = await blockPhone({ phone: phone.trim(), reason: reason.trim() || undefined });
      toast.success(`${blocked.phone} is blocked`);
      setPhone("");
      setReason("");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to block");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (row: IBlockedPhone) => {
    const ok = await confirmAction({
      title: `Unblock ${row.phone}?`,
      text: "This number will be able to place orders again.",
      confirmText: "Unblock",
      variant: "primary",
      icon: "question",
    });
    if (!ok) return;
    setBusyId(row.id);
    try {
      await unblockPhone(row.id);
      toast.success(`${row.phone} can order again`);
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to unblock");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Blocked Numbers</h3>
        <p className="text-muted-foreground">
          These phone numbers can&apos;t place orders from checkout or landing
          pages. Block from an order with the &quot;Fraud&quot; button, or add a
          number here. Unblock to let it order again.
        </p>
      </div>

      {/* Block a number by hand */}
      <form
        onSubmit={handleBlock}
        className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center"
      >
        <ShieldBan className="hidden size-5 shrink-0 text-red-600 md:block" />
        <Input
          type="tel"
          placeholder="01XXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-10 md:w-48"
          aria-label="Phone number to block"
        />
        <Input
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="h-10 flex-1"
          aria-label="Reason"
        />
        <Button
          type="submit"
          disabled={isBlocking}
          className="h-10 gap-2 bg-red-600 text-white hover:bg-red-700"
        >
          {isBlocking ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
          Block Number
        </Button>
      </form>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number, reason or order no."
          className="h-10 rounded-full pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <ShieldCheck className="size-10 text-emerald-500" />
            <p className="font-semibold">{debounced ? "No match" : "No blocked numbers"}</p>
            <p className="text-sm text-muted-foreground">
              {debounced ? "Try another number." : "Every number can place orders."}
            </p>
          </div>
        ) : (
          <div className={cn("overflow-x-auto", isFetching && "opacity-60")}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">From Order</th>
                  <th className="px-4 py-3 font-semibold">Blocked</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold">{row.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.reason || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{row.orderNumber || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(row.createdAt), "d MMM yyyy, h:mm a")}
                      {row.blockedBy && <span className="block">by {row.blockedBy}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() => handleUnblock(row)}
                        className="gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:text-emerald-400"
                      >
                        {busyId === row.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Unlock className="size-3.5" />
                        )}
                        Unblock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
