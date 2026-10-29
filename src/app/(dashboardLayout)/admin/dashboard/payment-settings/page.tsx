"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { CheckCircle2, Eye, EyeOff, Loader2, Save, Truck } from "lucide-react";
import {
  getAdminPaymentSettings,
  updateBkashSettings,
  updateSslcommerzSettings,
} from "@/services/paymentSetting.services";
import { GatewayMode } from "@/types/paymentSetting.types";
import { cn } from "@/lib/utils";

interface GatewayField {
  key: string;
  label: string;
  secret?: boolean;
}

interface GatewayCardProps {
  title: string;
  accent: string;
  logo: React.ReactNode;
  fields: GatewayField[];
  enabled: boolean;
  mode: GatewayMode;
  values: Record<string, string>;
  help?: React.ReactNode;
  onSave: (data: {
    enabled: boolean;
    mode: GatewayMode;
    values: Record<string, string>;
  }) => Promise<void>;
}

function SecretInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl pr-10 font-mono text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide" : "Show"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

// Status + Sandbox/Live + credentials for one gateway
function GatewayCard({
  title,
  accent,
  logo,
  fields,
  enabled: initialEnabled,
  mode: initialMode,
  values: initialValues,
  help,
  onSave,
}: GatewayCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mode, setMode] = useState<GatewayMode>(initialMode);
  const [values, setValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  const missing = fields.filter((f) => !values[f.key]?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled && missing.length > 0) {
      toast.error(`Fill in ${missing.map((f) => f.label).join(", ")} before activating`);
      return;
    }
    setIsSaving(true);
    try {
      await onSave({ enabled, mode, values });
      toast.success(`${title} settings saved`);
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-fit flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b p-5" style={{ borderTop: `3px solid ${accent}` }}>
        <div className="flex items-center gap-3">
          {logo}
          <h4 className="text-lg font-bold">{title}</h4>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            enabled
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground",
          )}
        >
          {enabled ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={enabled ? "active" : "inactive"}
              onValueChange={(v) => setEnabled(v === "active")}
            >
              <SelectTrigger className="h-11 w-full rounded-xl">
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
            <Select value={mode} onValueChange={(v) => setMode(v as GatewayMode)}>
              <SelectTrigger className="h-11 w-full rounded-xl">
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
            Sandbox mode: payments are test only, no real money moves. Switch to
            Production with your live credentials before going live.
          </p>
        )}

        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={`${title}-${field.key}`}>{field.label}</Label>
            {field.secret ? (
              <SecretInput
                id={`${title}-${field.key}`}
                value={values[field.key] ?? ""}
                onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
              />
            ) : (
              <Input
                id={`${title}-${field.key}`}
                autoComplete="off"
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="h-11 rounded-xl font-mono text-sm"
              />
            )}
          </div>
        ))}

        {help}
      </div>

      <div className="border-t bg-muted/30 p-4">
        <Button type="submit" disabled={isSaving} className="w-full rounded-full font-bold">
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2 size-4" /> Save
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

const unwrap = async <T,>(promise: Promise<{ success: boolean; message?: string } & T>) => {
  const res = await promise;
  if (!res.success) throw new Error(res.message || "Failed to save");
};

export default function PaymentSettingsPage() {
  const { data, isLoading } = usePaymentSettings();

  if (isLoading || !data) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          "Couldn't load payment settings. Refresh to try again."
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Payment Settings</h3>
        <p className="text-muted-foreground">
          Choose which payment methods customers can use on checkout and
          landing pages. Inactive methods are hidden from customers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* COD — always on */}
        <div className="flex h-fit flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b p-5" style={{ borderTop: "3px solid #16a34a" }}>
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Truck className="size-5" />
              </span>
              <h4 className="text-lg font-bold">Cash on Delivery</h4>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Always active
            </span>
          </div>
          <div className="space-y-3 p-5 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              Always offered and selected by default on checkout and landing pages.
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              Customers can switch to an online method below when it&apos;s active.
            </p>
          </div>
        </div>

        <GatewayCard
          title="bKash"
          accent="#E2136E"
          logo={
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#E2136E] text-sm font-black text-white">
              b
            </span>
          }
          enabled={data.bkashEnabled}
          mode={data.bkashMode || "SANDBOX"}
          values={{
            appKey: data.bkashAppKey ?? "",
            appSecret: data.bkashAppSecret ?? "",
            username: data.bkashUsername ?? "",
            password: data.bkashPassword ?? "",
          }}
          fields={[
            { key: "appKey", label: "App Key" },
            { key: "appSecret", label: "App Secret", secret: true },
            { key: "username", label: "Username" },
            { key: "password", label: "Password", secret: true },
          ]}
          help={
            <p className="text-xs text-muted-foreground">
              Use the Tokenized Checkout credentials from your bKash merchant
              account. Sandbox and production credentials are different.
            </p>
          }
          onSave={({ enabled, mode, values }) =>
            unwrap(
              updateBkashSettings({
                bkashEnabled: enabled,
                bkashMode: mode,
                bkashAppKey: values.appKey.trim(),
                bkashAppSecret: values.appSecret.trim(),
                bkashUsername: values.username.trim(),
                bkashPassword: values.password.trim(),
              }),
            )
          }
        />

        <GatewayCard
          title="SSLCommerz"
          accent="#2563eb"
          logo={
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
              SSL
            </span>
          }
          enabled={data.sslcommerzEnabled}
          mode={data.sslcommerzMode || "SANDBOX"}
          values={{
            storeId: data.sslcommerzStoreId ?? "",
            storePassword: data.sslcommerzStorePassword ?? "",
          }}
          fields={[
            { key: "storeId", label: "Store ID" },
            { key: "storePassword", label: "Store Password", secret: true },
          ]}
          help={
            <p className="text-xs text-muted-foreground">
              Card, mobile banking and net banking through SSLCommerz. Only for
              signed-in checkout.
            </p>
          }
          onSave={({ enabled, mode, values }) =>
            unwrap(
              updateSslcommerzSettings({
                sslcommerzEnabled: enabled,
                sslcommerzMode: mode,
                sslcommerzStoreId: values.storeId.trim(),
                sslcommerzStorePassword: values.storePassword.trim(),
              }),
            )
          }
        />
      </div>
    </div>
  );
}

function usePaymentSettings() {
  const [state, setState] = useState<{
    data: Awaited<ReturnType<typeof getAdminPaymentSettings>>["data"] | null;
    isLoading: boolean;
  }>({ data: null, isLoading: true });

  useEffect(() => {
    getAdminPaymentSettings()
      .then((res) => setState({ data: res.data, isLoading: false }))
      .catch(() => {
        toast.error("Failed to load payment settings");
        setState({ data: null, isLoading: false });
      });
  }, []);

  return state;
}
