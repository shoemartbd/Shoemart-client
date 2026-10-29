"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Loader2, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCourierSettings,
  updateRedxSettings,
} from "@/services/courierSetting.services";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(16).padStart(2, "0")).join("");

// RedX Open API: access token from the RedX merchant panel (Developer API)
export default function RedxSettingsCard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"SANDBOX" | "LIVE">("SANDBOX");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [pickupStoreId, setPickupStoreId] = useState("");
  const [webhookToken, setWebhookToken] = useState("");

  useEffect(() => {
    getCourierSettings()
      .then((res) => {
        const s = res.data;
        if (!s) return;
        setEnabled(s.redxEnabled ?? false);
        setMode(s.redxMode === "LIVE" ? "LIVE" : "SANDBOX");
        setAccessToken(s.redxAccessToken || "");
        setPickupStoreId(s.redxPickupStoreId || "");
        setWebhookToken(s.redxWebhookToken || "");
      })
      .catch(() => toast.error("Failed to load RedX settings"))
      .finally(() => setIsLoading(false));
  }, []);

  const callbackUrl = `${API_BASE}/courier-webhooks/redx${
    webhookToken ? `?token=${encodeURIComponent(webhookToken)}` : ""
  }`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled && !accessToken.trim()) {
      toast.error("Enter the RedX access token before activating");
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateRedxSettings({
        redxEnabled: enabled,
        redxMode: mode,
        redxAccessToken: accessToken.trim(),
        redxPickupStoreId: pickupStoreId.trim(),
        redxWebhookToken: webhookToken.trim(),
      });
      if (res.success) toast.success("RedX settings saved");
      else toast.error(res.message || "Failed to save RedX settings");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-card">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm h-fit" style={{ borderTop: "3px solid #e11d2a" }}>
      <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#e11d2a] text-xs font-black text-white">
          RX
        </span>
        RedX Courier
      </h4>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={enabled ? "active" : "inactive"} onValueChange={(v) => setEnabled(v === "active")}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as "SANDBOX" | "LIVE")}>
              <SelectTrigger className="h-11 rounded-xl w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SANDBOX">Sandbox (test)</SelectItem>
                <SelectItem value="LIVE">Production (live)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {mode === "SANDBOX" && enabled && (
          <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            Sandbox: parcels are test only and won&apos;t be picked up. Switch to
            Production with your live token when ready.
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="redxAccessToken">API Access Token</Label>
          <div className="relative">
            <Input
              id="redxAccessToken"
              type={showToken ? "text" : "password"}
              autoComplete="off"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="From RedX merchant panel → Developer API"
              className="h-11 rounded-xl pr-10 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              aria-label={showToken ? "Hide token" : "Show token"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redxPickupStoreId">Pickup Store ID (optional)</Label>
          <Input
            id="redxPickupStoreId"
            inputMode="numeric"
            value={pickupStoreId}
            onChange={(e) => setPickupStoreId(e.target.value)}
            placeholder="Leave empty to use your default pickup point"
            className="h-11 rounded-xl"
          />
        </div>

        <div className="rounded-xl border border-dashed p-4 space-y-4 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground">
            Status updates: paste this URL into the RedX merchant panel
            (Developer API → Webhook / Callback URL) so parcel status updates here
            automatically.
          </p>
          <div className="space-y-2">
            <Label htmlFor="redxWebhookToken">Webhook secret</Label>
            <div className="flex gap-2">
              <Input
                id="redxWebhookToken"
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="Any secret, it becomes part of the URL"
                className="h-11 rounded-xl font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                title="Generate a random secret"
                onClick={() => setWebhookToken(randomToken())}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Callback URL</Label>
            <div className="flex gap-2">
              <Input readOnly value={callbackUrl} className="h-11 rounded-xl font-mono text-xs" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl"
                onClick={() => {
                  navigator.clipboard.writeText(callbackUrl);
                  toast.success("Callback URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Save first, then copy. Changing the secret means updating the URL
              in RedX too.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={isSaving} className="rounded-full font-bold">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
